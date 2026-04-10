/**
 * Appointments Service
 * 
 * API calls for booking, cancelling, and rescheduling.
 * 
 * Note: Database uses start_time/end_time columns for appointments.
 * Now uses Supabase directly for all operations.
 * Email notifications are sent via database trigger (pg_net) - no CORS issues.
 */
import { supabase } from '@/lib/supabase';

// Default appointment duration in minutes
const APPOINTMENT_DURATION = 30;

/**
 * Calculate end time from start time
 */
function calculateEndTime(startTime, durationMinutes = APPOINTMENT_DURATION) {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
    return end.toISOString();
}

export async function bookAppointment(appointmentData) {
    const startTime = appointmentData.appointmentTime;
    const endTime = calculateEndTime(startTime);

    try {
        // Get current user with profile info
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            throw new Error('Not authenticated. Please log in again.');
        }

        // Get user profile for name
        const { data: profile } = await supabase
            .from('users')
            .select('full_name, email')
            .eq('id', user.id)
            .single();

        // Check if time slot is still available
        const { data: existingAppointments, error: checkError } = await supabase
            .from('appointments')
            .select('id')
            .eq('doctor_id', appointmentData.doctorId)
            .neq('status', 'cancelled')
            .or(`and(start_time.lt.${endTime},end_time.gt.${startTime})`);

        if (checkError) {
            console.error('Error checking availability:', checkError);
        }

        if (existingAppointments && existingAppointments.length > 0) {
            throw new Error('This time slot is no longer available. Please select another time.');
        }

        // Insert appointment directly via Supabase
        const { data, error } = await supabase
            .from('appointments')
            .insert({
                patient_id: user.id,
                doctor_id: appointmentData.doctorId,
                department_id: appointmentData.departmentId,
                start_time: startTime,
                end_time: endTime,
                reason: appointmentData.reason,
                notes: appointmentData.notes || null,
                status: 'pending',
            })
            .select(`
                *,
                doctor:doctors(
                    *,
                    user:users(full_name, email),
                    department:departments(name)
                )
            `)
            .single();

        if (error) {
            console.error('Supabase booking error:', error);
            // Handle specific errors
            if (error.code === '23505' || error.message.includes('overlap')) {
                throw new Error('This time slot is no longer available. Please select another time.');
            }
            if (error.code === '42501' || error.message.includes('RLS')) {
                throw new Error('Permission denied. Please try logging out and back in.');
            }
            throw new Error(error.message || 'Failed to book appointment');
        }

        // Email is now sent automatically via database trigger (pg_net)
        // No need to call email service from frontend - avoids CORS issues
        console.log('Appointment booked, email sent via database trigger');

        return data;
    } catch (error) {
        // Re-throw with user-friendly message
        if (error.message.includes('overlap') || error.message.includes('no longer available')) {
            throw new Error('This time slot is no longer available. Please select another time.');
        }
        throw error;
    }
}

export async function getMyAppointments(userId) {
    const { data, error } = await supabase
        .from('appointments')
        .select(`
      *,
      doctor:doctors(
        *,
        user:users(full_name, email),
        department:departments(name)
      )
    `)
        .eq('patient_id', userId)
        .order('start_time', { ascending: true });

    if (error) throw error;
    return data;
}

export async function getUpcomingAppointments(userId) {
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from('appointments')
        .select(`
      *,
      doctor:doctors(
        *,
        user:users(full_name),
        department:departments(name)
      )
    `)
        .eq('patient_id', userId)
        .gte('start_time', now)
        .neq('status', 'cancelled')
        .order('start_time', { ascending: true });

    if (error) throw error;
    return data;
}

export async function getPastAppointments(userId) {
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from('appointments')
        .select(`
      *,
      doctor:doctors(
        *,
        user:users(full_name),
        department:departments(name)
      )
    `)
        .eq('patient_id', userId)
        .or(`start_time.lt.${now},status.eq.cancelled`)
        .order('start_time', { ascending: false });

    if (error) throw error;
    return data;
}

export async function cancelAppointment(appointmentId, reason) {
    const { data, error } = await supabase
        .from('appointments')
        .update({
            status: 'cancelled',
            cancellation_reason: reason,
            cancelled_at: new Date().toISOString(),
        })
        .eq('id', appointmentId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function rescheduleAppointment(appointmentId, newTime) {
    const endTime = calculateEndTime(newTime);

    const { data, error } = await supabase
        .from('appointments')
        .update({
            start_time: newTime,
            end_time: endTime,
            status: 'pending', // Reset to pending for reconfirmation
        })
        .eq('id', appointmentId)
        .select(`
      *,
      doctor:doctors(
        *,
        user:users(full_name),
        department:departments(name)
      )
    `)
        .single();

    if (error) {
        if (error.message.includes('overlap') || error.code === '23505') {
            throw new Error('This time slot is no longer available. Please select another time.');
        }
        throw error;
    }

    return data;
}

export async function confirmAppointment(appointmentId) {
    const { data, error } = await supabase
        .from('appointments')
        .update({
            status: 'confirmed',
            confirmed_at: new Date().toISOString(),
        })
        .eq('id', appointmentId)
        .select()
        .single();

    if (error) throw error;
    return data;
}
