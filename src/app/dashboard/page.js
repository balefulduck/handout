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

export default function DashboardPage() {
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
    <div className="min-h-screen pt-7">

      <ContextMenu activePhase={activePhase} onPhaseSelect={handlePhaseSelect} />

      <main className="max-w-7xl mx-auto px-4 py-8 pb-24">
        {/* Phase Content */}
        <div className="mb-8">
          <Transition
            show={activePhase !== null}
            enter="transition-opacity duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div>
              {renderPhaseContent()}
            </div>
          </Transition>
        </div>

      
      </main>
    </div>
  );
}
