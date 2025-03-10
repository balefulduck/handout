'use client';

import { useState, Fragment, useEffect } from 'react';
import { WiHumidity } from "react-icons/wi";
import { PiPlantBold } from "react-icons/pi";
import { LuSunMedium } from "react-icons/lu";
import { GiPlantSeed, GiGrowth, GiFlowerPot, GiScythe, GiWateringCan } from "react-icons/gi";
import { BsChatDots, BsPlusLg } from "react-icons/bs";
import { FaFirstAid, FaLeaf, FaPlus, FaArrowLeft } from "react-icons/fa";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import { useRouter, usePathname, useParams } from 'next/navigation';
import { Dialog, Transition } from '@headlessui/react';
import { useSession, signOut } from 'next-auth/react';

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

  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email);
    }
  }, [session?.user?.email]);

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
                  <div className="flex-shrink-0 flex items-center px-4">
                    <h2 className="text-xl font-bold text-custom-orange">Handout</h2>
                  </div>
                  <div className="mt-5 px-2 space-y-1">
                    <div className="px-4 py-4 border-t border-gray-200">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-custom-orange flex items-center justify-center text-white">
                            {session?.user?.name?.charAt(0) || 'W'}
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-base font-medium text-gray-800">{session?.user?.name || 'Workshop'}</div>
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
                              <div className="text-sm font-medium text-gray-500">{session?.user?.email || 'Keine E-Mail hinterlegt'}</div>
                              <button
                                onClick={() => setIsEditingEmail(true)}
                                className="text-xs text-custom-orange hover:text-orange-700"
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
                          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-custom-orange hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-orange"
                        >
                          Abmelden
                        </button>
                      </div>
                    </div>
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

      <div className="fixed top-0 left-0 right-0 z-50 bg-custom-orange shadow-lg">
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
              className="absolute left-10 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white focus:outline-none z-10 flex items-center gap-1.5 text-sm transition-colors"
            >
              <FaArrowLeft className="text-sm" />
              <span className="font-medium">Zurück</span>
            </button>
          )}
          {/* Main navigation with equal width buttons */}
          <div className="grid grid-cols-3">
            <button
              onClick={() => router.push('/dashboard')}
              className={`flex items-center justify-center py-1.5 transition-colors relative ${pathname === '/dashboard' ? 'bg-white/20 font-semibold' : 'hover:bg-white/10 font-semibold'} pl-10`}
            >
              <span className="text-sm font-semibold text-icon-purple px-2">Dashboard</span>
              {pathname !== '/dashboard' && <div className="absolute right-0 top-1/2 -translate-y-1/2 h-4/5 w-px bg-white/20" />}
            </button>
            <button
              onClick={() => router.push('/plants')}
              className={`flex items-center justify-center py-1.5 transition-colors relative ${pathname === '/plants' ? 'bg-white/20 font-semibold' : 'hover:bg-white/10 font-semibold'}`}
            >
              <span className="text-sm font-semibold text-icon-purple px-2">Pflanzen</span>
              {pathname !== '/plants' && <div className="absolute right-0 top-1/2 -translate-y-1/2 h-4/5 w-px bg-white/20" />}
            </button>
            <button
              onClick={() => router.push('/help')}
              className={`flex items-center justify-center py-1.5 transition-colors ${pathname === '/help' ? 'bg-white/20 font-semibold' : 'hover:bg-white/10 font-semibold'}`}
            >
              <span className="text-sm font-semibold text-icon-purple px-2">Erste Hilfe</span>
            </button>
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-custom-orange shadow-lg border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          {pathname === '/dashboard' && (
            <div className="grid grid-cols-4 gap-3 py-2 px-2">
              <button
                onClick={() => onPhaseSelect('seedling')}
                className={`flex flex-col items-center gap-2 transition-colors`}
              >
                <div className={`p-2 rounded-lg bg-gray-50/95 ${activePhase === 'seedling' ? 'text-icon-purple' : 'text-gray-600 hover:text-icon-purple'}`}>
                  <GiPlantSeed className="text-lg" />
                </div>
                <span className="text-xs text-white font-semibold">Keimling</span>
              </button>

              <button
                onClick={() => onPhaseSelect('vegetation')}
                className={`flex flex-col items-center gap-2 transition-colors`}
              >
                <div className={`p-2 rounded-lg bg-gray-50/95 ${activePhase === 'vegetation' ? 'text-icon-lime' : 'text-gray-600 hover:text-icon-lime'}`}>
                  <GiGrowth className="text-lg" />
                </div>
                <span className="text-xs text-white font-semibold">Vegetation</span>
              </button>

              <button
                onClick={() => onPhaseSelect('flower')}
                className={`flex flex-col items-center gap-2 transition-colors`}
              >
                <div className={`p-2 rounded-lg bg-gray-50/95 ${activePhase === 'flower' ? 'text-icon-olive' : 'text-gray-600 hover:text-icon-olive'}`}>
                  <GiFlowerPot className="text-lg" />
                </div>
                <span className="text-xs text-white font-semibold">Blüte</span>
              </button>

              <button
                onClick={() => onPhaseSelect('harvest')}
                className={`flex flex-col items-center gap-2 transition-colors`}
              >
                <div className={`p-2 rounded-lg bg-gray-50/95 ${activePhase === 'harvest' ? 'text-icon-purple' : 'text-gray-600 hover:text-icon-purple'}`}>
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
                <div className="p-2 rounded-lg bg-gray-50/95 text-gray-600 hover:text-custom-orange">
                  <FaPlus className="text-lg" />
                </div>
                <span className="text-xs text-white font-semibold">Neuer Tageseintrag</span>
              </button>

              {!plant.flowering_start_date && (
                <button
                  onClick={onStartFlowering}
                  className="flex flex-col items-center gap-2 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-gray-50/95 text-gray-600 hover:text-purple-500">
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
                  <div className="p-2 rounded-lg bg-gray-50/95 text-gray-600 hover:text-green-500">
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
