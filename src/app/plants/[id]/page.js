'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ContextMenu from '@/components/ContextMenu';
import DayEntryMenu from '@/components/DayEntryMenu';
import { FaSeedling, FaCalendarAlt, FaEdit, FaTrash, FaPlus, FaTint, FaCalendarDay, FaWater, FaPencilAlt, FaTemperatureHigh, FaInfoCircle, FaLeaf, FaChartLine, FaCut, FaSun, FaFlask } from 'react-icons/fa';
import { GiFlowerPot, GiWateringCan, GiMedicines } from 'react-icons/gi';
import { BsChatDots } from 'react-icons/bs';
import StatisticsTab from '@/components/StatisticsTab';
import { addToRecentlyViewed } from '@/utils/recentlyViewedPlants';
import DrcInfoTag from '@/components/DrcInfoTag';

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
  const [activeTab, setActiveTab] = useState('details'); // Add tab state: 'details', 'statistics', or 'harvest'
  const [newHarvestData, setNewHarvestData] = useState({
    description: '',
    bud_density: 3,
    trichome_color: 'milky',
    curing_begin: new Date().toISOString().split('T')[0],
    curing_end: '',
    dry_weight: ''
  });

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
              if (harvestData.harvest) {
                // Pre-fill form with existing data
                setNewHarvestData({
                  description: harvestData.harvest.description || '',
                  bud_density: harvestData.harvest.bud_density || 3,
                  trichome_color: harvestData.harvest.trichome_color || 'milky',
                  curing_begin: harvestData.harvest.curing_begin || new Date().toISOString().split('T')[0],
                  curing_end: harvestData.harvest.curing_end || '',
                  dry_weight: harvestData.harvest.dry_weight || ''
                });
              }
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
      
      // If flowering is set to true and the plant isn't already flowering, start flowering phase
      if (newDay.flowering && !plant.flowering_start_date) {
        await handleStartFlowering(false); // Pass false to skip confirmation
      }
      
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
  const handleStartFlowering = async (confirm = true) => {
    if (confirm && !window.confirm('Möchtest du die Blütephase für diese Pflanze jetzt starten?')) {
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

  // Handle saving harvest data
  const handleSaveHarvest = async (e) => {
    if (e) e.preventDefault();
    
    try {
      const method = harvestData ? 'PUT' : 'POST';
      const response = await fetch(`/api/plants/${params.id}/harvest`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newHarvestData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save harvest data');
      }
      
      // Update the harvest data in state
      const updatedData = await response.json();
      setHarvestData(updatedData.harvest);
      
      // Update plant status to harvested if not already
      if (plant.status !== 'harvested') {
        const plantResponse = await fetch(`/api/plants/${params.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'harvested' }),
        });
        
        if (plantResponse.ok) {
          const updatedPlant = await plantResponse.json();
          setPlant(updatedPlant.plant);
        }
      }
      
      alert(harvestData ? 'Erntedaten erfolgreich aktualisiert!' : 'Ernte erfolgreich gespeichert!');
    } catch (err) {
      console.error('Error saving harvest data:', err);
      alert('Fehler beim Speichern der Erntedaten: ' + err.message);
    }
  };

  return (
    <>
      <ContextMenu
        plant={plant}
        harvestData={harvestData}
        onStartFlowering={handleStartFlowering}
        onShowNewDayForm={(show = true) => {
          if (show) {
            setShowDayEntryModal(true);
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
      
      {/* Day Entry Modal */}
      {showDayEntryModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            // Close modal when clicking on the backdrop (outside the modal)
            if (e.target === e.currentTarget) {
              setShowDayEntryModal(false);
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center">
                  <h3 className="text-2xl font-bold text-gray-800">Neuer Tageseintrag</h3>
                </div>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                handleAddDayEntry();
              }} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  {/* Date field */}
                  <div className="mb-8">
                    <div className="border-2 border-brand-primary/20 rounded-lg bg-brand-primary/5 relative">
                      <div className="absolute -top-3 left-4 bg-white px-2 text-brand-primary font-medium flex items-center gap-2 z-10">
                        <FaCalendarDay className="text-brand-primary" />
                        <span>Datum</span>
                      </div>

                      <div className="p-5">
                        {/* Current Date Display */}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3 cursor-pointer group">
                            <div className="flex flex-col">
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-gray-800">
                                  {new Date(newDay.date).toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })}
                                </span>
                                <span className="text-lg text-gray-600">
                                  {new Date(newDay.date).toLocaleDateString('de-DE', { year: 'numeric' })}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(newDay.date).toLocaleDateString('de-DE', { weekday: 'long' })}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 bg-white rounded-lg border border-gray-200 p-2">
                          <input
                            type="date"
                            value={newDay.date}
                            onChange={(e) => setNewDay({...newDay, date: e.target.value})}
                            className="w-full px-3 py-2 bg-transparent rounded focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Plant Care */}
                  <div className="mb-8">
                    <div className="border-2 border-brand-primary/20 rounded-lg bg-brand-primary/5 relative p-5">
                      <div className="absolute -top-3 left-4 bg-white px-2 text-brand-primary font-medium flex items-center gap-2">
                        <FaSeedling className="text-brand-primary" />
                        <span>Pflanzenpflege</span>
                      </div>
                      
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
                          <span className="text-sm font-medium">Blüte eingeleitet</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Watering Module */}
                  <div className="mb-8">
                    <div className="border-2 border-brand-primary/20 rounded-lg p-5 bg-brand-primary/5 relative">
                      <div className="absolute -top-3 left-4 bg-white px-2 text-brand-primary font-medium flex items-center gap-2">
                        <FaWater className="text-brand-primary" />
                        <span>Bewässerung</span>
                      </div>
                      
                      {/* Watering Slider */}
                      <div className="mb-6">
                        <div className="flex justify-between items-end mb-1">
                          <label htmlFor="watering_amount" className="block text-gray-700 font-medium">
                            Wassermenge: <span className="text-brand-primary font-bold">{newDay.watering_amount || 0} ml</span>
                          </label>
                          <div className="text-xs text-gray-500">
                            {parseInt(newDay.watering_amount) > 0 ? "Gewässert" : "Nicht gewässert"}
                          </div>
                        </div>
                        
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden w-full mt-2 mb-1 relative">
                          <div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-primary/50 to-brand-primary" 
                            style={{ width: `${Math.min(100, (parseInt(newDay.watering_amount || 0) / 1000) * 100)}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex items-center gap-2 w-full">
                          <input
                            type="range"
                            id="watering_amount"
                            value={newDay.watering_amount || 0}
                            onChange={(e) => setNewDay({...newDay, watering_amount: e.target.value})}
                            min="0"
                            max="1000"
                            step="10"
                            className="flex-1 accent-brand-primary cursor-pointer"
                          />
                          <input
                            type="number"
                            value={newDay.watering_amount || 0}
                            onChange={(e) => setNewDay({...newDay, watering_amount: e.target.value})}
                            min="0"
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-right"
                          />
                          <span className="text-gray-700">ml</span>
                        </div>
                        
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0 ml</span>
                          <span>500 ml</span>
                          <span>1000 ml</span>
                        </div>
                      </div>
                      
                      {/* Fertilizers - Integrated inside the watering section */}
                      <div className="border-t border-dashed border-brand-primary/30 pt-4 mt-6 mb-2">
                        <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <FaSeedling className="text-brand-primary" />
                          Düngung hinzufügen
                        </h3>
                        
                        <div className="flex justify-end items-center mb-4">
                          <button
                            type="button"
                            onClick={() => setShowFertilizerSelect(!showFertilizerSelect)}
                            className="text-brand-primary hover:text-primary-hover flex items-center text-sm gap-1 py-1 px-3 border border-brand-primary/20 rounded-full hover:bg-brand-primary/10 transition-colors"
                          >
                            <FaPlus /> Dünger hinzufügen
                          </button>
                        </div>
                        
                        <div className="bg-white rounded-lg p-3 border border-gray-200 hover:border-brand-primary/30 transition-colors">
                          {newDay.fertilizers.length > 0 ? (
                            newDay.fertilizers.map((fert, index) => (
                              <div 
                                key={index}
                                className="flex gap-2 items-center mb-3 bg-white rounded-lg p-2 border border-gray-200 hover:border-brand-primary/30 transition-colors"
                              >
                                <div className="flex-grow">
                                  <span className="font-medium">{fert.name}</span>
                                </div>
                                <div className="w-1/4 text-right">
                                  <span>{fert.amount} ml</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedFertilizers = [...newDay.fertilizers];
                                    updatedFertilizers.splice(index, 1);
                                    setNewDay({...newDay, fertilizers: updatedFertilizers});
                                  }}
                                  className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                                >
                                  <FaTimes />
                                </button>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4 text-gray-500">
                              <p>Noch keine Dünger hinzugefügt</p>
                            </div>
                          )}
                        </div>
                        
                        {/* Fertilizer Selection */}
                        {showFertilizerSelect && (
                          <div className="mt-4 p-3 border border-gray-200 rounded-md bg-gray-50">
                            <div className="mb-3">
                              <label className="block text-xs font-medium text-gray-700 mb-1">Düngername</label>
                              <input
                                type="text"
                                value={newFertilizer.name}
                                onChange={(e) => setNewFertilizer({...newFertilizer, name: e.target.value})}
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                placeholder="z.B. BioBizz Grow"
                              />
                            </div>
                            
                            <div className="mb-3">
                              <label className="block text-xs font-medium text-gray-700 mb-1">Menge (ml)</label>
                              <input
                                type="number"
                                min="0"
                                value={newFertilizer.amount}
                                onChange={(e) => setNewFertilizer({...newFertilizer, amount: e.target.value})}
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                placeholder="z.B. 5"
                              />
                            </div>
                            
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  if (newFertilizer.name.trim()) {
                                    setNewDay({
                                      ...newDay, 
                                      fertilizers: [...newDay.fertilizers, {...newFertilizer}]
                                    });
                                    setNewFertilizer({ name: '', amount: '' });
                                    setShowFertilizerSelect(false);
                                    
                                    // Save to previous fertilizers for future use
                                    if (!previousFertilizers.some(f => f.name === newFertilizer.name)) {
                                      setPreviousFertilizers([...previousFertilizers, {...newFertilizer}]);
                                    }
                                  }
                                }}
                                className="px-3 py-1 bg-brand-primary text-white text-sm rounded-md hover:bg-primary-hover"
                              >
                                Hinzufügen
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Environment Metrics */}
                  <div className="mb-8">
                    <div className="border-2 border-brand-primary/20 rounded-lg bg-brand-primary/5 relative p-5">
                      <div className="absolute -top-3 left-4 bg-white px-2 text-brand-primary font-medium flex items-center gap-2">
                        <FaInfoCircle className="text-brand-primary" />
                        <span>Umgebungswerte</span>
                      </div>
                      
                      {/* pH Value Selection */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-gray-700 font-medium flex items-center gap-1">
                            <FaFlask className="text-brand-primary" /> pH-Wert
                          </h3>
                          <div className="text-brand-primary font-medium bg-white px-3 py-1 rounded-full border border-brand-primary/20">
                            {newDay.ph_value ? newDay.ph_value : '---'}
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-3 border border-gray-200 hover:border-brand-primary/30 transition-colors">
                          <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-13 gap-1 py-1">
                            {Array.from({ length: 26 }, (_, i) => (5 + i * 0.1).toFixed(1)).map(value => (
                              <button
                                key={`ph-${value}`}
                                type="button"
                                onClick={() => {
                                  setNewDay({
                                    ...newDay,
                                    ph_value: value
                                  });
                                }}
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
                      
                      {/* Temperature Slider */}
                      <div className="mb-5">
                        <div className="flex justify-between items-end mb-1">
                          <h3 className="text-gray-700 font-medium flex items-center gap-1">
                            <svg className="w-4 h-4 text-brand-primary" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M8,5V19a4,4,0,0,0,8,0V5a4,4,0,0,0-8,0ZM12,3a2,2,0,0,1,2,2V19a2,2,0,0,1-4,0V5A2,2,0,0,1,12,3Zm0,14a1,1,0,1,0,1,1A1,1,0,0,0,12,17Z"/>
                            </svg>
                            Temperatur
                          </h3>
                          <div className="text-brand-primary font-medium">
                            {newDay.temperature ? `${newDay.temperature} °C` : '---'}
                          </div>
                        </div>
                        
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden w-full mt-2 mb-1 relative">
                          <div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-red-400" 
                            style={{ width: `${newDay.temperature ? Math.min(100, (parseFloat(newDay.temperature) - 10) * 5) : 0}%` }}
                          ></div>
                        </div>
                        
                        <input
                          type="range"
                          id="temperature"
                          value={newDay.temperature || 20}
                          onChange={(e) => setNewDay({...newDay, temperature: e.target.value})}
                          min="10"
                          max="35"
                          step="0.5"
                          className="w-full accent-brand-primary cursor-pointer"
                        />
                        
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>10 °C</span>
                          <span>22.5 °C</span>
                          <span>35 °C</span>
                        </div>
                      </div>
                      
                      {/* Humidity Slider */}
                      <div>
                        <div className="flex justify-between items-end mb-1">
                          <h3 className="text-gray-700 font-medium flex items-center gap-1">
                            <svg className="w-4 h-4 text-brand-primary" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M17.66,8L12,2.35,6.34,8C4.78,9.56,4,11.64,4,13.64s0.78,4.11,2.34,5.67 s3.61,2.35,5.66,2.35s4.1-0.79,5.66-2.35S20,15.64,20,13.64S19.22,9.56,17.66,8z M6,14c0.01-2,0.62-3.27,1.76-4.4L12,5.27l4.24,4.38 C17.38,10.77,17.99,12,18,14H6z"/>
                            </svg>
                            Luftfeuchtigkeit
                          </h3>
                          <div className="text-brand-primary font-medium">
                            {newDay.humidity ? `${newDay.humidity} %` : '---'}
                          </div>
                        </div>
                        
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden w-full mt-2 mb-1 relative">
                          <div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-gray-400 to-brand-primary" 
                            style={{ width: `${newDay.humidity ? Math.min(100, parseInt(newDay.humidity)) : 0}%` }}
                          ></div>
                        </div>
                        
                        <input
                          type="range"
                          id="humidity"
                          value={newDay.humidity || 50}
                          onChange={(e) => setNewDay({...newDay, humidity: e.target.value})}
                          min="0"
                          max="100"
                          step="1"
                          className="w-full accent-brand-primary cursor-pointer"
                        />
                        
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>0 %</span>
                          <span>50 %</span>
                          <span>100 %</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Notes field */}
                  <div className="mb-8">
                    <div className="border-2 border-brand-primary/20 rounded-lg bg-brand-primary/5 relative p-5">
                      <div className="absolute -top-3 left-4 bg-white px-2 text-brand-primary font-medium flex items-center gap-2">
                        <FaPencilAlt className="text-brand-primary" />
                        <span>Notizen</span>
                      </div>
                      
                      <div className="bg-white rounded-lg border border-gray-200 p-3 hover:border-brand-primary/30 transition-colors">
                        <textarea
                          id="notes"
                          value={newDay.notes}
                          onChange={(e) => setNewDay({...newDay, notes: e.target.value})}
                          className="w-full px-3 py-2 bg-transparent rounded focus:outline-none focus:ring-2 focus:ring-brand-primary"
                          rows="4"
                          placeholder="Notizen zum Tag..."
                        ></textarea>
                      </div>
                    </div>
                  </div>
                  
                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowDayEntryModal(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 mr-3"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-brand-primary text-white rounded-md hover:bg-primary-hover"
                    >
                      Speichern
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="p-6 flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
        </div>
      ) : error ? (
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
      ) : !plant ? (
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
      ) : (
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
            <div className="inline-flex rounded-md shadow-sm overflow-hidden" role="group">
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'details' 
                    ? 'bg-brand-primary text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                } rounded-l-lg`}
                onClick={() => setActiveTab('details')}
              >
                <span className="flex items-center gap-2 transition-all duration-300">
                  <FaCalendarAlt />
                  Tageseinträge
                </span>
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium ${
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
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'harvest' 
                    ? 'bg-brand-primary text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('harvest')}
              >
                <span className="flex items-center gap-2 transition-all duration-300">
                  <GiFlowerPot />
                  Ernte
                </span>
              </button>
              <div className="relative">
                <DrcInfoTag
                  term="Studienteilnahme"
                  tooltipContent="Hilf uns, indem du anonym an unserer Studie teilnimmst."
                  color="brand-primary"
                >
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-r-lg bg-white text-gray-400 cursor-not-allowed`}
                    disabled
                  >
                    <span className="flex items-center gap-2 transition-all duration-300">
                      <GiMedicines />
                      Studienteilnahme
                    </span>
                  </button>
                </DrcInfoTag>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'details' ? (
            <div className="bg-white rounded-lg shadow-md p-6 interactive-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Tageseinträge</h2>
                <button
                  onClick={() => {
                    setShowDayEntryModal(true);
                  }}
                  className="px-3 py-1.5 bg-brand-primary text-white rounded-md hover:bg-primary-hover transition-all duration-300 flex items-center gap-1.5"
                >
                  <FaPlus className="h-3 w-3" />
                  Neuer Eintrag
                </button>
              </div>
              
              {days.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="mb-3">
                    <FaCalendarAlt className="h-10 w-10 mx-auto text-gray-300" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-500 mb-2">Keine Tageseinträge</h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    Füge deinen ersten Tageseintrag hinzu, um wichtige Informationen über deine Pflanze zu dokumentieren.
                  </p>
                  <button
                    onClick={() => {
                      setShowDayEntryModal(true);
                    }}
                    className="mt-4 px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-primary-hover transition-all duration-300"
                  >
                    Ersten Eintrag erstellen
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {days.sort((a, b) => new Date(b.date) - new Date(a.date)).map((day) => (
                    <div key={day.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-center justify-between bg-gray-50 p-3 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-brand-primary" />
                          <span className="font-medium">{new Date(day.date).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                          {day.topped && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">Getoppt</span>
                          )}
                          {day.flowering && (
                            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">Blütebeginn</span>
                          )}
                        </div>
                        <DayEntryMenu 
                          items={[
                            { 
                              label: 'Details anzeigen', 
                              icon: <FaInfoCircle />, 
                              onClick: () => router.push(`/plants/${params.id}/days/${day.id}`) 
                            },
                            { 
                              label: 'Bearbeiten', 
                              icon: <FaEdit />, 
                              onClick: () => handleEditDay(day.id) 
                            },
                            { 
                              label: 'Löschen', 
                              icon: <FaTrash />, 
                              onClick: () => handleDeleteDay(day.id) 
                            }
                          ]} 
                        />
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          {day.watering_amount && (
                            <div className="flex items-center gap-2">
                              <FaTint className="text-blue-500" />
                              <span className="text-sm">{day.watering_amount} ml</span>
                            </div>
                          )}
                          {day.temperature && (
                            <div className="flex items-center gap-2">
                              <FaTemperatureHigh className="text-red-500" />
                              <span className="text-sm">{day.temperature} °C</span>
                            </div>
                          )}
                          {day.humidity && (
                            <div className="flex items-center gap-2">
                              <FaTint className="text-blue-300" />
                              <span className="text-sm">{day.humidity} %</span>
                            </div>
                          )}
                          {day.ph_value && (
                            <div className="flex items-center gap-2">
                              <FaFlask className="text-purple-500" />
                              <span className="text-sm">pH {day.ph_value}</span>
                            </div>
                          )}
                        </div>
                        
                        {day.fertilizers && day.fertilizers.length > 0 && (
                          <div className="mb-3">
                            <div className="text-xs text-gray-500 mb-1">Dünger:</div>
                            <div className="flex flex-wrap gap-2">
                              {day.fertilizers.map((fert, idx) => (
                                <span key={idx} className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">
                                  {fert.name} {fert.amount && `(${fert.amount} ml)`}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {day.notes && (
                          <div className="mt-3">
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                              <BsChatDots />
                              <span>Notizen:</span>
                            </div>
                            <p className="text-sm text-gray-700">{day.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'statistics' ? (
            <StatisticsTab days={days} />
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 interactive-card relative overflow-hidden">
              <div className="absolute inset-0 pattern-dots opacity-[0.03] pointer-events-none"></div>
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <GiFlowerPot className="text-2xl text-brand-accent mr-2" />
                  <h2 className="text-gray-800 text-focus-animation">
                    {harvestData ? 'Erntedaten bearbeiten' : 'Pflanze ernten'}
                  </h2>
                </div>

                {plant.status === 'harvested' || harvestData ? (
                  <form onSubmit={handleSaveHarvest}>
                    {/* Description */}
                    <div className="mb-6">
                      <label className="block text-small font-medium text-gray-700 mb-1">Beschreibung</label>
                      <textarea
                        value={newHarvestData.description}
                        onChange={(e) => setNewHarvestData({...newHarvestData, description: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-orange"
                        rows="3"
                        placeholder="Beschreibe deine Ernte..."
                      ></textarea>
                    </div>
                    
                    {/* Quality Metrics */}
                    <div className="mb-6">
                      <h3 className="mb-3 text-focus-animation">Qualitätsmerkmale</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Knospendichte (1-5)</label>
                          <input
                            type="range"
                            min="1"
                            max="5"
                            step="1"
                            value={newHarvestData.bud_density}
                            onChange={(e) => setNewHarvestData({...newHarvestData, bud_density: parseInt(e.target.value)})}
                            className="w-full"
                          />
                          <div className="flex justify-between text-micro text-gray-500">
                            <span>Locker (1)</span>
                            <span>Mittel (3)</span>
                            <span>Dicht (5)</span>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Trichomfarbe</label>
                          <select
                            value={newHarvestData.trichome_color}
                            onChange={(e) => setNewHarvestData({...newHarvestData, trichome_color: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md input-focus-animation"
                          >
                            <option value="clear">Klar</option>
                            <option value="cloudy">Trüb</option>
                            <option value="milky">Milchig</option>
                            <option value="amber">Bernstein</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    {/* Curing and Weight */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">Trocknung & Gewicht</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Trocknungsbeginn</label>
                          <input
                            type="date"
                            value={newHarvestData.curing_begin}
                            onChange={(e) => setNewHarvestData({...newHarvestData, curing_begin: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md input-focus-animation"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Trocknungsende</label>
                          <input
                            type="date"
                            value={newHarvestData.curing_end}
                            onChange={(e) => setNewHarvestData({...newHarvestData, curing_end: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md input-focus-animation"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Trockengewicht (g)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={newHarvestData.dry_weight}
                            onChange={(e) => setNewHarvestData({...newHarvestData, dry_weight: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md input-focus-animation"
                            placeholder="0.0"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Submit Button */}
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-primary-hover transition-all duration-300 hover:shadow-md"
                      >
                        {harvestData ? 'Erntedaten aktualisieren' : 'Ernte speichern'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-8">
                    <div className="mb-4">
                      <GiFlowerPot className="text-6xl mx-auto text-brand-primary opacity-50" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">Pflanze noch nicht geerntet</h3>
                    <p className="text-gray-600 mb-6">
                      Wenn du deine Pflanze geerntet hast, kannst du hier die Erntedaten erfassen.
                    </p>
                    <button
                      onClick={() => {
                        setNewHarvestData({
                          description: '',
                          bud_density: 3,
                          trichome_color: 'milky',
                          curing_begin: new Date().toISOString().split('T')[0],
                          curing_end: '',
                          dry_weight: ''
                        });
                        setPlant({...plant, status: 'harvested'});
                      }}
                      className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-primary-hover transition-all duration-300 hover:shadow-md"
                    >
                      Pflanze als geerntet markieren
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}