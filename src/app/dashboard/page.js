'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedStrains, setSelectedStrains] = useState([]);

  useEffect(() => {
    const fetchStrains = async () => {
      const response = await fetch('/api/strains/selected');
      if (response.ok) {
        const data = await response.json();
        setSelectedStrains(data.strains);
      }
    };
    fetchStrains();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <main className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
 
          <div className="text-right">
            <p className="text-sm text-gray-600">Willkommen zurück,</p>
            <p className="font-medium">{session?.user?.name || 'Workshop'}</p>
          </div>
        </div>

        {/* Selected Strains */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Deine ausgewählten Sorten</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedStrains.map((strain) => (
              <div key={strain.id} className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold">{strain.name}</h3>
                <p className="text-sm text-gray-600">{strain.type}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Growth Phases */}
         {/* Seedling phase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-teal hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-semibold mb-4">Keimling</h2>
            <p className="text-gray-600">Phase 1: Keimung und erste Blätter</p>
            <button 
              onClick={() => router.push('/phases/seedling')}
              className="mt-4 text-teal hover:text-teal-700">
              Mehr erfahren →
            </button>
          </div>
           {/* Vegetation Phase */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-lime hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-semibold mb-4">Vegetatives Wachstum</h2>
            <p className="text-gray-600">Phase 2: Wachstum und Entwicklung</p>
            <button className="mt-4 text-lime hover:text-lime-700">Mehr erfahren →</button>
          </div>
           {/* FLower Phase */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-orange hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-semibold mb-4">Blüte</h2>
            <p className="text-gray-600">Phase 3: Blütenbildung</p>
            <button className="mt-4 text-orange hover:text-orange-700">Mehr erfahren →</button>
          </div>

             {/* Harvest */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-semibold mb-4">Ernte</h2>
            <p className="text-gray-600">Phase 4: Ernte und Trocknung</p>
            <button className="mt-4 text-purple hover:text-purple-700">Mehr erfahren →</button>
          </div>
        </div>

        {/* Emergency Help Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500 hover:shadow-xl transition-shadow">
          <h2 className="text-2xl font-semibold text-red-500 mb-4">Notfall-Hilfe</h2>
          <p className="text-gray-600">Schnelle Hilfe bei Problemen mit deinen Pflanzen</p>
          <button className="mt-4 text-red-500 hover:text-red-700">Hilfe bekommen →</button>
        </div>
      </main>
    </div>
  );
}
