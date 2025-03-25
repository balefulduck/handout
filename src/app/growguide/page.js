'use client';

import { useSession } from 'next-auth/react';
import React, { useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';

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
        <div className="mb-8 md:flex md:justify-between">
          <div className="md:w-1/2">
            <h2 className="text-medium-blue mb-2 text-left">Grow Guide</h2>
          </div>
          <div className="md:w-1/2 mt-4 md:mt-0 text-left">
            <p className="text-gray-600 text-base font-dosis">
              Wähle eine Wachstumsphase im Kontextmenü am unteren Bildschirmrand um detaillierte Informationen zu den wichtigsten Parametern deines Grows zu erhalten.
            </p>
            <p className="text-gray-600 text-base mt-2 font-dosis">
              Wische über <span className="drc-info-tag-style rounded-md px-2 py-0.5 font-bold shadow-md bg-olive-green/15 text-olive-green border border-olive-green/30">markierte</span> Begriffe um weitere Informationen und Tipps zu erhalten. <br />Schau Dir auch unser Dr. Cannabis Lexikon an!
            </p>
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
