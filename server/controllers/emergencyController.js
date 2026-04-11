/**
 * Emergency Controller
 * 
 * Handles SOS/emergency triage operations:
 * - Finding nearest doctors via PostGIS proximity search
 * - Triggering emergency appointment bookings
 */
const { supabaseAdmin } = require('../config/supabaseAdmin');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const { logger } = require('../config/logger');
const emailService = require('../services/email/emailService');
const smsService = require('../services/sms/smsService');

/**
 * Find nearest doctors based on patient GPS coordinates
 * Uses the PostGIS-powered find_nearest_doctors RPC function
 */
const findNearestDoctors = asyncHandler(async (req, res) => {
    const { lat, lng, radius_km = 50, max_results = 10 } = req.body;

    if (!lat || !lng) {
        throw ApiError.badRequest('Patient coordinates (lat, lng) are required');
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw ApiError.badRequest('Invalid coordinates: lat must be -90 to 90, lng must be -180 to 180');
    }

    const { data: doctors, error } = await supabaseAdmin.rpc('find_nearest_doctors', {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        radius_km: parseFloat(radius_km),
        max_results: parseInt(max_results),
    });

    if (error) {
        logger.error('PostGIS nearest doctor search failed:', error);
        throw ApiError.internal('Failed to search for nearby doctors');
    }

    logger.info(`Emergency search: Found ${doctors?.length || 0} doctors within ${radius_km}km of (${lat}, ${lng})`);

    res.json({
        success: true,
        data: {
            doctors: doctors || [],
            search: {
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                radius_km: parseFloat(radius_km),
                results_count: doctors?.length || 0,
            },
        },
    });
});

/**
 * Trigger an SOS emergency booking
 * 
 * Flow:
 * 1. Capture patient GPS coordinates
 * 2. Find nearest available doctor via PostGIS
 * 3. Auto-create emergency appointment (is_emergency=true, severity='high')
 * 4. Fire email notification
 */
const triggerSOS = asyncHandler(async (req, res) => {
    const patientId = req.user.id;
    const { lat, lng, reason = 'Emergency SOS Alert' } = req.body;

    if (!lat || !lng) {
        throw ApiError.badRequest('Patient coordinates (lat, lng) are required for SOS');
    }

    // 1. Update patient location in the database
    await supabaseAdmin
        .from('users')
        .update({
            location: `SRID=4326;POINT(${parseFloat(lng)} ${parseFloat(lat)})`,
        })
        .eq('id', patientId);

    // 2. Find nearest available doctor
    const { data: nearestDoctors, error: searchError } = await supabaseAdmin.rpc('find_nearest_doctors', {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        radius_km: 50,
        max_results: 5,
    });

    if (searchError) {
        logger.error('SOS doctor search failed:', searchError);
        throw ApiError.internal('Failed to locate nearby doctors');
    }

    if (!nearestDoctors || nearestDoctors.length === 0) {
        throw ApiError.notFound('No available doctors found within 50km of your location');
    }

    // 3. Attempt booking closest available doctors in order
    let assignedDoctor = null;
    let appointment = null;
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

    for (const doc of nearestDoctors) {
        // Get doctor's department
        const { data: doctorDetail } = await supabaseAdmin
            .from('doctors')
            .select('department_id')
            .eq('id', doc.doctor_id)
            .single();

        const { data: newAppt, error: appointmentError } = await supabaseAdmin
            .from('appointments')
            .insert([{
                patient_id: patientId,
                doctor_id: doc.doctor_id,
                department_id: doctorDetail?.department_id || null,
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                reason,
                status: 'pending',
                severity: 'high',
                is_emergency: true,
            }])
            .select(`
                *,
                doctor:doctors(
                    id,
                    specialization,
                    user:users(full_name),
                    department:departments(name)
                )
            `)
            .single();

        if (!appointmentError) {
            // Success!
            assignedDoctor = doc;
            appointment = newAppt;
            break;
        } else {
            // If it's an overlap, log it and try the next doctor. Otherwise, it's a real failure
            if (appointmentError.message?.includes('overlap') || appointmentError.message?.includes('Appointment time slot overlaps') || appointmentError.code === '23505' || appointmentError.code === 'P0001') {
                logger.warn(`Doctor ${doc.doctor_id} is currently booked, trying next nearest doctor...`);
                continue;
            }
            logger.error('Unexpected emergency appointment creation error:', appointmentError);
            throw ApiError.internal('Failed to create emergency appointment');
        }
    }

    if (!appointment) {
        throw ApiError.conflict('All nearby doctors are currently engaged in critical cases. Please contact 112 directly.');
    }

    // 4. Get patient info for email/SMS
    const { data: patient, error: patientError } = await supabaseAdmin
        .from('users')
        .select('full_name, email')
        .eq('id', patientId)
        .single();

    if (patientError || !patient) {
        throw ApiError.notFound('Patient not found');
    }

    logger.info(`🚨 SOS TRIGGERED: Appointment ${appointment.id} | Patient: ${patientId} → Doctor: ${assignedDoctor.doctor_id} (${assignedDoctor.distance_km}km away)`);

    // 7. Send emergency notification email (fire and forget)
    emailService.sendBookingConfirmation(patient.email, {
        appointmentId: appointment.id,
        patientName: patient.full_name,
        doctorName: assignedDoctor.full_name,
        specialization: assignedDoctor.specialization,
        departmentName: assignedDoctor.department_name,
        startTime: startTime.toISOString(),
        reason: `🚨 EMERGENCY: ${reason}`,
    }).catch(err => {
        logger.error('Failed to send SOS confirmation email', {
            appointmentId: appointment.id,
            error: err.message,
        });
    });

    // 8. Broadcast SMS alerts to emergency contacts via Twilio
    smsService.broadcastSOS({
        patientName: patient.full_name,
        reason,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        doctorName: assignedDoctor.full_name,
        appointmentId: appointment.id,
    }).catch(err => {
        logger.error('SMS broadcast failed', { error: err.message });
    });

    res.status(201).json({
        success: true,
        data: {
            appointment,
            assigned_doctor: {
                id: assignedDoctor.doctor_id,
                name: assignedDoctor.full_name,
                specialization: assignedDoctor.specialization,
                department: assignedDoctor.department_name,
                distance_km: assignedDoctor.distance_km,
            },
            all_nearby_doctors: nearestDoctors,
            sms_enabled: smsService.enabled,
        },
    });
});

module.exports = {
    findNearestDoctors,
    triggerSOS,
};
