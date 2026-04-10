/**
 * Booking Context
 * 
 * Global state for the booking wizard flow.
 * Avoids prop drilling through 4-5 component layers.
 */
import { createContext, useContext, useReducer, useCallback } from 'react';

const BookingContext = createContext({});

// Wizard steps
export const BOOKING_STEPS = {
    DEPARTMENT: 1,
    DOCTOR: 2,
    DATETIME: 3,
    CONFIRM: 4,
    SUCCESS: 5,
};

const initialState = {
    step: BOOKING_STEPS.DEPARTMENT,
    selection: {
        department: null,
        doctor: null,
        date: null,       // ISO 8601 string
        timeSlot: null,   // ISO 8601 string
        reason: '',
        notes: '',
        isEmergency: false,
        severity: 'low',
        patientLocation: null,
    },
    error: null,
    isSubmitting: false,
};

// Reducer
function bookingReducer(state, action) {
    switch (action.type) {
        case 'SET_STEP':
            return { ...state, step: action.payload, error: null };

        case 'NEXT_STEP':
            return {
                ...state,
                step: Math.min(state.step + 1, BOOKING_STEPS.SUCCESS),
                error: null,
            };

        case 'PREV_STEP':
            return {
                ...state,
                step: Math.max(state.step - 1, BOOKING_STEPS.DEPARTMENT),
                error: null,
            };

        case 'SET_SELECTION':
            return {
                ...state,
                selection: { ...state.selection, ...action.payload },
            };

        case 'SET_DEPARTMENT':
            return {
                ...state,
                selection: {
                    ...state.selection,
                    department: action.payload,
                    // Reset downstream selections
                    doctor: null,
                    date: null,
                    timeSlot: null,
                },
            };

        case 'SET_DOCTOR':
            return {
                ...state,
                selection: {
                    ...state.selection,
                    doctor: action.payload,
                    // Reset downstream selections
                    date: null,
                    timeSlot: null,
                },
            };

        case 'SET_DATETIME':
            return {
                ...state,
                selection: {
                    ...state.selection,
                    date: action.payload.date,
                    timeSlot: action.payload.timeSlot,
                },
            };

        case 'SET_ERROR':
            return { ...state, error: action.payload, isSubmitting: false };

        case 'SET_SUBMITTING':
            return { ...state, isSubmitting: action.payload };

        case 'RESET':
            return initialState;

        case 'SET_EMERGENCY':
            return {
                ...state,
                selection: {
                    ...state.selection,
                    isEmergency: action.payload.isEmergency,
                    severity: action.payload.severity || 'high',
                    patientLocation: action.payload.patientLocation || null,
                },
            };

        default:
            return state;
    }
}

export const BookingProvider = ({ children }) => {
    const [state, dispatch] = useReducer(bookingReducer, initialState);

    // Actions
    const nextStep = useCallback(() => dispatch({ type: 'NEXT_STEP' }), []);
    const prevStep = useCallback(() => dispatch({ type: 'PREV_STEP' }), []);
    const setStep = useCallback((step) => dispatch({ type: 'SET_STEP', payload: step }), []);

    const setDepartment = useCallback((department) => {
        dispatch({ type: 'SET_DEPARTMENT', payload: department });
    }, []);

    const setDoctor = useCallback((doctor) => {
        dispatch({ type: 'SET_DOCTOR', payload: doctor });
    }, []);

    const setDateTime = useCallback((date, timeSlot) => {
        dispatch({ type: 'SET_DATETIME', payload: { date, timeSlot } });
    }, []);

    const setSelection = useCallback((data) => {
        dispatch({ type: 'SET_SELECTION', payload: data });
    }, []);

    const setError = useCallback((error) => {
        dispatch({ type: 'SET_ERROR', payload: error });
    }, []);

    const setSubmitting = useCallback((isSubmitting) => {
        dispatch({ type: 'SET_SUBMITTING', payload: isSubmitting });
    }, []);

    const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

    const setEmergency = useCallback((isEmergency, severity, patientLocation) => {
        dispatch({
            type: 'SET_EMERGENCY',
            payload: { isEmergency, severity, patientLocation },
        });
    }, []);

    // Computed values
    const canProceed = {
        [BOOKING_STEPS.DEPARTMENT]: !!state.selection.department,
        [BOOKING_STEPS.DOCTOR]: !!state.selection.doctor,
        [BOOKING_STEPS.DATETIME]: !!state.selection.date && !!state.selection.timeSlot,
        [BOOKING_STEPS.CONFIRM]: true,
        [BOOKING_STEPS.SUCCESS]: false,
    };

    const value = {
        // State
        ...state,
        canProceed: canProceed[state.step],

        // Actions
        nextStep,
        prevStep,
        setStep,
        setDepartment,
        setDoctor,
        setDateTime,
        setSelection,
        setError,
        setSubmitting,
        reset,
        setEmergency,
    };

    return (
        <BookingContext.Provider value={value}>
            {children}
        </BookingContext.Provider>
    );
};

export const useBooking = () => {
    const context = useContext(BookingContext);
    if (!context) {
        throw new Error('useBooking must be used within a BookingProvider');
    }
    return context;
};

export default BookingContext;
