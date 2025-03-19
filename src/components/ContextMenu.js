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
import HelpRequestModal from './HelpRequestModal';

export default function ContextMenu({ 
  activePhase, 
  onPhaseSelect,
  // Plant detail specific props
  plant,
  harvestData,
  onStartFlowering,
  onShowNewDayForm,
  showNewDayForm,
  onSaveNewDay,
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
      fetch('/api/plants?includeAllData=true')
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
            // Make sure to fetch each plant's full data including days with fertilizers
            Promise.all(
              data.plants.map(plant => 
                fetch(`/api/plants/${plant.id}`)
                  .then(res => res.json())
                  .then(plantData => ({
                    ...plant,
                    days: plantData.days || []
                  }))
                  .catch(err => {
                    console.error(`Error fetching details for plant ${plant.id}:`, err);
                    return plant;
                  })
              )
            )
            .then(plantsWithDays => {
              console.log('Plants with days:', plantsWithDays);
              setUserPlants(plantsWithDays);
              setIsLoadingPlants(false);
            })
            .catch(err => {
              console.error('Error fetching plant details:', err);
              setUserPlants(data.plants);
              setIsLoadingPlants(false);
            });
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
  
  // Add event listener for diagnostic help
  useEffect(() => {
    const handleDiagnosticHelp = (event) => {
      const helpData = event.detail;
      // Open help modal
      setHelpModalOpen(true);
      
      // Pre-fill the message with diagnostic information
      if (helpData && helpData.diagnosisInfo) {
        const { symptom, refinement, diagnosis, severity } = helpData.diagnosisInfo;
        const diagnosisMessage = `
Pflanzen-Diagnose Anfrage:
- Problem: ${symptom}
- Details: ${refinement}
- Diagnose: ${diagnosis}
- Schweregrad: ${severity}

Ich benötige weitere Unterstützung bei diesem Problem.
`;
        
        setHelpFormData(prevData => ({
          ...prevData,
          subject: `Diagnose Hilfe: ${diagnosis}`,
          message: diagnosisMessage
        }));
        
        // If plant data is available, pre-select the affected plant
        if (helpData.plantData && helpData.plantData.id) {
          const plantId = helpData.plantData.id;
          // Find the plant in userPlants
          const plantToSelect = userPlants.find(p => p.id === plantId);
          if (plantToSelect && !selectedPlants.some(p => p.id === plantId)) {
            setSelectedPlants([...selectedPlants, plantToSelect]);
          }
        }
      }
    };
    
    window.addEventListener('diagnosticHelpClick', handleDiagnosticHelp);
    return () => {
      window.removeEventListener('diagnosticHelpClick', handleDiagnosticHelp);
    };
  }, [userPlants, selectedPlants]);

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

      <div className="fixed top-0 left-0 p-1 right-0 z-50 bg-cool-gray shadow-lg before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/30 before:to-transparent before:opacity-50 before:pointer-events-none overflow-hidden">
        <div className="max-w-7xl mx-auto relative">
          {/* Hamburger icon positioned absolutely to avoid affecting the flex layout */}
          <button
            type="button"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white focus:outline-none z-10"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <img src="/menu.png" alt="Menu" className="h-9 w-9" aria-hidden="true" />
          </button>
    
          {/* Responsive navigation with flex layout */}
          <div className="flex pl-10">
            <a 
              href="/growguide"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Use window.location for a full page navigation to avoid any router conflicts
                window.location.href = '/growguide';
                return false;
              }}
              className={`flex-1 flex items-center justify-center py-1.5 transition-colors relative ${pathname === '/growguide' ? 'bg-white/20 font-semibold' : 'hover:bg-white/10 font-semibold'}`}
            >
              <PiPlantBold className="md:hidden text-yellow-green text-lg" />
              <span className="hidden md:block text-xs lg:text-sm font-semibold text-yellow-green px-1 lg:px-2 interactive-link">Grow Guide</span>
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
              className={`flex-1 flex items-center justify-center py-1.5 transition-colors relative ${pathname === '/plants' ? 'bg-white/20 font-semibold' : 'hover:bg-white/10 font-semibold'}`}
            >
              <GiSprout className="md:hidden text-turquoise text-lg" />
              <span className="hidden md:block text-xs lg:text-sm font-semibold text-turquoise px-1 interactive-link">Pflanzen</span>
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
              className={`flex-1 flex items-center justify-center py-1.5 transition-colors ${pathname === '/help' ? 'bg-white/20 font-semibold' : 'hover:bg-white/10 font-semibold'}`}
            >
              <FaFirstAid className="md:hidden text-medium-blue text-lg" />
              <span className="hidden md:block text-xs lg:text-sm font-semibold text-medium-blue px-1 lg:px-2 interactive-link whitespace-nowrap">Dr. Cannabis Hilfe</span>
            </a>
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-cool-gray shadow-lg border-t border-gray-200 before:absolute before:inset-0 before:bg-gradient-to-t before:from-white/30 before:to-transparent before:opacity-50 before:pointer-events-none overflow-hidden">
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
              {!showNewDayForm ? (
                <>
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
                </>
              ) : (
                <>
                  <button
                    onClick={() => onShowNewDayForm(false)}
                    className="flex flex-col items-center gap-2 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-gray-50/95 text-gray-600 hover:text-red-500">
                      <FaArrowLeft className="text-lg" />
                    </div>
                    <span className="text-xs text-white font-semibold">Abbrechen</span>
                  </button>
                  <button
                    onClick={onSaveNewDay}
                    className="flex flex-col items-center gap-2 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-gray-50/95 text-gray-600 hover:text-green-500">
                      <FaSave className="text-lg" />
                    </div>
                    <span className="text-xs text-white font-semibold">Speichern</span>
                  </button>
                </>
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
            <div className="grid grid-cols-2 py-2 px-2 gap-3">
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
      {/* Help Request Modal */}
      {helpModalOpen && (
        <HelpRequestModal onClose={() => setHelpModalOpen(false)} />
      )}
    </>
  );
}
