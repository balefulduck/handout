'use client';

import { FaLeaf, FaSeedling, FaBug, FaWater } from 'react-icons/fa';
import { GiGrowth, GiFlowerPot, GiMushroomCloud, GiSprout } from 'react-icons/gi';

export default function StepSelector({ onSelect }) {
  // Expanded symptom library for Phase 2
  const primarySymptoms = [
    // Leaf Issues
    {
      id: 'discoloration',
      icon: <FaLeaf className="text-2xl text-olive-green" />,
      label: 'Verfärbte Blätter',
      description: 'Gelbe, braune, lila oder fleckige Blätter',
      imageUrl: '/images/leaf-discoloration.jpg',
      category: 'leaves'
    },
    {
      id: 'leaf-deformities',
      icon: <FaLeaf className="text-2xl text-olive-green" />,
      label: 'Verformte Blätter',
      description: 'Gekräuselte, verdrehte oder deformierte Blätter',
      imageUrl: '/images/leaf-deformities.jpg',
      category: 'leaves'
    },
    
    // Growth Issues
    {
      id: 'growth-issues',
      icon: <GiGrowth className="text-2xl text-olive-green" />,
      label: 'Wachstumsprobleme',
      description: 'Verzögertes Wachstum, Streckung oder Welken',
      imageUrl: '/images/growth-issues.jpg',
      category: 'growth'
    },
    {
      id: 'stem-issues',
      icon: <GiSprout className="text-2xl text-olive-green" />,
      label: 'Stängel & Stielprobleme',
      description: 'Schwache Stängel, Verfärbungen, Deformationen',
      imageUrl: '/images/stem-issues.jpg',
      category: 'growth'
    },
    
    // Pests & Diseases
    {
      id: 'pests',
      icon: <FaBug className="text-2xl text-olive-green" />,
      label: 'Schädlinge',
      description: 'Insekten, Milben oder andere Schädlinge',
      imageUrl: '/images/pests.jpg',
      category: 'pests'
    },
    {
      id: 'mold-mildew',
      icon: <GiMushroomCloud className="text-2xl text-olive-green" />,
      label: 'Schimmel & Mehltau',
      description: 'Weißes Pulver, graue/braune Flecken, Fäulnis',
      imageUrl: '/images/mold.jpg',
      category: 'pests'
    },
    
    // Flowering Problems
    {
      id: 'flower-issues',
      icon: <GiFlowerPot className="text-2xl text-olive-green" />,
      label: 'Blütenprobleme',
      description: 'Probleme mit Knospenbildung oder Blütenentwicklung',
      imageUrl: '/images/flower-issues.jpg',
      category: 'flowering'
    },
    
    // Watering & Nutrients
    {
      id: 'watering-issues',
      icon: <FaWater className="text-2xl text-olive-green" />,
      label: 'Bewässerungsprobleme',
      description: 'Zu viel oder zu wenig Wasser, Drainageprobleme',
      imageUrl: '/images/watering-issues.jpg',
      category: 'nutrients'
    }
  ];
  
  // Group symptoms by category for UI organization
  const categories = {
    leaves: { label: 'Blattprobleme', items: [] },
    growth: { label: 'Wachstum & Struktur', items: [] },
    pests: { label: 'Schädlinge & Krankheiten', items: [] },
    flowering: { label: 'Blütenprobleme', items: [] },
    nutrients: { label: 'Bewässerung & Nährstoffe', items: [] }
  };
  
  // Organize symptoms by category
  primarySymptoms.forEach(symptom => {
    if (categories[symptom.category]) {
      categories[symptom.category].items.push(symptom);
    }
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Was ist das Hauptsymptom deiner Pflanze?</h2>
      <p className="text-gray-600 mb-6">Wähle die Kategorie, die am besten zum Problem deiner Pflanze passt.</p>
      
      {/* Display organized by categories */}
      <div className="space-y-8">
        {Object.entries(categories).map(([key, category]) => (
          category.items.length > 0 && (
            <div key={key} className="space-y-3">
              <h3 className="font-medium text-gray-700 border-b border-gray-200 pb-2">{category.label}</h3>
              <div className="grid gap-3">
                {category.items.map(symptom => (
                  <button
                    key={symptom.id}
                    onClick={() => onSelect(symptom)}
                    className="flex items-center p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-olive-green/50 transition-all"
                  >
                    <div className="flex-shrink-0 mr-4 p-3 bg-olive-green/10 rounded-full">
                      {symptom.icon}
                    </div>
                    <div className="flex-grow text-left">
                      <h4 className="font-medium text-gray-800">{symptom.label}</h4>
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
          )
        ))}
      </div>
    </div>
  );
}
