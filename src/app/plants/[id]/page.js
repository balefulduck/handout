'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ContextMenu from '@/components/ContextMenu';
import { FaSeedling, FaCalendarAlt, FaEdit, FaTrash, FaPlus, FaTint, FaTemperatureHigh, FaLeaf } from 'react-icons/fa';
import { GiFlowerPot, GiWateringCan } from 'react-icons/gi';

export default function PlantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [plant, setPlant] = useState(null);
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewDayForm, setShowNewDayForm] = useState(false);
  const [harvestData, setHarvestData] = useState(null);
  const [newDay, setNewDay] = useState({
    date: new Date().toISOString().split('T')[0],
    watering_amount: '',
    temperature: '',
    humidity: '',
    notes: '',
    fertilizers: []
  });
  
  const [showFertilizerForm, setShowFertilizerForm] = useState(false);
  const [newFertilizer, setNewFertilizer] = useState({
    name: '',
    amount: ''
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
  
  // Calculate day number from start date
  const calculateDayNumber = (currentDate, startDate) => {
    if (!currentDate || !startDate) return 1;
    
    const start = new Date(startDate);
    const current = new Date(currentDate);
    const diffTime = Math.abs(current - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  // Handle adding a new day entry
  const handleAddDayEntry = async (e) => {
    e.preventDefault();
    
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-custom-orange"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
        <button
          onClick={() => router.push('/plants')}
          className="mt-4 px-4 py-2 bg-custom-orange text-white rounded hover:bg-orange-600"
        >
          Zurück zur Pflanzenübersicht
        </button>
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-4">
          Pflanze nicht gefunden
        </div>
        <p className="text-gray-600 mb-4">
          Die gesuchte Pflanze existiert nicht oder wurde gelöscht. Du kannst zur Pflanzenübersicht zurückkehren oder eine neue Pflanze anlegen.
        </p>
        <div className="flex space-x-4">
          <button
            onClick={() => router.push('/plants')}
            className="px-4 py-2 bg-custom-orange text-white rounded hover:bg-orange-600"
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
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
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
        onShowNewDayForm={() => setShowNewDayForm(true)}
      />
      <div className="p-6 mt-5 pb-32">
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.push('/plants')}
            className="mr-4 text-custom-orange hover:text-orange-600"
          >
            &larr; Zurück
          </button>
          <h1 className="text-2xl font-bold font-aptos">{plant.name}</h1>
        </div>

        {/* Plant Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-gray-800">Pflanzendetails</h2>
            <span className="px-3 py-1 text-sm rounded-full bg-custom-orange text-white">
              {plant.genetic_type || plant.strain_type || 'Unbekannt'}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              {plant.breeder && (
                <p className="text-gray-700"><span className="font-semibold">Züchter:</span> {plant.breeder}</p>
              )}
              
              <div className="flex items-center text-gray-700">
                <FaSeedling className="mr-2 text-green-500" />
                <span><span className="font-semibold">Alter:</span> {calculateAge(plant.start_date)} Tage</span>
              </div>
              
              {plant.expected_flowering_days && (
                <p className="text-gray-700">
                  <span className="font-semibold">Erwartete Blütezeit:</span> {plant.expected_flowering_days} Tage
                </p>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center text-gray-700">
                <FaCalendarAlt className="mr-2 text-blue-500" />
                <span><span className="font-semibold">Startdatum:</span> {new Date(plant.start_date).toLocaleDateString()}</span>
              </div>
              
              {plant.flowering_start_date ? (
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center text-gray-700">
                    <GiFlowerPot className="mr-2 text-purple-500" />
                    <span>
                      <span className="font-semibold">Blüte seit:</span> {new Date(plant.flowering_start_date).toLocaleDateString()} 
                      ({calculateFloweringDays(plant.flowering_start_date)} Tage)
                    </span>
                  </div>
                  
                  {/* Show harvest info */}
                  {harvestData && (
                    <div className="flex items-center text-gray-700">
                      <FaLeaf className="mr-2 text-green-500" />
                      <span>
                        <span className="font-semibold">Geerntet:</span> {harvestData.dry_weight ? `${harvestData.dry_weight}g` : 'Ja'}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center text-gray-700">
                  <GiFlowerPot className="mr-2 text-purple-500" />
                  <span>Noch nicht in Blüte</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Plant Days Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Tageseinträge</h2>
          </div>
          
          {/* New Day Entry Form */}
          {showNewDayForm && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-3">Neuer Tageseintrag</h3>
              <form onSubmit={handleAddDayEntry}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
                    <input
                      type="date"
                      value={newDay.date}
                      onChange={(e) => setNewDay({...newDay, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-orange"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bewässerung (ml)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <GiWateringCan className="text-gray-400" />
                      </div>
                      <input
                        type="number"
                        value={newDay.watering_amount}
                        onChange={(e) => setNewDay({...newDay, watering_amount: e.target.value})}
                        className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-orange"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Temperatur (°C)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaTemperatureHigh className="text-gray-400" />
                      </div>
                      <input
                        type="number"
                        step="0.1"
                        value={newDay.temperature}
                        onChange={(e) => setNewDay({...newDay, temperature: e.target.value})}
                        className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-orange"
                        placeholder="20"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Luftfeuchtigkeit (%)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaTint className="text-gray-400" />
                      </div>
                      <input
                        type="number"
                        value={newDay.humidity}
                        onChange={(e) => setNewDay({...newDay, humidity: e.target.value})}
                        className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-orange"
                        placeholder="50"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
                  <textarea
                    value={newDay.notes}
                    onChange={(e) => setNewDay({...newDay, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-orange"
                    rows="3"
                    placeholder="Beobachtungen oder Notizen zum Tag..."
                  ></textarea>
                </div>
                
                {/* Fertilizer Section */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Dünger</label>
                    <button 
                      type="button"
                      onClick={() => setShowFertilizerForm(!showFertilizerForm)}
                      className="text-sm text-custom-orange hover:text-orange-600"
                    >
                      + Dünger hinzufügen
                    </button>
                  </div>
                  
                  {/* Fertilizer List */}
                  {newDay.fertilizers.length > 0 && (
                    <div className="mb-3">
                      <div className="bg-gray-100 p-3 rounded-md">
                        {newDay.fertilizers.map((fertilizer, index) => (
                          <div key={index} className="flex justify-between items-center mb-2 last:mb-0">
                            <div>
                              <span className="font-medium">{fertilizer.name}</span>
                              {fertilizer.amount && (
                                <span className="text-sm text-gray-600 ml-2">{fertilizer.amount} ml</span>
                              )}
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
                    </div>
                  )}
                  
                  {/* Add Fertilizer Form */}
                  {showFertilizerForm && (
                    <div className="bg-gray-50 p-3 rounded-md border border-gray-200 mb-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                          <input
                            type="text"
                            value={newFertilizer.name}
                            onChange={(e) => setNewFertilizer({...newFertilizer, name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-orange text-sm"
                            placeholder="Düngername"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Menge (ml)</label>
                          <input
                            type="number"
                            value={newFertilizer.amount}
                            onChange={(e) => setNewFertilizer({...newFertilizer, amount: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-orange text-sm"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (!newFertilizer.name) return;
                            
                            setNewDay({
                              ...newDay, 
                              fertilizers: [...newDay.fertilizers, {...newFertilizer}]
                            });
                            setNewFertilizer({ name: '', amount: '' });
                            setShowFertilizerForm(false);
                          }}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm"
                        >
                          Hinzufügen
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowNewDayForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-custom-orange text-white rounded-md hover:bg-orange-600"
                  >
                    Speichern
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Day Entries List */}
          {days.length > 0 ? (
            <div className="space-y-4">
              {days.map((day) => (
                <div key={day.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <div className="bg-green-100 text-green-800 p-2 rounded-md mr-3">
                        <FaCalendarAlt />
                      </div>
                      <div>
                        <h4 className="font-medium">{new Date(day.date).toLocaleDateString()}</h4>
                        <p className="text-sm text-gray-500">
                          Tag {calculateDayNumber(day.date, plant.start_date)}
                          {plant.flowering_start_date && day.date >= plant.flowering_start_date && 
                            ` | Blütetag ${calculateDayNumber(day.date, plant.flowering_start_date)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditDay(day.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => handleDeleteDay(day.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                    {day.watering_amount && (
                      <div className="flex items-center">
                        <GiWateringCan className="text-blue-500 mr-1" />
                        <span>{day.watering_amount} ml</span>
                      </div>
                    )}
                    {day.temperature && (
                      <div className="flex items-center">
                        <FaTemperatureHigh className="text-red-500 mr-1" />
                        <span>{day.temperature} °C</span>
                      </div>
                    )}
                    {day.humidity && (
                      <div className="flex items-center">
                        <FaTint className="text-blue-400 mr-1" />
                        <span>{day.humidity}%</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Display fertilizers if any */}
                  {day.fertilizers && day.fertilizers.length > 0 && (
                    <div className="mt-2 border-t border-gray-100 pt-2">
                      <div className="text-sm font-medium text-gray-700">Dünger:</div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {day.fertilizers.map((fertilizer, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 text-xs rounded">
                            {fertilizer.fertilizer_name}
                            {fertilizer.amount && ` (${fertilizer.amount} ml)`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {day.notes && (
                    <p className="mt-2 text-gray-700 text-sm border-t border-gray-100 pt-2">{day.notes}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Noch keine Tageseinträge vorhanden.</p>
              <p className="text-sm">Füge deinen ersten Eintrag hinzu, um das Wachstum zu verfolgen.</p>
            </div>
          )}
        </div>
      </div>

    </>
  );
}