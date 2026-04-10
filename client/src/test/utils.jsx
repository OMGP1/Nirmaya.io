/**
 * Test Utilities
 * 
 * Helper functions for rendering components with providers.
 */
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/ui/Toast';

/**
 * Custom render that wraps components with all providers
 */
export function renderWithProviders(ui, options = {}) {
    const Wrapper = ({ children }) => (
        <BrowserRouter>
            <AuthProvider>
                <ToastProvider>
                    {children}
                </ToastProvider>
            </AuthProvider>
        </BrowserRouter>
    );

    return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Custom render with just router (no auth)
 */
export function renderWithRouter(ui, options = {}) {
    const Wrapper = ({ children }) => (
        <BrowserRouter>
            {children}
        </BrowserRouter>
    );

    return render(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
