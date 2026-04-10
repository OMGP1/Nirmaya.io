/**
 * Appointments Controller
 * 
 * CRUD operations for appointments with validation.
 * Email notifications are triggered internally (not via API endpoints).
 */
const { supabaseAdmin } = require('../config/supabaseAdmin');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const { logger } = require('../config/logger');
const emailService = require('../services/email/emailService');

/**
 * Book a new appointment
 */
const createAppointment = asyncHandler(async (req, res) => {
    const patientId = req.user.id;
    const { doctor_id, department_id, start_time, end_time, reason, notes, severity, is_emergency } = req.body;

    // Verify doctor exists and is active
    const { data: doctor, error: doctorError } = await supabaseAdmin
        .from('doctors')
        .select(`
            id, 
            is_active,
            specialization,
            user:users(full_name, email),
            department:departments(id, name)
        `)
        .eq('id', doctor_id)
        .single();

    if (doctorError || !doctor) {
        throw ApiError.notFound('Doctor not found');
    }

    if (!doctor.is_active) {
        throw ApiError.badRequest('Doctor is not currently accepting appointments');
    }

    // Get patient info for email
    const { data: patient, error: patientError } = await supabaseAdmin
        .from('users')
        .select('full_name, email')
        .eq('id', patientId)
        .single();

    if (patientError || !patient) {
        throw ApiError.notFound('Patient not found');
    }

    // Create appointment (with optional triage severity tracking)
    const { data, error } = await supabaseAdmin
        .from('appointments')
        .insert([{
            patient_id: patientId,
            doctor_id,
            department_id: department_id || doctor.department?.id,
            start_time,
            end_time,
            reason,
            notes,
            status: 'pending',
            ...(severity && { severity }),
            ...(is_emergency !== undefined && { is_emergency }),
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

    if (error) {
        // Handle double-booking (constraint violation)
        if (error.message.includes('overlap') || error.code === '23505') {
            throw ApiError.conflict('This time slot is no longer available');
        }
        logger.error('Appointment creation error:', error);
        throw ApiError.internal('Failed to create appointment');
    }

    logger.info(`Appointment created: ${data.id} by patient: ${patientId}`);

    // Send confirmation email (fire and forget - don't block response)
    emailService.sendBookingConfirmation(patient.email, {
        appointmentId: data.id,
        patientName: patient.full_name,
        doctorName: doctor.user?.full_name,
        specialization: doctor.specialization,
        departmentName: doctor.department?.name,
        startTime: start_time,
        reason,
    }).catch(err => {
        logger.error('Failed to send confirmation email', {
            appointmentId: data.id,
            error: err.message
        });
    });

    res.status(201).json({
        success: true,
        data: { appointment: data },
    });
});

/**
 * Get current user's appointments
 */
const getMyAppointments = asyncHandler(async (req, res) => {
    const patientId = req.user.id;
    const { status, start_date, end_date, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
        .from('appointments')
        .select(`
            *,
            doctor:doctors(
                id,
                specialization,
                user:users(full_name),
                department:departments(name)
            )
        `, { count: 'exact' })
        .eq('patient_id', patientId);

    if (status) {
        query = query.eq('status', status);
    }
    if (start_date) {
        query = query.gte('start_time', start_date);
    }
    if (end_date) {
        query = query.lte('start_time', end_date);
    }

    const { data, error, count } = await query
        .order('start_time', { ascending: true })
        .range(offset, offset + limit - 1);

    if (error) {
        throw ApiError.internal('Failed to fetch appointments');
    }

    res.json({
        success: true,
        data: {
            appointments: data,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                totalPages: Math.ceil(count / limit),
            },
        },
    });
});

/**
 * Get appointment by ID
 */
const getAppointmentById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.role === 'admin';

    const { data, error } = await supabaseAdmin
        .from('appointments')
        .select(`
            *,
            patient:users!appointments_patient_id_fkey(id, full_name, email, phone),
            doctor:doctors(
                id,
                specialization,
                user:users(full_name, email),
                department:departments(name)
            )
        `)
        .eq('id', id)
        .single();

    if (error || !data) {
        throw ApiError.notFound('Appointment not found');
    }

    // Check ownership (unless admin)
    if (!isAdmin && data.patient_id !== userId) {
        // Check if user is the doctor
        const { data: doctorData } = await supabaseAdmin
            .from('doctors')
            .select('user_id')
            .eq('id', data.doctor_id)
            .single();

        if (!doctorData || doctorData.user_id !== userId) {
            throw ApiError.forbidden('Access denied');
        }
    }

    res.json({
        success: true,
        data: { appointment: data },
    });
});

/**
 * Reschedule an appointment
 */
const rescheduleAppointment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { new_time, new_end_time } = req.body;
    const userId = req.user.id;

    // Verify ownership
    const { data: existing, error: fetchError } = await supabaseAdmin
        .from('appointments')
        .select('patient_id, status')
        .eq('id', id)
        .single();

    if (fetchError || !existing) {
        throw ApiError.notFound('Appointment not found');
    }

    if (existing.patient_id !== userId && req.role !== 'admin') {
        throw ApiError.forbidden('Access denied');
    }

    if (existing.status === 'cancelled') {
        throw ApiError.badRequest('Cannot reschedule a cancelled appointment');
    }

    if (existing.status === 'completed') {
        throw ApiError.badRequest('Cannot reschedule a completed appointment');
    }

    // Update appointment
    const { data, error } = await supabaseAdmin
        .from('appointments')
        .update({
            start_time: new_time,
            end_time: new_end_time,
            status: 'pending',
        })
        .eq('id', id)
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

    if (error) {
        if (error.message.includes('overlap') || error.code === '23505') {
            throw ApiError.conflict('This time slot is no longer available');
        }
        throw ApiError.internal('Failed to reschedule appointment');
    }

    logger.info(`Appointment rescheduled: ${id}`);

    res.json({
        success: true,
        data: { appointment: data },
    });
});

