'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ContextMenu from '@/components/ContextMenu';
import { FaSeedling, FaLeaf, FaCalendarAlt } from 'react-icons/fa';
import { GiFlowerPot } from 'react-icons/gi';

export default function PlantsPage() {
  const router = useRouter();
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewPlantModal, setShowNewPlantModal] = useState(false);

  // Form state for new plant
  const [newPlant, setNewPlant] = useState({
    name: '',
    breeder: '',
    genetic_type: 'hybrid', // Default value
    expected_flowering_days: 60, // Default value
    start_date: new Date().toISOString().split('T')[0], // Today's date as default
    substrate: '' // New substrate field
  });

  // Function to handle new plant form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPlant(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Function to fetch plants from our new API
  const fetchPlants = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/plants');
      if (!response.ok) {
        throw new Error('Failed to fetch plants');
      }
      const data = await response.json();
      // Handle case where plants might be null or undefined
      setPlants(data.plants || []);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Error fetching plants:', err);
      // Don't set error state for empty plants - just show the empty state UI
      setPlants([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to create a new plant
  const createPlant = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/plants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPlant),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create plant');
      }

      // Reset form and close modal
      setNewPlant({
        name: '',
        breeder: '',
        genetic_type: 'hybrid',
        expected_flowering_days: 60,
        start_date: new Date().toISOString().split('T')[0],
        substrate: ''
      });
      setShowNewPlantModal(false);
      
      // Refresh plants list
      fetchPlants();
    } catch (err) {
      setError(err.message);
      console.error('Error creating plant:', err);
    }
  };

  // Function to navigate to plant detail page
  const navigateToPlantDetail = (plantId) => {
    router.push(`/plants/${plantId}`);
  };

  // Listen for the "Neue Pflanze" button click from ContextMenu
  useEffect(() => {
    const handleNewPlantClick = () => {
      setShowNewPlantModal(true);
    };

    // Add event listener
    window.addEventListener('newPlantClick', handleNewPlantClick);

    // Initial fetch
    fetchPlants();

    // Clean up event listener
    return () => {
      window.removeEventListener('newPlantClick', handleNewPlantClick);
    };
  }, []);

  // Calculate plant age in days
  const calculateAge = (startDate) => {
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

  // Calculate vegetation days (from start to flowering start)
  const calculateFloweringAge = (startDate, floweringStartDate) => {
    if (!floweringStartDate) return null;
    
    const start = new Date(startDate);
    const floweringStart = new Date(floweringStartDate);
    const diffTime = Math.abs(floweringStart - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (error) {
    return <div className="p-4 alert-error rounded-md px-4 py-3 font-semibold">Error: {error}</div>;
  }

  return (
    <>
      <div className="p-6 mt-10 pb-32 pattern-diagonal">
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
          </div>
        ) : plants.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg shadow text-focus-animation pattern-dots">
            <p className="text-gray-600 mb-4 text-normal">Du hast noch keine Pflanzen hinzugefügt.</p>
            <button 
              onClick={() => setShowNewPlantModal(true)}
              className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary hover:bg-primary-hover transition-all duration-300 hover:shadow-md"
            >
              Erste Pflanze hinzufügen
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
            {plants.map((plant) => (
              <div 
                key={plant.id}
                onClick={() => navigateToPlantDetail(plant.id)}
                className="bg-white border border-gray-200 p-4 rounded-lg shadow hover:shadow-md transition-all duration-300 cursor-pointer interactive-card relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-aptos text-gray-800">{plant.name}</h4>
                  <span className="px-2 py-1 text-micro rounded-full bg-brand-primary text-white">
                    {plant.genetic_type || plant.strain_type || 'Unbekannt'}
                  </span>
                </div>
                {plant.breeder && (
                    <p className="text-sm text-gray-600 font-semibold">{plant.breeder}</p>
                  )}
                
                {plant.substrate && (
                  <div className="text-xs text-gray-600 mb-1">
                    <span className="font-semibold">Substrat:</span> {plant.substrate === 'soil' ? 'Erde' : 
                                                      plant.substrate === 'coco' ? 'Kokos' : 
                                                      plant.substrate === 'hydro' ? 'Hydrokultur' : 
                                                      plant.substrate === 'rockwool' ? 'Steinwolle' : 
                                                      plant.substrate === 'other' ? 'Andere' : 
                                                      plant.substrate}
                  </div>
                )}
                
                <div className="mt-3 space-y-2">
                
                  <div className="space-y-1">
                    {/* Age progress bar */}
                    <div className="relative pt-1">
                     
                      <div className="overflow-hidden h-8 mb-2 text-xs flex rounded-lg bg-gray-200 border border-gray-300">
                        {plant.flowering_start_date ? (
                          <>
                            {/* Vegetation phase */}
                            <div 
                              style={{ 
                                width: `${Math.min(calculateFloweringAge(plant.start_date, plant.flowering_start_date) * 2, 100)}%` 
                              }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 relative min-w-[40px]"
                            >
                              <span className="relative z-10 font-bold">
                                {calculateFloweringAge(plant.start_date, plant.flowering_start_date)}
                              </span>
                            </div>
                            {/* Flowering phase */}
                            <div 
                              style={{ 
                                width: `${Math.min(calculateFloweringDays(plant.flowering_start_date) * 2, 100)}%`,
                                backgroundColor: '#941e71'
                              }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center relative min-w-[40px]"
                            >
                              <span className="relative z-10 font-bold">
                                {calculateFloweringDays(plant.flowering_start_date)}
                              </span>
                            </div>
                          </>
                        ) : (
                          /* Only vegetation phase */
                          <div 
                            style={{ 
                              width: `${Math.min(calculateAge(plant.start_date) * 2, 100)}%` 
                            }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 relative min-w-[40px]"
                          >
                            <span className="relative z-10 font-bold">
                              {calculateAge(plant.start_date)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
            
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Plant Modal */}
      {showNewPlantModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto relative">
            <div className="absolute inset-0 pattern-grid opacity-5 pointer-events-none"></div>
            <div className="relative z-10 p-6">
              <h3 className="mb-4 text-gray-800 interactive-heading">Neue Pflanze hinzufügen</h3>
              
              <form onSubmit={createPlant}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={newPlant.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-orange"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="breeder" className="block text-sm font-medium text-gray-700 mb-1">Züchter</label>
                    <input
                      type="text"
                      id="breeder"
                      name="breeder"
                      value={newPlant.breeder}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-orange"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="genetic_type" className="block text-sm font-medium text-gray-700 mb-1">Genetischer Typ</label>
                    <select
                      id="genetic_type"
                      name="genetic_type"
                      value={newPlant.genetic_type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-orange"
                    >
                      <option value="indica">Indica</option>
                      <option value="sativa">Sativa</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="ruderalis">Ruderalis</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="expected_flowering_days" className="block text-sm font-medium text-gray-700 mb-1">Erwartete Blütezeit (Tage)</label>
                    <input
                      type="number"
                      id="expected_flowering_days"
                      name="expected_flowering_days"
                      value={newPlant.expected_flowering_days}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-orange"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">Startdatum</label>
                    <input
                      type="date"
                      id="start_date"
                      name="start_date"
                      value={newPlant.start_date}
                      onChange={handleInputChange}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-orange"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="substrate" className="block text-sm font-medium text-gray-700 mb-1">Substrat</label>
                    <select
                      id="substrate"
                      name="substrate"
                      value={newPlant.substrate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-orange"
                    >
                      <option value="">Bitte wählen</option>
                      <option value="soil">Erde</option>
                      <option value="coco">Kokos</option>
                      <option value="hydro">Hydrokultur</option>
                      <option value="rockwool">Steinwolle</option>
                      <option value="other">Andere</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowNewPlantModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-orange"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-custom-orange text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-orange"
                  >
                    Pflanze hinzufügen
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ContextMenu />
    </>
  );
}
