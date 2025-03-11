'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaLeaf, FaArrowLeft } from 'react-icons/fa';
import { GiFlowerPot } from 'react-icons/gi';
import ContextMenu from '@/components/ContextMenu';

export default function HarvestPage() {
  const params = useParams();
  const router = useRouter();
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [existingHarvest, setExistingHarvest] = useState(null);
  
  const [harvestData, setHarvestData] = useState({
    consumption_material: 'flower',
    consumption_method: 'smoking',
    description: '',
    bud_density: 3,
    trichome_color: 'milky',
    curing_begin: new Date().toISOString().split('T')[0],
    curing_end: '',
    dry_weight: ''
  });

  // Fetch plant data and check for existing harvest data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch plant data
        const plantResponse = await fetch(`/api/plants/${params.id}`);
        
        if (plantResponse.status === 404) {
          setPlant(null);
          setError("Pflanze nicht gefunden");
          setLoading(false);
          return;
        }
        
        if (!plantResponse.ok) {
          throw new Error('Failed to fetch plant data');
        }
        
        const plantData = await plantResponse.json();
        
        if (!plantData.plant) {
          setPlant(null);
          setError("Pflanze nicht gefunden");
          setLoading(false);
          return;
        }
        
        setPlant(plantData.plant);
        
        // Check for existing harvest data
        const harvestResponse = await fetch(`/api/plants/${params.id}/harvest`);
        
        if (harvestResponse.ok) {
          const harvestData = await harvestResponse.json();
          if (harvestData.harvest) {
            setExistingHarvest(harvestData.harvest);
            // Pre-fill form with existing data
            setHarvestData({
              consumption_material: harvestData.harvest.consumption_material || 'flower',
              consumption_method: harvestData.harvest.consumption_method || 'smoking',
              description: harvestData.harvest.description || '',
              bud_density: harvestData.harvest.bud_density || 3,
              trichome_color: harvestData.harvest.trichome_color || 'milky',
              curing_begin: harvestData.harvest.curing_begin || new Date().toISOString().split('T')[0],
              curing_end: harvestData.harvest.curing_end || '',
              dry_weight: harvestData.harvest.dry_weight || ''
            });
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const method = existingHarvest ? 'PUT' : 'POST';
      const response = await fetch(`/api/plants/${params.id}/harvest`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(harvestData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save harvest data');
      }
      
      // Navigate back to plant detail page
      router.push(`/plants/${params.id}`);
      alert(existingHarvest ? 'Erntedaten erfolgreich aktualisiert!' : 'Ernte erfolgreich gespeichert!');
    } catch (err) {
      console.error('Error saving harvest data:', err);
      alert('Fehler beim Speichern der Erntedaten: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (error || !plant) {
    return (
      <div className="p-6">
        <div className="alert-error px-4 py-3 rounded">
          Error: {error || "Pflanze nicht gefunden"}
        </div>
        <button
          onClick={() => router.push('/plants')}
          className="mt-4 px-4 py-2 bg-brand-primary text-white rounded hover:bg-primary-hover transition-all duration-300 hover:shadow-md"
        >
          Zurück zur Pflanzenübersicht
        </button>
      </div>
    );
  }

  return (
    <>
      <ContextMenu
        plant={plant}
        harvestData={harvestData}
        existingHarvest={existingHarvest}
        onSaveHarvest={handleSubmit}
      />
      <div className="p-6 pb-32">
        <div className="flex items-center mb-6">
          <h1 className="font-aptos text-focus-animation interactive-heading">
            {existingHarvest ? 'Ernte bearbeiten' : 'Pflanze ernten'}: {plant.name}
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6 interactive-card">
          <div className="flex items-center mb-4">
            <GiFlowerPot className="text-2xl text-brand-accent mr-2" />
            <h2 className="text-gray-800 text-focus-animation">Erntedaten</h2>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Consumption Method Group */}
            <div className="mb-6">
              <h3 className="mb-3 text-focus-animation">Konsummethode</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-small font-medium text-gray-700 mb-1">Material</label>
                  <select
                    value={harvestData.consumption_material}
                    onChange={(e) => setHarvestData({...harvestData, consumption_material: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md input-focus-animation"
                    required
                  >
                    <option value="flower">Blüte</option>
                    <option value="concentrate">Konzentrat</option>
                    <option value="edible">Essbar</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-small font-medium text-gray-700 mb-1">Methode</label>
                  <select
                    value={harvestData.consumption_method}
                    onChange={(e) => setHarvestData({...harvestData, consumption_method: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md input-focus-animation"
                    required
                  >
                    <option value="smoking">Rauchen</option>
                    <option value="vaping">Verdampfen</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Description */}
            <div className="mb-6">
              <label className="block text-small font-medium text-gray-700 mb-1">Beschreibung</label>
              <textarea
                value={harvestData.description}
                onChange={(e) => setHarvestData({...harvestData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-orange"
                rows="3"
                placeholder="Beschreibe deine Ernte..."
              ></textarea>
            </div>
            
            {/* Quality Metrics */}
            <div className="mb-6">
              <h3 className="mb-3 text-focus-animation">Qualitätsmerkmale</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Knospendichte (1-5)</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={harvestData.bud_density}
                    onChange={(e) => setHarvestData({...harvestData, bud_density: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <div className="flex justify-between text-micro text-gray-500">
                    <span>Locker (1)</span>
                    <span>Mittel (3)</span>
                    <span>Dicht (5)</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trichomfarbe</label>
                  <select
                    value={harvestData.trichome_color}
                    onChange={(e) => setHarvestData({...harvestData, trichome_color: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md input-focus-animation"
                  >
                    <option value="clear">Klar</option>
                    <option value="cloudy">Trüb</option>
                    <option value="milky">Milchig</option>
                    <option value="amber">Bernstein</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Curing and Weight */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Trocknung & Gewicht</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trocknungsbeginn</label>
                  <input
                    type="date"
                    value={harvestData.curing_begin}
                    onChange={(e) => setHarvestData({...harvestData, curing_begin: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md input-focus-animation"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trocknungsende</label>
                  <input
                    type="date"
                    value={harvestData.curing_end}
                    onChange={(e) => setHarvestData({...harvestData, curing_end: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md input-focus-animation"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trockengewicht (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={harvestData.dry_weight}
                    onChange={(e) => setHarvestData({...harvestData, dry_weight: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md input-focus-animation"
                    placeholder="0.0"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
