/**
 * useAuth Hook
 * 
 * Convenience hook for accessing auth context.
 * Re-exports all auth state and methods.
 */
import { useAuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
    return useAuthContext();
};

export default useAuth;
