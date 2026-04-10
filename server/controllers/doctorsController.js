/**
 * Doctors Controller
 * 
 * Doctor listing and availability endpoints.
 */
const { supabaseAdmin } = require('../config/supabaseAdmin');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');

// Slot duration in minutes
const SLOT_DURATION = 30;

/**
 * List all doctors with optional filters
 */
const getDoctors = asyncHandler(async (req, res) => {
    const { department_id, search, page, limit } = req.query;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
        .from('doctors')
        .select(`
            *,
            user:users(id, full_name, email),
            department:departments(id, name)
        `, { count: 'exact' })
        .eq('is_active', true);

    if (department_id) {
        query = query.eq('department_id', department_id);
    }

    if (search) {
        query = query.or(`specialization.ilike.%${search}%`);
    }

    const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        throw ApiError.internal('Failed to fetch doctors');
    }

    res.json({
        success: true,
        data: {
            doctors: data,
            pagination: {
                page,
                limit,
                total: count,
                totalPages: Math.ceil(count / limit),
            },
        },
    });
});

/**
 * Get doctor by ID
 */
const getDoctorById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
        .from('doctors')
        .select(`
            *,
            user:users(id, full_name, email, phone),
            department:departments(id, name, description)
        `)
        .eq('id', id)
        .single();

    if (error || !data) {
        throw ApiError.notFound('Doctor not found');
    }

    res.json({
        success: true,
        data: { doctor: data },
    });
});

/**
 * Get doctor's available time slots for a specific date
 */
const getDoctorAvailability = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { date } = req.query;

    // Fetch doctor
    const { data: doctor, error: doctorError } = await supabaseAdmin
        .from('doctors')
        .select('id, availability, is_active')
        .eq('id', id)
        .single();

    if (doctorError || !doctor) {
        throw ApiError.notFound('Doctor not found');
    }

    if (!doctor.is_active) {
        return res.json({
            success: true,
            data: { slots: [], message: 'Doctor is not currently available' },
        });
    }

    // Parse date and get day of week
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();
    const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayMap[dayOfWeek];

    // Get working hours for this day
    const availability = doctor.availability || {};
    const hours = availability[dayName] || availability[String(dayOfWeek)];

    if (!hours || hours.length !== 2) {
        return res.json({
            success: true,
            data: { slots: [], message: 'Doctor does not work on this day' },
        });
    }

    const [startTime, endTime] = hours;

    // Generate all possible slots
    const allSlots = generateTimeSlots(startTime, endTime);

    // Fetch existing appointments for this date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: appointments, error: apptError } = await supabaseAdmin
        .from('appointments')
        .select('appointment_time')
        .eq('doctor_id', id)
        .gte('appointment_time', startOfDay.toISOString())
        .lte('appointment_time', endOfDay.toISOString())
        .neq('status', 'cancelled');

    if (apptError) {
        throw ApiError.internal('Failed to fetch appointments');
    }

    // Filter out booked slots
    const bookedTimes = appointments.map(a => {
        const d = new Date(a.appointment_time);
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    });

    const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot.time));

    // Filter out past slots if today
    const today = new Date();
    const isToday = targetDate.toDateString() === today.toDateString();

    const finalSlots = isToday
        ? availableSlots.filter(slot => {
            const [h, m] = slot.time.split(':').map(Number);
            const slotTime = new Date(targetDate);
            slotTime.setHours(h, m, 0, 0);
            return slotTime > today;
        })
        : availableSlots;

    res.json({
        success: true,
        data: {
            date,
            doctor_id: id,
            slots: finalSlots,
        },
    });
});

/**
 * Generate time slots between start and end times
 */
function generateTimeSlots(startTime, endTime) {
    const slots = [];
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    let currentHour = startHour;
    let currentMin = startMin;

    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
        const time = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
        const label = formatTime(currentHour, currentMin);

        slots.push({ time, label });

        currentMin += SLOT_DURATION;
        if (currentMin >= 60) {
            currentHour += 1;
            currentMin -= 60;
        }
    }

    return slots;
}

/**
 * Format time as "9:00 AM"
 */
function formatTime(hour, min) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${String(min).padStart(2, '0')} ${period}`;
}

module.exports = {
    getDoctors,
    getDoctorById,
    getDoctorAvailability,
};
