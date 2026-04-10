/**
 * Intent Parser with Comprehensive Symptom Recognition
 * 
 * Maps symptoms and keywords to medical departments
 */

// Comprehensive symptom-to-department mapping
const SYMPTOM_DEPARTMENT_MAP = {
    // Cardiology - Heart & Circulatory System
    cardiology: {
        department: 'Cardiology',
        symptoms: [
            'chest pain', 'heart pain', 'palpitations', 'heart racing',
            'shortness of breath', 'breathing difficulty', 'heavy breathing',
            'high blood pressure', 'hypertension', 'low blood pressure',
            'irregular heartbeat', 'heart flutter', 'swollen ankles',
            'dizziness', 'fainting', 'fatigue', 'heart attack', 'angina',
            'blocked arteries', 'cholesterol', 'arrhythmia'
        ],
        keywords: ['heart', 'cardiac', 'cardiovascular', 'bp', 'blood pressure']
    },

    // Neurology - Brain & Nervous System
    neurology: {
        department: 'Neurology',
        symptoms: [
            'headache', 'migraine', 'head pain', 'severe headache',
            'seizures', 'epilepsy', 'convulsions', 'fits',
            'numbness', 'tingling', 'pins and needles',
            'memory loss', 'confusion', 'difficulty speaking',
            'tremors', 'shaking', 'parkinsons', 'paralysis',
            'stroke', 'brain fog', 'vertigo', 'balance problems',
            'nerve pain', 'sciatica', 'neuropathy'
        ],
        keywords: ['brain', 'nerve', 'neurological', 'spinal cord']
    },

    // Orthopedics - Bones & Joints
    orthopedics: {
        department: 'Orthopedics',
        symptoms: [
            'bone pain', 'joint pain', 'knee pain', 'back pain',
            'fracture', 'broken bone', 'sprain', 'strain',
            'arthritis', 'joint swelling', 'stiff joints',
            'shoulder pain', 'hip pain', 'neck pain', 'spine pain',
            'muscle pain', 'sports injury', 'ligament tear',
            'osteoporosis', 'scoliosis', 'herniated disc', 'slipped disc'
        ],
        keywords: ['bone', 'joint', 'muscle', 'skeleton', 'orthopedic', 'fracture']
    },

    // Dermatology - Skin
    dermatology: {
        department: 'Dermatology',
        symptoms: [
            'skin rash', 'rashes', 'itching', 'itchy skin',
            'acne', 'pimples', 'eczema', 'psoriasis',
            'skin infection', 'fungal infection', 'ringworm',
            'hair loss', 'baldness', 'dandruff',
            'skin allergy', 'hives', 'urticaria',
            'moles', 'warts', 'skin lesions', 'skin cancer',
            'dry skin', 'sunburn', 'skin discoloration'
        ],
        keywords: ['skin', 'hair', 'nail', 'derma']
    },

    // Pediatrics - Children
    pediatrics: {
        department: 'Pediatrics',
        symptoms: [
            'child fever', 'baby sick', 'child cough',
            'child vaccination', 'immunization', 'growth issues',
            'developmental delay', 'child not eating',
            'childhood illness', 'infant care', 'newborn checkup',
            'child stomach ache', 'child ear infection'
        ],
        keywords: ['child', 'baby', 'infant', 'kid', 'toddler', 'pediatric', 'newborn', 'son', 'daughter']
    },

    // Gastroenterology - Digestive System
    gastroenterology: {
        department: 'Gastroenterology',
        symptoms: [
            'stomach pain', 'abdominal pain', 'belly pain',
            'acidity', 'acid reflux', 'heartburn', 'gerd',
            'nausea', 'vomiting', 'indigestion',
            'diarrhea', 'constipation', 'bloating', 'gas',
            'ulcer', 'gastritis', 'ibs', 'irritable bowel',
            'liver problem', 'jaundice', 'hepatitis',
            'gallstones', 'appendicitis', 'food poisoning'
        ],
        keywords: ['stomach', 'digestive', 'liver', 'intestine', 'bowel', 'gastric']
    },

    // Pulmonology - Lungs & Respiratory
    pulmonology: {
        department: 'Pulmonology',
        symptoms: [
            'cough', 'chronic cough', 'persistent cough',
            'wheezing', 'breathing problems', 'breathlessness',
            'asthma', 'bronchitis', 'pneumonia',
            'chest congestion', 'phlegm', 'mucus',
            'tuberculosis', 'tb', 'lung infection',
            'sleep apnea', 'snoring', 'copd'
        ],
        keywords: ['lung', 'respiratory', 'breathing', 'pulmonary', 'chest']
    },

    // ENT - Ear, Nose, Throat
    ent: {
        department: 'ENT',
        symptoms: [
            'ear pain', 'earache', 'hearing loss', 'ringing ears', 'tinnitus',
            'sore throat', 'throat pain', 'difficulty swallowing',
            'sinus', 'sinusitis', 'nasal congestion', 'blocked nose',
            'runny nose', 'sneezing', 'nosebleed',
            'voice change', 'hoarse voice', 'tonsils', 'tonsillitis'
        ],
        keywords: ['ear', 'nose', 'throat', 'sinus', 'hearing', 'voice']
    },

    // Ophthalmology - Eyes
    ophthalmology: {
        department: 'Ophthalmology',
        symptoms: [
            'eye pain', 'blurred vision', 'vision problems',
            'red eyes', 'eye infection', 'conjunctivitis', 'pink eye',
            'dry eyes', 'watery eyes', 'eye irritation',
            'double vision', 'night blindness', 'color blindness',
            'cataracts', 'glaucoma', 'floaters', 'flashes'
        ],
        keywords: ['eye', 'vision', 'sight', 'optical', 'glasses', 'spectacles']
    },

    // General Medicine - Common Issues
    general: {
        department: 'General Medicine',
        symptoms: [
            'fever', 'cold', 'flu', 'viral infection',
            'weakness', 'tiredness', 'body pain', 'body ache',
            'weight loss', 'weight gain', 'loss of appetite',
            'diabetes', 'blood sugar', 'thyroid',
            'general checkup', 'annual checkup', 'health screening',
            'not feeling well', 'unwell', 'sick'
        ],
        keywords: ['general', 'common', 'checkup', 'routine', 'physical exam']
    },

    // Psychiatry - Mental Health
    psychiatry: {
        department: 'Psychiatry',
        symptoms: [
            'depression', 'anxiety', 'panic attacks',
            'stress', 'insomnia', 'sleep problems', 'cant sleep',
            'mood swings', 'bipolar', 'schizophrenia',
            'addiction', 'substance abuse', 'alcohol problem',
            'suicidal thoughts', 'self harm', 'mental health'
        ],
        keywords: ['mental', 'psychological', 'emotional', 'therapy', 'counseling']
    },

    // Gynecology - Women's Health
    gynecology: {
        department: 'Gynecology',
        symptoms: [
            'irregular periods', 'missed period', 'heavy periods',
            'period pain', 'menstrual cramps', 'pcos', 'pcod',
            'pregnancy', 'prenatal', 'fertility issues',
            'vaginal infection', 'discharge', 'menopause',
            'breast pain', 'breast lump'
        ],
        keywords: ['pregnancy', 'menstrual', 'gynecologist', 'womens health', 'female']
    },

    // Urology - Urinary System
    urology: {
        department: 'Urology',
        symptoms: [
            'urinary infection', 'uti', 'burning urination',
            'frequent urination', 'blood in urine', 'kidney pain',
            'kidney stones', 'bladder problem', 'incontinence',
            'prostate problem', 'erectile dysfunction'
        ],
        keywords: ['urinary', 'kidney', 'bladder', 'prostate']
    },

    // Oncology - Cancer
    oncology: {
        department: 'Oncology',
        symptoms: [
            'tumor', 'cancer', 'malignant', 'lump',
            'unexplained weight loss', 'night sweats',
            'chemotherapy', 'radiation therapy', 'cancer screening'
        ],
        keywords: ['cancer', 'tumor', 'malignant', 'oncology', 'chemo']
    }
};

