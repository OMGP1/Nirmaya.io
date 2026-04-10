/**
 * Departments Service
 * 
 * API calls for department data.
 */
import { supabase } from '@/lib/supabase';

export async function getDepartments() {
    const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('is_active', true)
        .order('name');

    if (error) throw error;
    return data || [];
}

export async function getDepartmentById(id) {
    const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
}
