import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function AutoLogin() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Authenticating...");

  useEffect(() => {
    const loginExistingUser = async () => {
      try {
        // Logging in with your exact existing account
        const { error } = await supabase.auth.signInWithPassword({
          email: 'omparabomgp123@gmail.com',
          password: 'Omgp@123',
        });

        if (error) throw error;

        // Success! Redirect to your dashboard
        setStatus("Success! Redirecting...");
        navigate('/dashboard');

      } catch (error) {
        console.error("Auto-login failed:", error.message);
        setStatus("Login failed. Please log in manually.");
      }
    };

    loginExistingUser();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <h2 className="text-xl font-semibold text-slate-700">{status}</h2>
    </div>
  );
}
