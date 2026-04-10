/**
 * Format Doctor Name Utility
 * 
 * Prevents duplicate "Dr." prefix in doctor names.
 */

/**
 * Format a doctor's name, ensuring "Dr." prefix is only added once.
 * @param {string} fullName - The doctor's full name (may or may not include "Dr.")
 * @returns {string} - Formatted name with single "Dr." prefix
 */
export function formatDoctorName(fullName) {
    if (!fullName) return 'Unknown Doctor';

    // Remove any existing "Dr." or "Dr " prefix (case insensitive)
    const cleanName = fullName.replace(/^Dr\.?\s*/i, '').trim();

    // Return with single "Dr." prefix
    return `Dr. ${cleanName}`;
}

/**
 * Get clean doctor name without any prefix
 * @param {string} fullName - The doctor's full name
 * @returns {string} - Name without Dr. prefix
 */
export function getCleanDoctorName(fullName) {
    if (!fullName) return 'Unknown';
    return fullName.replace(/^Dr\.?\s*/i, '').trim();
}

export default formatDoctorName;
