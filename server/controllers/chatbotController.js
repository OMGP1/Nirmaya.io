/**
 * Enhanced Chatbot Controller
 * 
 * Features:
 * - Comprehensive symptom recognition
 * - Auto department & doctor selection
 * - Available time slots
 * - Page navigation commands
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { parseIntent, SYMPTOM_DEPARTMENT_MAP } = require('../utils/intentParser');
const { supabaseAdmin: supabase } = require('../config/supabaseAdmin');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Get available doctors for a department
 */
async function getAvailableDoctors(departmentName) {
    try {
        // First get department ID
        const { data: department } = await supabase
            .from('departments')
            .select('id, name')
            .ilike('name', `%${departmentName}%`)
            .eq('is_active', true)
            .single();

        if (!department) return [];

        // Get doctors in this department
        const { data: doctors } = await supabase
            .from('doctors')
            .select(`
                id,
                user_id,
                specialization,
                users!inner(full_name, email)
            `)
            .eq('department_id', department.id)
            .eq('is_active', true);

        return doctors?.map(d => ({
            id: d.id,
            name: d.users?.full_name || 'Doctor',
            specialization: d.specialization,
            departmentId: department.id,
            departmentName: department.name
        })) || [];
    } catch (error) {
        console.error('Error fetching doctors:', error);
        return [];
    }
}

/**
 * Generate available time slots for next 7 days
 */
function generateTimeSlots() {
    const slots = [];
    const now = new Date();

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const date = new Date(now);
        date.setDate(date.getDate() + dayOffset);

        // Skip past times for today
        const startHour = dayOffset === 0 ? Math.max(9, now.getHours() + 1) : 9;

        // Generate slots from 9 AM to 5 PM
        for (let hour = startHour; hour <= 17; hour++) {
            const slotDate = new Date(date);
            slotDate.setHours(hour, 0, 0, 0);

            slots.push({
                datetime: slotDate.toISOString(),
                display: slotDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                }) + ' at ' + slotDate.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit'
                })
            });
        }
    }

    return slots.slice(0, 10); // Return first 10 available slots
}

/**
 * Create appointment in database
 */
