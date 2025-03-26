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
  const [activeTab, setActiveTab] = useState('details'); // Add tab state: 'details', 'statistics', or 'harvest'
  const [newHarvestData, setNewHarvestData] = useState({
    consumption_material: 'flower',
    consumption_method: 'smoking',
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
                  consumption_material: harvestData.harvest.consumption_material || 'flower',
                  consumption_method: harvestData.harvest.consumption_method || 'smoking',
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
            {/* Modal content here */}
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
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'details' 
                    ? 'bg-brand-primary text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                } ${activeTab === 'details' ? 'rounded-l-lg' : activeTab === 'statistics' ? 'border-r border-l' : 'rounded-l-lg'}`}
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
                } ${activeTab === 'harvest' ? 'border-l' : activeTab === 'details' ? 'border-r' : ''}`}
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
                } rounded-r-lg`}
                onClick={() => setActiveTab('harvest')}
              >
                <span className="flex items-center gap-2 transition-all duration-300">
                  <GiFlowerPot />
                  Ernte
                </span>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'details' ? (
            <div className="bg-white rounded-lg shadow-md p-6 interactive-card">
              {/* Day entries content */}
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
                    {/* Consumption Method Group */}
                    <div className="mb-6">
                      <h3 className="mb-3 text-focus-animation">Konsummethode</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-small font-medium text-gray-700 mb-1">Material</label>
                          <select
                            value={newHarvestData.consumption_material}
                            onChange={(e) => setNewHarvestData({...newHarvestData, consumption_material: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md input-focus-animation"
                            required
                          >
                            <option value="flower">Blüte</option>
                            <option value="concentrate">Konzentrat</option>
                            <option value="edible">Essbar</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-small font-medium text-gray-700 mb-1">Methode</label>
                          <select
                            value={newHarvestData.consumption_method}
                            onChange={(e) => setNewHarvestData({...newHarvestData, consumption_method: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md input-focus-animation"
                            required
                          >
                            <option value="smoking">Rauchen</option>
                            <option value="vaping">Verdampfen</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
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
                          consumption_material: 'flower',
                          consumption_method: 'smoking',
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