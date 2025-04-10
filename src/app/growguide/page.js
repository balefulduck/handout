'use client';

import { useSession } from 'next-auth/react';
import React, { useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

import ContextMenu from '@/components/ContextMenu';

// Use dynamic import with SSR disabled for the PhaseContent component to prevent hydration issues
const PhaseContent = dynamic(() => import('@/components/phases/PhaseContent'), {
  ssr: false,
  loading: () => <div className="animate-pulse p-4 bg-gray-100 rounded">Loading phase content...</div>
});

// Create an error boundary fallback component
function ErrorFallback({ error }) {
  return (
    <div className="border-2 border-red-500 p-4 rounded-lg mb-4 bg-red-50">
      <h3 className="font-bold text-red-700">Ein Fehler ist aufgetreten</h3>
      <p className="text-sm text-red-600">Bitte lade die Seite neu oder kontaktiere den Support.</p>
      <button 
        onClick={() => window.location.reload()}
        className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
      >
        Seite neu laden
      </button>
    </div>
  );
}

// Custom ErrorBoundary component since React's is being deprecated
class CustomErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Growth guide error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

export default function GrowGuidePage() {
  // Use safe default values for all state
  const { data: session } = useSession();
  const [selectedStrains, setSelectedStrains] = useState([]);
  const [activePhase, setActivePhase] = useState('seedling');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clientReady, setClientReady] = useState(false);

  // Handle client-side mounting to prevent hydration issues
  useEffect(() => {
    // Set client ready after hydration is complete
    setClientReady(true);
  }, []);

  // Safely fetch data with proper error handling
  useEffect(() => {
    let isComponentMounted = true;
    
    const fetchStrains = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/strains/selected');
        
        if (!isComponentMounted) return;
        
        if (response.ok) {
          const data = await response.json();
          setSelectedStrains(data.strains || []);
        } else {
          console.warn('Failed to fetch strains:', response.status);
          // Fail gracefully - don't set error state as this isn't critical
        }
      } catch (err) {
        if (isComponentMounted) {
          console.error('Error fetching strains:', err);
          // Again, fail gracefully for this non-critical data
        }
      } finally {
        if (isComponentMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchStrains();
    
    return () => {
      isComponentMounted = false;
    };
  }, []);

  const handlePhaseSelect = (phase) => {
    setActivePhase(phase === activePhase ? null : phase);
  };
  
  const getPhaseTitle = () => {
    switch (activePhase) {
      case 'seedling':
        return 'Keimlingsphase';
      case 'vegetation':
        return 'Vegetationsphase';
      case 'flower':
        return 'Blütephase';
      case 'harvest':
        return 'Ernte';
      default:
        return '';
    }
  };

  const renderPhaseContent = () => {
    if (error) {
      return <ErrorFallback error={error} />;
    }
    
    if (!activePhase) {
      return null;
    }
    
    return (
      <Suspense fallback={<div className="animate-pulse p-4 bg-gray-100 rounded">Loading phase content...</div>}>
        {/* Only render PhaseContent component when on client */}
        {clientReady && <PhaseContent phaseName={activePhase} />}
      </Suspense>
    );
  };

  return (
    <div className="min-h-screen mt-10 pt-7 bg-gray-50">
      {/* Render ContextMenu always - it's client-side only via 'use client' directive */}
      <ContextMenu activePhase={activePhase} onPhaseSelect={handlePhaseSelect} />

      <main className="max-w-7xl mx-auto px-6 py-10 pb-24">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-medium-blue mb-4 text-left">Grow Guide</h2>
          
          {/* Info Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Card 1: Phase Selection */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-medium-blue/10 p-3 flex items-center gap-3">
                <div className="bg-medium-blue rounded-full p-2 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h3 className="font-bold text-medium-blue">Phasen erkunden</h3>
              </div>
              <div className="p-4">
                <p className="text-gray-600 text-sm font-dosis">
                  Wähle eine Wachstumsphase im Kontextmenü am unteren Bildschirmrand für detaillierte Informationen zu den wichtigsten Parametern.
                </p>
              </div>
            </div>
            
            {/* Card 2: DRC Info Tags */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-olive-green/10 p-3 flex items-center gap-3">
                <div className="bg-olive-green rounded-full p-2 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-olive-green">Fachbegriffe</h3>
              </div>
              <div className="p-4">
                <p className="text-gray-600 text-sm font-dosis">
                  Tippe auf <span className="drc-info-tag-style rounded-md px-2 py-0.5 font-bold shadow-sm bg-olive-green/15 text-olive-green border border-olive-green/30">markierte</span> Begriffe für weitere Informationen und praktische Tipps.
                </p>
              </div>
            </div>
            
            {/* Card 3: Dr. Cannabis Lexikon */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-purple/10 p-3 flex items-center gap-3">
                <div className="bg-purple rounded-full p-2 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="font-bold text-purple">Dr. Cannabis Lexikon</h3>
              </div>
              <div className="p-4">
                <p className="text-gray-600 text-sm font-dosis mb-3">
                  Schau Dir unser Dr. Cannabis Lexikon an für umfassende Erklärungen und Hintergrundwissen. <span className="text-xs text-gray-500">(Derzeit in der Aufbauphase)</span>
                </p>
                <Link href="/drc-info" className="block w-full py-2 px-4 bg-purple text-white text-center rounded-md hover:bg-purple/90 transition-colors text-sm font-medium">
                  Zum Lexikon
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Phase Content */}
        <div className="mb-10 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          {activePhase && (
            <div className="mb-6">
              <h4 className="mb-2 text-cool-gray text-pulse-animation">{getPhaseTitle()}</h4>
              <div className="h-1 w-24 bg-gradient-to-r from-purple to-medium-blue rounded transition-all duration-500 hover:w-32"></div>
            </div>
          )}
          {/* Simpler fade animation implemented with CSS for better hydration */}
          <div className={`transition-opacity duration-300 ${activePhase !== null ? 'opacity-100' : 'opacity-0'}`}>
            {renderPhaseContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