// Action keywords
const ACTION_KEYWORDS = {
    book: ['book', 'schedule', 'make appointment', 'fix appointment', 'set up', 'arrange', 'need appointment', 'want to see', 'need to see'],
    view: ['view', 'show', 'see', 'list', 'my appointments', 'check appointments', 'upcoming'],
    cancel: ['cancel', 'delete', 'remove appointment'],
    reschedule: ['reschedule', 'change date', 'change time', 'modify appointment', 'postpone']
};

// Time-related keywords
const TIME_KEYWORDS = {
    today: ['today', 'now', 'immediately', 'asap', 'right now'],
    tomorrow: ['tomorrow', 'next day'],
    thisWeek: ['this week', 'in few days'],
    nextWeek: ['next week', 'coming week'],
    morning: ['morning', 'am', 'early'],
    afternoon: ['afternoon', 'noon', 'midday'],
    evening: ['evening', 'pm', 'late']
};

/**
 * Find matching department based on symptoms
 */
function suggestDepartment(message) {
    const lowerMessage = message.toLowerCase();
    let bestMatch = null;
    let highestScore = 0;
    let matchedSymptoms = [];

    for (const [key, data] of Object.entries(SYMPTOM_DEPARTMENT_MAP)) {
        let score = 0;
        let matched = [];

        // Check symptoms
        for (const symptom of data.symptoms) {
            if (lowerMessage.includes(symptom)) {
                score += 3; // Higher weight for symptom match
                matched.push(symptom);
            }
        }

        // Check keywords
        for (const keyword of data.keywords) {
            if (lowerMessage.includes(keyword)) {
                score += 2;
                matched.push(keyword);
            }
        }

        if (score > highestScore) {
            highestScore = score;
            bestMatch = data.department;
            matchedSymptoms = matched;
        }
    }

    return {
        department: bestMatch,
        confidence: Math.min(highestScore / 10, 1.0),
        matchedSymptoms
    };
}

