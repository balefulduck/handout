'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      // Clear any previous errors
      setError('');
      
      // Validate input fields first
      const username = formData.get('username');
      const password = formData.get('password');
      
      if (!username || !password) {
        setError('Bitte Benutzername und Passwort eingeben');
        return;
      }
      
      console.log('Login attempt with username:', username);
      
      // Attempt sign in but don't redirect automatically
      // This allows us to properly handle errors
      const result = await signIn('credentials', {
        username: username,
        password: password,
        callbackUrl: '/growguide',
        redirect: false, // Don't redirect automatically so we can handle errors
      });
      
      console.log('Login result:', result);
      
      if (result?.error) {
        // Handle specific NextAuth errors
        setError(result.error);
      } else if (result?.ok) {
        // If login was successful, clear any cached data and redirect
        localStorage.removeItem('recentlyViewedPlants');
        sessionStorage.clear();
        
        // Force page reload to ensure clean session state
        // Use the callbackUrl directly instead of trying to use result.url
        window.location.href = '/growguide';
      } else {
        // Unexpected error case
        setError('Ein unbekannter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
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
