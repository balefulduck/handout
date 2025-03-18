'use client';

import { FaLeaf, FaSeedling } from 'react-icons/fa';
import { GiGrowth } from 'react-icons/gi';

export default function StepSelector({ onSelect }) {
  // For Phase 1, we only include two primary symptoms
  const primarySymptoms = [
    {
      id: 'discoloration',
      icon: <FaLeaf className="text-2xl text-olive-green" />,
      label: 'Verfärbte Blätter',
      description: 'Gelbe, braune, lila oder fleckige Blätter',
      imageUrl: '/images/leaf-discoloration.jpg' // Will be added in a future update
    },
    {
      id: 'growth-issues',
      icon: <GiGrowth className="text-2xl text-olive-green" />,
      label: 'Wachstumsprobleme',
      description: 'Verzögertes Wachstum, Streckung oder Welken',
      imageUrl: '/images/growth-issues.jpg' // Will be added in a future update
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Was ist das Hauptsymptom deiner Pflanze?</h2>
      <p className="text-gray-600 mb-6">Wähle die Kategorie, die am besten zum Problem deiner Pflanze passt.</p>
      
      <div className="grid gap-4">
        {primarySymptoms.map(symptom => (
          <button
            key={symptom.id}
            onClick={() => onSelect(symptom)}
            className="flex items-center p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-olive-green/50 transition-all"
          >
            <div className="flex-shrink-0 mr-4 p-3 bg-olive-green/10 rounded-full">
              {symptom.icon}
            </div>
            <div className="flex-grow text-left">
              <h3 className="font-medium text-gray-800">{symptom.label}</h3>
              <p className="text-sm text-gray-600">{symptom.description}</p>
            </div>
            <div className="ml-2 text-olive-green">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
