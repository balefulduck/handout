'use client';

import { useEffect, useState } from 'react';
import ContextMenu from '@/components/ContextMenu';

export default function PlantsPage() {
  const [plants, setPlants] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const response = await fetch('/api/strains/selected');
        if (!response.ok) {
          throw new Error('Failed to fetch plants');
        }
        const data = await response.json();
        setPlants(data.strains);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching plants:', err);
      }
    };

    fetchPlants();
  }, []);

  if (error) {
    return <div className="p-4 text-custom-orange font-semibold">Error: {error}</div>;
  }

  return (
    <>
    <div className="p-6 pb-32">
      <h1 className="text-2xl font-bold mb-6 font-aptos">My Plants</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plants.map((plant) => (
          <div 
            key={plant.id}
            className="bg-custom-orange text-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-lg font-bold font-aptos">{plant.name}</h2>
            <p className="text-sm text-white/80">Type: {plant.type}</p>
          </div>
        ))}
      </div>
    </div>
    <ContextMenu />
    </>
  );
}
