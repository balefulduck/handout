'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Prevent multiple submissions
      if (isSubmitting) return;
      setIsSubmitting(true);
      
      // Clear any previous errors
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
      
      // Simplified login approach - don't use callbackUrl to avoid URL constructor issues
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false
      });
      
      console.log('Login result:', result);
      
      if (result?.error) {
        // Display the error from NextAuth
        setError(result.error || 'Anmeldung fehlgeschlagen');
        setIsSubmitting(false);
      } else if (result?.ok) {
        // Clear client-side data
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (e) {
          console.error('Error clearing storage:', e);
        }
        
        // Use Next.js router for navigation instead of window.location
        // This avoids URL constructor issues
        router.push('/growguide');
      } else {
        setError('Ein unbekannter Fehler ist aufgetreten');
        setIsSubmitting(false);
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
