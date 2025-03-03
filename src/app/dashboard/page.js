'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Disclosure, Transition } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';

import ContextMenu from '@/components/ContextMenu';
import SeedlingPhase from '@/components/phases/SeedlingPhase';
import VegetationPhase from '@/components/phases/VegetationPhase';
import FlowerPhase from '@/components/phases/FlowerPhase';
import HarvestPhase from '@/components/phases/HarvestPhase';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [selectedStrains, setSelectedStrains] = useState([]);
  const [activePhase, setActivePhase] = useState(null);

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
    <div className="min-h-screen bg-gray-50">
      <Disclosure defaultOpen={false}>
        {({ open }) => (
          <>
            <div className="sticky top-0 z-10 bg-white shadow-md">
              <Disclosure.Button className="flex w-full justify-between items-center px-4 py-2 text-left focus:outline-none focus-visible:ring focus-visible:ring-opacity-75">
            
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Willkommen zurück,</p>
                    <p className="font-medium">{session?.user?.name || 'Workshop'}</p>
                  </div>
                  <ChevronUpIcon
                    className={`${open ? '' : 'transform rotate-180'} w-5 h-5 text-gray-500 transition-transform duration-200`}
                  />
                </div>
              </Disclosure.Button>

              <Transition
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
              >
                <Disclosure.Panel className="px-4 pb-4">
                  <div className="mt-4">
                    <h2 className="text-2xl font-semibold mb-4">Deine Pflanzen</h2>
                    <div className="grid grid-cols-3 gap-4">
                      {selectedStrains.map((strain) => (
                        <div key={strain.id} className="bg-gray-50 rounded-lg p-4">
                          <h3 className="font-semibold">{strain.name}</h3>
                        </div>
                      ))}
                    </div>
                  </div>
                </Disclosure.Panel>
              </Transition>
            </div>
          </>
        )}
      </Disclosure>

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
