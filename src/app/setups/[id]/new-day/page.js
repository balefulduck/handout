'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FaPlus, FaTimes, FaArrowLeft, FaInfoCircle } from 'react-icons/fa';

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
    watered: false,
    topped: false,
    ph_value: '',
    watering_amount: '',
    temperature: '',
    humidity: '',
    notes: ''
  });

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
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
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
    
    setSubmitting(true);
    
    // Filter out empty fertilizers
    const filteredFertilizers = fertilizers.filter(f => f.name.trim() !== '');
    
    try {
      const payload = {
        ...formData,
        fertilizers: filteredFertilizers
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
        <div className="mb-6 flex items-center">
          <button
            onClick={() => router.push(`/setups/${params.id}`)}
            className="mr-4 text-gray-600 hover:text-gray-800"
          >
            <FaArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Neuer Tageseintrag</h1>
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
            <div className="mb-6">
              <label htmlFor="date" className="block text-gray-700 font-medium mb-2">
                Datum*
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-primary"
                required
              />
            </div>
            
            {/* Checkbox fields */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="watered"
                  name="watered"
                  checked={formData.watered}
                  onChange={handleInputChange}
                  className="mr-2 h-5 w-5"
                />
                <label htmlFor="watered" className="text-gray-700">
                  Gewässert
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="topped"
                  name="topped"
                  checked={formData.topped}
                  onChange={handleInputChange}
                  className="mr-2 h-5 w-5"
                />
                <label htmlFor="topped" className="text-gray-700">
                  Getoppt
                </label>
              </div>
            </div>
            
            {/* Numeric fields */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ph_value" className="block text-gray-700 font-medium mb-2">
                  pH-Wert
                </label>
                <input
                  type="number"
                  id="ph_value"
                  name="ph_value"
                  value={formData.ph_value}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0"
                  max="14"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
              <div>
                <label htmlFor="watering_amount" className="block text-gray-700 font-medium mb-2">
                  Wassermenge (ml)
                </label>
                <input
                  type="number"
                  id="watering_amount"
                  name="watering_amount"
                  value={formData.watering_amount}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
              <div>
                <label htmlFor="temperature" className="block text-gray-700 font-medium mb-2">
                  Temperatur (°C)
                </label>
                <input
                  type="number"
                  id="temperature"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleInputChange}
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
              <div>
                <label htmlFor="humidity" className="block text-gray-700 font-medium mb-2">
                  Luftfeuchtigkeit (%)
                </label>
                <input
                  type="number"
                  id="humidity"
                  name="humidity"
                  value={formData.humidity}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>
            
            {/* Notes field */}
            <div className="mb-6">
              <label htmlFor="notes" className="block text-gray-700 font-medium mb-2">
                Notizen
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-primary"
                rows="3"
              />
            </div>
            
            {/* Fertilizers */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-gray-700 font-medium">
                  Dünger
                </label>
                <button
                  type="button"
                  onClick={handleAddFertilizer}
                  className="text-brand-primary hover:text-primary-hover flex items-center text-sm gap-1"
                >
                  <FaPlus /> Dünger hinzufügen
                </button>
              </div>
              
              {fertilizers.map((fertilizer, index) => (
                <div 
                  key={index}
                  className="flex gap-2 items-center mb-3"
                >
                  <div className="flex-grow">
                    <input
                      type="text"
                      placeholder="Düngername"
                      value={fertilizer.name}
                      onChange={(e) => handleFertilizerChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>
                  <div className="w-1/4">
                    <input
                      type="text"
                      placeholder="Menge"
                      value={fertilizer.amount}
                      onChange={(e) => handleFertilizerChange(index, 'amount', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>
                  {fertilizers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFertilizer(index)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 flex justify-between">
            <button
              type="button"
              onClick={() => router.push(`/setups/${params.id}`)}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 bg-brand-primary text-white rounded hover:bg-primary-hover flex items-center gap-2 ${
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
