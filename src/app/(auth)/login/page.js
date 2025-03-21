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
      // Log pre-login state
      await fetch('/api/debug/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'pre_login',
          username: formData.get('username')
        })
      });

      const res = await signIn('credentials', {
        username: formData.get('username'),
        password: formData.get('password'),
        redirect: false,
      });

      // Log post-login state
      await fetch('/api/debug/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'post_login',
          response: res
        })
      });

      if (res.error) {
        setError(res.error);
        return;
      }

      if (res.ok) {
        // Store successful authentication in sessionStorage
        sessionStorage.setItem('auth_success', 'true');
        
        // Add visual feedback that login was successful
        try {
          const loginForm = document.querySelector('form');
          if (loginForm) {
            loginForm.innerHTML = '<div class="p-4 bg-green-100 text-green-800 rounded">Anmeldung erfolgreich! Leite weiter...</div>';
          }
        } catch (error) {
          console.error('UI update error:', error);
        }
        
        // Simplified approach: first try the redirect API for consistency
        console.log('Attempting redirect after successful login');
        
        // Use a short timeout to ensure the session is properly established
        setTimeout(() => {
          try {
            // Try server-side redirect first
            fetch('/api/auth/redirect', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ destination: '/growguide' }),
            })
            .then(response => {
              if (!response.ok) throw new Error('Redirect API failed');
              return response.json();
            })
            .then(data => {
              console.log('Redirect response:', data);
              // Use the redirectUrl from the API response
              window.location.href = data.redirectUrl || '/growguide';
            })
            .catch(error => {
              console.error('Server redirect failed, using direct navigation:', error);
              // Direct navigation as fallback
              window.location.href = '/growguide';
            });
          } catch (error) {
            console.error('Redirect error, using fallback:', error);
            window.location.href = '/growguide';
          }
        }, 500); // Short delay to ensure session is established
      }
    } catch (error) {
      // Log any errors
      await fetch('/api/debug/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'error',
          error: error.message
        })
      });
      setError('Ein Fehler ist aufgetreten');
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
                defaultValue="workshop"
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
                defaultValue="drc"
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
