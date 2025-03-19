'use client';

import { useState, useRef, useEffect } from 'react';
import { FaSeedling, FaCog, FaImage } from 'react-icons/fa';

export default function HelpRequestModal({ onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [userPlants, setUserPlants] = useState([]);
  const [isLoadingPlants, setIsLoadingPlants] = useState(false);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    plantIds: [],
    files: []
  });

  // Fetch user's plants when modal opens
  useEffect(() => {
    fetchUserPlants();
  }, []);

  const fetchUserPlants = async () => {
    try {
      setIsLoadingPlants(true);
      const response = await fetch('/api/plants?includeAllData=true');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // The API returns { plants: [...] }
      if (data && Array.isArray(data.plants)) {
        // Make sure to fetch each plant's full data including days with fertilizers
        const plantsWithDays = await Promise.all(
          data.plants.map(plant => 
            fetch(`/api/plants/${plant.id}`)
              .then(res => res.json())
              .then(plantData => ({
                ...plant,
                days: plantData.days || []
              }))
              .catch(err => {
                console.error(`Error fetching details for plant ${plant.id}:`, err);
                return plant;
              })
          )
        );
        
        setUserPlants(plantsWithDays);
      } else if (Array.isArray(data)) {
        setUserPlants(data);
      } else {
        console.error('Unexpected data format for plants:', data);
        setUserPlants([]);
      }
    } catch (err) {
      console.error('Error loading plants:', err);
      setUserPlants([]);
    } finally {
      setIsLoadingPlants(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePlantToggle = (plantId) => {
    setFormData(prev => {
      const plantIds = [...prev.plantIds];
      
      if (plantIds.includes(plantId)) {
        return {
          ...prev,
          plantIds: plantIds.filter(id => id !== plantId)
        };
      } else {
        return {
          ...prev,
          plantIds: [...plantIds, plantId]
        };
      }
    });
  };

  const handleFileChange = (e) => {
    const fileList = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      files: fileList
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      return;
    }
    
    try {
      setIsSubmitting(true);
      setSubmitError('');
      
      // Create FormData to send to the API
      const formData = new FormData();
      formData.append('name', formData.name);
      formData.append('email', formData.email);
      formData.append('subject', formData.subject);
      formData.append('message', formData.message);
      
      // Add selected plants and their data
      const selectedPlants = userPlants.filter(plant => formData.plantIds.includes(plant.id));
      formData.append('plantData', JSON.stringify(selectedPlants));
      formData.append('selectedPlantIds', JSON.stringify(formData.plantIds));
      
      // Note: File upload is temporarily disabled as per the memory
      
      const response = await fetch('/api/help-requests', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Fehler beim Senden der Nachricht');
      }
      
      const data = await response.json();
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Error saving help request:', error);
      setSubmitError(error.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Filter plants based on search term
  const [searchTerm, setSearchTerm] = useState('');
  const filteredPlants = userPlants.filter(plant => 
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
          
          {submitSuccess ? (
            <div className="text-center py-8">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">Nachricht gesendet!</h3>
              <p className="mt-2 text-sm text-gray-500">
                Vielen Dank für Deine Nachricht. Wir werden uns so schnell wie möglich bei Dir melden.
              </p>
              <div className="mt-5">
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-olive-green px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-yellow-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-green sm:text-sm"
                  onClick={onClose}
                >
                  Schließen
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="overflow-y-auto mt-10 max-h-[calc(90vh-4rem)]">
              {/* Step 1: General Information */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  {/* Name Field */}
                  <div className="mb-6 relative pt-4">
                    <div className="border-2 border-brand-primary/40 rounded-lg bg-brand-primary/10 relative p-4">
                      <div className="absolute -top-3 left-4 bg-white px-2 text-brand-primary font-semibold flex items-center gap-2 z-20">
                        <FaSeedling className="text-brand-primary" />
                        <span>Deine Kontaktdaten</span>
                      </div>
                      
                      <div className="mt-1 space-y-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Name
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Dein Name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full text-base py-2 px-3 border border-gray-300 rounded-md bg-white shadow-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            E-Mail
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="deine@email.de"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full text-base py-2 px-3 border border-gray-300 rounded-md bg-white shadow-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Message Field */}
                  <div className="mb-6 relative pt-4">
                    <div className="border-2 border-gray-200 rounded-lg bg-gray-50 relative p-4">
                      <div className="absolute -top-3 left-4 bg-white px-2 text-gray-600 font-medium flex items-center gap-2 z-20">
                        <FaCog className="text-gray-500" />
                        <span>Deine Anfrage</span>
                      </div>
                      
                      <div className="mt-1 space-y-4">
                        <div>
                          <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                            Betreff
                          </label>
                          <input
                            type="text"
                            id="subject"
                            name="subject"
                            placeholder="Worum geht es?"
                            value={formData.subject}
                            onChange={handleInputChange}
                            required
                            className="w-full text-base py-2 px-3 border border-gray-300 rounded-md bg-white shadow-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                            Nachricht
                          </label>
                          <textarea
                            id="message"
                            name="message"
                            rows={4}
                            placeholder="Beschreibe dein Problem oder deine Frage..."
                            value={formData.message}
                            onChange={handleInputChange}
                            required
                            className="w-full text-base py-2 px-3 border border-gray-300 rounded-md bg-white shadow-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Step 2: Plant Selection */}
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
                          {isLoadingPlants ? (
                            <div className="p-4 text-center text-gray-500">
                              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-olive-green mx-auto"></div>
                              <p className="mt-2 text-sm">Pflanzen werden geladen...</p>
                            </div>
                          ) : filteredPlants.length === 0 ? (
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
              
              {/* Step 3: Photo Upload */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <div className="mb-6 relative pt-4">
                    <div className="border-2 border-brand-primary/40 rounded-lg bg-brand-primary/10 relative p-4">
                      <div className="absolute -top-3 left-4 bg-white px-2 text-brand-primary font-semibold flex items-center gap-2 z-20">
                        <FaImage className="text-brand-primary" />
                        <span>Fotos hinzufügen</span>
                      </div>
                      
                      <div className="mt-1">
                        <p className="text-sm text-gray-600 mb-4">
                          Fotos helfen uns, dein Problem besser zu verstehen. Du kannst mehrere Fotos hochladen.
                        </p>
                        
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm text-yellow-700">
                                Foto-Upload ist vorübergehend deaktiviert. Bitte beschreibe dein Problem ausführlich in der Nachricht.
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-1 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6 bg-gray-50">
                          <div className="space-y-1 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className="flex text-sm text-gray-600">
                              <label htmlFor="file-upload" className="relative cursor-not-allowed rounded-md bg-white font-medium text-gray-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-olive-green">
                                <span>Fotos hochladen</span>
                                <input 
                                  id="file-upload" 
                                  name="file-upload" 
                                  type="file" 
                                  className="sr-only" 
                                  multiple 
                                  accept="image/*" 
                                  disabled
                                />
                              </label>
                              <p className="pl-1">oder per Drag & Drop</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, GIF bis zu 10MB
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Navigation Buttons */}
              <div className="mt-8 flex justify-between">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={goToPreviousStep}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-green"
                  >
                    Zurück
                  </button>
                ) : (
                  <div>{/* Empty div to maintain layout */}</div>
                )}
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-olive-green hover:bg-yellow-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-green"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Wird gesendet...
                    </>
                  ) : currentStep < totalSteps ? (
                    'Weiter'
                  ) : (
                    'Anfrage senden'
                  )}
                </button>
              </div>
              
              {submitError && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{submitError}</p>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
