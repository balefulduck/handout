'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Transition } from '@headlessui/react';
import Image from 'next/image';

import ContextMenu from '@/components/ContextMenu';
import SeedlingPhase from '@/components/phases/SeedlingPhase';
import VegetationPhase from '@/components/phases/VegetationPhase';
import FlowerPhase from '@/components/phases/FlowerPhase';
import HarvestPhase from '@/components/phases/HarvestPhase';

export default function GrowGuidePage() {
  const { data: session } = useSession();
  const [selectedStrains, setSelectedStrains] = useState([]);
  const [activePhase, setActivePhase] = useState('seedling'); //Make seedling phase default

  useEffect(() => {
    const fetchStrains = async () => {
      const response = await fetch('/api/strains/selected');
      if (response.ok) {
        const data = await response.json();
        setSelectedStrains(data.strains);
      }
    };
    fetchStrains();
  }, []);

  const handlePhaseSelect = (phase) => {
    setActivePhase(activePhase === phase ? null : phase);
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
    switch (activePhase) {
      case 'seedling':
        return <SeedlingPhase />;
      case 'vegetation':
        return <VegetationPhase />;
      case 'flower':
        return <FlowerPhase />;
      case 'harvest':
        return <HarvestPhase />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen mt-10 pt-7 bg-gray-50">

      <ContextMenu activePhase={activePhase} onPhaseSelect={handlePhaseSelect} />

      <main className="max-w-7xl mx-auto px-6 py-10 pb-24">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h2 className="text-medium-blue mb-2">Grow Guide</h2>
          <p className="max-w-2xl mx-auto text-gray-600 text-base">Wähle eine Wachstumsphase im Kontextmenü am unteren Bildschirmrand um detaillierte Informationen zu den wichtigsten Parametern deines Grows zu erhalten.</p>
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
    </div>
  );
}
