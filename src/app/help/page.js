'use client';

import { useState } from 'react';
import ContextMenu from '@/components/ContextMenu';
import DrcInfoTag from '@/components/DrcInfoTag';
import { FaLeaf, FaSeedling, FaSearch } from 'react-icons/fa';
import { GiGrowth } from 'react-icons/gi';
import HelpRequestModal from '@/components/HelpRequestModal';

export default function HelpPage() {
  const [expandedCards, setExpandedCards] = useState({});
  const [showHelpRequestModal, setShowHelpRequestModal] = useState(false);
  
  // Function to toggle card expansion
  const toggleCard = (id) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  const troubleshootingItems = [
    {
      id: 1,
      problem: 'Gelbe Blätter',
      cause: 'Stickstoffmangel oder Überbelichtung',
      solution: 'Nährstoffzufuhr überprüfen und ggf. anpassen. Bei Überbelichtung den Abstand zur Lichtquelle vergrößern.'
    },
    {
      id: 2,
      problem: 'Braune Blattränder',
      cause: 'Nährstoffüberschuss oder zu geringe Luftfeuchtigkeit',
      solution: 'Nährstoffgabe reduzieren und Luftfeuchtigkeit erhöhen. Ideal sind 40-60% während der Blüte.'
    },
    {
      id: 3,
      problem: 'Gekräuselte Blätter',
      cause: <>
        <DrcInfoTag 
          term="pH" 
          color="olive-green"
          bgMode="light"
          tooltipContent="Der pH-Wert gibt an, wie sauer oder basisch eine Lösung ist. Für Cannabis ist ein pH-Wert zwischen 6.0-6.5 bei Erde und 5.5-6.0 bei Hydrokultur optimal."
        >
          pH
        </DrcInfoTag>-Wert nicht optimal oder Temperaturstress
      </>,
      solution: <>
        <DrcInfoTag 
          term="pH" 
          color="olive-green"
          bgMode="light"
          tooltipContent="Der pH-Wert gibt an, wie sauer oder basisch eine Lösung ist. Für Cannabis ist ein pH-Wert zwischen 6.0-6.5 bei Erde und 5.5-6.0 bei Hydrokultur optimal."
        >
          pH
        </DrcInfoTag>-Wert des Wassers auf 6.0-6.5 einstellen. Temperatur zwischen 20-28°C halten.
      </>
    },
    {
      id: 4,
      problem: 'Weiße Flecken auf Blättern',
      cause: 'Mehltau oder Schädlingsbefall',
      solution: 'Luftzirkulation verbessern und Luftfeuchtigkeit reduzieren. Bei Schädlingen biologische Bekämpfungsmittel einsetzen.'
    }
  ];

  return (
    <>
    <div className="p-8 pb-32 mt-10 max-w-4xl mx-auto">
    
      
      {/* New Diagnostic Tool Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8 border border-gray-100">
        <div className="bg-olive-green p-5 text-white">
          <h2 className="text-xl font-semibold">Pflanzen-Diagnose</h2>
          <p className="mt-1 text-white/90">Probleme bei deiner Pflanze schnell identifizieren</p>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1">
              <h3 className="text-lg font-medium mb-2 text-gray-800">Was stimmt nicht mit deiner Pflanze?</h3>
              <p className="text-gray-600 mb-4">
                Unser Hilfe-Assistent ermöglicht es dir, eine detaillierte Anfrage an unser Team zu senden.
                Du kannst Fotos hinzufügen und betroffene Pflanzen auswählen.
              </p>
              <button 
                onClick={() => setShowHelpRequestModal(true)}
                className="px-5 py-2.5 bg-olive-green text-white rounded-md hover:bg-yellow-green transition-all duration-300 flex items-center"
              >
                <FaSearch className="mr-2" /> Hilfe anfordern
              </button>
            </div>
            
            <div className="flex-shrink-0 grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <FaLeaf className="text-3xl text-olive-green mx-auto mb-2" />
                <p className="text-sm font-medium">Blattverfärbungen</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <GiGrowth className="text-3xl text-olive-green mx-auto mb-2" />
                <p className="text-sm font-medium">Wachstumsprobleme</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      


    </div>
    <ContextMenu />
    
    {/* Help Request Modal */}
    {showHelpRequestModal && (
      <HelpRequestModal 
        onClose={() => setShowHelpRequestModal(false)} 
      />
    )}
    </>
  );
}
