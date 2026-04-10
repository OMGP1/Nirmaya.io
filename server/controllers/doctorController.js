/**
 * Doctor Portal Controller
 * 
 * Endpoints for doctor-specific operations.
 */
const { supabaseAdmin } = require('../config/supabaseAdmin');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const { logger } = require('../config/logger');

/**
 * Get the current logged-in doctor's profile
 */
const getMyProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const { data, error } = await supabaseAdmin
        .from('doctors')
        .select(`
            *,
            user:users(id, full_name, email, phone),
            department:departments(id, name)
        `)
        .eq('user_id', userId)
        .single();

    if (error || !data) {
        throw ApiError.notFound('Doctor profile not found');
    }

    res.json({
        success: true,
        data: { doctor: data },
    });
});

/**
 * Get doctor's appointments
 */
const getMyAppointments = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { status, date, start_date, end_date } = req.query;

    // First get doctor id for this user
    const { data: doctor, error: doctorError } = await supabaseAdmin
        .from('doctors')
        .select('id')
        .eq('user_id', userId)
        .single();

    if (doctorError || !doctor) {
        throw ApiError.notFound('Doctor profile not found');
    }

    let query = supabaseAdmin
        .from('appointments')
        .select(`
            *,
            patient:users!appointments_patient_id_fkey(id, full_name, email, phone),
            department:departments(name)
        `)
        .eq('doctor_id', doctor.id)
        .order('start_time', { ascending: true });

    // Apply filters
    if (status) {
        query = query.eq('status', status);
    }

    if (date) {
        // Filter for a specific date
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        query = query
            .gte('start_time', startOfDay.toISOString())
            .lte('start_time', endOfDay.toISOString());
    } else {
        if (start_date) {
            query = query.gte('start_time', start_date);
        }
        if (end_date) {
            query = query.lte('start_time', end_date);
        }
    }

    const { data, error } = await query;

    if (error) {
        logger.error('Failed to fetch doctor appointments:', error);
        throw ApiError.internal('Failed to fetch appointments');
    }

    res.json({
        success: true,
        data: { appointments: data },
    });
});

/**
 * Get today's appointments summary
 */
const getTodaysSummary = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Get doctor id
    const { data: doctor, error: doctorError } = await supabaseAdmin
        .from('doctors')
        .select('id')
        .eq('user_id', userId)
        .single();

    if (doctorError || !doctor) {
        throw ApiError.notFound('Doctor profile not found');
    }

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

    // Get today's appointments
    const { data: todayAppointments, error: todayError } = await supabaseAdmin
        .from('appointments')
        .select(`
            *,
            patient:users!appointments_patient_id_fkey(id, full_name, email, phone)
        `)
        .eq('doctor_id', doctor.id)
        .gte('start_time', startOfDay)
        .lte('start_time', endOfDay)
        .order('start_time', { ascending: true });

    if (todayError) {
        throw ApiError.internal('Failed to fetch today\'s appointments');
    }

    // Get pending count
    const { count: pendingCount } = await supabaseAdmin
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', doctor.id)
        .eq('status', 'pending');

    // Get upcoming count (confirmed, future)
    const { count: upcomingCount } = await supabaseAdmin
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', doctor.id)
        .eq('status', 'confirmed')
        .gt('start_time', new Date().toISOString());

    res.json({
        success: true,
        data: {
            todayAppointments,
            stats: {
                todayTotal: todayAppointments.length,
                pending: pendingCount || 0,
                upcoming: upcomingCount || 0,
            },
        },
    });
});

/**
 * Update appointment status (accept/reject/complete)
 */
