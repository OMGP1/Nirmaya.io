/**
 * AuthContext - Authentication State Management
 * 
 * Handles:
 * - Supabase session management via onAuthStateChange
 * - User profile + role fetching from public.users
 * - Loading states to prevent flash of unauthorized content
 */
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};

// Helper to get cached profile from localStorage
const getCachedProfile = () => {
    try {
        const cached = localStorage.getItem('niramaya_profile');
        return cached ? JSON.parse(cached) : null;
    } catch {
        return null;
    }
};

// Helper to cache profile to localStorage
const cacheProfile = (profile) => {
    try {
        if (profile) {
            localStorage.setItem('niramaya_profile', JSON.stringify(profile));
        } else {
            localStorage.removeItem('niramaya_profile');
        }
    } catch {
        // Ignore localStorage errors
    }
};

export const AuthProvider = ({ children }) => {
    // Initialize profile from cache to prevent flash
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(getCachedProfile());
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch user profile (including role) from public.users
    // Handles missing profiles gracefully (users created before trigger was set up)
    // Includes timeout to prevent infinite loading if RLS blocks the query
    const fetchProfile = async (userId) => {
        console.log('🔍 Fetching profile for:', userId); // DEBUG 1

        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            console.log('📋 Profile Fetch Result:', { data, error }); // DEBUG 2

            if (error) {
                // PGRST116 = "Row not found" - this is expected for legacy users
                if (error.code === 'PGRST116') {
                    console.warn('⚠️ User authenticated but has no profile row - using default');
                    return {
                        id: userId,
                        role: 'patient',
                        full_name: 'New User',
                        email: null,
                    };
                }
                throw error;
            }

            if (!data) {
                console.warn('⚠️ Profile query returned no data');
                return {
                    id: userId,
                    role: 'patient',
                    full_name: 'New User',
                    email: null,
                };
            }

            console.log('✅ Profile loaded successfully:', data.full_name, 'Role:', data.role); // DEBUG 3
            return data;
        } catch (err) {
            console.error('💥 Profile fetch error:', err.message);
            console.warn('⚠️ Using fallback profile - please check network or RLS policies');
            // Return fallback profile with PATIENT role (not admin) to prevent privilege escalation
            return {
                id: userId,
                role: 'patient', // IMPORTANT: Default to patient, not admin
                full_name: 'User',
                email: null,
            };
        }
    };

    // Initialize auth state
    useEffect(() => {
        // Get initial session
        const initAuth = async () => {
            try {
                const { data: { session: initialSession } } = await supabase.auth.getSession();

                if (initialSession) {
                    setSession(initialSession);
                    setUser(initialSession.user);

                    // Fetch profile with role immediately after getting session
                    const userProfile = await fetchProfile(initialSession.user.id);
                    setProfile(userProfile);
                    cacheProfile(userProfile);
                }
            } catch (err) {
                console.error('Auth init error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, currentSession) => {
                console.log('Auth event:', event);

                setSession(currentSession);
                setUser(currentSession?.user ?? null);

                if (currentSession?.user) {
                    // Fetch profile on login/token refresh
                    const userProfile = await fetchProfile(currentSession.user.id);
                    setProfile(userProfile);
                    cacheProfile(userProfile);
                } else {
                    // Clear profile on logout
                    setProfile(null);
                    cacheProfile(null);
                }

                setLoading(false);
            }
        );

        // Cleanup subscription
        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    // Sign up with email and password
    // Note: Does NOT set global loading - form components manage their own loading state
    const signUp = async (email, password, fullName) => {
        setError(null);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName, // Critical: passed to handle_new_user trigger
                    },
                },
            });

            if (error) throw error;

            return { data, error: null };
        } catch (err) {
            setError(err.message);
            return { data: null, error: err };
        }
    };

    // Sign in with email and password
    // Note: Does NOT set global loading - form components manage their own loading state
    const signIn = async (email, password) => {
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            return { data, error: null };
        } catch (err) {
            setError(err.message);
            return { data: null, error: err };
        }
    };

    // Sign in with Google OAuth
    const signInWithGoogle = async () => {
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });

            if (error) throw error;

            return { data, error: null };
        } catch (err) {
            setError(err.message);
            return { data: null, error: err };
        }
    };

    // Sign out
    const signOut = async () => {
        try {
            // Clear state immediately for responsive UI
            setUser(null);
            setProfile(null);
            setSession(null);
            cacheProfile(null); // Clear cached profile

            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Sign out error:', error);
            }
        } catch (err) {
            console.error('Sign out error:', err);
            setError(err.message);
        }
    };

    // Reset password (send email)
    const resetPassword = async (email) => {
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            return { error: null };
        } catch (err) {
            setError(err.message);
            return { error: err };
        } finally {
            setLoading(false);
        }
    };

    // Update password (after reset)
    const updatePassword = async (newPassword) => {
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (error) throw error;

            return { error: null };
        } catch (err) {
            setError(err.message);
            return { error: err };
        } finally {
            setLoading(false);
        }
    };

    const value = {
        // State
        user,
        profile,
        session,
        loading,
        error,

        // Computed
        isAuthenticated: !!session,
        role: profile?.role ?? null,
        isAdmin: profile?.role === 'admin',
        isDoctor: profile?.role === 'doctor',
        isPatient: profile?.role === 'patient',

        // Methods
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
        updatePassword,
        refreshProfile: () => user && fetchProfile(user.id).then(setProfile),
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
