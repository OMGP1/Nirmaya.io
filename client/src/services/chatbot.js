/**
 * Chatbot Service
 * 
 * Local symptom analysis and recommendations
 * Works without backend API to avoid CORS issues
 */
import { supabase } from '@/lib/supabase';

// Symptom to department mapping
const SYMPTOM_MAPPINGS = {
    // Cardiology
    'chest pain': 'Cardiology',
    'heart': 'Cardiology',
    'palpitation': 'Cardiology',
    'shortness of breath': 'Cardiology',
    'blood pressure': 'Cardiology',
    'hypertension': 'Cardiology',

    // Neurology
    'headache': 'Neurology',
    'migraine': 'Neurology',
    'dizziness': 'Neurology',
    'numbness': 'Neurology',
    'seizure': 'Neurology',
    'memory': 'Neurology',
    'brain': 'Neurology',

    // Orthopedics
    'joint pain': 'Orthopedics',
    'back pain': 'Orthopedics',
    'bone': 'Orthopedics',
    'fracture': 'Orthopedics',
    'arthritis': 'Orthopedics',
    'knee': 'Orthopedics',
    'spine': 'Orthopedics',
    'shoulder': 'Orthopedics',

    // Dermatology
    'skin': 'Dermatology',
    'rash': 'Dermatology',
    'acne': 'Dermatology',
    'eczema': 'Dermatology',
    'itching': 'Dermatology',
    'hair loss': 'Dermatology',

    // Gastroenterology
    'stomach': 'Gastroenterology',
    'digestive': 'Gastroenterology',
    'nausea': 'Gastroenterology',
    'vomiting': 'Gastroenterology',
    'diarrhea': 'Gastroenterology',
    'constipation': 'Gastroenterology',
    'acid reflux': 'Gastroenterology',
    'indigestion': 'Gastroenterology',

    // Ophthalmology
    'eye': 'Ophthalmology',
    'vision': 'Ophthalmology',
    'blurry': 'Ophthalmology',
    'cataract': 'Ophthalmology',

    // ENT
    'ear': 'ENT',
    'nose': 'ENT',
    'throat': 'ENT',
    'sore throat': 'ENT',
    'hearing': 'ENT',
    'sinus': 'ENT',
    'cold': 'ENT',
    'cough': 'ENT',

    // Psychiatry
    'anxiety': 'Psychiatry',
    'depression': 'Psychiatry',
    'stress': 'Psychiatry',
    'sleep': 'Psychiatry',
    'insomnia': 'Psychiatry',
    'mental': 'Psychiatry',

    // General Medicine
    'fever': 'General Medicine',
    'fatigue': 'General Medicine',
    'weakness': 'General Medicine',
    'tired': 'General Medicine',
    'flu': 'General Medicine',
    'infection': 'General Medicine',
};

/**
 * Analyze symptoms and return department recommendation
 */
function analyzeSymptoms(message) {
    const lowerMessage = message.toLowerCase();

    for (const [symptom, department] of Object.entries(SYMPTOM_MAPPINGS)) {
        if (lowerMessage.includes(symptom)) {
            return {
                department,
                symptom,
                confidence: 'high'
            };
        }
    }

    return null;
}

/**
 * Generate response based on user message using BioBERT FastAPI
 */
async function generateResponse(message, userId) {
    const lowerMessage = message.toLowerCase();

    // Check for booking intent
    if (lowerMessage.includes('book') && lowerMessage.includes('appointment') && lowerMessage.split(' ').length < 5) {
        return {
            message: "I'd be happy to help you book an appointment! 📅 Please describe your symptoms in detail so I can analyze and route you to the correct department.",
            intent: 'booking',
            quickReplies: ['I have a headache', 'General checkup']
        };
    }

    if (lowerMessage.includes('view') && lowerMessage.includes('appointment')) {
        return {
            message: "Sure! Click below to view your appointments.",
            intent: 'view_appointments',
            navigation: { page: '/appointments' }
        };
    }

    try {
        // ML Backend Integration
        const res = await fetch('http://localhost:8000/analyze-symptoms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transcript: message })
        });
        
        if (!res.ok) throw new Error("Backend not responding");
        
        const analysis = await res.json();
        const department = analysis.department || 'General Medicine';
        
        // Fetch doctors based on the AI routed department
        const doctors = await fetchDoctorsByDepartment(department);
        const slots = generateTimeSlots();
        
        let responseMessage = `Based on my analysis (BioBERT Confidence: ${Math.round(analysis.confidence*100)}%), I recommend consulting our **${department}** department.\n\n${getDepartmentDescription(department)}\n\n_Clinical Advice: ${analysis.protocol_advice}_`;
        
        return {
            message: responseMessage,
            intent: 'symptom_analysis',
            departmentInfo: { name: department },
            riskScore: analysis.risk_score,
            riskStatus: analysis.risk_status,
            doctors: doctors,
            slots: slots,
            navigation: {
                page: '/book',
                params: { department: department }
            }
        };
    } catch (error) {
        console.warn('Falling back to local heuristic analysis:', error);
        // Fallback to old heuristic logic embedded here
        const analysis = analyzeSymptoms(message) || { department: 'General Medicine' };
        
        const doctors = await fetchDoctorsByDepartment(analysis.department);
        const slots = generateTimeSlots();

        return {
            message: `Based on your symptoms, I recommend visiting our **${analysis.department}** department. ${getDepartmentDescription(analysis.department)}`,
            intent: 'symptom_analysis',
            departmentInfo: { name: analysis.department },
            doctors: doctors,
            slots: slots,
            navigation: {
                page: '/book',
                params: { department: analysis.department }
            }
        };
    }
}

