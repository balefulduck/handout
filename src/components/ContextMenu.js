'use client';

import { useState, Fragment, useEffect } from 'react';
import { WiHumidity } from "react-icons/wi";
import { PiPlantBold } from "react-icons/pi";
import { LuSunMedium } from "react-icons/lu";
import { GiPlantSeed, GiGrowth, GiFlowerPot, GiScythe, GiWateringCan, GiSprout } from "react-icons/gi";
import { BsChatDots, BsPlusLg } from "react-icons/bs";
import { FaFirstAid, FaLeaf, FaPlus, FaArrowLeft, FaClock } from "react-icons/fa";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import { useRouter, usePathname, useParams } from 'next/navigation';
import { Dialog, Transition } from '@headlessui/react';
import { useSession, signOut } from 'next-auth/react';
import { getRecentlyViewedPlants, clearRecentlyViewedPlants } from '@/utils/recentlyViewedPlants';

export default function ContextMenu({ 
  activePhase, 
  onPhaseSelect,
  // Plant detail specific props
  plant,
  harvestData,
  onStartFlowering,
  onShowNewDayForm,
  // Harvest page specific props
  onSaveHarvest,
  existingHarvest
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [recentPlants, setRecentPlants] = useState([]);

  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email);
    }
  }, [session?.user?.email]);

  // Function to force refresh of recently viewed plants
  const refreshRecentPlants = () => {
    const recentlyViewed = getRecentlyViewedPlants();
    console.log('Force refreshed plants:', recentlyViewed);
    setRecentPlants(recentlyViewed);
  };
  
  // Function to clear recently viewed plants
  const clearRecentPlants = () => {
    clearRecentlyViewedPlants();
    setRecentPlants([]);
  };

  // Load recently viewed plants when sidebar opens
  useEffect(() => {
    if (sidebarOpen) {
      refreshRecentPlants();
    }
  }, [sidebarOpen]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const handleEmailUpdate = async () => {
    try {
      const response = await fetch('/api/user/email', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update email');
      }

      setIsEditingEmail(false);
    } catch (error) {
      console.error('Error updating email:', error);
    }
  };

  return (
    <>
      {/* Mobile menu */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 flex z-50">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                      type="button"
                      className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                  <div className="flex-shrink-0 flex flex-col items-center px-4">
                    <img src="/drca.svg" alt="DRCA Logo" className="h-16 w-auto mb-2" />
                    <h2 className="text-custom-orange scale-animation">Handout</h2>
                  </div>
                  <div className="mt-5 px-2 space-y-1">
                    <div className="px-4 py-4 border-t border-gray-200">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-turquoise flex items-center justify-center text-white">
                            {session?.user?.name?.charAt(0) || 'W'}
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-normal font-medium text-gray-800">{session?.user?.name || 'Workshop'}</div>
                          {isEditingEmail ? (
                            <div className="flex items-center gap-2 mt-1">
                              <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="text-sm text-gray-900 rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-custom-orange"
                                placeholder="Enter email"
                              />
                              <button
                                onClick={handleEmailUpdate}
                                className="text-xs bg-custom-orange text-white px-2 py-1 rounded-md hover:bg-orange-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setIsEditingEmail(false)}
                                className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-md hover:bg-gray-300"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="text-small text-gray-500">{session?.user?.email || 'Keine E-Mail hinterlegt'}</div>
                              <button
                                onClick={() => setIsEditingEmail(true)}
                                className="text-xs text-olive-green hover:text-yellow-green"
                              >
                                Editieren 
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-3">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-small font-medium text-white bg-purple hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple"
                        >
                          Abmelden
                        </button>
                      </div>
                    </div>
                    
                    {/* Recently Viewed Plants */}
                    {recentPlants.length > 0 && (
                      <div className="mt-6 px-4 py-4 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <FaClock className="mr-2 text-olive-green" />
                            <h4 className="text-gray-700">Zuletzt angesehen</h4>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                refreshRecentPlants();
                              }}
                              className="text-xs text-olive-green hover:text-yellow-green"
                            >
                              Aktualisieren
                            </button>
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                clearRecentPlants();
                              }}
                              className="text-xs text-gray-500 hover:text-gray-700"
                            >
                              Löschen
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {recentPlants.map((plant) => (
                            <button
                              key={plant.id}
                              onClick={() => {
                                router.push(`/plants/${plant.id}`);
                                setSidebarOpen(false);
                              }}
                              className="w-full text-left p-2 rounded-md hover:bg-gray-100 transition-colors flex items-center"
                            >

                              {plant.isFlowering ? (
                                <GiFlowerPot className="text-purple mr-2" />
                              ) : (
                                <GiSprout className="text-yellow-green mr-2" />
                              )}
                              <span className="text-sm text-gray-800 truncate">{plant.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
            <div className="flex-shrink-0 w-14">
              {/* Force sidebar to shrink to fit close icon */}
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      <div className="fixed top-0 left-0 right-0 z-50 bg-cool-gray shadow-lg">
        <div className="max-w-7xl mx-auto relative">
          {/* Hamburger icon positioned absolutely to avoid affecting the grid layout */}
          <button
            type="button"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white focus:outline-none z-10"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          {pathname.startsWith('/plants/') && (
            <button
              onClick={() => router.push('/plants')}
              className="absolute left-10 top-1/2 transform -translate-y-1/2 text-turquoise hover:text-white focus:outline-none z-10 flex items-center gap-1.5 text-sm transition-colors"
            >
              <FaArrowLeft className="text-sm" />
              <span className="font-medium">Zurück</span>
            </button>
          )}
          {/* Main navigation with equal width buttons */}
          <div className="grid grid-cols-3">
            <a 
              href="/growguide"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Use window.location for a full page navigation to avoid any router conflicts
                window.location.href = '/growguide';
                return false;
              }}
              className={`flex items-center justify-center py-1.5 transition-colors relative ${pathname === '/growguide' ? 'bg-white/20 font-semibold' : 'hover:bg-white/10 font-semibold'} pl-10`}
            >
              <span className="text-sm font-semibold text-yellow-green px-2 interactive-link">Grow Guide</span>
              {pathname !== '/growguide' && <div className="absolute right-0 top-1/2 -translate-y-1/2 h-4/5 w-px bg-white/20" />}
            </a>
            <a
              href="/plants"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Use window.location for a full page navigation to avoid any router conflicts
                window.location.href = '/plants';
                return false;
              }}
              className={`flex items-center justify-center py-1.5 transition-colors relative ${pathname === '/plants' ? 'bg-white/20 font-semibold' : 'hover:bg-white/10 font-semibold'}`}
            >
              <span className="text-sm font-semibold text-turquoise px-2 interactive-link">Pflanzen</span>
              {pathname !== '/plants' && <div className="absolute right-0 top-1/2 -translate-y-1/2 h-4/5 w-px bg-white/20" />}
            </a>
            <a
              href="/help"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Use window.location for a full page navigation to avoid any router conflicts
                window.location.href = '/help';
                return false;
              }}
              className={`flex items-center justify-center py-1.5 transition-colors ${pathname === '/help' ? 'bg-white/20 font-semibold' : 'hover:bg-white/10 font-semibold'}`}
            >
              <span className="text-sm font-semibold text-medium-blue px-2 interactive-link">Erste Hilfe</span>
            </a>
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-cool-gray shadow-lg border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          {pathname === '/growguide' && (
            <div className="grid grid-cols-4 gap-3 py-2 px-2">
              <button
                onClick={() => onPhaseSelect('seedling')}
                className={`flex flex-col items-center gap-2 transition-colors`}
              >
                <div className={`p-2 rounded-lg bg-gray-50/95 transition-colors duration-300 ${activePhase === 'seedling' ? 'text-purple' : 'text-gray-600 hover:text-purple'}`}>
                  <GiPlantSeed className="text-lg" />
                </div>
                <span className="text-xs text-white font-semibold">Keimling</span>
              </button>

              <button
                onClick={() => onPhaseSelect('vegetation')}
                className={`flex flex-col items-center gap-2 transition-colors`}
              >
                <div className={`p-2 rounded-lg bg-gray-50/95 ${activePhase === 'vegetation' ? 'text-yellow-green' : 'text-gray-600 hover:text-yellow-green'}`}>
                  <GiGrowth className="text-lg" />
                </div>
                <span className="text-xs text-white font-semibold">Vegetation</span>
              </button>

              <button
                onClick={() => onPhaseSelect('flower')}
                className={`flex flex-col items-center gap-2 transition-colors`}
              >
                <div className={`p-2 rounded-lg bg-gray-50/95 ${activePhase === 'flower' ? 'text-olive-green' : 'text-gray-600 hover:text-olive-green'}`}>
                  <GiFlowerPot className="text-lg" />
                </div>
                <span className="text-xs text-white font-semibold">Blüte</span>
              </button>

              <button
                onClick={() => onPhaseSelect('harvest')}
                className={`flex flex-col items-center gap-2 transition-colors`}
              >
                <div className={`p-2 rounded-lg bg-gray-50/95 ${activePhase === 'harvest' ? 'text-orange' : 'text-gray-600 hover:text-orange'}`}>
                  <GiScythe className="text-lg" />
                </div>
                <span className="text-xs text-white font-semibold">Ernte</span>
              </button>
            </div>
          )}

          {pathname.startsWith('/plants/') && pathname.split('/').length === 3 && plant && (
            <div className="grid grid-cols-3 gap-3 py-2 px-2">
              <button
                onClick={onShowNewDayForm}
                className="flex flex-col items-center gap-2 transition-colors"
              >
                <div className="p-2 rounded-lg bg-gray-50/95 text-gray-600 hover:text-orange">
                  <FaPlus className="text-lg" />
                </div>
                <span className="text-xs text-white font-semibold">Neuer Tageseintrag</span>
              </button>

              {!plant.flowering_start_date && (
                <button
                  onClick={onStartFlowering}
                  className="flex flex-col items-center gap-2 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-gray-50/95 text-gray-600 hover:text-purple">
                    <GiFlowerPot className="text-lg" />
                  </div>
                  <span className="text-xs text-white font-semibold">Blüte starten</span>
                </button>
              )}

              {plant.flowering_start_date && !harvestData && (
                <button
                  onClick={() => router.push(`/plants/${params.id}/harvest`)}
                  className="flex flex-col items-center gap-2 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-gray-50/95 text-gray-600 hover:text-turquoise">
                    <FaLeaf className="text-lg" />
                  </div>
                  <span className="text-xs text-white font-semibold">Ernten</span>
                </button>
              )}
            </div>
          )}

          {pathname.startsWith('/plants/') && pathname.split('/').length === 4 && pathname.endsWith('/harvest') && (
            <div className="grid grid-cols-1 gap-3 py-2 px-2">
              <button
                onClick={onSaveHarvest}
                className="flex flex-col items-center gap-2 transition-colors"
              >
                <div className="p-2 rounded-lg bg-gray-50/95 text-gray-600 hover:text-green-500">
                  <FaLeaf className="text-lg" />
                </div>
                <span className="text-xs text-white font-semibold">
                  {existingHarvest ? 'Erntedaten aktualisieren' : 'Ernte speichern'}
                </span>
              </button>
            </div>
          )}

          {pathname === '/help' && (
            <div className="grid grid-cols-2 gap-3 py-2 px-2">
              <button
                onClick={() => {/* TODO: Implement Discord integration */}}
                className="flex flex-col items-center gap-2 transition-colors"
              >
                <div className="p-2 rounded-lg bg-gray-50/95 text-gray-600 hover:text-icon-lime">
                  <BsChatDots className="text-lg" />
                </div>
                <span className="text-xs text-white font-semibold">Discord</span>
              </button>

              <button
                onClick={() => {/* TODO: Implement Dr. Cannabis help */}}
                className="flex flex-col items-center gap-2 transition-colors"
              >
                <div className="p-2 rounded-lg bg-gray-50/95 text-gray-600 hover:text-icon-olive">
                  <FaFirstAid className="text-lg" />
                </div>
                <span className="text-xs text-white font-semibold">Dr. Cannabis Hilfe</span>
              </button>
            </div>
          )}

          {pathname === '/plants' && (
            <div className="grid grid-cols-1 py-2 px-2">
              <button
                onClick={() => {
                  // Dispatch custom event to trigger the new plant modal
                  window.dispatchEvent(new Event('newPlantClick'));
                }}
                className="flex flex-col items-center gap-2 transition-colors"
              >
                <div className="p-2 rounded-lg bg-gray-50/95 text-gray-600 hover:text-icon-purple">
                  <BsPlusLg className="text-lg" />
                </div>
                <span className="text-xs text-white font-semibold">Neue Pflanze</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