const updateAppointmentStatus = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
        throw ApiError.badRequest(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Verify this appointment belongs to the doctor
    const { data: doctor } = await supabaseAdmin
        .from('doctors')
        .select('id')
        .eq('user_id', userId)
        .single();

    if (!doctor) {
        throw ApiError.notFound('Doctor profile not found');
    }

    const { data: appointment, error: fetchError } = await supabaseAdmin
        .from('appointments')
        .select('doctor_id, status')
        .eq('id', id)
        .single();

    if (fetchError || !appointment) {
        throw ApiError.notFound('Appointment not found');
    }

    if (appointment.doctor_id !== doctor.id) {
        throw ApiError.forbidden('You can only update your own appointments');
    }

    // Update the status
    const updateData = {
        status,
        ...(status === 'confirmed' && { confirmed_at: new Date().toISOString() }),
        ...(status === 'completed' && { completed_at: new Date().toISOString() }),
        ...(status === 'cancelled' && { cancelled_at: new Date().toISOString() }),
    };

    const { data, error } = await supabaseAdmin
        .from('appointments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw ApiError.internal('Failed to update appointment status');
    }

    logger.info(`Doctor ${doctor.id} updated appointment ${id} to ${status}`);

    res.json({
        success: true,
        data: { appointment: data },
    });
});

/**
 * Save clinical notes for an appointment
 */
const saveAppointmentNotes = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { notes } = req.body;

    // Verify this appointment belongs to the doctor
    const { data: doctor } = await supabaseAdmin
        .from('doctors')
        .select('id')
        .eq('user_id', userId)
        .single();

    if (!doctor) {
        throw ApiError.notFound('Doctor profile not found');
    }

    const { data: appointment, error: fetchError } = await supabaseAdmin
        .from('appointments')
        .select('doctor_id')
        .eq('id', id)
        .single();

    if (fetchError || !appointment) {
        throw ApiError.notFound('Appointment not found');
    }

    if (appointment.doctor_id !== doctor.id) {
        throw ApiError.forbidden('You can only update your own appointments');
    }

    // Update the notes
    const { data, error } = await supabaseAdmin
        .from('appointments')
        .update({ clinical_notes: notes })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw ApiError.internal('Failed to save notes');
    }

    logger.info(`Doctor ${doctor.id} saved notes for appointment ${id}`);

    res.json({
        success: true,
        data: { appointment: data },
    });
});

/**
 * Get doctor's availability
 */
const getAvailability = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const { data, error } = await supabaseAdmin
        .from('doctors')
        .select('id, availability')
        .eq('user_id', userId)
        .single();

    if (error || !data) {
        throw ApiError.notFound('Doctor profile not found');
    }

    res.json({
        success: true,
        data: { availability: data.availability || {} },
    });
});

/**
 * Update doctor's availability
 */
const updateAvailability = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { availability } = req.body;

    if (!availability || typeof availability !== 'object') {
        throw ApiError.badRequest('Availability must be an object');
    }

    const { data, error } = await supabaseAdmin
        .from('doctors')
        .update({ availability })
        .eq('user_id', userId)
        .select('id, availability')
        .single();

    if (error) {
        throw ApiError.internal('Failed to update availability');
    }

    logger.info(`Doctor updated availability: ${data.id}`);

    res.json({
        success: true,
        data: { availability: data.availability },
    });
});

/**
 * Get single appointment details
 */
const getAppointmentById = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    // Get doctor id
    const { data: doctor } = await supabaseAdmin
        .from('doctors')
        .select('id')
        .eq('user_id', userId)
        .single();

    if (!doctor) {
        throw ApiError.notFound('Doctor profile not found');
    }

    const { data, error } = await supabaseAdmin
        .from('appointments')
        .select(`
            *,
            patient:users!appointments_patient_id_fkey(id, full_name, email, phone),
            department:departments(name)
        `)
        .eq('id', id)
        .eq('doctor_id', doctor.id)
        .single();

    if (error || !data) {
        throw ApiError.notFound('Appointment not found');
    }

    res.json({
        success: true,
        data: { appointment: data },
    });
});

module.exports = {
    getMyProfile,
    getMyAppointments,
    getTodaysSummary,
    updateAppointmentStatus,
    saveAppointmentNotes,
    getAvailability,
    updateAvailability,
    getAppointmentById,
};
