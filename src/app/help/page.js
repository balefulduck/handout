'use client';

import { useState } from 'react';
import ContextMenu from '@/components/ContextMenu';

export default function HelpPage() {
  const [expandedCards, setExpandedCards] = useState({});
  
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
      cause: 'pH-Wert nicht optimal oder Temperaturstress',
      solution: 'pH-Wert des Wassers auf 6.0-6.5 einstellen. Temperatur zwischen 20-28°C halten.'
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
    <div className="p-6 pb-32 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mt-10 mb-6 font-aptos">Hilfe & Problemlösung</h1>
      
      <div className="bg-custom-orange/10 border-l-4 border-custom-orange p-4 mb-8">
        <p className="text-lg mb-2">
          Verfärbte oder verformte Blätter können Anzeichen für Probleme sein.
        </p>
        <p className="text-lg">
          Nur eine frühzeitige Diagnose und konsequente Behandlung kann Auswirkungen auf die Gesundheit Deiner Pflanzen minimieren.
        </p>
      </div>

      <div className="mt-8 mb-8 help rounded-lg shadow overflow-hidden">
        <div className="bg-custom-orange p-4">
          <h2 className="text-lg font-bold font-aptos text-white">Allgemeine Tipps:</h2>
        </div>
        <div className="p-4 border-x border-b border-custom-orange/20 rounded-b-lg">
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Überprüfe regelmäßig die Blätter auf Anzeichen von Problemen</li>
            <li>Halte ein Pflanzentagebuch für besseres Monitoring</li>
            <li>Stelle sicher, dass die Belüftung ausreichend ist</li>
            <li>Kontrolliere regelmäßig pH-Wert und Nährstoffversorgung</li>
          </ul>
        </div>
      </div>

      <div className="space-y-6">
        {troubleshootingItems.map((item) => (
          <div 
            key={item.id} 
            className="rounded-lg shadow overflow-hidden"
          >
            <div 
              className="bg-custom-orange p-4 cursor-pointer"
              onClick={() => toggleCard(item.id)}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold font-aptos text-white">{item.problem}</h3>
                <span className="text-white text-xl">
                  {expandedCards[item.id] ? '−' : '+'}
                </span>
              </div>
            </div>
            {expandedCards[item.id] && (
              <div className="p-6 border-x border-b border-custom-orange/20 rounded-b-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Mögliche Ursache:</h4>
                    <p className="text-gray-700">{item.cause}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Lösung:</h4>
                    <p className="text-gray-700">{item.solution}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>


    </div>
    <ContextMenu />
    </>
  );
}