/**
 * Get department description
 */
function getDepartmentDescription(department) {
    const descriptions = {
        'Cardiology': "Our cardiologists specialize in heart conditions and cardiovascular health.",
        'Neurology': "Our neurologists can help with headaches, migraines, and nervous system issues.",
        'Orthopedics': "Our orthopedic specialists handle bone, joint, and muscle problems.",
        'Dermatology': "Our dermatologists treat all skin-related conditions.",
        'Gastroenterology': "Our gastroenterologists specialize in digestive system issues.",
        'Ophthalmology': "Our ophthalmologists can help with all eye and vision problems.",
        'ENT': "Our ENT specialists treat ear, nose, and throat conditions.",
        'Psychiatry': "Our mental health specialists can help with anxiety, depression, and stress.",
        'General Medicine': "Our general physicians can assess your condition and provide treatment."
    };

    return descriptions[department] || "Our specialists are ready to help you.";
}

/**
 * Fetch doctors by department from Supabase
 */
async function fetchDoctorsByDepartment(departmentName) {
    try {
        const { data: department } = await supabase
            .from('departments')
            .select('id')
            .ilike('name', `%${departmentName}%`)
            .single();

        if (!department) return [];

        const { data: doctors } = await supabase
            .from('doctors')
            .select(`
                id,
                specialization,
                user:users(full_name),
                department:departments(name)
            `)
            .eq('department_id', department.id)
            .eq('is_active', true)
            .limit(3);

        return (doctors || []).map(doc => ({
            id: doc.id,
            name: doc.user?.full_name || 'Doctor',
            specialization: doc.specialization,
            departmentName: doc.department?.name
        }));
    } catch (error) {
        console.error('Error fetching doctors:', error);
        return [];
    }
}

/**
 * Generate available time slots for the next few days
 */
function generateTimeSlots() {
    const slots = [];
    const now = new Date();

    // Generate slots for next 3 days
    for (let dayOffset = 1; dayOffset <= 3; dayOffset++) {
        const date = new Date(now);
        date.setDate(date.getDate() + dayOffset);

        // Morning slots: 9 AM, 10 AM, 11 AM
        for (let hour of [9, 10, 11, 14, 15, 16]) {
            date.setHours(hour, 0, 0, 0);
            slots.push({
                datetime: date.toISOString(),
                display: `${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} ${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`
            });
        }
    }

    return slots.slice(0, 8); // Return first 8 slots
}

/**
 * Send message - now works locally without backend
 */
export async function sendMessage(message, userId) {
    // Add small delay to feel more natural
    await new Promise(resolve => setTimeout(resolve, 500));

    return generateResponse(message, userId);
}

/**
 * Get quick reply suggestions
 */
export async function getQuickReplies(userId) {
    return {
        suggestions: [
            'Book appointment',
            'View my appointments',
            'I have a headache',
            'General checkup'
        ]
    };
}

/**
 * Book appointment via chatbot - uses Supabase directly
 */
export async function bookAppointment({ userId, doctorId, datetime, department, reason, context_brief }) {
    try {
        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            throw new Error('Not authenticated');
        }

        // Calculate end time (30 min appointment)
        const startTime = new Date(datetime);
        const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

        // Get department ID if we have a name
        let departmentId = null;
        if (department) {
            const { data: dept } = await supabase
                .from('departments')
                .select('id')
                .ilike('name', `%${department}%`)
                .single();
            departmentId = dept?.id;
        }

        // Insert appointment
        const { data, error } = await supabase
            .from('appointments')
            .insert({
                patient_id: user.id,
                doctor_id: doctorId,
                department_id: departmentId,
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                reason: reason || 'Consultation',
                notes: context_brief || null,
                status: 'pending'
            })
            .select()
            .single();

        if (error) throw error;

        return {
            success: true,
            message: 'Your appointment has been booked successfully! 🎉',
            appointment: data
        };
    } catch (error) {
        console.error('Chatbot booking error:', error);
        throw new Error('Failed to book appointment. Please try again.');
    }
}

// Legacy function for backwards compatibility
export async function executeBooking(userId, departmentName, datetime, reason) {
    return bookAppointment({ userId, department: departmentName, datetime, reason });
}
