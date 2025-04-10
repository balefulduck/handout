'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaCalendarAlt, FaEdit, FaTrash, FaPlus, FaTint, FaTemperatureHigh, FaLeaf, FaInfoCircle } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import SetupModal from '@/components/SetupModal';
import DayEntryMenu from '@/components/DayEntryMenu';
import ContextMenu from '@/components/ContextMenu';
import { GiGreenhouse, GiWateringCan } from 'react-icons/gi';
import { WiHumidity } from 'react-icons/wi';

export default function SetupDetailPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const [setup, setSetup] = useState(null);
  const [dayEntries, setDayEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [availablePlants, setAvailablePlants] = useState([]);
  const [activeTab, setActiveTab] = useState('plants'); // 'plants' or 'days'

  // Fetch setup data
  useEffect(() => {
    const fetchSetupData = async () => {
      if (status === 'loading') return;
      if (status === 'unauthenticated') {
        router.push('/login');
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/plant-setups/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch setup data');
        }
        
        const data = await response.json();
        setSetup(data.setup || null);
        setDayEntries(data.setup?.dayEntries || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching setup data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchSetupData();
    }
  }, [params.id, status, router]);

  // Fetch all plants for setup editing
  useEffect(() => {
    const fetchPlants = async () => {
      if (status === 'loading') return;
      if (status === 'unauthenticated') return;

      try {
        const response = await fetch('/api/plants');
        
        if (!response.ok) {
          throw new Error('Failed to fetch plants');
        }
        
        const data = await response.json();
        setAvailablePlants(data.plants || []);
      } catch (err) {
        console.error('Error fetching plants:', err);
      }
    };

    fetchPlants();
  }, [status]);

  const handleEditSetup = async (setupData) => {
    try {
      const response = await fetch(`/api/plant-setups/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(setupData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update setup');
      }
      
      const data = await response.json();
      
      // Update the setup state
      setSetup(data.setup);
      setShowEditModal(false);
    } catch (err) {
      console.error('Error updating setup:', err);
      alert('Failed to update setup: ' + err.message);
    }
  };

  const handleDeleteSetup = async () => {
    if (!confirm('Möchtest du dieses Setup wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/plant-setups/${params.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete setup');
      }
      
      // Redirect to setups list after successful deletion
      router.push('/setups');
    } catch (err) {
      console.error('Error deleting setup:', err);
      alert('Failed to delete setup: ' + err.message);
    }
  };

  const handleAddDayEntry = () => {
    router.push(`/setups/${params.id}/new-day`);
  };

  const handleDeleteDayEntry = async (dayEntryId) => {
    if (!confirm('Möchtest du diesen Tageseintrag wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/plant-setups/${params.id}/days/${dayEntryId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete day entry');
      }
      
      // Remove the deleted day entry from state
      setDayEntries(dayEntries.filter(entry => entry.id !== dayEntryId));
    } catch (err) {
      console.error('Error deleting day entry:', err);
      alert('Failed to delete day entry: ' + err.message);
    }
  };

  const navigateToPlant = (plantId) => {
    router.push(`/plants/${plantId}`);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="alert-error px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
        <button
          onClick={() => router.push('/setups')}
          className="px-4 py-2 bg-brand-primary text-white rounded hover:bg-primary-hover"
        >
          Zurück zur Setup-Übersicht
        </button>
      </div>
    );
  }

  if (!setup) {
    return (
      <div className="p-6">
        <div className="alert-warning px-4 py-3 rounded mb-4">
          Setup nicht gefunden
        </div>
        <button
          onClick={() => router.push('/setups')}
          className="px-4 py-2 bg-brand-primary text-white rounded hover:bg-primary-hover"
        >
          Zurück zur Setup-Übersicht
        </button>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <div className="max-w-6xl mx-auto">
        {/* Setup header */}
        <div className="bg-gradient-to-b from-brand-primary/90 to-brand-primary/70 text-white p-6 shadow-md">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <GiGreenhouse className="text-2xl" />
              <h1 className="text-2xl font-bold">{setup.name}</h1>
            </div>
            {setup.description && (
              <p className="text-white/80 mt-1">{setup.description}</p>
            )}
            <p className="text-sm text-white/80 mt-2">
              <span className="font-medium">{setup.plants.length}</span> Pflanzen in diesem Setup
            </p>
            
            <div className="flex space-x-2 mt-4">
              <button
                onClick={() => setShowEditModal(true)}
                className="bg-white/20 text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-white/30 transition-colors text-sm"
              >
                <FaEdit className="text-xs" />
                <span>Bearbeiten</span>
              </button>
              <button
                onClick={handleDeleteSetup}
                className="bg-white/20 text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-red-500/70 transition-colors text-sm"
              >
                <FaTrash className="text-xs" />
                <span>Löschen</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Tab navigation */}
        <div className="bg-white shadow-sm">
          <div className="flex">
            <button
              onClick={() => setActiveTab('plants')}
              className={`px-4 py-3 text-sm font-medium flex-1 text-center ${
                activeTab === 'plants' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-gray-600'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <FaLeaf />
                Pflanzen ({setup.plants.length})
              </span>
            </button>
            <button
              onClick={() => setActiveTab('days')}
              className={`px-4 py-3 text-sm font-medium flex-1 text-center ${
                activeTab === 'days' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-gray-600'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <FaCalendarAlt />
                Tageseinträge ({dayEntries.length})
              </span>
            </button>
          </div>
          
          {/* Plants tab content */}
          {activeTab === 'plants' && (
            <div className="p-4">
              {setup.plants.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
                  <GiGreenhouse className="mx-auto text-4xl text-gray-400 mb-3" />
                  <p className="text-gray-500 mb-3">Keine Pflanzen in diesem Setup</p>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="px-4 py-2 bg-brand-primary text-white rounded-full hover:bg-primary-hover inline-flex items-center gap-2"
                  >
                    <FaPlus className="text-sm" />
                    Pflanzen hinzufügen
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {setup.plants.map(plant => (
                    <div 
                      key={plant.id}
                      className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer"
                      onClick={() => navigateToPlant(plant.id)}
                    >
                      <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
                        <h3 className="font-medium text-gray-800">{plant.name}</h3>
                        <span className="px-2 py-0.5 bg-brand-primary/10 text-brand-primary rounded-full text-xs">
                          {plant.genetic_type || plant.strain_type || 'Unbekannt'}
                        </span>
                      </div>
                      <div className="p-4">
                        <div className="flex flex-wrap gap-3 mb-3">
                          <div className="flex items-center text-gray-600 text-sm">
                            <span className="text-xs mr-1">🌱</span> 
                            {new Date(plant.start_date).toLocaleDateString('de-DE')}
                          </div>
                          {plant.flowering_start_date && (
                            <div className="flex items-center text-gray-600 text-sm">
                              <span className="text-xs mr-1">🌸</span> 
                              {new Date(plant.flowering_start_date).toLocaleDateString('de-DE')}
                            </div>
                          )}
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <div className="text-xs text-gray-500">Klicken für Details</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Day entries tab content */}
          {activeTab === 'days' && (
            <div className="p-4">
              {dayEntries.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
                  <FaCalendarAlt className="mx-auto text-4xl text-gray-400 mb-3" />
                  <p className="text-gray-500 mb-3">Keine Tageseinträge für dieses Setup</p>
                  <button
                    onClick={handleAddDayEntry}
                    className="px-4 py-2 bg-brand-primary text-white rounded-full hover:bg-primary-hover inline-flex items-center gap-2"
                  >
                    <FaPlus className="text-sm" />
                    Tageseintrag hinzufügen
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {dayEntries.sort((a, b) => new Date(b.date) - new Date(a.date)).map(entry => (
                    <div key={entry.id} className="bg-white border rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
                      <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                        <div className="font-medium text-gray-800">
                          {new Date(entry.date).toLocaleDateString('de-DE', { 
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </div>
                        <DayEntryMenu
                          items={[
                            {
                              label: 'Löschen',
                              icon: <FaTrash />,
                              onClick: () => handleDeleteDayEntry(entry.id)
                            }
                          ]}
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex flex-wrap gap-4">
                          {entry.watering_amount && (
                            <div className="flex items-center text-gray-700 bg-blue-50 px-3 py-1.5 rounded-full">
                              <GiWateringCan className="mr-2 text-blue-500" />
                              <span>{entry.watering_amount} ml</span>
                            </div>
                          )}
                          {entry.temperature && (
                            <div className="flex items-center text-gray-700 bg-red-50 px-3 py-1.5 rounded-full">
                              <FaTemperatureHigh className="mr-2 text-red-500" />
                              <span>{entry.temperature}°C</span>
                            </div>
                          )}
                          {entry.humidity && (
                            <div className="flex items-center text-gray-700 bg-teal-50 px-3 py-1.5 rounded-full">
                              <WiHumidity className="mr-1 text-xl text-teal-500" />
                              <span>{entry.humidity}%</span>
                            </div>
                          )}
                        </div>
                        {entry.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            <div className="text-sm text-gray-700">
                              <FaInfoCircle className="inline-block mr-2 text-gray-500" />
                              {entry.notes}
                            </div>
                          </div>
                        )}
                        {entry.fertilizers && entry.fertilizers.length > 0 && (
                          <div className="mt-3">
                            <div className="font-medium text-sm text-gray-700 mb-2">Dünger:</div>
                            <div className="flex flex-wrap gap-2">
                              {entry.fertilizers.map((f, idx) => (
                                <span key={idx} className="bg-green-50 text-green-700 px-2 py-1 rounded-md text-xs">
                                  {f.fertilizer_name} ({f.amount})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {showEditModal && (
        <SetupModal
          onClose={() => setShowEditModal(false)}
          onSave={handleEditSetup}
          setup={setup}
          availablePlants={availablePlants}
          isNew={false}
        />
      )}
      
      {/* Context Menu for navigation with bottom action menu */}
      <ContextMenu 
        setup={setup} 
        onAddDayEntry={handleAddDayEntry}
      />
    </div>
  );
}