async function createAppointment(userId, doctorId, datetime, reason) {
    const startTime = new Date(datetime);
    const endTime = new Date(startTime.getTime() + 30 * 60000); // 30 min appointment

    // First get the doctor's department_id
    const { data: doctor, error: doctorError } = await supabase
        .from('doctors')
        .select('department_id')
        .eq('id', doctorId)
        .single();

    if (doctorError || !doctor) {
        throw new Error('Doctor not found');
    }

    const { data, error } = await supabase
        .from('appointments')
        .insert({
            patient_id: userId,
            doctor_id: doctorId,
            department_id: doctor.department_id,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            status: 'pending',
            reason: reason || 'Consultation',
            created_at: new Date().toISOString()
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Process chat message with enhanced intelligence
 */
async function processMessage(req, res) {
    try {
        const { message, userId, context } = req.body;

        console.log('📩 Received:', message);

        if (!message?.trim()) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Parse intent from message
        const intent = parseIntent(message);
        console.log('🔍 Parsed intent:', intent);

        let response = {
            message: '',
            intent,
            suggestedAction: null,
            navigation: null,
            doctors: [],
            slots: [],
            departmentInfo: null
        };

        // If we detected symptoms, find matching department and doctors
        if (intent.department && intent.confidence > 0.2) {
            const doctors = await getAvailableDoctors(intent.department);
            response.doctors = doctors;
            response.departmentInfo = {
                name: intent.department,
                matchedSymptoms: intent.matchedSymptoms
            };

            // Generate time slots
            response.slots = generateTimeSlots();

            // Build a smart response with AI
            const model = genAI.getGenerativeModel({
                model: 'gemini-2.5-flash',
                generationConfig: { temperature: 0.7, maxOutputTokens: 200 }
            });

            const prompt = `You are a helpful medical appointment assistant. Be VERY direct and action-oriented.

The patient said: "${message}"
Detected symptoms: ${intent.matchedSymptoms.join(', ')}
Recommended department: ${intent.department}
${doctors.length > 0 ? `Available doctor: Dr. ${doctors[0]?.name}` : ''}

Write a brief response (2 sentences max) that:
1. Briefly acknowledges their symptoms (e.g., "I understand you're experiencing...")
2. Immediately says "I recommend ${intent.department}. ${doctors.length > 0 ? `I've found Dr. ${doctors[0]?.name} who can help you. Please select a time slot below to book:` : 'Please select a time slot to book:'}"

Be concise and direct. Don't ask follow-up questions - just recommend and offer to book.`;

            const result = await model.generateContent(prompt);
            response.message = result.response.text();

            // Always set navigation to booking page when symptoms detected
            response.suggestedAction = 'book';
            response.navigation = {
                page: '/book',
                params: {
                    department: intent.department,
                    doctor: doctors[0]?.id || null
                }
            };

        } else if (intent.action === 'view') {
            // User wants to view appointments
            response.message = "I'll show you your appointments. Click below to view them!";
            response.suggestedAction = 'view';
            response.navigation = {
                page: '/appointments',
                params: {}
            };

        } else if (intent.action === 'cancel') {
            response.message = "I can help you cancel an appointment. Let me take you to your appointments where you can manage them.";
            response.suggestedAction = 'cancel';
            response.navigation = {
                page: '/appointments',
                params: {}
            };

        } else {
            // General query - use AI for conversational response
            const model = genAI.getGenerativeModel({
                model: 'gemini-2.5-flash',
                generationConfig: { temperature: 0.7, maxOutputTokens: 200 }
            });

            // Get available departments
            const { data: departments } = await supabase
                .from('departments')
                .select('name')
                .eq('is_active', true);
            const deptList = departments?.map(d => d.name).join(', ') || 'various departments';

            const prompt = `You are HealthBook's helpful medical appointment assistant.
Available departments: ${deptList}

User says: "${message}"

Respond helpfully in 2-3 sentences. If they describe symptoms, suggest a department. If they want to book, ask what symptoms they're experiencing. Be warm and professional.`;

            const result = await model.generateContent(prompt);
            response.message = result.response.text();
        }

        console.log('✅ Response:', response.message?.substring(0, 100));
        res.json(response);

    } catch (error) {
        console.error('❌ Chatbot error:', error);
        res.status(500).json({
            error: 'Failed to process message',
            message: 'I apologize, but I encountered an error. Please try again.'
        });
    }
}

/**
 * Direct booking from chat
 */
async function executeBooking(req, res) {
    try {
        const { userId, doctorId, datetime, department, reason } = req.body;

        if (!userId || !datetime) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        let targetDoctorId = doctorId;

        // If no specific doctor, find one from the department
        if (!targetDoctorId && department) {
            const doctors = await getAvailableDoctors(department);
            if (doctors.length === 0) {
                return res.status(400).json({ error: 'No doctors available in this department' });
            }
            targetDoctorId = doctors[0].id;
        }

        if (!targetDoctorId) {
            return res.status(400).json({ error: 'Please specify a department or doctor' });
        }

        // Create the appointment
        const appointment = await createAppointment(userId, targetDoctorId, datetime, reason);

        res.json({
            success: true,
            message: `✅ Appointment booked for ${new Date(datetime).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
            })}!`,
            appointment,
            navigation: {
                page: '/my-appointments',
                params: {}
            }
        });

    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ error: 'Failed to create appointment' });
    }
}

/**
 * Get quick replies based on context
 */
async function getQuickReplies(req, res) {
    try {
        const { userId, context } = req.query;

        let suggestions = [
            { text: 'Book appointment', action: 'book' },
            { text: 'View my appointments', action: 'view' },
            { text: 'I have a headache', action: 'symptom' }
        ];

        // Add context-aware suggestions
        if (context?.department) {
            suggestions.unshift({
                text: `Book ${context.department} appointment`,
                action: 'book_department'
            });
        }

        res.json({ suggestions });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get suggestions' });
    }
}

/**
 * Get symptom hints for autocomplete
 */
async function getSymptomHints(req, res) {
    try {
        const { query } = req.query;
        const allSymptoms = [];

        // Collect all symptoms
        for (const data of Object.values(SYMPTOM_DEPARTMENT_MAP)) {
            allSymptoms.push(...data.symptoms);
        }

        // Filter by query
        const filtered = query
            ? allSymptoms.filter(s => s.includes(query.toLowerCase()))
            : allSymptoms.slice(0, 10);

        res.json({ symptoms: [...new Set(filtered)].slice(0, 10) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get hints' });
    }
}

module.exports = {
    processMessage,
    executeBooking,
    getQuickReplies,
    getSymptomHints
};
