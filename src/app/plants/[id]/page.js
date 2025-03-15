'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ContextMenu from '@/components/ContextMenu';
import DayEntryMenu from '@/components/DayEntryMenu';
import { FaSeedling, FaCalendarAlt, FaEdit, FaTrash, FaPlus, FaTint, FaTemperatureHigh, FaLeaf, FaChartLine, FaCut, FaSun, FaFlask } from 'react-icons/fa';
import { GiFlowerPot, GiWateringCan } from 'react-icons/gi';
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
  const [harvestData, setHarvestData] = useState(null);
  const [previousFertilizers, setPreviousFertilizers] = useState([]);
  const [showFertilizerSelect, setShowFertilizerSelect] = useState(false);
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
  const [newFertilizer, setNewFertilizer] = useState({
    name: '',
    amount: ''
  });
  const [activeTab, setActiveTab] = useState('details'); // Add tab state: 'details' or 'statistics'

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
  
  // Handle adding a new day entry
  const handleAddDayEntry = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    try {
      const response = await fetch(`/api/plants/${params.id}/days`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDay),
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
        notes: '',
        fertilizers: []
      });
      setShowNewDayForm(false);
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
        onShowNewDayForm={(show = true) => setShowNewDayForm(show)}
        showNewDayForm={showNewDayForm}
        onSaveNewDay={handleAddDayEntry}
      />
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
            {showNewDayForm && (
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
                                                amount: fertilizer.last_amount || ''
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
                                      placeholder="Name"
                                      value={newFertilizer.name}
                                      onChange={(e) => setNewFertilizer({...newFertilizer, name: e.target.value})}
                                      className="flex-1 px-2 py-1 text-sm bg-transparent rounded focus:outline-none focus:ring-1 focus:ring-brand-primary"
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
                {days.map((day) => (
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