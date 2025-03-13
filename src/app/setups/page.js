'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FaPlus, FaEdit, FaTrash, FaLeaf, FaCalendarAlt } from 'react-icons/fa';
import SetupModal from '@/components/SetupModal';

export default function SetupsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [setups, setSetups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewSetupModal, setShowNewSetupModal] = useState(false);
  const [editingSetup, setEditingSetup] = useState(null);
  const [availablePlants, setAvailablePlants] = useState([]);

  // Fetch all setups
  useEffect(() => {
    const fetchSetups = async () => {
      if (status === 'loading') return;
      if (status === 'unauthenticated') {
        router.push('/login');
        return;
      }

      setLoading(true);
      try {
        const response = await fetch('/api/plant-setups');
        
        if (!response.ok) {
          throw new Error('Failed to fetch setups');
        }
        
        const data = await response.json();
        setSetups(data.setups || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching setups:', err);
        // Instead of setting the error, just set empty setups array
        // This allows the page to display the "no setups" state
        setSetups([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSetups();
  }, [status, router]);

  // Fetch all plants for setup creation/editing
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

  const handleCreateSetup = async (setupData) => {
    try {
      const response = await fetch('/api/plant-setups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(setupData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create setup');
      }
      
      const data = await response.json();
      
      // Add the new setup to the setups array
      setSetups([data.setup, ...setups]);
      setShowNewSetupModal(false);
    } catch (err) {
      console.error('Error creating setup:', err);
      alert('Failed to create setup: ' + err.message);
    }
  };

  const handleEditSetup = async (setupData) => {
    try {
      const response = await fetch(`/api/plant-setups/${editingSetup.id}`, {
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
      
      // Update the setup in the setups array
      setSetups(setups.map(setup => 
        setup.id === editingSetup.id ? data.setup : setup
      ));
      setEditingSetup(null);
    } catch (err) {
      console.error('Error updating setup:', err);
      alert('Failed to update setup: ' + err.message);
    }
  };

  const handleDeleteSetup = async (setupId) => {
    if (!confirm('Möchtest du dieses Setup wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/plant-setups/${setupId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete setup');
      }
      
      // Remove the deleted setup from the setups array
      setSetups(setups.filter(setup => setup.id !== setupId));
    } catch (err) {
      console.error('Error deleting setup:', err);
      alert('Failed to delete setup: ' + err.message);
    }
  };

  const navigateToSetupDetail = (setupId) => {
    router.push(`/setups/${setupId}`);
  };
  
  const navigateToNewDayEntry = (setupId) => {
    router.push(`/setups/${setupId}/new-day`);
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
        <div className="alert-error px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pb-32">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Setups</h1>
          <button
            onClick={() => setShowNewSetupModal(true)}
            className="bg-brand-primary text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-primary-hover transition-all duration-300"
          >
            <FaPlus /> Neues Setup erstellen
          </button>
        </div>
        
        {setups.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 mb-4">Du hast noch keine Setups erstellt.</p>
            <p className="text-gray-500 mb-6">Setups helfen dir, mehrere Pflanzen zu gruppieren und gemeinsam zu verwalten.</p>
            <button
              onClick={() => setShowNewSetupModal(true)}
              className="bg-brand-primary text-white px-4 py-2 rounded-md flex items-center gap-2 mx-auto hover:bg-primary-hover transition-all duration-300"
            >
              <FaPlus /> Erstes Setup erstellen
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {setups.map(setup => (
              <div 
                key={setup.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div 
                  className="cursor-pointer"
                  onClick={() => navigateToSetupDetail(setup.id)}
                >
                  <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-800">{setup.name}</h2>
                    {setup.description && (
                      <p className="text-gray-600 text-sm mt-1">{setup.description}</p>
                    )}
                  </div>
                  
                  <div className="px-4 py-3 bg-gray-50">
                    <div className="flex items-center text-sm text-gray-600">
                      <FaLeaf className="mr-2 text-brand-primary" />
                      <span>{setup.plants.length} Pflanzen</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-white border-t flex justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSetup(setup);
                      }}
                      className="text-gray-600 hover:text-gray-800 p-1"
                      title="Setup bearbeiten"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSetup(setup.id);
                      }}
                      className="text-gray-600 hover:text-red-600 p-1"
                      title="Setup löschen"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToNewDayEntry(setup.id);
                    }}
                    className="text-brand-primary hover:text-primary-hover p-1 flex items-center text-sm"
                    title="Tageseintrag hinzufügen"
                  >
                    <FaCalendarAlt className="mr-1" />
                    <span>Tageseintrag</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {showNewSetupModal && (
        <SetupModal
          onClose={() => setShowNewSetupModal(false)}
          onSave={handleCreateSetup}
          availablePlants={availablePlants}
          isNew={true}
        />
      )}
      
      {editingSetup && (
        <SetupModal
          onClose={() => setEditingSetup(null)}
          onSave={handleEditSetup}
          availablePlants={availablePlants}
          setup={editingSetup}
          isNew={false}
        />
      )}
    </div>
  );
}
