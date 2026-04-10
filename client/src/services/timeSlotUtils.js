/**
 * Time Slot Utilities
 * 
 * Algorithm for computing available time slots.
 * All times stored as ISO 8601 strings.
 * 
 * Supports two availability formats:
 * 1. Object format: { "monday": ["09:00", "17:00"] }
 * 2. Array format: [{ dayOfWeek: 1, slots: [{ startTime, endTime }] }]
 */
import {
    format,
    parse,
    addMinutes,
    isBefore,
    startOfDay,
    getDay,
    parseISO,
} from 'date-fns';

// Slot duration in minutes
export const SLOT_DURATION = 30;

// Day of week mapping (0 = Sunday, 1 = Monday, etc.)
const DAY_MAP = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
};

/**
 * Normalize availability to object format
 * Handles multiple formats:
 * 1. Object with day names and array [start, end]: { "monday": ["09:00", "17:00"] }
 * 2. Object with day names and slot objects: { "monday": [{ start: "09:00", end: "17:00" }] }
 * 3. Array format: [{ dayOfWeek: 1, slots: [{ startTime, endTime }] }]
 * @param {Object|Array} availability - Raw availability data
 * @returns {Object} Normalized availability object with [start, end] format
 */
function normalizeAvailability(availability) {
    if (!availability) return {};

    // Handle array format from older database schema
    if (Array.isArray(availability)) {
        const normalized = {};
        for (const entry of availability) {
            const dayNum = entry.dayOfWeek;
            const dayName = DAY_MAP[dayNum];
            if (dayName && entry.slots && entry.slots.length > 0) {
                const slot = entry.slots[0];
                normalized[dayName] = [slot.startTime, slot.endTime];
            }
        }
        return normalized;
    }

    // Handle object format
    if (typeof availability === 'object') {
        const dayNames = Object.values(DAY_MAP);
        const normalized = {};

        for (const [key, value] of Object.entries(availability)) {
            // Check if key is a day name
            if (dayNames.includes(key)) {
                // Check if value is array of slot objects (new format from doctor portal)
                if (Array.isArray(value) && value.length > 0) {
                    if (typeof value[0] === 'object' && value[0].start && value[0].end) {
                        // New format: [{ start: "09:00", end: "17:00" }]
                        normalized[key] = [value[0].start, value[0].end];
                    } else if (typeof value[0] === 'string') {
                        // Old format: ["09:00", "17:00"]
                        normalized[key] = value;
                    }
                }
            }
        }

        return normalized;
    }

    return {};
}

/**
 * Generate all possible time slots for a date based on doctor's availability
 * @param {Date} date - The date to generate slots for
 * @param {Object|Array} availability - Doctor's availability JSON
 * @returns {Array<string>} Array of time slots in HH:mm format
 */
export function generateTimeGrid(date, availability) {
    const normalizedAvail = normalizeAvailability(availability);
    const dayOfWeek = getDay(date);
    const dayName = DAY_MAP[dayOfWeek];

    // Get working hours for this day (try dayName first, then numeric key)
    const hours = normalizedAvail?.[dayName] || normalizedAvail?.[String(dayOfWeek)] || normalizedAvail?.[dayOfWeek];

    if (!hours || hours.length !== 2) {
        return []; // Doctor doesn't work this day
    }

    const [startTime, endTime] = hours;
    const slots = [];

    // Parse start and end times
    const baseDate = startOfDay(date);
    let currentSlot = parse(startTime, 'HH:mm', baseDate);
    const endSlot = parse(endTime, 'HH:mm', baseDate);

    // Generate 30-minute intervals
    while (isBefore(currentSlot, endSlot)) {
        slots.push(format(currentSlot, 'HH:mm'));
        currentSlot = addMinutes(currentSlot, SLOT_DURATION);
    }

    return slots;
}

/**
 * Filter out booked slots from available slots
 * @param {Array<string>} slots - Available time slots (HH:mm)
 * @param {Array<Object>} appointments - Existing appointments
 * @param {Date} date - The date being checked
 * @returns {Array<string>} Filtered available slots
 */
export function filterBookedSlots(slots, appointments, date) {
    const dateStr = format(date, 'yyyy-MM-dd');

    // Get booked times for this date (use start_time column)
    const bookedTimes = appointments
        .filter(apt => {
            if (!apt.start_time) return false;
            const aptDate = format(parseISO(apt.start_time), 'yyyy-MM-dd');
            return aptDate === dateStr && apt.status !== 'cancelled';
        })
        .map(apt => format(parseISO(apt.start_time), 'HH:mm'));

    // Filter out booked slots
    return slots.filter(slot => !bookedTimes.includes(slot));
}

/**
 * Filter out past time slots for today
 * @param {Array<string>} slots - Available time slots (HH:mm)
 * @param {Date} date - The date being checked
 * @returns {Array<string>} Filtered slots (future only if today)
 */
export function filterPastSlots(slots, date) {
    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');
    const selectedDate = format(date, 'yyyy-MM-dd');

    // If not today, return all slots
    if (today !== selectedDate) {
        return slots;
    }

    const currentTime = format(now, 'HH:mm');

    // Filter out slots that have already passed
    return slots.filter(slot => slot > currentTime);
}

/**
 * Get fully available slots for a doctor on a specific date
 * @param {Date} date - The date to check
 * @param {Object} doctor - Doctor object with availability
 * @param {Array<Object>} existingAppointments - Appointments to exclude
 * @returns {Array<Object>} Available slots with metadata
 */
export function getAvailableSlots(date, doctor, existingAppointments = []) {
    // 1. Generate all possible slots based on doctor's working hours
    const allSlots = generateTimeGrid(date, doctor.availability);

    // 2. Filter out booked slots
    const unbookedSlots = filterBookedSlots(allSlots, existingAppointments, date);

    // 3. Filter out past slots (for today)
    const availableSlots = filterPastSlots(unbookedSlots, date);

    // 4. Format for UI
    return availableSlots.map(slot => ({
        time: slot,
        label: formatSlotLabel(slot),
        isoString: toISOString(date, slot),
    }));
}

/**
 * Format slot time for display (e.g., "9:00 AM")
 */
export function formatSlotLabel(time) {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Convert date and time to ISO 8601 string
 */
export function toISOString(date, time) {
    const [hours, minutes] = time.split(':');
    const dt = new Date(date);
    dt.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return dt.toISOString();
}

/**
 * Check if a specific slot is available
 */
export function isSlotAvailable(date, time, doctor, appointments) {
    const available = getAvailableSlots(date, doctor, appointments);
    return available.some(slot => slot.time === time);
}

/**
 * Get dates with available slots for the next N days
 */
export function getAvailableDates(doctor, appointments, daysAhead = 30) {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < daysAhead; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);

        const slots = getAvailableSlots(date, doctor, appointments);

        if (slots.length > 0) {
            dates.push({
                date,
                slotsCount: slots.length,
            });
        }
    }

    return dates;
}
