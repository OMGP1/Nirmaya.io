/**
 * Doctors Service
 * 
 * API calls for doctor data with filtering.
 */
import { supabase } from '@/lib/supabase';

export async function getDoctors(filters = {}) {
    let query = supabase
        .from('doctors')
        .select(`
          *,
          department:departments(id, name),
          user:users(id, full_name, email)
        `)
        .eq('is_active', true);

    // Apply filters
    if (filters.departmentId) {
        query = query.eq('department_id', filters.departmentId);
    }

    if (filters.search) {
        query = query.or(`
          specialization.ilike.%${filters.search}%,
          user.full_name.ilike.%${filters.search}%
        `);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function getDoctorById(id) {
    const { data, error } = await supabase
        .from('doctors')
        .select(`
      *,
      department:departments(id, name, description),
      user:users(id, full_name, email, phone)
    `)
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
}

export async function getDoctorsByDepartment(departmentId) {
    const { data, error } = await supabase
        .from('doctors')
        .select(`
      *,
      department:departments(id, name),
      user:users(id, full_name, email)
    `)
        .eq('department_id', departmentId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function getDoctorAppointments(doctorId, startDate, endDate) {
    const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', doctorId)
        .gte('start_time', startDate)
        .lte('start_time', endDate)
        .neq('status', 'cancelled');

    if (error) throw error;
    return data;
}
