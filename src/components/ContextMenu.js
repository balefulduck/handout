'use client';

import { useState, Fragment, useEffect, useRef } from 'react';
import { WiHumidity } from "react-icons/wi";
import { PiPlantBold } from "react-icons/pi";
import { LuSunMedium } from "react-icons/lu";
import { GiPlantSeed, GiGrowth, GiFlowerPot, GiScythe, GiWateringCan, GiSprout } from "react-icons/gi";
import { BsChatDots, BsPlusLg } from "react-icons/bs";
import { FaFirstAid, FaLeaf, FaPlus, FaArrowLeft, FaClock, FaCog, FaSave } from "react-icons/fa";
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
  existingHarvest,
  // Setup new day entry props
  setup,
  onSaveDay,
  submitting
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [helpFormData, setHelpFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    files: []
  });
  const [userPlants, setUserPlants] = useState([]);
  const [selectedPlants, setSelectedPlants] = useState([]);
  const [isLoadingPlants, setIsLoadingPlants] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const fileInputRef = useRef(null);
  const [recentPlants, setRecentPlants] = useState([]);

  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email);
    }
  }, [session?.user?.email]);

  // Pre-fill help form with user data when modal opens
  useEffect(() => {
    if (helpModalOpen && session?.user) {
      setHelpFormData(prevData => ({
        ...prevData,
        name: session.user.name || '',
        email: session.user.email || ''
      }));
      
      // Fetch user's plants when help modal opens
      setIsLoadingPlants(true);
      fetch('/api/plants')
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          console.log('Plants API response:', data);
          // The API returns { plants: [...] }
          if (data && Array.isArray(data.plants)) {
            setUserPlants(data.plants);
          } else if (Array.isArray(data)) {
            setUserPlants(data);
          } else {
            console.error('Unexpected data format for plants:', data);
            setUserPlants([]);
          }
          setIsLoadingPlants(false);
        })
        .catch(err => {
          console.error('Error loading plants:', err);
          setUserPlants([]);
          setIsLoadingPlants(false);
        });
    }
  }, [helpModalOpen, session]);

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
                    <img src="/drca.svg" alt="DRCA Logo" className="h-32 w-auto mb-2" />
                    <h2 className="text-custom-orange scale-animation">GrowGuide</h2>
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
                      <div className="mt-3 space-y-2">
                        <button
                          onClick={() => router.push('/usersettings')}
                          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-small font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-green"
                        >
                          <FaCog className="mr-2" />
                          Einstellungen
                        </button>
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
                    
                    {/* Last Harvests - Feature Preview */}
                    <div className="mt-6 px-4 py-4 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <h4 className="text-gray-500">Letzte Ernten</h4>
                        </div>
                        <div>
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-md">Feature Vorschau!</span>
                        </div>
                      </div>
                      <div className="space-y-2 opacity-60">
                        <div className="w-full text-left p-2 rounded-md bg-gray-100 flex items-center cursor-not-allowed">
     
                          <span className="text-sm text-gray-500 truncate">White Widow</span>
                        </div>
                        <div className="w-full text-left p-2 rounded-md bg-gray-100 flex items-center cursor-not-allowed">
           
                          <span className="text-sm text-gray-500 truncate">Northern Lights</span>
                        </div>
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

      <div className="fixed top-0 left-0 right-0 z-50 bg-cool-gray shadow-lg">
        <div className="max-w-7xl mx-auto relative">
          {/* Hamburger icon positioned absolutely to avoid affecting the grid layout */}
          <button
            type="button"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white focus:outline-none z-10"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <img src="/menu.png" alt="Menu" className="h-6 w-6" aria-hidden="true" />
          </button>
    
          {/* Main navigation with custom width grid */}
          <div className="grid grid-cols-10">
            <a 
              href="/growguide"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Use window.location for a full page navigation to avoid any router conflicts
                window.location.href = '/growguide';
                return false;
              }}
              className={`col-span-4 flex items-center justify-center py-1.5 transition-colors relative ${pathname === '/growguide' ? 'bg-white/20 font-semibold' : 'hover:bg-white/10 font-semibold'} pl-10`}
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
              className={`col-span-2 flex items-center justify-center py-1.5 transition-colors relative ${pathname === '/plants' ? 'bg-white/20 font-semibold' : 'hover:bg-white/10 font-semibold'}`}
            >
              <span className="text-sm font-semibold text-turquoise px-1 interactive-link">Pflanzen</span>
              {pathname !== '/plants' && <div className="absolute right-0 top-1/2 -translate-y-1/2 h-4/5 w-px bg-white/20" />}
            </a>
            <a
              href="/setups"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Use window.location for a full page navigation to avoid any router conflicts
                window.location.href = '/setups';
                return false;
              }}
              className={`col-span-2 flex items-center justify-center py-1.5 transition-colors relative ${pathname === '/setups' ? 'bg-white/20 font-semibold' : 'hover:bg-white/10 font-semibold'}`}
            >
              <span className="text-sm font-semibold text-olive-green px-1 interactive-link">Setups</span>
              {pathname !== '/setups' && <div className="absolute right-0 top-1/2 -translate-y-1/2 h-4/5 w-px bg-white/20" />}
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
              className={`col-span-2 flex items-center justify-center py-1.5 transition-colors ${pathname === '/help' ? 'bg-white/20 font-semibold' : 'hover:bg-white/10 font-semibold'}`}
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
                  <img src="/1.png" alt="Seedling" className="h-6 w-6" />
                </div>
                <span className="text-xs text-white font-semibold">Keimling</span>
              </button>

              <button
                onClick={() => onPhaseSelect('vegetation')}
                className={`flex flex-col items-center gap-2 transition-colors`}
              >
                <div className={`p-2 rounded-lg bg-gray-50/95 ${activePhase === 'vegetation' ? 'text-yellow-green' : 'text-gray-600 hover:text-yellow-green'}`}>
                  <img src="/3.png" alt="Vegetation" className="h-6 w-6" />
                </div>
                <span className="text-xs text-white font-semibold">Vegetation</span>
              </button>

              <button
                onClick={() => onPhaseSelect('flower')}
                className={`flex flex-col items-center gap-2 transition-colors`}
              >
                <div className={`p-2 rounded-lg bg-gray-50/95 ${activePhase === 'flower' ? 'text-olive-green' : 'text-gray-600 hover:text-olive-green'}`}>
                  <img src="/2.png" alt="Flowering" className="h-6 w-6" />
                </div>
                <span className="text-xs text-white font-semibold">Blüte</span>
              </button>

              <button
                onClick={() => onPhaseSelect('harvest')}
                className={`flex flex-col items-center gap-2 transition-colors`}
              >
                <div className={`p-2 rounded-lg bg-gray-50/95 ${activePhase === 'harvest' ? 'text-orange' : 'text-gray-600 hover:text-orange'}`}>
                  <img src="/4.png" alt="Harvest" className="h-6 w-6" />
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

          {pathname.startsWith('/setups/') && pathname.endsWith('/new-day') && (
            <div className="grid grid-cols-2 gap-3 py-2 px-2">
              <button
                onClick={() => router.push(`/setups/${params.id}`)}
                className="flex flex-col items-center gap-2 transition-colors"
              >
                <div className="p-2 rounded-lg bg-gray-50/95 text-gray-600 hover:text-red-500">
                  <FaArrowLeft className="text-lg" />
                </div>
                <span className="text-xs text-white font-semibold">Abbrechen</span>
              </button>
              <button
                onClick={onSaveDay}
                disabled={submitting}
                className="flex flex-col items-center gap-2 transition-colors"
              >
                <div className="p-2 rounded-lg bg-gray-50/95 text-gray-600 hover:text-green-500">
                  {submitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-600"></div>
                  ) : (
                    <FaSave className="text-lg" />
                  )}
                </div>
                <span className="text-xs text-white font-semibold">
                  {submitting ? 'Speichern...' : 'Tageseintrag speichern'}
                </span>
              </button>
            </div>
          )}

          {pathname === '/help' && (
            <div className="grid grid-cols-3 gap-3 py-2 px-2">
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
                onClick={() => setHelpModalOpen(true)}
                className="flex flex-col items-center gap-2 transition-colors"
              >
                <div className="p-2 rounded-lg bg-gray-50/95 text-gray-600 hover:text-icon-olive">
                  <FaFirstAid className="text-lg" />
                </div>
                <span className="text-xs text-white font-semibold">Dr. Cannabis Hilfe</span>
              </button>

              <button
                onClick={() => {
                  router.push('/help-requests');
                  setIsOpen(false);
                }}
                className="flex flex-col items-center gap-2 transition-colors"
              >
                <div className="p-2 rounded-lg bg-gray-50/95 text-gray-600 hover:text-olive-green">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <span className="text-xs text-white font-semibold">Meine Anfragen</span>
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

          {pathname === '/setups' && (
            <div className="grid grid-cols-1 py-2 px-2">
              <button
                onClick={() => {
                  // Dispatch custom event to trigger the new setup modal
                  window.dispatchEvent(new Event('newSetupClick'));
                }}
                className="flex flex-col items-center gap-2 transition-colors"
              >
                <div className="p-2 rounded-lg bg-gray-50/95 text-gray-600 hover:text-olive-green">
                  <BsPlusLg className="text-lg" />
                </div>
                <span className="text-xs text-white font-semibold">Neues Setup</span>
              </button>
            </div>
          )}
          
          {pathname === '/usersettings' && (
            <div className="grid grid-cols-1 py-2 px-2">
              <button
                onClick={() => {
                  // Trigger the form submission
                  const form = document.querySelector('form');
                  if (form) {
                    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                  }
                }}
                className="flex flex-col items-center gap-2 transition-colors"
              >
                <div className="p-2 rounded-lg bg-gray-50/95 text-gray-600 hover:text-brand-primary">
                  <FaSave className="text-lg" />
                </div>
                <span className="text-xs text-white font-semibold">Speichern</span>
              </button>
            </div>
          )}

          {pathname.startsWith('/help-requests/') && pathname.split('/').length === 3 && (
            <div className="grid grid-cols-1 py-2 px-2">
              <button
                onClick={async () => {
                  const requestId = pathname.split('/')[2];
                  if (confirm('Bist Du sicher, dass Du diese Hilfe-Anfrage löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.')) {
                    try {
                      const response = await fetch(`/api/help-requests/${requestId}`, {
                        method: 'DELETE',
                      });
                      
                      if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                      }
                      
                      // Redirect to help-requests list after successful deletion
                      router.push('/help-requests');
                    } catch (error) {
                      console.error('Error deleting help request:', error);
                      alert('Fehler beim Löschen der Hilfe-Anfrage. Bitte versuche es später erneut.');
                    }
                  }
                }}
                className="flex flex-col items-center gap-2 transition-colors"
              >
                <div className="p-2 rounded-lg bg-gray-50/95 text-gray-600 hover:text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <span className="text-xs text-white font-semibold">Anfrage löschen</span>
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Dr. Cannabis Hilfe Modal */}
      <Transition.Root show={helpModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => {
          if (!isSubmitting) {
            setHelpModalOpen(false);
            // Reset form after closing if not in the middle of submitting
            if (submitSuccess) {
              setHelpFormData({
                name: '',
                email: '',
                subject: '',
                message: '',
                files: []
              });
              setSubmitSuccess(false);
              setSubmitError('');
            }
          }
        }}>
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

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  {submitSuccess ? (
                    <div className="text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="mt-3 text-lg font-medium text-gray-900">Nachricht gesendet!</h3>
                      <p className="mt-2 text-sm text-gray-500">
                        Vielen Dank für Deine Nachricht. Wir werden uns so schnell wie möglich bei Dir melden.
                      </p>
                      <div className="mt-5">
                        <button
                          type="button"
                          className="inline-flex w-full justify-center rounded-md border border-transparent bg-olive-green px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-yellow-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-green sm:text-sm"
                          onClick={() => {
                            setHelpModalOpen(false);
                            setHelpFormData({
                              name: '',
                              email: '',
                              subject: '',
                              message: '',
                              files: []
                            });
                            setSelectedPlants([]);
                            setSubmitSuccess(false);
                          }}
                        >
                          Schließen
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-center">
                        <img src="/menu.png" alt="Dr. Cannabis Logo" className="h-16 mx-auto mb-4" />
                        <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                          Dr. Cannabis Hilfe
                        </Dialog.Title>
                        <p className="mt-2 text-sm text-gray-500">
                          Hast Du Probleme mit Deiner Pflanze? Sende uns eine Nachricht mit Details und Fotos, und wir helfen Dir gerne weiter.
                        </p>
                      </div>
                      {submitError && (
                        <div className="mt-3 bg-red-50 border border-red-200 rounded-md p-3">
                          <p className="text-sm text-red-600">{submitError}</p>
                        </div>
                      )}
                      <form className="mt-5 space-y-4" onSubmit={(e) => {
                        e.preventDefault();
                        setIsSubmitting(true);
                        setSubmitError('');
                        
                        // Compile plant data to send with the form
                        const compilePlantData = () => {
                          return selectedPlants.map(plant => {
                            // Fetch additional plant data for each selected plant
                            let measurements = [];
                            let lastImages = [];
                            let growNotes = '';
                            
                            // Get measurements from plant_days entries if available
                            if (plant.days && plant.days.length) {
                              // Sort days by date (newest first) and take up to 5 latest
                              const sortedDays = [...plant.days].sort((a, b) => 
                                new Date(b.date) - new Date(a.date)
                              ).slice(0, 5);
                              
                              // Map to the format we need for displaying in the admin view
                              measurements = sortedDays.map(day => ({
                                date: day.date,
                                created_at: day.date, // For compatibility with different date field names
                                ph: day.ph_value,
                                watered: day.watered ? 'Ja' : 'Nein',
                                watering_amount: day.watering_amount,
                                temperature: day.temperature,
                                humidity: day.humidity,
                                notes: day.notes
                              }));
                              
                              // Collect notes from plant_days to compile growth information
                              const dayNotes = sortedDays
                                .filter(day => day.notes && day.notes.trim() !== '')
                                .map(day => `${new Date(day.date).toLocaleDateString('de-DE')}: ${day.notes}`)
                                .join('\n');
                                
                              if (dayNotes) {
                                growNotes = dayNotes;
                              }
                            } else if (plant.measurements && plant.measurements.length) {
                              // Fallback to measurements array if present
                              measurements = plant.measurements.slice(-5);
                            }
                            
                            // Get latest images if available
                            if (plant.images && plant.images.length) {
                              // Take up to 3 latest images
                              lastImages = plant.images.slice(-3);
                            } else if (plant.timeline && plant.timeline.items) {
                              // Try to get images from timeline if direct images array isn't available
                              const imageEntries = plant.timeline.items
                                .filter(item => item.type === 'image')
                                .slice(-3);
                              lastImages = imageEntries;
                            }
                            
                            // Extract phase information based on flowering_start_date
                            let phase = 'unknown';
                            if (plant.status === 'harvested') {
                              phase = 'harvested';
                            } else if (plant.flowering_start_date) {
                              phase = 'flowering';
                            } else {
                              const ageInDays = calculateAgeDays(plant.created_at || plant.start_date);
                              if (ageInDays < 21) {
                                phase = 'seedling';
                              } else {
                                phase = 'vegetative';
                              }
                            }
                            
                            // Calculate environmental averages if available
                            const environmentalData = {};
                            if (measurements.length > 0) {
                              const validTemps = measurements.filter(m => m.temperature).map(m => m.temperature);
                              const validHumidity = measurements.filter(m => m.humidity).map(m => m.humidity);
                              
                              if (validTemps.length > 0) {
                                environmentalData.avg_temperature = (validTemps.reduce((sum, temp) => sum + temp, 0) / validTemps.length).toFixed(1);
                              }
                              
                              if (validHumidity.length > 0) {
                                environmentalData.avg_humidity = Math.round(validHumidity.reduce((sum, hum) => sum + hum, 0) / validHumidity.length);
                              }
                            }
                            
                            return {
                              id: plant.id,
                              name: plant.name,
                              strain: plant.strain_name || plant.strain || (plant.strain_id ? `Strain #${plant.strain_id}` : 'Unbekannt'),
                              created_at: plant.created_at || plant.start_date,
                              flowering_start_date: plant.flowering_start_date,
                              phase: phase,
                              age_days: plant.age_days || calculateAgeDays(plant.created_at || plant.start_date),
                              measurements: measurements,
                              last_images: lastImages,
                              notes: plant.notes || growNotes || '',
                              grow_details: {
                                ...environmentalData,
                                // We'll add these fields in the future
                                grow_medium: '',
                                light_schedule: '',
                                nutrients: ''
                              }
                            };
                          });
                        };
                        
                        // Helper function to calculate plant age in days
                        const calculateAgeDays = (createdAt) => {
                          if (!createdAt) return 0;
                          const created = new Date(createdAt);
                          const now = new Date();
                          const diffTime = Math.abs(now - created);
                          return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        };
                        
                        // Create FormData to send to the API
                        const formData = new FormData();
                        formData.append('name', helpFormData.name);
                        formData.append('email', helpFormData.email);
                        formData.append('subject', helpFormData.subject);
                        formData.append('message', helpFormData.message);
                        formData.append('recipient', 'riegelsberg@drcannabis.de');
                        
                        // Add selected plants and their data
                        const plantData = compilePlantData();
                        formData.append('plantData', JSON.stringify(plantData));
                        formData.append('selectedPlantIds', JSON.stringify(selectedPlants.map(p => p.id)));
                        
                        // Add files (images)
                        // Now enabled for DigitalOcean which supports file system operations
                        for (let i = 0; i < helpFormData.files.length; i++) {
                          formData.append('files', helpFormData.files[i]);
                        }
                        
                        // Send the data to the server
                        console.log('Sending help request to server...');
                        console.log('Plant data:', plantData);
                        
                        fetch('/api/help-requests', {
                          method: 'POST',
                          body: formData,
                        })
                        .then(response => {
                          if (!response.ok) {
                            console.error('Error response:', response.status);
                            throw new Error('Fehler beim Senden der Nachricht');
                          }
                          return response.json();
                        })
                        .then(data => {
                          console.log('Help request saved successfully:', data);
                          setIsSubmitting(false);
                          setSubmitSuccess(true);
                        })
                        .catch(error => {
                          console.error('Error saving help request:', error);
                          setIsSubmitting(false);
                          setSubmitError(error.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
                        });
                      }}>
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-olive-green focus:ring-olive-green sm:text-sm"
                            value={helpFormData.name}
                            onChange={(e) => setHelpFormData({...helpFormData, name: e.target.value})}
                            disabled={isSubmitting}
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            E-Mail
                          </label>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-olive-green focus:ring-olive-green sm:text-sm"
                            value={helpFormData.email}
                            onChange={(e) => setHelpFormData({...helpFormData, email: e.target.value})}
                            disabled={isSubmitting}
                          />
                        </div>
                        <div>
                          <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                            Betreff
                          </label>
                          <input
                            type="text"
                            name="subject"
                            id="subject"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-olive-green focus:ring-olive-green sm:text-sm"
                            value={helpFormData.subject}
                            onChange={(e) => setHelpFormData({...helpFormData, subject: e.target.value})}
                            disabled={isSubmitting}
                          />
                        </div>
                        <div>
                          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                            Nachricht
                          </label>
                          <textarea
                            name="message"
                            id="message"
                            rows={4}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-olive-green focus:ring-olive-green sm:text-sm"
                            value={helpFormData.message}
                            onChange={(e) => setHelpFormData({...helpFormData, message: e.target.value})}
                            disabled={isSubmitting}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Fotos anhängen (optional)
                          </label>
                          <div className="mt-1 flex items-center">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              ref={fileInputRef}
                              onChange={(e) => {
                                const fileList = Array.from(e.target.files || []);
                                setHelpFormData({...helpFormData, files: fileList});
                              }}
                              disabled={isSubmitting}
                            />
                            <button
                              type="button"
                              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-green"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isSubmitting}
                            >
                              Dateien auswählen
                            </button>
                            <span className="ml-3 text-sm text-gray-500">
                              {helpFormData.files.length > 0 ? `${helpFormData.files.length} Datei(en) ausgewählt` : 'Keine Dateien ausgewählt'}
                            </span>
                          </div>
                          {helpFormData.files.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {helpFormData.files.map((file, index) => (
                                <div key={index} className="relative bg-gray-100 rounded p-1">
                                  <img 
                                    src={URL.createObjectURL(file)} 
                                    alt={`Vorschau ${index}`} 
                                    className="h-16 w-16 object-cover rounded" 
                                  />
                                  <button 
                                    type="button" 
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700"
                                    onClick={() => {
                                      const newFiles = [...helpFormData.files];
                                      newFiles.splice(index, 1);
                                      setHelpFormData({...helpFormData, files: newFiles});
                                    }}
                                    disabled={isSubmitting}
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Wähle die betroffene Pflanze(n), um uns alle Parameter deines Grows mitzusenden.
                          </label>
                          {isLoadingPlants ? (
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-olive-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Pflanzen werden geladen...
                            </div>
                          ) : userPlants.length === 0 ? (
                            <p className="mt-1 text-sm text-gray-500">Keine Pflanzen gefunden</p>
                          ) : (
                            <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2">
                              {userPlants.map(plant => (
                                <div key={plant.id} className="flex items-center p-2 hover:bg-gray-50 rounded-md">
                                  <input
                                    id={`plant-${plant.id}`}
                                    name={`plant-${plant.id}`}
                                    type="checkbox"
                                    className="h-4 w-4 text-olive-green focus:ring-olive-green border-gray-300 rounded"
                                    checked={selectedPlants.some(p => p.id === plant.id)}
                                    onChange={() => {
                                      if (selectedPlants.some(p => p.id === plant.id)) {
                                        setSelectedPlants(selectedPlants.filter(p => p.id !== plant.id));
                                      } else {
                                        setSelectedPlants([...selectedPlants, plant]);
                                      }
                                    }}
                                    disabled={isSubmitting}
                                  />
                                  <label htmlFor={`plant-${plant.id}`} className="ml-3 block text-sm font-medium text-gray-700">
                                    {plant.name}
                                    {plant.strain && <span className="ml-1 text-xs text-gray-500">({plant.strain})</span>}
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}
                          {selectedPlants.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              <p className="w-full text-sm text-gray-600">Ausgewählt: {selectedPlants.length} Pflanze(n)</p>
                              <button
                                type="button"
                                className="text-xs text-gray-500 hover:text-gray-700"
                                onClick={() => setSelectedPlants([])}
                                disabled={isSubmitting}
                              >
                                Alle entfernen
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                          <button
                            type="button"
                            className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-green sm:text-sm"
                            onClick={() => setHelpModalOpen(false)}
                            disabled={isSubmitting}
                          >
                            Abbrechen
                          </button>
                          <button
                            type="submit"
                            className="inline-flex w-full justify-center rounded-md border border-transparent bg-olive-green px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-yellow-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-green sm:text-sm"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Senden...
                              </>
                            ) : 'Senden'}
                          </button>
                        </div>
                      </form>
                    </>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}
