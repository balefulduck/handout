'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const CookieConsent = () => {
  const [showConsent, setShowConsent] = useState(false);
  
  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem('cookie-consent');
    if (!hasConsented) {
      setShowConsent(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'true');
    setShowConsent(false);
  };

  const handleReject = () => {
    // Still set a flag to remember that the user has seen the banner
    // but indicate they've rejected non-essential cookies
    localStorage.setItem('cookie-consent', 'false');
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50 border-t border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="mb-4 md:mb-0 md:mr-8 max-w-3xl">
            <h3 className="text-lg font-semibold mb-2">Cookie-Hinweis</h3>
            <p className="text-sm text-gray-600">
              Diese Website verwendet Cookies und lokale Speichertechnologien, um Ihnen ein besseres Nutzungserlebnis zu bieten. 
              Einige sind für den Betrieb der Seite notwendig (z.B. für die Anmeldung), während andere uns helfen, 
              die Nutzung der Website zu analysieren und zu verbessern. 
              Weitere Informationen finden Sie in unserer{' '}
              <Link href="/datenschutz" className="text-olive-green hover:underline">
                Datenschutzerklärung
              </Link>.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <button
              onClick={handleAccept}
              className="bg-olive-green text-white px-4 py-2 rounded hover:bg-olive-green/90 transition-colors"
            >
              Alle akzeptieren
            </button>
            <button
              onClick={handleReject}
              className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 transition-colors"
            >
              Nur notwendige akzeptieren
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
