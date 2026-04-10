/**
 * Departments Controller
 */
const { supabaseAdmin } = require('../config/supabaseAdmin');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');

/**
 * List all departments
 */
const getDepartments = asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
        .from('departments')
        .select('*')
        .order('name');

    if (error) {
        throw ApiError.internal('Failed to fetch departments');
    }

    res.json({
        success: true,
        data: { departments: data },
    });
});

/**
 * Get department by ID
 */
const getDepartmentById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
        .from('departments')
        .select(`
            *,
            doctors:doctors(
                id,
                specialization,
                is_active,
                user:users(full_name)
            )
        `)
        .eq('id', id)
        .single();

    if (error || !data) {
        throw ApiError.notFound('Department not found');
    }

    res.json({
        success: true,
        data: { department: data },
    });
});

module.exports = {
    getDepartments,
    getDepartmentById,
};
