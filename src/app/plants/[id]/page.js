'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ContextMenu from '@/components/ContextMenu';
import DayEntryMenu from '@/components/DayEntryMenu';
import { FaSeedling, FaCalendarAlt, FaEdit, FaTrash, FaPlus, FaTint, FaTemperatureHigh, FaLeaf, FaChartLine, FaCut, FaSun, FaFlask } from 'react-icons/fa';
import { GiFlowerPot, GiWateringCan } from 'react-icons/gi';
import { BsChatDots } from 'react-icons/bs';
import StatisticsTab from '@/components/StatisticsTab';
import { addToRecentlyViewed } from '@/utils/recentlyViewedPlants';

export default function PlantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [plant, setPlant] = useState(null);
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewDayForm, setShowNewDayForm] = useState(false);
  // New state variables for multi-step modal
  const [showDayEntryModal, setShowDayEntryModal] = useState(false);
  const [currentDayStep, setCurrentDayStep] = useState(1);
  const [totalDaySteps, setTotalDaySteps] = useState(3);
  const [showFertilizerSelect, setShowFertilizerSelect] = useState(false);
  const [newFertilizer, setNewFertilizer] = useState({ name: '', amount: '' });
  const [previousFertilizers, setPreviousFertilizers] = useState([]);
  const [harvestData, setHarvestData] = useState(null);
  const [newDay, setNewDay] = useState({
    date: new Date().toISOString().split('T')[0],
    watering_amount: '',
    temperature: '',
    humidity: '',
    ph_value: '',
    notes: '',
    fertilizers: [],
    topped: false,
    flowering: false
  });
  const [activeTab, setActiveTab] = useState('details'); // Add tab state: 'details' or 'statistics'
  
  /* Quick Entry Feature - Commented out for later implementation
  // Fetch the most recent day entry when opening the form
  useEffect(() => {
    if (showNewDayForm && days.length > 0) {
      fetchMostRecentEntry();
    }
  }, [showNewDayForm, days]);
  */

  // Fetch plant data
  useEffect(() => {
    const fetchPlantData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/plants/${params.id}`);
        
        if (response.status === 404) {
          // Plant not found - set plant to null but don't show error
          setPlant(null);
          setError(null);
          setLoading(false);
          return;
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch plant data');
        }
        
        const data = await response.json();
        
        if (!data.plant) {
          // Handle case where plant might be null
          setPlant(null);
        } else {
          setPlant(data.plant);
          setDays(data.days || []);
          
          // Add to recently viewed plants
          addToRecentlyViewed(data.plant);
          
          // Fetch harvest data if plant exists
          try {
            const harvestResponse = await fetch(`/api/plants/${params.id}/harvest`);
            if (harvestResponse.ok) {
              const harvestData = await harvestResponse.json();
              setHarvestData(harvestData.harvest);
            }
          } catch (harvestErr) {
            console.error('Error fetching harvest data:', harvestErr);
            // Don't set error for harvest data fetch failure
          }
        }
        
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error('Error fetching plant data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPlantData();
    }
  }, [params.id]);

  // Function to fetch previous fertilizers
  const fetchPreviousFertilizers = async () => {
    try {
      const response = await fetch(`/api/plants/${params.id}/fertilizers`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch previous fertilizers');
      }
      
      const data = await response.json();
      setPreviousFertilizers(data.fertilizers || []);
    } catch (err) {
      console.error('Error fetching previous fertilizers:', err);
    }
  };

  // Effect to fetch previous fertilizers when the modal opens
  useEffect(() => {
    if (showDayEntryModal && currentDayStep === 2) {
      fetchPreviousFertilizers();
    }
  }, [showDayEntryModal, currentDayStep, params.id]);

  // Fetch previously used fertilizers
  useEffect(() => {
    const fetchFertilizers = async () => {
      try {
        const response = await fetch('/api/fertilizers');
        if (!response.ok) throw new Error('Failed to fetch fertilizers');
        const data = await response.json();
        setPreviousFertilizers(data.fertilizers);
      } catch (error) {
        console.error('Error fetching fertilizers:', error);
      }
    };

    fetchFertilizers();
  }, []);

  // Calculate plant age in days
  const calculateAge = (startDate) => {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const today = new Date();
    const diffTime = Math.abs(today - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calculate flowering days
  const calculateFloweringDays = (floweringStartDate) => {
    if (!floweringStartDate) return null;
    
    const start = new Date(floweringStartDate);
    const today = new Date();
    const diffTime = Math.abs(today - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  /* Quick Entry Feature - Commented out for later implementation
  // Fetch the most recent day entry for quick entry feature
  const fetchMostRecentEntry = async () => {
    if (!params.id || days.length === 0) return null;
    
    try {
      setLoadingLastEntry(true);
      
      // Sort days by date (newest first)
      const sortedDays = [...days].sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // If we have any days, return the most recent one
      if (sortedDays.length > 0) {
        setLastDayEntry(sortedDays[0]);
        return sortedDays[0];
      }
      
      return null;
    } catch (err) {
      console.error('Error preparing most recent entry:', err);
      return null;
    } finally {
      setLoadingLastEntry(false);
    }
  };
  
  // Use the most recent day entry data for quick entry
  const useLastEntryData = () => {
    if (!lastDayEntry) return;
    
    // Create a new day entry based on the last entry's data
    // but with today's date
    setNewDay({
      ...lastDayEntry,
      id: undefined, // Remove the ID as this is a new entry
      day_number: undefined, // Remove day number as it will be calculated by the API
      date: new Date().toISOString().split('T')[0], // Set today's date
    });
  };
  */
  
  // Handle adding a new day entry
  const handleAddDayEntry = async (e) => {
    if (e) e.preventDefault();
    
    try {
      // Ensure pH value is properly formatted as a string
      const formattedDay = {
        ...newDay,
        ph_value: newDay.ph_value ? String(newDay.ph_value) : '',
        humidity: newDay.humidity ? String(newDay.humidity) : '',
        temperature: newDay.temperature ? String(newDay.temperature) : ''
      };
      
      const response = await fetch(`/api/plants/${params.id}/days`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedDay),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add day entry');
      }
      
      const data = await response.json();
      
      // Add the new day to the days array
      setDays([...days, data.day]);
      
      // Reset form and hide it
      setNewDay({
        date: new Date().toISOString().split('T')[0],
        watering_amount: '',
        temperature: '',
        humidity: '',
        ph_value: '',
        notes: '',
        fertilizers: [],
        topped: false,
        flowering: false
      });
      setShowNewDayForm(false);
      setShowDayEntryModal(false);
      setCurrentDayStep(1);
      
      // Show success message
      alert('Tageseintrag erfolgreich hinzugefügt!');
    } catch (err) {
      console.error('Error adding day entry:', err);
      alert('Failed to add day entry: ' + err.message);
    }
  };
  
  // Handle editing a day entry
  const handleEditDay = (dayId) => {
    // For now, just log the ID - we'll implement this later
    console.log('Edit day:', dayId);
    alert('Edit functionality will be implemented in the next phase');
  };
  
  // Handle deleting a day entry
  const handleDeleteDay = async (dayId) => {
    if (!confirm('Möchtest du diesen Tageseintrag wirklich löschen?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/plants/${params.id}/days/${dayId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete day entry');
      }
      
      // Remove the deleted day from the days array
      setDays(days.filter(day => day.id !== dayId));
    } catch (err) {
      console.error('Error deleting day entry:', err);
      alert('Failed to delete day entry: ' + err.message);
    }
  };
  
  // Handle deleting a plant
  const handleDeletePlant = async () => {
    if (!confirm('Möchtest du diese Pflanze wirklich löschen?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/plants/${params.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete plant');
      }
      
      // Redirect to plants list after successful deletion
      router.push('/plants');
    } catch (err) {
      console.error('Error deleting plant:', err);
      alert('Failed to delete plant: ' + err.message);
    }
  };
  
  // Handle starting the flowering phase
  const handleStartFlowering = async () => {
    if (!confirm('Möchtest du die Blütephase für diese Pflanze jetzt starten?')) {
      return;
    }
    
    try {
      const floweringStartDate = new Date().toISOString().split('T')[0];
      
      const response = await fetch(`/api/plants/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...plant,
          flowering_start_date: floweringStartDate
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update plant');
      }
      
      const data = await response.json();
      
      // Update the plant in state
      setPlant(data.plant);
      
      // Show success message
      alert('Blütephase erfolgreich gestartet!');
    } catch (err) {
      console.error('Error starting flowering phase:', err);
      alert('Failed to start flowering phase: ' + err.message);
    }
  };

  // Effect to handle keyboard events for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showDayEntryModal) {
        setShowDayEntryModal(false);
        setCurrentDayStep(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showDayEntryModal]);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="alert-error px-4 py-3 rounded">
          Error: {error}
        </div>
        <button
          onClick={() => router.push('/plants')}
          className="mt-4 px-4 py-2 bg-brand-primary text-white rounded hover:bg-primary-hover transition-all duration-300 hover:shadow-md"
        >
          Zurück zur Pflanzenübersicht
        </button>
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="p-6">
        <div className="alert-warning px-4 py-3 rounded mb-4">
          Pflanze nicht gefunden
        </div>
        <p className="text-gray-600 mb-4">
          Die gesuchte Pflanze existiert nicht oder wurde gelöscht. Du kannst zur Pflanzenübersicht zurückkehren oder eine neue Pflanze anlegen.
        </p>
        <div className="flex space-x-4">
          <button
            onClick={() => router.push('/plants')}
            className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-primary-hover transition-all duration-300 hover:shadow-md"
          >
            Zurück zur Pflanzenübersicht
          </button>
          <button
            onClick={() => {
              router.push('/plants');
              // Dispatch event to open new plant modal after navigation
              setTimeout(() => {
                window.dispatchEvent(new Event('newPlantClick'));
              }, 100);
            }}
            className="px-4 py-2 bg-brand-secondary text-white rounded-md hover:bg-secondary-hover transition-all duration-300 hover:shadow-md"
          >
            Neue Pflanze anlegen
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ContextMenu
        plant={plant}
        harvestData={harvestData}
        onStartFlowering={handleStartFlowering}
        onShowNewDayForm={(show = true) => {
          if (show) {
            setShowDayEntryModal(true);
            setCurrentDayStep(1);
          } else {
            setShowDayEntryModal(false);
            setShowNewDayForm(false);
          }
        }}
        showNewDayForm={showNewDayForm || showDayEntryModal}
        onDeleteDay={handleDeleteDay}
        onDeletePlant={handleDeletePlant}
        days={days}
      />
      
      {/* Multi-Step Day Entry Modal */}
      {showDayEntryModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            // Close modal when clicking on the backdrop (outside the modal)
            if (e.target === e.currentTarget) {
              setShowDayEntryModal(false);
              setCurrentDayStep(1);
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-brand-primary">Neuer Tageseintrag</h2>
                <button 
                  onClick={() => {
                    setShowDayEntryModal(false);
                    setCurrentDayStep(1);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-brand-primary h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${(currentDayStep / totalDaySteps) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Grundinfo</span>
                  <span>Bewässerung</span>
                  <span>Messwerte</span>
                </div>
              </div>
              
              {/* Form Content */}
              <div>
                {/* Step 1: Basic Information */}
                {currentDayStep === 1 && (
                  <div className="space-y-6">
                    {/* Date Selection */}
                    <div className="border-2 border-brand-primary/20 rounded-lg bg-brand-primary/5 relative p-4">
                      <div className="absolute -top-3 left-4 bg-white px-2 text-brand-primary font-medium flex items-center gap-2">
                        <FaCalendarAlt className="text-brand-primary" />
                        <span>Datum</span>
                      </div>
                      
                      <div className="mt-3">
                        <input
                          type="date"
                          value={newDay.date}
                          onChange={(e) => setNewDay({...newDay, date: e.target.value})}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                          required
                        />
                      </div>
                    </div>
                    
                    {/* Plant Care Options */}
                    <div className="border-2 border-brand-primary/20 rounded-lg bg-brand-primary/5 relative p-4">
                      <div className="absolute -top-3 left-4 bg-white px-2 text-brand-primary font-medium flex items-center gap-2">
                        <FaLeaf className="text-brand-primary" />
                        <span>Pflegemaßnahmen</span>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-4">
                          <button
                            type="button"
                            onClick={() => setNewDay(prev => ({ ...prev, topped: !prev.topped }))}
                            className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all ${newDay.topped ? 'bg-brand-primary text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                          >
                            <FaCut className={`text-2xl mb-1 ${newDay.topped ? 'text-white' : 'text-gray-500'}`} />
                            <span className="text-sm font-medium">Getoppt</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => setNewDay(prev => ({ ...prev, flowering: !prev.flowering }))}
                            className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all ${newDay.flowering ? 'bg-brand-primary text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                          >
                            <FaSun className={`text-2xl mb-1 ${newDay.flowering ? 'text-white' : 'text-gray-500'}`} />
                            <span className="text-sm font-medium">Blüte</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Notes */}
                    <div className="border-2 border-brand-primary/20 rounded-lg bg-brand-primary/5 relative p-4">
                      <div className="absolute -top-3 left-4 bg-white px-2 text-brand-primary font-medium flex items-center gap-2">
                        <BsChatDots className="text-brand-primary" />
                        <span>Notizen</span>
                      </div>
                      
                      <div className="mt-3">
                        <textarea
                          value={newDay.notes}
                          onChange={(e) => setNewDay({...newDay, notes: e.target.value})}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary h-24 resize-none"
                          placeholder="Notizen zum Tag..."
                        ></textarea>
                      </div>
                    </div>
                    
                    {/* Navigation Buttons */}
                    <div className="mt-6 flex justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setShowDayEntryModal(false);
                          setCurrentDayStep(1);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50"
                      >
                        Abbrechen
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setCurrentDayStep(currentDayStep + 1)}
                        className="px-5 py-2.5 bg-brand-primary text-white rounded-md font-medium hover:bg-opacity-90 shadow-sm flex items-center gap-1"
                      >
                        Weiter
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Step 2: Watering & Fertilizers */}
                {currentDayStep === 2 && (
                  <div className="space-y-6">
                    {/* Watering Amount */}
                    <div className="border-2 border-brand-primary/20 rounded-lg bg-brand-primary/5 relative p-4">
                      <div className="absolute -top-3 left-4 bg-white px-2 text-brand-primary font-medium flex items-center gap-2">
                        <GiWateringCan className="text-brand-primary" />
                        <span>Bewässerung</span>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex items-center gap-3 mb-2">
                          <GiWateringCan className="text-brand-primary text-xl" />
                          <span className="font-medium">{newDay.watering_amount || '0'} ml</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1000"
                          step="50"
                          value={newDay.watering_amount || 0}
                          onChange={(e) => setNewDay({...newDay, watering_amount: e.target.value})}
                          className="w-full accent-brand-primary"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>0 ml</span>
                          <span>500 ml</span>
                          <span>1000 ml</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Fertilizers - Only show if watering amount > 0 */}
                    {parseInt(newDay.watering_amount) > 0 && (
                      <div className="border-2 border-brand-primary/20 rounded-lg bg-brand-primary/5 relative p-4">
                        <div className="absolute -top-3 left-4 bg-white px-2 text-brand-primary font-medium flex items-center gap-2">
                          <FaFlask className="text-brand-primary" />
                          <span>Dünger</span>
                        </div>
                        
                        <div className="mt-3 space-y-4">
                          {/* Current Fertilizers */}
                          {newDay.fertilizers.length > 0 ? (
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-gray-700 mb-2">Hinzugefügte Dünger:</div>
                              <div className="bg-white rounded-lg border border-gray-200 p-2 space-y-2">
                                {newDay.fertilizers.map((fertilizer, index) => (
                                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{fertilizer.name}</span>
                                      <div className="flex items-center">
                                        <input
                                          type="number"
                                          value={fertilizer.amount}
                                          onChange={(e) => {
                                            const updatedFertilizers = [...newDay.fertilizers];
                                            updatedFertilizers[index] = {
                                              ...fertilizer,
                                              amount: e.target.value
                                            };
                                            setNewDay({...newDay, fertilizers: updatedFertilizers});
                                          }}
                                          className="w-20 px-2 py-1 bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                          placeholder="ml"
                                        />
                                        <span className="ml-1 text-gray-500">ml</span>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updatedFertilizers = [...newDay.fertilizers];
                                        updatedFertilizers.splice(index, 1);
                                        setNewDay({...newDay, fertilizers: updatedFertilizers});
                                      }}
                                      className="text-red-500 hover:text-red-700 p-1"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                      </svg>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-500">
                              Noch keine Dünger hinzugefügt
                            </div>
                          )}
                          
                          {/* Add Fertilizer Button */}
                          <div>
                            <button
                              type="button"
                              onClick={() => setShowFertilizerSelect(!showFertilizerSelect)}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-brand-primary/30 text-brand-primary rounded-md hover:bg-brand-primary/5 transition-colors"
                            >
                              <FaPlus className="text-xs" />
                              Dünger hinzufügen
                            </button>
                          </div>
                          
                          {/* Fertilizer Selection Panel */}
                          {showFertilizerSelect && (
                            <div className="bg-white rounded-lg border border-gray-200 p-4 mt-2">
                              {/* Previously used fertilizers */}
                              {previousFertilizers.length > 0 && (
                                <div className="mb-4">
                                  <div className="text-sm font-medium text-gray-700 mb-2">Zuletzt verwendet</div>
                                  <div className="grid grid-cols-2 gap-2">
                                    {previousFertilizers.map((fertilizer) => (
                                      <button
                                        key={fertilizer.fertilizer_name}
                                        type="button"
                                        onClick={() => {
                                          setNewDay({
                                            ...newDay,
                                            fertilizers: [...newDay.fertilizers, {
                                              name: fertilizer.fertilizer_name,
                                              amount: fertilizer.amount || ''
                                            }]
                                          });
                                          setShowFertilizerSelect(false);
                                        }}
                                        className="text-left px-2 py-1 text-sm rounded hover:bg-gray-100 flex items-center justify-between"
                                      >
                                        <span>{fertilizer.fertilizer_name}</span>
                                        <span className="text-xs text-gray-500">{fertilizer.usage_count}×</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Add new fertilizer */}
                              <div className="pt-2 border-t border-gray-200">
                                <div className="text-sm font-medium text-gray-700 mb-2">Neuer Dünger:</div>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={newFertilizer.name}
                                    onChange={(e) => setNewFertilizer({...newFertilizer, name: e.target.value})}
                                    className="flex-1 px-2 py-1 bg-transparent rounded focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!newFertilizer.name) return;
                                      setNewDay({
                                        ...newDay,
                                        fertilizers: [...newDay.fertilizers, {...newFertilizer}]
                                      });
                                      setNewFertilizer({ name: '', amount: '' });
                                      setShowFertilizerSelect(false);
                                    }}
                                    className="px-3 py-1 text-sm bg-custom-orange text-white rounded hover:bg-orange-600"
                                    disabled={!newFertilizer.name}
                                  >
                                    Hinzufügen
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Navigation Buttons */}
                    <div className="mt-6 flex justify-between">
                      <button
                        type="button"
                        onClick={() => setCurrentDayStep(currentDayStep - 1)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50"
                      >
                        Zurück
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setCurrentDayStep(currentDayStep + 1)}
                        className="px-5 py-2.5 bg-brand-primary text-white rounded-md font-medium hover:bg-opacity-90 shadow-sm flex items-center gap-1"
                      >
                        Weiter
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Step 3: Environmental Metrics */}
                {currentDayStep === 3 && (
                  <form onSubmit={handleAddDayEntry}>
                    {/* Temperature */}
                    <div className="border-2 border-brand-primary/20 rounded-lg bg-brand-primary/5 relative p-4">
                      <div className="absolute -top-3 left-4 bg-white px-2 text-brand-primary font-medium flex items-center gap-2">
                        <FaTemperatureHigh className="text-brand-primary" />
                        <span>Temperatur</span>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex items-center gap-3 mb-2">
                          <FaTemperatureHigh className="text-brand-primary text-xl" />
                          <span className="font-medium">{newDay.temperature || '20'}°C</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="35"
                          step="0.5"
                          value={newDay.temperature || 20}
                          onChange={(e) => setNewDay({...newDay, temperature: e.target.value})}
                          className="w-full accent-brand-primary"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>10°C</span>
                          <span>22.5°C</span>
                          <span>35°C</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Humidity */}
                    <div className="border-2 border-brand-primary/20 rounded-lg bg-brand-primary/5 relative p-4">
                      <div className="absolute -top-3 left-4 bg-white px-2 text-brand-primary font-medium flex items-center gap-2">
                        <FaTint className="text-brand-primary" />
                        <span>Luftfeuchtigkeit</span>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex items-center gap-3 mb-2">
                          <FaTint className="text-brand-primary text-xl" />
                          <span className="font-medium">{newDay.humidity || '50'}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={newDay.humidity || 50}
                          onChange={(e) => setNewDay({...newDay, humidity: e.target.value})}
                          className="w-full accent-brand-primary"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>0%</span>
                          <span>50%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* pH Value */}
                    <div className="border-2 border-brand-primary/20 rounded-lg bg-brand-primary/5 relative p-4">
                      <div className="absolute -top-3 left-4 bg-white px-2 text-brand-primary font-medium flex items-center gap-2">
                        <FaFlask className="text-brand-primary" />
                        <span>pH-Wert</span>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <FaFlask className="text-brand-primary text-xl" />
                            <span className="font-medium">pH-Wert</span>
                          </div>
                          <div className="text-brand-primary font-medium bg-white px-3 py-1 rounded-full border border-brand-primary/20">
                            {newDay.ph_value ? newDay.ph_value : '---'}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-7 gap-1 py-1">
                          {Array.from({ length: 14 }, (_, i) => (5 + i * 0.2).toFixed(1)).map(value => (
                            <button
                              key={`ph-${value}`}
                              type="button"
                              onClick={() => setNewDay({...newDay, ph_value: value})}
                              className={`
                                px-1 py-1.5 text-xs rounded-md transition-all flex justify-center
                                ${newDay.ph_value === value 
                                  ? 'bg-brand-primary text-white font-medium shadow-md' 
                                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}
                              `}
                            >
                              {value}
                            </button>
                          ))}
                        </div>
                        
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>Sauer (5.0)</span>
                          <span>Neutral (6.5)</span>
                          <span>Basisch (7.5)</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Navigation Buttons */}
                    <div className="mt-8 flex justify-between items-center">
                      {currentDayStep > 1 ? (
                        <button
                          type="button"
                          onClick={() => setCurrentDayStep(currentDayStep - 1)}
                          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                          </svg>
                          Zurück
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setShowDayEntryModal(false);
                            setCurrentDayStep(1);
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50"
                        >
                          Abbrechen
                        </button>
                      )}
                      
                      {currentDayStep < totalDaySteps ? (
                        <button
                          type="button"
                          onClick={() => setCurrentDayStep(currentDayStep + 1)}
                          className="px-5 py-2.5 bg-brand-primary text-white rounded-md font-medium hover:bg-opacity-90 shadow-sm flex items-center gap-1"
                        >
                          Weiter
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                          </svg>
                        </button>
                      ) : (
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-brand-primary text-white rounded-md font-medium hover:bg-opacity-90 shadow-sm"
                        >
                          Speichern
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="p-6 mt-10 pb-32 pattern-diagonal">
  

        {/* Plant Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 pattern-dots opacity-[0.03] pointer-events-none"></div>
          <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between max-w-4xl mx-auto">
            <div className="mb-4 md:mb-0">
              <h2 className="text-gray-800 interactive-heading text-focus-animation">{plant.name}</h2>
              {plant.breeder && (
                <p className="text-gray-500 text-small mt-1">von {plant.breeder}</p>
              )}
            </div>
            
            <div className="flex flex-col md:flex-row md:space-x-8 space-y-4 md:space-y-0">
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-primary">{calculateAge(plant.start_date)}</div>
                <div className="text-small uppercase tracking-wide text-gray-400 mt-1">Tage alt</div>
                <div className="text-micro text-gray-500">{new Date(plant.start_date).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: '2-digit' })}</div>
              </div>

              <div className="text-center">
                {plant.flowering_start_date ? (
                  <>
                    <div className="text-2xl font-bold text-purple-600">
                      {calculateFloweringDays(plant.flowering_start_date)} / {plant.expected_flowering_days || '?'}
                    </div>
                    <div className="text-xs uppercase tracking-wide text-gray-400 mt-1">Blütetage</div>
                  </>
                ) : plant.expected_flowering_days ? (
                  <>
                    <div className="text-2xl font-bold text-gray-400">0 / {plant.expected_flowering_days}</div>
                    <div className="text-xs uppercase tracking-wide text-gray-400 mt-1">Blütetage</div>
                  </>
                ) : null}
              </div>

              {harvestData && (
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{harvestData.dry_weight}g</div>
                  <div className="text-xs uppercase tracking-wide text-gray-400 mt-1">Ertrag</div>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>



        {/* Tab navigation */}
        <div className="flex justify-center mb-6 text-focus-animation">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                activeTab === 'details' 
                  ? 'bg-brand-primary text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('details')}
            >
              <span className="flex items-center gap-2 transition-all duration-300">
                <FaCalendarAlt />
                Tageseinträge
              </span>
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                activeTab === 'statistics' 
                  ? 'bg-brand-primary text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('statistics')}
            >
              <span className="flex items-center gap-2 transition-all duration-300">
                <FaChartLine />
                Statistiken
              </span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'details' ? (
          <div className="bg-white rounded-lg shadow-md p-6 interactive-card">
            {/* New Day Entry Form */}
            {showNewDayForm && !showDayEntryModal && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
              <h3 className="mb-3 text-focus-animation text-text-primary">Neuer Tageseintrag</h3>
              
              <form onSubmit={handleAddDayEntry}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
                    <div className="bg-white rounded-lg border border-gray-200 p-2">
                      <input
                        type="date"
                        value={newDay.date}
                        onChange={(e) => setNewDay({...newDay, date: e.target.value})}
                        className="w-full px-3 py-2 bg-transparent rounded focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        required
                      />
                    </div>
                  </div>

                  {/* Watering and Fertilizer Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bewässerung</label>
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg border border-gray-200 p-3">
                        <div className="flex items-center gap-3 mb-2">
                          <GiWateringCan className="mr-2" />
                          <span className="font-medium">{newDay.watering_amount || '0'} ml</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1000"
                          step="50"
                          value={newDay.watering_amount || 0}
                          onChange={(e) => setNewDay({...newDay, watering_amount: e.target.value})}
                          className="w-full accent-brand-primary"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>0</span>
                          <span>500</span>
                          <span>1000</span>
                        </div>
                      </div>

                      {newDay.watering_amount > 0 && (
                        <div className="space-y-2">
                          {/* Current Fertilizers */}
                          {newDay.fertilizers.length > 0 && (
                            <div className="bg-gray-100 p-2 rounded-md space-y-1">
                              {newDay.fertilizers.map((fertilizer, index) => (
                                <div key={index} className="flex items-center justify-between text-sm bg-white p-2 rounded">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{fertilizer.name}</span>
                                    <input
                                      type="number"
                                      value={fertilizer.amount}
                                      onChange={(e) => {
                                        const updatedFertilizers = [...newDay.fertilizers];
                                        updatedFertilizers[index] = {
                                          ...fertilizer,
                                          amount: e.target.value
                                        };
                                        setNewDay({...newDay, fertilizers: updatedFertilizers});
                                      }}
                                      className="w-20 px-2 py-1 bg-transparent rounded focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                      placeholder="ml"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updatedFertilizers = [...newDay.fertilizers];
                                      updatedFertilizers.splice(index, 1);
                                      setNewDay({...newDay, fertilizers: updatedFertilizers});
                                    }}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    &times;
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add Fertilizer Button */}
                          <div className="flex justify-between items-center">
                            <button
                              type="button"
                              onClick={() => setShowFertilizerSelect(!showFertilizerSelect)}
                              className="text-sm text-custom-orange hover:text-orange-600 flex items-center gap-1"
                            >
                              <FaPlus className="text-xs" />
                              Dünger hinzufügen
                            </button>
                          </div>

                          {/* Fertilizer Quick Select */}
                          {showFertilizerSelect && (
                            <div className="bg-white p-3 rounded-md border border-gray-200">
                              <div className="grid gap-2">
                                {/* Previously used fertilizers */}
                                {previousFertilizers.length > 0 && (
                                  <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-500">Zuletzt verwendet</label>
                                    <div className="grid grid-cols-2 gap-1">
                                      {previousFertilizers.map((fertilizer) => (
                                        <button
                                          key={fertilizer.fertilizer_name}
                                          type="button"
                                          onClick={() => {
                                            setNewDay({
                                              ...newDay,
                                              fertilizers: [...newDay.fertilizers, {
                                                name: fertilizer.fertilizer_name,
                                                amount: fertilizer.amount || ''
                                              }]
                                            });
                                            setShowFertilizerSelect(false);
                                          }}
                                          className="text-left px-2 py-1 text-sm rounded hover:bg-gray-100 flex items-center justify-between"
                                        >
                                          <span>{fertilizer.fertilizer_name}</span>
                                          <span className="text-xs text-gray-500">{fertilizer.usage_count}×</span>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Add new fertilizer */}
                                <div className="mt-2 pt-2 border-t">
                                  <label className="block text-xs font-medium text-gray-500 mb-1">Neuer Dünger</label>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={newFertilizer.name}
                                      onChange={(e) => setNewFertilizer({...newFertilizer, name: e.target.value})}
                                      className="flex-1 px-2 py-1 bg-transparent rounded focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!newFertilizer.name) return;
                                        setNewDay({
                                          ...newDay,
                                          fertilizers: [...newDay.fertilizers, {...newFertilizer}]
                                        });
                                        setNewFertilizer({ name: '', amount: '' });
                                        setShowFertilizerSelect(false);
                                      }}
                                      className="px-3 py-1 text-sm bg-custom-orange text-white rounded hover:bg-orange-600"
                                      disabled={!newFertilizer.name}
                                    >
                                      Hinzufügen
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Plant Care with interactive icons */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pflanzenpflege</label>
                    <div className="bg-white rounded-lg border border-gray-200 p-3">
                      <div className="flex flex-wrap gap-4 mt-2">
                        <button
                          type="button"
                          onClick={() => setNewDay(prev => ({ ...prev, topped: !prev.topped }))}
                          className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all ${newDay.topped ? 'bg-brand-primary text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                          <FaCut className={`text-2xl mb-1 ${newDay.topped ? 'text-white' : 'text-gray-500'}`} />
                          <span className="text-sm font-medium">Getoppt</span>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setNewDay(prev => ({ ...prev, flowering: !prev.flowering }))}
                          className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all ${newDay.flowering ? 'bg-brand-primary text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                          <FaSun className={`text-2xl mb-1 ${newDay.flowering ? 'text-white' : 'text-gray-500'}`} />
                          <span className="text-sm font-medium">Blüte</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Temperatur (°C)</label>
                    <div className="bg-white rounded-lg border border-gray-200 p-3">
                      <div className="flex items-center gap-3 mb-2">
                        <FaTemperatureHigh className="text-brand-primary text-xl" />
                        <span className="font-medium">{newDay.temperature || '20'}°C</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="35"
                        step="0.5"
                        value={newDay.temperature || 20}
                        onChange={(e) => setNewDay({...newDay, temperature: e.target.value})}
                        className="w-full accent-brand-primary"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>10°C</span>
                        <span>22.5°C</span>
                        <span>35°C</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Luftfeuchtigkeit (%)</label>
                    <div className="bg-white rounded-lg border border-gray-200 p-3">
                      <div className="flex items-center gap-3 mb-2">
                        <FaTint className="text-brand-primary text-xl" />
                        <span className="font-medium">{newDay.humidity || '50'}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={newDay.humidity || 50}
                        onChange={(e) => setNewDay({...newDay, humidity: e.target.value})}
                        className="w-full accent-brand-primary"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* pH Value Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">pH-Wert</label>
                    <div className="bg-white rounded-lg border border-gray-200 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FaFlask className="text-brand-primary text-xl" />
                          <span className="font-medium">pH-Wert</span>
                        </div>
                        <div className="text-brand-primary font-medium bg-white px-3 py-1 rounded-full border border-brand-primary/20">
                          {newDay.ph_value ? newDay.ph_value : '---'}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-7 gap-1 py-1">
                        {Array.from({ length: 14 }, (_, i) => (5 + i * 0.2).toFixed(1)).map(value => (
                          <button
                            key={`ph-${value}`}
                            type="button"
                            onClick={() => setNewDay({...newDay, ph_value: value})}
                            className={`
                              px-1 py-1.5 text-xs rounded-md transition-all flex justify-center
                              ${newDay.ph_value === value 
                                ? 'bg-brand-primary text-white font-medium shadow-md' 
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}
                            `}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>Sauer (5.0)</span>
                        <span>Neutral (6.5)</span>
                        <span>Basisch (7.5)</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
                  <div className="bg-white rounded-lg border border-gray-200 p-2">
                    <textarea
                      value={newDay.notes}
                      onChange={(e) => setNewDay({...newDay, notes: e.target.value})}
                      className="w-full px-3 py-2 bg-transparent rounded focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      rows="3"
                      placeholder="Beobachtungen oder Notizen zum Tag..."
                    ></textarea>
                  </div>
                </div>
                
                {/* Save and cancel buttons moved to ContextMenu */}
              </form>
            </div>
          )}
          
          {/* Day Entries List */}

          {days.length > 0 && (
            <div className="mt-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {days.sort((a, b) => new Date(b.date) - new Date(a.date)).map((day) => (
                  <div
                    key={day.id}
                    onClick={() => router.push(`/plants/${params.id}/days/${day.id}`)}
                    className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium">Tag {day.day_number}</h3>
                        <p className="text-sm text-gray-600">{new Date(day.date).toLocaleDateString('de-DE')}</p>
                        
                        <div className="mt-2 space-y-2">
                          {day.watering_amount && (
                            <div className="flex items-center text-sm text-gray-600">
                              <GiWateringCan className="mr-2" />
                              <span>{day.watering_amount} ml</span>
                            </div>
                          )}
                          {day.temperature && (
                            <div className="flex items-center text-sm text-gray-600">
                              <FaTemperatureHigh className="mr-2" />
                              <span>{day.temperature} °C</span>
                            </div>
                          )}
                          {day.humidity && (
                            <div className="flex items-center text-sm text-gray-600">
                              <FaTint className="mr-2" />
                              <span>{day.humidity}%</span>
                            </div>
                          )}
                          {day.ph_value && (
                            <div className="flex items-center text-sm text-gray-600">
                              <FaFlask className="mr-2" />
                              <span>pH {day.ph_value}</span>
                            </div>
                          )}
                          {day.fertilizers && day.fertilizers.length > 0 && (
                            <div className="flex items-center text-sm text-gray-600">
                              <FaLeaf className="mr-2" />
                              <span>{day.fertilizers.length} Dünger</span>
                            </div>
                          )}
                          {day.notes && (
                            <div className="text-sm text-gray-600 mt-2 line-clamp-2">
                              {day.notes}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <DayEntryMenu
                        items={[
                          {
                            label: 'Bearbeiten',
                            icon: <FaEdit />,
                            onClick: (e) => {
                              e.stopPropagation();
                              handleEditDay(day.id);
                            }
                          },
                          {
                            label: 'Löschen',
                            icon: <FaTrash />,
                            onClick: (e) => {
                              e.stopPropagation();
                              handleDeleteDay(day.id);
                            }
                          }
                        ]}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>
        ) : (
          <StatisticsTab days={days} />
        )}
      </div>
    </>
  );
}