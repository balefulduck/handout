'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import strainData from '@/data/strains.json';

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedStrains, setSelectedStrains] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleStrainSelect = (strainId) => {
    setSelectedStrains(prev => {
      if (prev.includes(strainId)) {
        return prev.filter(id => id !== strainId);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, strainId];
    });
  };

  const handleSave = async () => {
    if (selectedStrains.length !== 3) {
      setError('Bitte wählen Sie genau 3 Sorten aus');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/strains/select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selectedStrains }),
      });

      if (!response.ok) {
        throw new Error('Fehler beim Speichern');
      }

      router.push('/dashboard');
    } catch (error) {
      setError('Fehler beim Speichern der Auswahl');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-teal">Willkommen beim Workshop</h1>
          <p className="text-xl text-gray-600">
            Wählen Sie 3 Cannabis-Sorten für Ihren persönlichen Anbau
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {strainData.strains.map((strain) => (
            <div
              key={strain.id}
              className={`bg-white rounded-xl shadow-lg p-6 space-y-4 cursor-pointer transition-all
                ${
                  selectedStrains.includes(strain.id)
                    ? 'ring-2 ring-lime border-transparent'
                    : 'hover:shadow-xl'
                }
                ${
                  selectedStrains.length >= 3 && !selectedStrains.includes(strain.id)
                    ? 'opacity-50'
                    : ''
                }
              `}
              onClick={() => handleStrainSelect(strain.id)}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold text-teal">{strain.name}</h3>
                <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                  {strain.type}
                </span>
              </div>
              
              <div className="space-y-2">
                <p className="text-gray-600">{strain.description}</p>
                <div className="flex gap-2 flex-wrap">
                  {strain.effects.map((effect, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-orange/10 text-orange rounded-full text-sm"
                    >
                      {effect}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">THC:</span>
                  <span className="ml-2 font-medium">{strain.thc}</span>
                </div>
                <div>
                  <span className="text-gray-500">CBD:</span>
                  <span className="ml-2 font-medium">{strain.cbd}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-6">
          <button
            onClick={handleSave}
            disabled={selectedStrains.length !== 3 || saving}
            className={`
              px-8 py-3 rounded-lg text-white font-medium
              ${
                selectedStrains.length === 3
                  ? 'bg-lime hover:bg-lime/90'
                  : 'bg-gray-300 cursor-not-allowed'
              }
            `}
          >
            {saving ? 'Wird gespeichert...' : 'Auswahl bestätigen'}
          </button>
        </div>

        <div className="text-center text-sm text-gray-500">
          {selectedStrains.length}/3 Sorten ausgewählt
        </div>
      </div>
    </div>
  );
}
