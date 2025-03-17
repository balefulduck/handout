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
        
        // Log pre-redirect state
        await fetch('/api/debug/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'pre_redirect',
            url: window.location.href
          })
        });

        // Force update auth state
        router.refresh();
        
        // Set up an event listener to detect if anything is preventing navigation
        const beforeUnloadHandler = (e) => {
          console.log('beforeunload fired - navigation starting');
          sessionStorage.setItem('navigation_started', 'true');
        };
        
        window.addEventListener('beforeunload', beforeUnloadHandler);
        
        // Most basic approach - set a field in the form that indicates 
        // success and update the UI to show redirect is happening
        try {
          // Add a visible indicator that redirect is in progress
          const loginForm = document.querySelector('form');
          if (loginForm) {
            loginForm.innerHTML = '<div class="p-4 bg-green-100 text-green-800 rounded">Anmeldung erfolgreich! Leite weiter...</div>';
          }
          
          console.log('LOGIN SUCCESS: Redirecting to /growguide');
          
          // Try the absolute URL approach
          const baseUrl = window.location.origin;
          const targetUrl = `${baseUrl}/growguide`;
          console.log('Redirecting to absolute URL:', targetUrl);
          
          // Use setTimeout to ensure this code runs after any potential framework code
          setTimeout(() => {
            try {
              // Remove the event listener to prevent memory leaks
              window.removeEventListener('beforeunload', beforeUnloadHandler);
              
              // Try the most direct method
              window.location.href = targetUrl;
              
              // Final fallback if we're still here
              setTimeout(() => {
                if (window.location.pathname === '/login') {
                  console.log('FINAL FALLBACK: Using document.location');
                  document.location = targetUrl;
                }
              }, 500);
            } catch (err) {
              console.error('Redirect error:', err);
            }
          }, 300);
        } catch (error) {
          console.error('UI update error:', error);
          // If UI update fails, still try to redirect
          window.location.href = '/growguide';
        }

        // Log post-redirect attempt
        await fetch('/api/debug/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'post_redirect_attempt'
          })
        });
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
            Willkommen beim Cannabis Anbau Workshop
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