/**
 * Detect user action intent
 */
function detectAction(message) {
    const lowerMessage = message.toLowerCase();

    for (const [action, keywords] of Object.entries(ACTION_KEYWORDS)) {
        for (const keyword of keywords) {
            if (lowerMessage.includes(keyword)) {
                return action;
            }
        }
    }
    return 'query';
}

/**
 * Parse date/time from message
 */
function parseDateTime(message) {
    const lowerMessage = message.toLowerCase();
    const now = new Date();
    let preferredDate = null;
    let preferredTime = null;

    // Check for specific dates
    if (TIME_KEYWORDS.today.some(k => lowerMessage.includes(k))) {
        preferredDate = new Date(now);
    } else if (TIME_KEYWORDS.tomorrow.some(k => lowerMessage.includes(k))) {
        preferredDate = new Date(now);
        preferredDate.setDate(preferredDate.getDate() + 1);
    } else if (TIME_KEYWORDS.thisWeek.some(k => lowerMessage.includes(k))) {
        preferredDate = new Date(now);
        preferredDate.setDate(preferredDate.getDate() + 3);
    } else if (TIME_KEYWORDS.nextWeek.some(k => lowerMessage.includes(k))) {
        preferredDate = new Date(now);
        preferredDate.setDate(preferredDate.getDate() + 7);
    }

    // Check for day names
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (let i = 0; i < days.length; i++) {
        if (lowerMessage.includes(days[i])) {
            preferredDate = new Date(now);
            const daysUntil = (i - now.getDay() + 7) % 7 || 7;
            preferredDate.setDate(preferredDate.getDate() + daysUntil);
            break;
        }
    }

    // Check for time preference
    if (TIME_KEYWORDS.morning.some(k => lowerMessage.includes(k))) {
        preferredTime = '09:00';
    } else if (TIME_KEYWORDS.afternoon.some(k => lowerMessage.includes(k))) {
        preferredTime = '14:00';
    } else if (TIME_KEYWORDS.evening.some(k => lowerMessage.includes(k))) {
        preferredTime = '17:00';
    }

    // Parse specific times like "3 pm", "10:30 am"
    const timeMatch = lowerMessage.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
        const period = timeMatch[3]?.toLowerCase();

        if (period === 'pm' && hours !== 12) hours += 12;
        if (period === 'am' && hours === 12) hours = 0;

        preferredTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    if (preferredDate && preferredTime) {
        const [hours, minutes] = preferredTime.split(':');
        preferredDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return preferredDate.toISOString();
    }

    return preferredDate?.toISOString() || null;
}

/**
 * Main intent parsing function
 */
function parseIntent(message) {
    const action = detectAction(message);
    const departmentResult = suggestDepartment(message);
    const datetime = parseDateTime(message);

    return {
        action,
        department: departmentResult.department,
        matchedSymptoms: departmentResult.matchedSymptoms,
        datetime,
        confidence: departmentResult.confidence,
        rawMessage: message
    };
}

/**
 * Get all department mappings
 */
function getDepartmentInfo() {
    return Object.entries(SYMPTOM_DEPARTMENT_MAP).map(([key, data]) => ({
        key,
        name: data.department,
        sampleSymptoms: data.symptoms.slice(0, 5)
    }));
}

module.exports = {
    parseIntent,
    suggestDepartment,
    detectAction,
    parseDateTime,
    getDepartmentInfo,
    SYMPTOM_DEPARTMENT_MAP
};
