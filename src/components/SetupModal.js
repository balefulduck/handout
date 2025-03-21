'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaTimes, FaSeedling, FaCog } from 'react-icons/fa';

export default function SetupModal({ onClose, onSave, setup, availablePlants, isNew }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    plantIds: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  // Initialize form data when editing an existing setup
  useEffect(() => {
    if (setup) {
      setFormData({
        name: setup.name || '',
        description: setup.description || '',
        plantIds: setup.plants ? setup.plants.map(plant => plant.id) : []
      });
    }
  }, [setup]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePlantToggle = (plantId) => {
    setFormData(prev => {
      const plantIds = prev.plantIds.includes(plantId)
        ? prev.plantIds.filter(id => id !== plantId)
        : [...prev.plantIds, plantId];
      
      return {
        ...prev,
        plantIds
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // If we're on step 1, validate and move to step 2
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        alert('Bitte gib einen Namen für das Setup ein.');
        return;
      }
      setCurrentStep(2);
      return;
    }
    
    // If we're on step 2, save the form
    onSave(formData);
  };

  // Filter plants based on search term
  const filteredPlants = availablePlants.filter(plant => 
    plant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md h-full md:h-auto md:max-h-[90vh] md:rounded-lg shadow-lg overflow-y-auto relative">
        <div className="absolute inset-0 pattern-grid opacity-5 pointer-events-none"></div>
        <div className="relative z-10 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <button 
              type="button" 
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          {/* Progress Indicator */}
          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-10">
            <div 
              className="bg-brand-primary h-1.5 rounded-full transition-all duration-300 ease-in-out" 
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="overflow-y-auto mt-10 max-h-[calc(90vh-4rem)]">
            {/* Step 1: Name and Description */}
            {currentStep === 1 && (
              <div className="space-y-5">
                {/* Setup Name */}
                <div className="mb-6 relative pt-4">
                  <div className="border-2 border-brand-primary/40 rounded-lg bg-brand-primary/10 relative p-4">
                    <div className="absolute -top-3 left-4 bg-white px-2 text-brand-primary font-semibold flex items-center gap-2 z-20">
                      <FaSeedling className="text-brand-primary" />
                      <span>Name des Setups</span>
                    </div>
                    
                    <div className="mt-1">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Name des Setups"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className={`w-full text-lg font-medium py-2 px-2 border ${!formData.name ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-md bg-white shadow-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary`}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Setup Description */}
                <div className="mb-6 relative pt-4">
                  <div className="border-2 border-gray-200 rounded-lg bg-gray-50 relative p-4">
                    <div className="absolute -top-3 left-4 bg-white px-2 text-gray-600 font-medium flex items-center gap-2 z-20">
                      <FaCog className="text-gray-500" />
                      <span>Beschreibung (optional)</span>
                    </div>
                    
                    <div className="mt-1">
                      <textarea
                        id="description"
                        name="description"
                        placeholder="Beschreibung des Setups"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full text-md py-2 px-2 border border-gray-300 rounded-md bg-white shadow-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 2: Select Plants */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <div className="mb-6 relative pt-4">
                  <div className="border-2 border-brand-primary/40 rounded-lg bg-brand-primary/10 relative p-4">
                    <div className="absolute -top-3 left-4 bg-white px-2 text-brand-primary font-semibold flex items-center gap-2 z-20">
                      <FaSeedling className="text-brand-primary" />
                      <span>Pflanzen auswählen</span>
                    </div>
                    
                    <div className="mt-1">
                      <div className="mb-3">
                        <div className="relative">
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            placeholder="Pflanzen suchen..."
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      <div className="max-h-64 overflow-y-auto rounded-md border border-gray-200 bg-white">
                        {filteredPlants.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            <p className="mt-2 text-sm">Keine Pflanzen gefunden</p>
                          </div>
                        ) : (
                          <ul className="divide-y divide-gray-200">
                            {filteredPlants.map(plant => (
                              <li 
                                key={plant.id}
                                onClick={() => handlePlantToggle(plant.id)}
                                className={`p-3 transition-colors cursor-pointer hover:bg-gray-50 ${
                                  formData.plantIds.includes(plant.id) ? 'bg-green-50 hover:bg-green-100' : ''
                                }`}
                              >
                                <div className="flex items-center space-x-3">
                                  <div className={`flex-shrink-0 h-5 w-5 rounded-full border ${
                                    formData.plantIds.includes(plant.id) 
                                      ? 'bg-brand-primary border-brand-primary' 
                                      : 'border-gray-300'
                                  } flex items-center justify-center`}>
                                    {formData.plantIds.includes(plant.id) && (
                                      <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm font-medium text-gray-900 truncate">{plant.name}</p>
                                      <div className="ml-2 flex-shrink-0 flex">
                                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                          {plant.genetic_type || plant.strain_type || 'Unbekannt'}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="mt-1 flex items-center">
                                      <span className="text-xs text-gray-500">
                                        Gestartet am {new Date(plant.start_date).toLocaleDateString('de-DE')}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          {formData.plantIds.length} Pflanzen ausgewählt
                        </p>
                        {formData.plantIds.length > 0 && (
                          <button 
                            type="button"
                            onClick={() => setFormData({...formData, plantIds: []})}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Auswahl zurücksetzen
                          </button>
                        )}
                      </div>
                    </div>
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
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                  Zurück
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
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
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </>
                ) : (
                  <>
                    <FaPlus className="text-sm" />
                    {isNew ? 'Setup erstellen' : 'Setup speichern'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
