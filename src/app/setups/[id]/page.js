'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaCalendarAlt, FaEdit, FaTrash, FaPlus, FaTint, FaTemperatureHigh, FaLeaf } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import SetupModal from '@/components/SetupModal';
import DayEntryMenu from '@/components/DayEntryMenu';

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
    <div className="p-6 pb-32">
      <div className="max-w-6xl mx-auto">
        {/* Setup header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{setup.name}</h1>
              {setup.description && (
                <p className="text-gray-600 mt-1">{setup.description}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                <span className="font-medium">{setup.plants.length}</span> Pflanzen in diesem Setup
              </p>
            </div>
            
            <div className="flex space-x-2 mt-4 md:mt-0">
              <button
                onClick={() => setShowEditModal(true)}
                className="bg-white text-gray-700 border border-gray-300 px-3 py-1 rounded flex items-center gap-1 hover:bg-gray-50"
              >
                <FaEdit className="text-gray-500" />
                <span>Bearbeiten</span>
              </button>
              <button
                onClick={handleDeleteSetup}
                className="bg-white text-red-600 border border-red-300 px-3 py-1 rounded flex items-center gap-1 hover:bg-red-50"
              >
                <FaTrash className="text-red-500" />
                <span>Löschen</span>
              </button>
              <button
                onClick={handleAddDayEntry}
                className="bg-brand-primary text-white px-3 py-1 rounded flex items-center gap-1 hover:bg-primary-hover"
              >
                <FaPlus />
                <span>Tageseintrag</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Tab navigation */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="flex border-b">
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
                <div className="text-center py-6">
                  <p className="text-gray-500">Keine Pflanzen in diesem Setup</p>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="mt-3 px-4 py-2 bg-brand-primary text-white rounded hover:bg-primary-hover inline-flex items-center gap-2"
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
                      className="border rounded-md overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer"
                      onClick={() => navigateToPlant(plant.id)}
                    >
                      <div className="p-3 border-b bg-gray-50">
                        <h3 className="font-medium text-gray-800">{plant.name}</h3>
                      </div>
                      <div className="p-3">
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <span className="text-xs">🌱</span> Start: {new Date(plant.start_date).toLocaleDateString('de-DE')}
                        </p>
                        {plant.flowering_start_date && (
                          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <span className="text-xs">🌸</span> Blüte: {new Date(plant.flowering_start_date).toLocaleDateString('de-DE')}
                          </p>
                        )}
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
                <div className="text-center py-6">
                  <p className="text-gray-500">Keine Tageseinträge für dieses Setup</p>
                  <button
                    onClick={handleAddDayEntry}
                    className="mt-3 px-4 py-2 bg-brand-primary text-white rounded hover:bg-primary-hover inline-flex items-center gap-2"
                  >
                    <FaPlus className="text-sm" />
                    Tageseintrag hinzufügen
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="px-4 py-2 text-gray-600 font-medium">Datum</th>
                        <th className="px-4 py-2 text-gray-600 font-medium">Details</th>
                        <th className="px-4 py-2 text-gray-600 font-medium text-right">Aktionen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dayEntries.map(entry => (
                        <tr key={entry.id} className="border-t">
                          <td className="px-4 py-3">
                            <div className="font-medium">
                              {new Date(entry.date).toLocaleDateString('de-DE', { 
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-3">
                              {entry.watering_amount && (
                                <div className="flex items-center text-gray-600 text-sm">
                                  <FaTint className="mr-1 text-blue-500" />
                                  {entry.watering_amount} ml
                                </div>
                              )}
                              {entry.temperature && (
                                <div className="flex items-center text-gray-600 text-sm">
                                  <FaTemperatureHigh className="mr-1 text-red-500" />
                                  {entry.temperature}°C
                                </div>
                              )}
                              {entry.humidity && (
                                <div className="flex items-center text-gray-600 text-sm">
                                  <span className="mr-1">💧</span>
                                  {entry.humidity}%
                                </div>
                              )}
                            </div>
                            {entry.notes && (
                              <div className="text-sm text-gray-600 mt-1">
                                <span className="font-medium">Notizen:</span> {entry.notes}
                              </div>
                            )}
                            {entry.fertilizers && entry.fertilizers.length > 0 && (
                              <div className="text-sm text-gray-600 mt-1">
                                <span className="font-medium">Dünger:</span> {entry.fertilizers.map(f => `${f.fertilizer_name} (${f.amount})`).join(', ')}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <DayEntryMenu
                              items={[
                                {
                                  label: 'Löschen',
                                  icon: <FaTrash />,
                                  onClick: () => handleDeleteDayEntry(entry.id)
                                }
                              ]}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
    </div>
  );
}