/**
 * Cancel an appointment
 */
const cancelAppointment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    // Verify ownership and get full details for email
    const { data: existing, error: fetchError } = await supabaseAdmin
        .from('appointments')
        .select(`
            *,
            patient:users!appointments_patient_id_fkey(full_name, email),
            doctor:doctors(
                specialization,
                user:users(full_name)
            )
        `)
        .eq('id', id)
        .single();

    if (fetchError || !existing) {
        throw ApiError.notFound('Appointment not found');
    }

    if (existing.patient_id !== userId && req.role !== 'admin') {
        throw ApiError.forbidden('Access denied');
    }

    if (existing.status === 'cancelled') {
        throw ApiError.badRequest('Appointment is already cancelled');
    }

    // Cancel appointment
    const { data, error } = await supabaseAdmin
        .from('appointments')
        .update({
            status: 'cancelled',
            cancellation_reason: reason,
            cancelled_at: new Date().toISOString(),
            cancelled_by: userId,
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw ApiError.internal('Failed to cancel appointment');
    }

    logger.info(`Appointment cancelled: ${id}, reason: ${reason}`);

    // Send cancellation email (fire and forget)
    emailService.sendCancellationEmail(existing.patient?.email, {
        patientName: existing.patient?.full_name,
        doctorName: existing.doctor?.user?.full_name,
        specialization: existing.doctor?.specialization,
        startTime: existing.start_time,
        cancellationReason: reason,
    }).catch(err => {
        logger.error('Failed to send cancellation email', {
            appointmentId: id,
            error: err.message
        });
    });

    res.json({
        success: true,
        data: { appointment: data },
    });
});

/**
 * Confirm an appointment (doctor/admin only)
 */
const confirmAppointment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
        .from('appointments')
        .update({
            status: 'confirmed',
            confirmed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw ApiError.internal('Failed to confirm appointment');
    }

    logger.info(`Appointment confirmed: ${id}`);

    res.json({
        success: true,
        data: { appointment: data },
    });
});

module.exports = {
    createAppointment,
    getMyAppointments,
    getAppointmentById,
    rescheduleAppointment,
    cancelAppointment,
    confirmAppointment,
};

