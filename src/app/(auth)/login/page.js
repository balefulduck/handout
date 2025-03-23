'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get the current origin to ensure we use the correct URL in all environments
  const getOrigin = () => {
    return typeof window !== 'undefined' ? window.location.origin : '';
  };

  // Direct API call to authenticate without NextAuth redirect handling
  const handleDirectLogin = async (username, password) => {
    try {
      const origin = getOrigin();
      console.log('Using origin for API calls:', origin);
      
      // Call the credentials API directly with the correct origin
      const res = await fetch(`${origin}/api/auth/callback/credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      if (res.ok) {
        // Clear client storage
        localStorage.clear();
        sessionStorage.clear();
        
        // Direct navigation without URL constructor
        document.location.href = '/growguide';
        return true;
      } else {
        const data = await res.json();
        return { error: data.error || 'Anmeldung fehlgeschlagen' };
      }
    } catch (err) {
      console.error('Direct login error:', err);
      return { error: 'Ein Fehler ist aufgetreten' };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Prevent multiple submissions
      if (isSubmitting) return;
      setIsSubmitting(true);
      setError('');
      
      // Get form data
      const formData = new FormData(e.currentTarget);
      const username = formData.get('username');
      const password = formData.get('password');
      
      // Basic validation
      if (!username || !password) {
        setError('Bitte Benutzername und Passwort eingeben');
        setIsSubmitting(false);
        return;
      }
      
      console.log('Attempting login with username:', username);
      
      // First try the standard NextAuth approach
      try {
        const result = await signIn('credentials', {
          username,
          password,
          redirect: false
        });
        
        console.log('NextAuth login result:', result);
        
        if (result?.error) {
          setError(result.error);
          setIsSubmitting(false);
        } else if (result?.ok) {
          // Success - clear storage and redirect
          localStorage.clear();
          sessionStorage.clear();
          
          // Simple direct navigation
          window.location.href = '/growguide';
        }
      } catch (authError) {
        console.error('NextAuth error:', authError);
        
        // Fall back to direct login if NextAuth fails
        const directResult = await handleDirectLogin(username, password);
        
        if (directResult.error) {
          setError(directResult.error);
          setIsSubmitting(false);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold font-aptos text-custom-orange">
            Anmelden
          </h2>
          <p className="mt-2 text-center text-sm text-custom-orange/80">
            Willkommen beim Dr. Cannabis GrowGuide
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-custom-orange/10 p-4">
              <p className="text-sm text-custom-orange font-semibold">{error}</p>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Benutzername
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-custom-orange focus:border-custom-orange focus:z-10 sm:text-sm"
                placeholder="Benutzername"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Passwort
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-custom-orange focus:border-custom-orange focus:z-10 sm:text-sm"
                placeholder="Passwort"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-semibold rounded-md text-white bg-custom-orange hover:bg-custom-orange/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-orange"
            >
              Anmelden
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
