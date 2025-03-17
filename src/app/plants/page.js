'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ContextMenu from '@/components/ContextMenu';
import { FaSeedling, FaLeaf, FaCalendarAlt, FaPlus, FaEdit, FaWater, FaChevronDown, FaChevronUp, FaUsers, FaTint, FaCopy } from 'react-icons/fa';
import { GiFlowerPot, GiGreenhouse } from 'react-icons/gi';
import Link from 'next/link';

export default function PlantsPage() {
  const router = useRouter();
  const [plants, setPlants] = useState([]);
  const [setups, setSetups] = useState([]);
  const [expandedSetups, setExpandedSetups] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewPlantModal, setShowNewPlantModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const [individualPlants, setIndividualPlants] = useState([]);

  // Form state for new plant
  const [newPlant, setNewPlant] = useState({
    name: '',
    breeder: '',
    genetic_type: 'hybrid', // Default value
    expected_flowering_days: 60, // Default value
    start_date: new Date().toISOString().split('T')[0], // Today's date as default
    substrate: 'soil', // Default to soil
    copies: 1 // Number of plant copies to create
  });

  // Function to handle new plant form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPlant(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Function to fetch all data: plants and setups
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch plants
      const plantsResponse = await fetch('/api/plants');
      if (!plantsResponse.ok) {
        throw new Error('Failed to fetch plants');
      }
      const plantsData = await plantsResponse.json();
      const allPlants = plantsData.plants || [];
      setPlants(allPlants);
      
      // Fetch setups
      const setupsResponse = await fetch('/api/plant-setups');
      if (!setupsResponse.ok) {
        throw new Error('Failed to fetch setups');
      }
      const setupsData = await setupsResponse.json();
      const allSetups = setupsData.setups || [];
      setSetups(allSetups);
      
      // Set initial expanded state for setups
      const initialExpandedState = {};
      allSetups.forEach(setup => {
        initialExpandedState[setup.id] = true; // Default to expanded
      });
      setExpandedSetups(initialExpandedState);
      
      // Identify individual plants (not in any setup)
      const setupPlantIds = new Set();
      allSetups.forEach(setup => {
        setup.plants.forEach(plant => {
          setupPlantIds.add(plant.id);
        });
      });
      
      const standalone = allPlants.filter(plant => !setupPlantIds.has(plant.id));
      setIndividualPlants(standalone);
      
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Error fetching data:', err);
      setPlants([]);
      setSetups([]);
      setIndividualPlants([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to create new plant(s)
  const createPlant = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      const copies = Math.max(1, parseInt(newPlant.copies) || 1);
      let successCount = 0;
      
      // Create multiple plants if copies > 1
      for (let i = 0; i < copies; i++) {
        // Create a copy of the plant data without the copies field
        const plantData = {...newPlant};
        delete plantData.copies; // Remove copies field before sending to API
        
        // Modify name for multiple copies
        if (copies > 1) {
          const baseName = plantData.name || 'Pflanze';
          plantData.name = `${baseName} ${i+1}`;
        }
        
        const response = await fetch('/api/plants', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(plantData),
        });

        if (response.ok) {
          successCount++;
        } else {
          const errorData = await response.json();
          setError(errorData.error || `Fehler beim Erstellen der Pflanze ${i+1}`);
          console.error(`Error creating plant copy ${i+1}:`, errorData);
        }
      }

      // Only close modal and reset form if at least one plant was created successfully
      if (successCount > 0) {
        // Reset form and close modal
        setNewPlant({
          name: '',
          breeder: '',
          genetic_type: 'hybrid',
          expected_flowering_days: 60,
          start_date: new Date().toISOString().split('T')[0],
          substrate: '',
          copies: 1
        });
        setShowNewPlantModal(false);
        setCurrentStep(1);
        
        // Success message based on how many plants were created
        if (successCount === 1) {
          // No special message needed for one plant
        } else {
          // Maybe add a toast or alert here if you have a notification system
          console.log(`Successfully created ${successCount} plants`);
        }
      }
      
      // Refresh plants list
      fetchData();
    } catch (err) {
      setError(err.message);
      console.error('Error creating plants:', err);
    } finally {
      setLoading(false);
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
    fetchData();

    // Clean up event listener
    return () => {
      window.removeEventListener('newPlantClick', handleNewPlantClick);
    };
  }, []);
  
  // Toggle setup expansion
  const toggleSetupExpansion = (setupId) => {
    setExpandedSetups(prev => ({
      ...prev,
      [setupId]: !prev[setupId]
    }));
  };
  
  // Navigate to setup detail
  const navigateToSetupDetail = (setupId) => {
    router.push(`/setups/${setupId}`);
  };
  
  // Navigate to setup new day entry
  const navigateToNewDayEntry = (setupId) => {
    router.push(`/setups/${setupId}/new-day`);
  };

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
      <div className="p-6 mt-10 pb-32 pattern-diagonal max-w-7xl mx-auto">
     
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
          </div>
        ) : (plants.length === 0 && setups.length === 0) ? (
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
          <div className="space-y-6">
            {/* Setups Section */}
            {setups.length > 0 && (
              <div className="space-y-4">
                {setups.map((setup) => (
                  <div key={setup.id} className="bg-white border border-gray-200 rounded-lg shadow overflow-hidden">
                    {/* Setup Header */}
                    <div className="bg-brand-primary/10 border-b border-brand-primary/20 p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <GiGreenhouse className="text-2xl text-brand-primary" />
                          <div>
                            <h3 className="font-bold text-gray-800 hover:text-brand-primary transition-colors cursor-pointer" 
                                onClick={() => navigateToSetupDetail(setup.id)}>
                              {setup.name}
                            </h3>
                            <p className="text-sm text-gray-600">{setup.plants.length} Pflanzen</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => navigateToNewDayEntry(setup.id)}
                            className="p-2 bg-brand-primary text-white rounded-md hover:bg-primary-hover transition-all text-sm flex items-center gap-1"
                          >
                            <FaCalendarAlt className="text-xs" /> <span>Tageseintrag</span>
                          </button>
                          <button 
                            onClick={() => toggleSetupExpansion(setup.id)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                          >
                            {expandedSetups[setup.id] ? <FaChevronUp /> : <FaChevronDown />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Setup Plants */}
                    {expandedSetups[setup.id] && (
                      <div className="divide-y divide-gray-100">
                        {setup.plants.length > 0 ? (
                          setup.plants.map((plant) => (
                            <div 
                              key={plant.id}
                              onClick={() => navigateToPlantDetail(plant.id)}
                              className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex justify-between items-center"
                            >
                              <div className="flex items-center space-x-3">
                                <div>
                                  <h4 className="font-medium text-gray-800">{plant.name}</h4>
                                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                                    {plant.breeder && (
                                      <span>{plant.breeder}</span>
                                    )}
                                    <span className="px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary">
                                      {plant.genetic_type || plant.strain_type || 'Unbekannt'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-4">
                                {/* Age indicator */}
                                <div className="text-xs text-gray-600">
                                  <div className="flex items-center">
                                    <FaLeaf className="mr-1 text-green-500" />
                                    <span>{calculateAge(plant.start_date)} Tage alt</span>
                                  </div>
                                </div>
                                
                                {/* Flowering indicator */}
                                {plant.flowering_start_date && (
                                  <div className="text-xs text-gray-600">
                                    <div className="flex items-center">
                                      <FaLeaf className="mr-1 text-pink-500" />
                                      <span>{calculateFloweringDays(plant.flowering_start_date)} Tage blüte</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-6 text-center text-gray-500">
                            <p>Keine Pflanzen in diesem Setup</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Individual Plants Section */}
            {individualPlants.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg shadow overflow-hidden">
                <div className="bg-gray-100 border-b border-gray-200 p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h3 className="font-bold text-gray-800">Einzelne Pflanzen</h3>
                        <p className="text-sm text-gray-600">{individualPlants.length} Pflanzen ohne Setup</p>
                      </div>
                    </div>
                   
                  </div>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {individualPlants.map((plant) => (
                    <div 
                      key={plant.id}
                      onClick={() => navigateToPlantDetail(plant.id)}
                      className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex justify-between items-center"
                    >
                      <div className="flex items-center space-x-3">
                        <div>
                          <h4 className="font-medium text-gray-800">{plant.name}</h4>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            {plant.breeder && (
                              <span>{plant.breeder}</span>
                            )}
                            <span className="px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary">
                              {plant.genetic_type || plant.strain_type || 'Unbekannt'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {/* Age indicator */}
                        <div className="text-xs text-gray-600">
                          <div className="flex items-center">
                            <FaLeaf className="mr-1 text-green-500" />
                            <span>{calculateAge(plant.start_date)} Tage alt</span>
                          </div>
                        </div>
                        
                        {/* Flowering indicator */}
                        {plant.flowering_start_date && (
                          <div className="text-xs text-gray-600">
                            <div className="flex items-center">
                              <FaLeaf className="mr-1 text-pink-500" />
                              <span>{calculateFloweringDays(plant.flowering_start_date)} Tage blüte</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Plant Modal - Multi-step with Fullscreen Mobile */}
      {showNewPlantModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md h-full md:h-auto md:max-h-[90vh] md:rounded-lg shadow-lg overflow-y-auto relative">
            <div className="absolute inset-0 pattern-grid opacity-5 pointer-events-none"></div>
            <div className="relative z-10 p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowNewPlantModal(false);
                    setCurrentStep(1);
                  }}
                  className="rounded-full p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              {/* Progress Indicator */}
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-6">
                <div 
                  className="bg-brand-primary h-1.5 rounded-full transition-all duration-300 ease-in-out" 
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}>
                </div>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                
                // Validate name field before proceeding
                if (currentStep === 1 && !newPlant.name.trim()) {
                  // Don't proceed if name is empty on step 1
                  return;
                }
                
                if (currentStep < totalSteps) {
                  setCurrentStep(currentStep + 1);
                } else {
                  createPlant(e);
                  setCurrentStep(1);
                }
              }}>
                {/* Step 1: Name, Copies and Date with Hierarchical Levels */}
                {currentStep === 1 && (
                  <div className="space-y-5">
                  
                    {/* L1: Plant Name & Breeder - Primary importance */}
                    <div className="mb-6 relative">
                      <div className="border-2 border-brand-primary/40 rounded-lg bg-brand-primary/10 relative p-4">
                        <div className="absolute -top-3 left-4 bg-white px-2 text-brand-primary font-semibold flex items-center gap-2">
                          <FaSeedling className="text-brand-primary" />
                          <span>{newPlant.copies > 1 ? "Name der Pflanzen" : "Name der Pflanze"}</span>
                        </div>
                        
                        <div className="mt-1">
                          {/* Main name input (L1) - Mandatory */}
                          <div className="relative">
                            <input
                              type="text"
                              id="name"
                              name="name"
                              placeholder={newPlant.copies > 1 ? "Basis-Name für alle Pflanzen" : "Name der Pflanze"}
                              value={newPlant.name}
                              onChange={handleInputChange}
                              required
                              className={`w-full text-lg font-medium py-2 px-2 border ${!newPlant.name && currentStep === 1 ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-md bg-white shadow-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary`}
                            />
                            {!newPlant.name && currentStep === 1 && (
                              <div className="text-xs text-red-500 mt-1 ml-1">* Pflichtfeld</div>
                            )}
                          </div>
                          
                          {newPlant.copies > 1 && (
                            <div className="text-xs text-gray-600 mt-1 ml-1">
                              Namen werden durchnummeriert: {newPlant.name || "Pflanze"} 1, {newPlant.name || "Pflanze"} 2, ...
                            </div>
                          )}
                          
                          {/* Breeder input (L2) - nested under name */}
                          <div className="relative pl-6 border-l-2 border-gray-200 ml-1 mt-3">
                            <div className="text-sm font-medium text-gray-600 mb-1">Züchter</div>
                            <input
                              type="text"
                              id="breeder"
                              name="breeder"
                              placeholder="Optional"
                              value={newPlant.breeder}
                              onChange={handleInputChange}
                              className="w-full py-2 px-2 text-sm border border-dashed border-gray-200 rounded bg-transparent text-gray-600"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* L2: Copies Selection with Tappable Cards */}
                    <div className="mb-6 relative">
                      <div className="border-2 border-brand-primary/20 rounded-lg bg-brand-primary/5 relative p-4">
                        <div className="absolute -top-3 left-4 bg-white px-2 text-brand-primary font-medium flex items-center gap-2">
                          <FaCopy className="text-brand-primary" />
                          <span>Kopien</span>
                        </div>
                        
                        <div className="mt-2">
                          <div className="text-sm text-gray-600 mb-3">
                            {newPlant.copies > 1 
                              ? `${newPlant.copies} identische Pflanzen erstellen` 
                              : "Eine Pflanze erstellen"}
                          </div>
                          
                          {/* Tappable number cards */}
                          <div className="grid grid-cols-5 gap-2">
                            {[1, 2, 3, 4, 5].map(num => (
                              <button
                                key={`copy-${num}`}
                                type="button"
                                onClick={() => setNewPlant({...newPlant, copies: num})}
                                className={`py-2 px-0 rounded-md border ${newPlant.copies === num 
                                  ? 'bg-brand-primary text-white border-brand-primary' 
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'} 
                                  transition-colors duration-200 text-center font-medium`}
                              >
                                {num}
                              </button>
                            ))}
                          </div>
                          
                          <div className="grid grid-cols-5 gap-2 mt-2">
                            {[6, 7, 8, 9, 10].map(num => (
                              <button
                                key={`copy-${num}`}
                                type="button"
                                onClick={() => setNewPlant({...newPlant, copies: num})}
                                className={`py-2 px-0 rounded-md border ${newPlant.copies === num 
                                  ? 'bg-brand-primary text-white border-brand-primary' 
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'} 
                                  transition-colors duration-200 text-center font-medium`}
                              >
                                {num}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* L3: Start Date - Least emphasis */}
                    <div className="mb-6">
                      <div className="border-2 border-gray-200 rounded-lg bg-gray-50 relative">
                        <div className="absolute -top-3 left-4 bg-white px-2 text-gray-600 font-medium flex items-center gap-2 z-10">
                          <FaCalendarAlt className="text-gray-500" />
                          <span>Startdatum</span>
                        </div>
                        
                        <div className="p-4">
                          {/* Current Date Display */}
                          <div className="flex justify-between items-center cursor-pointer">
                            <div className="flex flex-col">
                              <div className="flex items-baseline gap-2">
                                <span className="text-sm font-medium text-gray-700">
                                  {new Date(newPlant.start_date).toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(newPlant.start_date).toLocaleDateString('de-DE', { year: 'numeric' })}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(newPlant.start_date).toLocaleDateString('de-DE', { weekday: 'long' })}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-3 bg-white rounded-lg border border-gray-200 p-1">
                            <input
                              type="date"
                              id="start_date"
                              name="start_date"
                              value={newPlant.start_date}
                              onChange={handleInputChange}
                              max={new Date().toISOString().split('T')[0]}
                              className="w-full text-xs px-3 py-2 bg-transparent rounded focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Step 2: Substrate */}
                {currentStep === 2 && (
                  <div>
                    {/* Substrate */}
                    <div className="border-2 border-brand-primary/20 rounded-lg bg-brand-primary/5 relative p-4">
                      <div className="absolute -top-3 left-4 bg-white px-2 text-brand-primary font-medium flex items-center gap-2">
                        <FaSeedling className="text-brand-primary" />
                        <span>Substrat</span>
                      </div>
                      
                      {/* Substrate Selection */}
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-2">
                          {[
                            { value: 'soil', label: 'Erde', icon: '🌱' },
                            { value: 'coco', label: 'Kokos', icon: '🥥' },
                            { value: 'hydro', label: 'Hydrokultur', icon: '💧' },
                            { value: 'rockwool', label: 'Steinwolle', icon: '🧱' },
                            { value: 'other', label: 'Andere', icon: '🔄' }
                          ].map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => setNewPlant({...newPlant, substrate: option.value})}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${newPlant.substrate === option.value 
                                ? 'bg-brand-primary text-white shadow-sm' 
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
                            >
                              <span>{option.icon}</span>
                              <span>{option.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Step 3: Expected Flowering Time */}
                {currentStep === 3 && (
                  <div className="space-y-8">
                    {/* Expected Flowering Time */}
                    <div className="border-2 border-brand-primary/20 rounded-lg bg-brand-primary/5 relative p-4">
                      <div className="absolute -top-3 left-4 bg-white px-2 text-brand-primary font-medium flex items-center gap-2">
                        <GiFlowerPot className="text-brand-primary" />
                        <span>Blütezeit</span>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex flex-col">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-brand-primary font-bold text-xl">{newPlant.expected_flowering_days} Tage</span>
                            <div className="flex gap-2">
                              <button 
                                type="button" 
                                onClick={() => setNewPlant({...newPlant, expected_flowering_days: Math.max(30, newPlant.expected_flowering_days - 5)})}  
                                className="h-8 w-8 rounded-full flex items-center justify-center border border-gray-300 hover:bg-gray-100"
                              >-</button>
                              <button 
                                type="button" 
                                onClick={() => setNewPlant({...newPlant, expected_flowering_days: Math.min(120, newPlant.expected_flowering_days + 5)})} 
                                className="h-8 w-8 rounded-full flex items-center justify-center border border-gray-300 hover:bg-gray-100"
                              >+</button>
                            </div>
                          </div>
                        </div>
                        
                        <input
                          type="range"
                          min="40"
                          max="100"
                          step="1"
                          value={newPlant.expected_flowering_days}
                          onChange={(e) => setNewPlant({...newPlant, expected_flowering_days: parseInt(e.target.value)})}
                          className="w-full h-2 bg-gradient-to-r from-green-400 to-purple-500 rounded-md appearance-none cursor-pointer accent-brand-primary"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Navigation Buttons */}
                <div className="mt-8 flex justify-between items-center">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(currentStep - 1)}
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
                        setShowNewPlantModal(false);
                        setCurrentStep(1);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50"
                    >
                      Abbrechen
                    </button>
                  )}
                  
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-brand-primary text-white rounded-md font-medium hover:bg-opacity-90 shadow-sm flex items-center gap-1"
                  >
                    {currentStep < totalSteps ? (
                      <>
                        Weiter
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                      </>
                    ) : 'Pflanze hinzufügen'}
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
