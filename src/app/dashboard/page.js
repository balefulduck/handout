'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Disclosure, Transition } from '@headlessui/react';
import { ChevronUpIcon, XMarkIcon } from '@heroicons/react/24/solid';
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
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
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
    <div className="min-h-screen">
      <Disclosure defaultOpen={false}>
        {({ open }) => (
          <>
            <div className="sticky top-0 z-10 bg-white shadow-md">
              <Disclosure.Button className="flex w-full justify-between items-center px-4 py-2 text-left focus:outline-none focus-visible:ring focus-visible:ring-opacity-75">
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Willkommen zurück,</p>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowLogoutModal(true);
                      }}
                      className="font-medium hover:text-gray-700 transition-colors"
                    >
                      {session?.user?.name || 'Workshop'}
                    </button>
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
                    
                  </div>
                </Disclosure.Panel>
              </Transition>
            </div>
          </>
        )}
      </Disclosure>

      {/* Logout Modal */}
      <Transition
        show={showLogoutModal}
        enter="transition-opacity duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowLogoutModal(false)} />
            
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowLogoutModal(false)}
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">
                      Abmelden
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Möchten Sie sich wirklich abmelden?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                >
                  Abmelden
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(false)}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>

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
