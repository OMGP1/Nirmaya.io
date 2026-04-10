/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors in child components,
 * displays a fallback UI, and logs the user out on critical errors.
 */
import React from 'react';
import { Button } from '@/components/ui';
import { AlertTriangle, RefreshCw, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        // Log error to console in development
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    handleLogout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (e) {
            console.error('Logout failed:', e);
        }
        // Clear all local storage and redirect
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                        {/* Error Icon */}
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>

                        {/* Error Message */}
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Something went wrong
                        </h1>
                        <p className="text-gray-600 mb-6">
                            We encountered an unexpected error. Please try refreshing the page or log out to start fresh.
                        </p>

                        {/* Error Details (Dev Only) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mb-6 p-4 bg-red-50 rounded-lg text-left">
                                <p className="text-sm font-mono text-red-700 break-all">
                                    {this.state.error.toString()}
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                onClick={this.handleRetry}
                                className="flex-1 gap-2"
                                variant="outline"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Try Again
                            </Button>
                            <Button
                                onClick={this.handleLogout}
                                className="flex-1 gap-2"
                                variant="destructive"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </Button>
                        </div>

                        {/* Support Link */}
                        <p className="text-sm text-gray-500 mt-6">
                            If this problem persists, please contact support.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
