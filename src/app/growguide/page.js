'use client';

import { useSession } from 'next-auth/react';
import React, { useEffect, useState, Suspense } from 'react';
import { Transition } from '@headlessui/react';
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
  const [isMounted, setIsMounted] = useState(false);

  // Handle client-side mounting to prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
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
    
    // Only render phase content on the client side
    if (!isMounted) {
      return <div className="animate-pulse p-4 bg-gray-100 rounded">Loading phase content...</div>;
    }
    
    if (!activePhase) {
      return null;
    }
    
    return (
      <Suspense fallback={<div className="animate-pulse p-4 bg-gray-100 rounded">Loading phase content...</div>}>
        <PhaseContent phaseName={activePhase} />
      </Suspense>
    );
  };

  return (
    <div className="min-h-screen mt-10 pt-7 bg-gray-50" suppressHydrationWarning={true}>
      {isMounted && (
        <>
          <ContextMenu activePhase={activePhase} onPhaseSelect={handlePhaseSelect} />

          <main className="max-w-7xl mx-auto px-6 py-10 pb-24" suppressHydrationWarning={true}>
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h2 className="text-medium-blue mb-2">Grow Guide</h2>
          <p className="max-w-2xl mx-auto text-gray-600 text-base">
            Wähle eine Wachstumsphase im Kontextmenü am unteren Bildschirmrand um detaillierte Informationen zu den wichtigsten Parametern deines Grows zu erhalten.
          </p>
        </div>
        
        {/* Phase Content */}
        <div className="mb-10 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          {activePhase && (
            <div className="mb-6">
              <h4 className="mb-2 text-cool-gray text-pulse-animation">{getPhaseTitle()}</h4>
              <div className="h-1 w-24 bg-gradient-to-r from-purple to-medium-blue rounded transition-all duration-500 hover:w-32"></div>
            </div>
          )}
          <Transition
            show={activePhase !== null}
            enter="transition-opacity duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="transition-all duration-300 text-focus-animation">
              {renderPhaseContent()}
            </div>
          </Transition>
        </div>
          </main>
        </>
      )}
      {!isMounted && (
        <div className="max-w-7xl mx-auto px-6 py-10 pb-24 flex justify-center items-center min-h-screen">
          <div className="animate-pulse p-8 bg-gray-100 rounded-xl w-full max-w-md text-center">
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto"></div>
          </div>
        </div>
      )}
    </div>
  );
}
