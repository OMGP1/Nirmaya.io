/**
 * Emergency Service
 * 
 * Client-side API service for SOS/emergency triage operations.
 * Calls the /api/emergency backend endpoints.
 */
import { supabase } from '@/lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005';

/**
 * Get auth headers for API calls
 */
async function getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
        throw new Error('Not authenticated — please log in');
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
    };
}

/**
 * Find nearest doctors by GPS coordinates
 * @param {number} lat - Patient latitude
 * @param {number} lng - Patient longitude
 * @param {number} [radiusKm=50] - Search radius in kilometers
 * @returns {Promise<{doctors: Array, search: Object}>}
 */
export async function findNearestDoctors(lat, lng, radiusKm = 50) {
    const headers = await getAuthHeaders();

    const res = await fetch(`${API_URL}/api/emergency/nearest-doctors`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ lat, lng, radius_km: radiusKm }),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to find nearby doctors');
    return json.data;
}

/**
 * Trigger an SOS emergency booking
 * Auto-assigns to the nearest available doctor.
 * 
 * @param {number} lat - Patient latitude
 * @param {number} lng - Patient longitude
 * @param {string} [reason] - Emergency reason
 * @returns {Promise<{appointment: Object, assigned_doctor: Object, all_nearby_doctors: Array}>}
 */
export async function triggerSOSBooking(lat, lng, reason = 'Emergency SOS Alert') {
    const headers = await getAuthHeaders();

    const res = await fetch(`${API_URL}/api/emergency/sos`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ lat, lng, reason }),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to trigger SOS booking');
    return json.data;
}

/**
 * Get patient's current GPS location with fallback
 * 
 * @param {number} [timeoutMs=5000] - Geolocation timeout
 * @returns {Promise<{lat: number, lng: number, isDemo: boolean}>}
 */
export function getPatientLocation(timeoutMs = 5000) {
    // Demo fallback coordinates (Mumbai city center)
    const DEMO_LOCATION = { lat: 19.0760, lng: 72.8777, isDemo: true };

    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            console.warn('Geolocation not supported — using demo location');
            resolve(DEMO_LOCATION);
            return;
        }

        const timeoutId = setTimeout(() => {
            console.warn('Geolocation timed out — using demo location');
            resolve(DEMO_LOCATION);
        }, timeoutMs);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                clearTimeout(timeoutId);
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    isDemo: false,
                });
            },
            (error) => {
                clearTimeout(timeoutId);
                console.warn('Geolocation error:', error.message, '— using demo location');
                resolve(DEMO_LOCATION);
            },
            {
                enableHighAccuracy: true,
                timeout: timeoutMs,
                maximumAge: 30000,
            }
        );
    });
}

/**
 * Update the current user's GPS location in the database
 * @param {number} lat
 * @param {number} lng
 */
export async function updateUserLocation(lat, lng) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('users')
        .update({
            location: `SRID=4326;POINT(${lng} ${lat})`,
        })
        .eq('id', user.id);

    if (error) throw error;
}
