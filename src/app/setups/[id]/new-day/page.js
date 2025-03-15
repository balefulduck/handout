'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FaPlus, FaTimes, FaArrowLeft, FaInfoCircle, FaWater, FaSeedling, FaTint, FaCalendarAlt, FaCalendarDay, FaPencilAlt, FaFlask, FaCut, FaSun } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function NewSetupDayEntryPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const [setup, setSetup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fertilizers, setFertilizers] = useState([{ name: '', amount: '' }]);
  
  const today = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    date: today,
    topped: false,
    flowering: false,
    ph_value: '',
    watering_amount: '0',
    temperature: '',
    humidity: '',
    notes: ''
  });
  
  // Default maximum water amount (dynamically adjustable)
  const [wateringMax, setWateringMax] = useState(1000);
  
  const [customDistribution, setCustomDistribution] = useState(false);
  const [plantWaterDistribution, setPlantWaterDistribution] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

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
        // Set the wateringMax to the setup's water_limit if it exists
        if (data.setup && data.setup.water_limit) {
          setWateringMax(data.setup.water_limit);
        }
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updatedFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    };
    
    // Dynamically adjust maximum if user enters a larger value
    if (name === 'watering_amount') {
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue > wateringMax) {
        // Round up to the nearest multiple of 500
        const newMax = Math.ceil(numValue / 500) * 500;
        // Update the wateringMax
        setWateringMax(newMax);
        
        // Persist this higher maximum for future use
        updateSetupWaterLimit(newMax);
      }
    }
    
    setFormData(updatedFormData);
    
    // Reset plant water distribution when water amount changes
    if (name === 'watering_amount' && !customDistribution) {
      initializeEqualDistribution(updatedFormData.watering_amount);
    }
  };
  
  // Initialize equal water distribution across all plants
  // Function to update the setup's water_limit in the database
  const updateSetupWaterLimit = async (newLimit) => {
    if (!setup || !setup.id) return;
    
    try {
      const response = await fetch(`/api/plant-setups/${setup.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: setup.name, // Keep the existing name
          water_limit: newLimit // Update the water limit
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to update setup water limit:', await response.text());
      }
    } catch (error) {
      console.error('Error updating setup water limit:', error);
    }
  };
  
  const initializeEqualDistribution = (totalAmount) => {
    if (!setup?.plants?.length) return;
    
    const totalWater = parseInt(totalAmount);
    if (isNaN(totalWater) || totalWater <= 0) {
      // If total water is invalid, set all to 0
      const distributions = setup.plants.map(plant => ({
        plantId: plant.id,
        plantName: plant.name || `Pflanze ${plant.id}`,
        amount: '0'
      }));
      setPlantWaterDistribution(distributions);
      return;
    }
    
    // Calculate even distribution with potential remainder
    const plantCount = setup.plants.length;
    const baseAmount = Math.floor(totalWater / plantCount);
    const remainder = totalWater % plantCount;
    
    // Create distributions with base amount and distribute remainder
    const distributions = setup.plants.map((plant, index) => ({
      plantId: plant.id,
      plantName: plant.name || `Pflanze ${plant.id}`,
      amount: (baseAmount + (index < remainder ? 1 : 0)).toString()
    }));
    
    setPlantWaterDistribution(distributions);
  };
  
  // Initialize plant water distribution when setup loads
  useEffect(() => {
    if (setup?.plants?.length && formData.watering_amount) {
      initializeEqualDistribution(formData.watering_amount);
    }
  }, [setup, formData.watering_amount]);
  
  // Handle custom water distribution changes
  const handleDistributionChange = (index, value) => {
    const totalWater = parseInt(formData.watering_amount);
    const newValue = parseInt(value);
    
    // Create a new distribution array
    const newDistribution = [...plantWaterDistribution];
    
    // Set the new value for the changed plant
    newDistribution[index].amount = newValue.toString();
    
    // Calculate remaining water to distribute
    const remainingWater = totalWater - newValue;
    
    // Count plants that need adjustment (all except the one being changed)
    const plantsToAdjust = newDistribution.filter((_, i) => i !== index);
    
    if (plantsToAdjust.length > 0) {
      // Get current total for plants that need adjustment
      const currentOtherTotal = plantsToAdjust.reduce((sum, plant) => sum + parseInt(plant.amount || 0), 0);
      
      // If current total is not zero, distribute proportionally
      if (currentOtherTotal > 0) {
        plantsToAdjust.forEach((plant, i) => {
          const otherIndex = i >= index ? i + 1 : i; // Map back to original index
          const proportion = parseInt(plant.amount) / currentOtherTotal;
          newDistribution[otherIndex].amount = Math.round(remainingWater * proportion).toString();
        });
      } else {
        // If current total is zero, distribute equally
        const equalShare = Math.floor(remainingWater / plantsToAdjust.length);
        plantsToAdjust.forEach((_, i) => {
          const otherIndex = i >= index ? i + 1 : i; // Map back to original index
          newDistribution[otherIndex].amount = equalShare.toString();
        });
      }
    }
    
    setPlantWaterDistribution(newDistribution);
  };

  const handleAddFertilizer = () => {
    setFertilizers([...fertilizers, { name: '', amount: '' }]);
  };

  const handleRemoveFertilizer = (index) => {
    const updatedFertilizers = [...fertilizers];
    updatedFertilizers.splice(index, 1);
    setFertilizers(updatedFertilizers);
  };

  const handleFertilizerChange = (index, field, value) => {
    const updatedFertilizers = [...fertilizers];
    updatedFertilizers[index][field] = value;
    setFertilizers(updatedFertilizers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.date) {
      alert('Bitte wähle ein Datum aus.');
      return;
    }
    
    // Check if water distribution adds up to total when custom distribution is enabled
    if (customDistribution && parseInt(formData.watering_amount) > 0) {
      const totalDistributed = plantWaterDistribution.reduce((sum, plant) => sum + parseInt(plant.amount || 0), 0);
      if (totalDistributed !== parseInt(formData.watering_amount)) {
        const proceed = confirm('Die Wassermenge der einzelnen Pflanzen entspricht nicht der Gesamtmenge. Möchtest du trotzdem fortfahren?');
        if (!proceed) return;
      }
    }
    
    setSubmitting(true);
    
    // Filter out empty fertilizers
    const filteredFertilizers = fertilizers.filter(f => f.name.trim() !== '');
    
    try {
      const payload = {
        ...formData,
        watered: parseInt(formData.watering_amount) > 0,
        plantWaterDistribution: customDistribution ? plantWaterDistribution : [],
        fertilizers: filteredFertilizers,
        topped: formData.topped,
        flowering: formData.flowering
      };
      
      const response = await fetch(`/api/plant-setups/${params.id}/days`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create day entry');
      }
      
      const data = await response.json();
      console.log('Created day entry:', data);
      
      // Redirect to setup detail page
      router.push(`/setups/${params.id}`);
    } catch (err) {
      console.error('Error creating day entry:', err);
      setError(err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
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
          onClick={() => router.push(`/setups/${params.id}`)}
          className="px-4 py-2 bg-brand-primary text-white rounded hover:bg-primary-hover flex items-center gap-2"
        >
          <FaArrowLeft />
          Zurück zum Setup
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
          className="px-4 py-2 bg-brand-primary text-white rounded hover:bg-primary-hover flex items-center gap-2"
        >
          <FaArrowLeft />
          Zurück zur Setup-Übersicht
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 pb-32">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => router.push(`/setups/${params.id}`)}
              className="mr-4 text-gray-600 hover:text-gray-800"
            >
              <FaArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Neuer Tageseintrag</h1>
          </div>
        </div>
        
        {/* Setup info */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{setup.name}</h2>
          {setup.description && (
            <p className="text-gray-600 mb-3">{setup.description}</p>
          )}
          <div className="flex items-center text-sm text-gray-600">
            <FaInfoCircle className="mr-2 text-brand-primary" />
            <span>Dieser Eintrag wird für alle {setup.plants.length} Pflanzen in diesem Setup erstellt.</span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            {/* Date field */}
            <div className="mb-8">
              <div className="border-2 border-brand-primary/20 rounded-lg bg-brand-primary/5 relative">
                <div className="absolute -top-3 left-4 bg-white px-2 text-brand-primary font-medium flex items-center gap-2 z-10">
                  <FaCalendarDay className="text-brand-primary" />
                  <span>Datum</span>
                </div>

                <div className="p-5">
                  {/* Current Date Display */}
                  <div 
                    className={`flex justify-between items-center ${showDatePicker ? 'mb-4' : ''}`}
                    onClick={() => setShowDatePicker(!showDatePicker)}
                  >
                    <div className="flex items-center gap-3 cursor-pointer group">
                      <div className="flex flex-col">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-gray-800">
                            {new Date(formData.date).toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })}
                          </span>
                          <span className="text-lg text-gray-600">
                            {new Date(formData.date).toLocaleDateString('de-DE', { year: 'numeric' })}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(formData.date).toLocaleDateString('de-DE', { weekday: 'long' })}
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      type="button"
                      className="flex items-center gap-1 text-sm text-brand-primary hover:text-brand-primary/80 transition-colors py-1 px-3 rounded-full border border-brand-primary/20 hover:bg-brand-primary/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDatePicker(!showDatePicker);
                      }}
                    >
                      <FaPencilAlt size={12} />
                      {showDatePicker ? 'Schließen' : 'Ändern'}
                    </button>
                  </div>
                  
                  {/* Date Picker */}
                  <AnimatePresence>
                    {showDatePicker && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-2 border-t border-dashed border-gray-300 mt-2">
                          <div className="mb-2 flex items-start gap-2 p-3 bg-white rounded border border-gray-200">
                            <FaInfoCircle className="text-brand-primary mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-600">
                              Hier kannst du das Datum für einen vergangenen Eintrag anpassen.
                            </p>
                          </div>
                          
                          <div className="bg-white rounded-lg border border-gray-200 p-2">
                            <input
                              type="date"
                              id="date"
                              name="date"
                              value={formData.date}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 bg-transparent rounded focus:outline-none focus:ring-2 focus:ring-brand-primary"
                              required
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            
            {/* Plant Care */}
            <div className="mb-8">
              <div className="border-2 border-brand-primary/20 rounded-lg bg-brand-primary/5 relative p-5">
                <div className="absolute -top-3 left-4 bg-white px-2 text-brand-primary font-medium flex items-center gap-2">
                  <FaSeedling className="text-brand-primary" />
                  <span>Pflanzenpflege</span>
                </div>
                
                <div className="flex flex-wrap gap-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, topped: !prev.topped }))}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all ${formData.topped ? 'bg-brand-primary text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    <FaCut className={`text-2xl mb-1 ${formData.topped ? 'text-white' : 'text-gray-500'}`} />
                    <span className="text-sm font-medium">Getoppt</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, flowering: !prev.flowering }))}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all ${formData.flowering ? 'bg-brand-primary text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    <FaSun className={`text-2xl mb-1 ${formData.flowering ? 'text-white' : 'text-gray-500'}`} />
                    <span className="text-sm font-medium">Blüte eingeleitet</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Watering Module */}
            <div className="mb-8">
              <div className="border-2 border-brand-primary/20 rounded-lg p-5 bg-brand-primary/5 relative">
                <div className="absolute -top-3 left-4 bg-white px-2 text-brand-primary font-medium flex items-center gap-2">
                  <FaWater className="text-brand-primary" />
                  <span>Bewässerung</span>
                </div>
                
                {/* Watering Slider */}
                <div className="mb-6">
                  <div className="flex justify-between items-end mb-1">
                    <label htmlFor="watering_amount" className="block text-gray-700 font-medium">
                      Wassermenge: <span className="text-brand-primary font-bold">{formData.watering_amount} ml</span>
                    </label>
                    <div className="flex items-center gap-2">
                      {parseInt(formData.watering_amount) > wateringMax * 0.8 && (
                        <button 
                          type="button" 
                          onClick={() => setWateringMax(wateringMax + 500)}
                          className="text-xs px-2 py-1 bg-brand-primary/10 text-brand-primary rounded-full hover:bg-brand-primary/20 transition"
                        >
                          + Erhöhen
                        </button>
                      )}
                      <div className="text-xs text-gray-500">
                        {parseInt(formData.watering_amount) > 0 ? "Gewässert" : "Nicht gewässert"}
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden w-full mt-2 mb-1 relative">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-primary/50 to-brand-primary" 
                      style={{ width: `${Math.min(100, (parseInt(formData.watering_amount) / wateringMax) * 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center gap-2 w-full">
                    <input
                      type="range"
                      id="watering_amount"
                      name="watering_amount"
                      value={formData.watering_amount}
                      onChange={handleInputChange}
                      min="0"
                      max={wateringMax}
                      step="10"
                      className="flex-1 accent-brand-primary cursor-pointer"
                    />
                    <input
                      type="number"
                      name="watering_amount"
                      value={formData.watering_amount}
                      onChange={handleInputChange}
                      min="0"
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-right"
                    />
                    <span className="text-gray-700">ml</span>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0 ml</span>
                    <span>{Math.round(wateringMax/2)} ml</span>
                    <span>{wateringMax} ml</span>
                  </div>
                </div>
                
                {/* Water Distribution Notice */}
                {parseInt(formData.watering_amount) > 0 && setup?.plants?.length > 0 && (
                  <div className="flex items-start gap-2 mb-4 p-3 bg-white rounded border border-gray-200">
                    <FaInfoCircle className="text-brand-primary mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-600">
                      <p>Diese Wassermenge ({formData.watering_amount} ml) wird gleichmäßig auf 
                      {setup.plants.length} Pflanzen verteilt 
                      ({Math.floor(parseInt(formData.watering_amount) / setup.plants.length)} ml pro Pflanze).</p>
                      
                      <div className="mt-2 flex items-center">
                        <button 
                          type="button"
                          onClick={() => setCustomDistribution(!customDistribution)}
                          className="text-brand-primary text-sm font-medium hover:underline"
                        >
                          {customDistribution ? "Gleichmäßige Verteilung verwenden" : "Individuelle Verteilung festlegen"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Custom Water Distribution */}
                <AnimatePresence>
                  {customDistribution && parseInt(formData.watering_amount) > 0 && setup?.plants?.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-dashed border-gray-300 pt-4 mt-2">
                        <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <FaTint className="text-brand-primary" />
                          Individuelle Wasserverteilung
                        </h3>
                        
                        <div className="space-y-4">
                          {plantWaterDistribution.map((plant, index) => (
                            <div key={plant.plantId} className="flex items-center gap-3">
                              <div className="w-1/3 text-sm">{plant.plantName}</div>
                              <div className="flex-1">
                                <input
                                  type="range"
                                  value={plant.amount}
                                  onChange={(e) => handleDistributionChange(index, e.target.value)}
                                  min="0"
                                  max={formData.watering_amount}
                                  step="5"
                                  className="w-full accent-brand-primary"
                                />
                              
                              </div>
                              <div className="w-16 text-right font-medium">
                                {plant.amount} ml
                              </div>
                            </div>
                          ))}
                          
                          <div className="text-right text-sm text-gray-500">
                            Gesamt: {plantWaterDistribution.reduce((sum, plant) => sum + parseInt(plant.amount || 0), 0)} ml 
                            von {formData.watering_amount} ml
                            {plantWaterDistribution.reduce((sum, plant) => sum + parseInt(plant.amount || 0), 0) !== parseInt(formData.watering_amount) && 
                              <span className="text-red-500 ml-2 font-medium">(Warnung: Summe stimmt nicht mit Gesamtmenge überein)</span>
                            }
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Fertilizers - Integrated inside the watering section */}
                <AnimatePresence>
                  {parseInt(formData.watering_amount) > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-dashed border-brand-primary/30 pt-4 mt-6 mb-2">
                        <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <FaSeedling className="text-brand-primary" />
                          Düngung hinzufügen
                        </h3>
                        
                        <div className="flex justify-end items-center mb-4">
                          <button
                            type="button"
                            onClick={handleAddFertilizer}
                            className="text-brand-primary hover:text-primary-hover flex items-center text-sm gap-1 py-1 px-3 border border-brand-primary/20 rounded-full hover:bg-brand-primary/10 transition-colors"
                          >
                            <FaPlus /> Dünger hinzufügen
                          </button>
                        </div>
                        
                        <div className="bg-white/60 rounded-lg p-3 border border-brand-primary/10">
                          {fertilizers.map((fertilizer, index) => (
                            <div 
                              key={index}
                              className="flex gap-2 items-center mb-3 bg-white rounded-lg p-2 border border-gray-200 hover:border-brand-primary/30 transition-colors"
                            >
                              <div className="flex-grow">
                                <input
                                  type="text"
                                  placeholder="Düngername"
                                  value={fertilizer.name}
                                  onChange={(e) => handleFertilizerChange(index, 'name', e.target.value)}
                                  className="w-full px-3 py-2 bg-transparent rounded focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                />
                              </div>
                              <div className="w-1/4">
                                <input
                                  type="text"
                                  placeholder="Menge"
                                  value={fertilizer.amount}
                                  onChange={(e) => handleFertilizerChange(index, 'amount', e.target.value)}
                                  className="w-full px-3 py-2 bg-transparent rounded focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                />
                              </div>
                              {fertilizers.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFertilizer(index)}
                                  className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                                >
                                  <FaTimes />
                                </button>
                              )}
                            </div>
                          ))}
                          
                          {fertilizers.length === 0 && (
                            <div className="text-center py-4 text-gray-500">
                              <p>Noch keine Dünger hinzugefügt</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            {/* Environment Metrics */}
            <div className="mb-8">
              <div className="border-2 border-brand-primary/20 rounded-lg bg-brand-primary/5 relative p-5">
                <div className="absolute -top-3 left-4 bg-white px-2 text-brand-primary font-medium flex items-center gap-2">
                  <FaInfoCircle className="text-brand-primary" />
                  <span>Umgebungswerte</span>
                </div>
                
                {/* pH Value Selection */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-700 font-medium flex items-center gap-1">
                      <FaFlask className="text-brand-primary" /> pH-Wert
                    </h3>
                    <div className="text-brand-primary font-medium bg-white px-3 py-1 rounded-full border border-brand-primary/20">
                      {formData.ph_value ? formData.ph_value : '---'}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 border border-gray-200 hover:border-brand-primary/30 transition-colors">
                    <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-13 gap-1 py-1">
                      {Array.from({ length: 26 }, (_, i) => (5 + i * 0.1).toFixed(1)).map(value => (
                        <button
                          key={`ph-${value}`}
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              ph_value: value
                            });
                          }}
                          className={`
                            px-1 py-1.5 text-xs rounded-md transition-all flex justify-center
                            ${formData.ph_value === value 
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
                
                {/* Temperature Slider */}
                <div className="mb-5">
                  <div className="flex justify-between items-end mb-1">
                    <h3 className="text-gray-700 font-medium flex items-center gap-1">
                      <svg className="w-4 h-4 text-brand-primary" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8,5V19a4,4,0,0,0,8,0V5a4,4,0,0,0-8,0ZM12,3a2,2,0,0,1,2,2V19a2,2,0,0,1-4,0V5A2,2,0,0,1,12,3Zm0,14a1,1,0,1,0,1,1A1,1,0,0,0,12,17Z"/>
                      </svg>
                      Temperatur
                    </h3>
                    <div className="text-brand-primary font-medium">
                      {formData.temperature ? `${formData.temperature} °C` : '---'}
                    </div>
                  </div>
                  
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden w-full mt-2 mb-1 relative">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-red-400" 
                      style={{ width: `${formData.temperature ? Math.min(100, (parseFloat(formData.temperature) - 10) * 5) : 0}%` }}
                    ></div>
                  </div>
                  
                  <input
                    type="range"
                    id="temperature"
                    name="temperature"
                    value={formData.temperature || 20}
                    onChange={handleInputChange}
                    min="10"
                    max="35"
                    step="0.5"
                    className="w-full accent-brand-primary cursor-pointer"
                  />
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>10 °C</span>
                    <span>22.5 °C</span>
                    <span>35 °C</span>
                  </div>
                </div>
                
                {/* Humidity Slider */}
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <h3 className="text-gray-700 font-medium flex items-center gap-1">
                      <svg className="w-4 h-4 text-brand-primary" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.66,8L12,2.35,6.34,8C4.78,9.56,4,11.64,4,13.64s0.78,4.11,2.34,5.67 s3.61,2.35,5.66,2.35s4.1-0.79,5.66-2.35S20,15.64,20,13.64S19.22,9.56,17.66,8z M6,14c0.01-2,0.62-3.27,1.76-4.4L12,5.27l4.24,4.38 C17.38,10.77,17.99,12,18,14H6z"/>
                      </svg>
                      Luftfeuchtigkeit
                    </h3>
                    <div className="text-brand-primary font-medium">
                      {formData.humidity ? `${formData.humidity} %` : '---'}
                    </div>
                  </div>
                  
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden w-full mt-2 mb-1 relative">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-gray-400 to-brand-primary" 
                      style={{ width: `${formData.humidity ? Math.min(100, parseInt(formData.humidity)) : 0}%` }}
                    ></div>
                  </div>
                  
                  <input
                    type="range"
                    id="humidity"
                    name="humidity"
                    value={formData.humidity || 50}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="1"
                    className="w-full accent-brand-primary cursor-pointer"
                  />
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0 %</span>
                    <span>50 %</span>
                    <span>100 %</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Notes field */}
            <div className="mb-8">
              <div className="border-2 border-brand-primary/20 rounded-lg bg-brand-primary/5 relative p-5">
                <div className="absolute -top-3 left-4 bg-white px-2 text-brand-primary font-medium flex items-center gap-2">
                  <FaPencilAlt className="text-brand-primary" />
                  <span>Notizen</span>
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 p-3 hover:border-brand-primary/30 transition-colors">
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Besondere Beobachtungen oder Notizen zum Tag..."
                    className="w-full px-3 py-2 bg-transparent rounded focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    rows="3"
                  />
                </div>
              </div>
            </div>
            
            {/* This section is now moved above immediately after the water slider */}
          </div>
          
          <div className="sticky bottom-0 left-0 right-0 px-6 py-4 bg-white border-t border-gray-200 flex justify-between shadow-lg">
            <button
              type="button"
              onClick={() => router.push(`/setups/${params.id}`)}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-5 py-2.5 bg-brand-primary text-white rounded-lg hover:bg-primary-hover flex items-center gap-2 shadow-md hover:shadow-lg transition-all ${
                submitting ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Speichern...
                </>
              ) : (
                <>
                  <FaPlus className="text-sm" />
                  Tageseintrag speichern
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
