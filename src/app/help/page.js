'use client';

import ContextMenu from '@/components/ContextMenu';

export default function HelpPage() {
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
      <h1 className="text-2xl font-bold mb-6 font-aptos">Hilfe & Problemlösung</h1>
      
      <div className="bg-custom-orange/10 border-l-4 border-custom-orange p-4 mb-8">
        <p className="text-lg mb-2">
          Verfärbte oder verformte Blätter können Anzeichen für Probleme sein.
        </p>
        <p className="text-lg">
          Nur eine frühzeitige Diagnose und konsequente Behandlung kann Auswirkungen auf die Gesundheit Deiner Pflanzen minimieren.
        </p>
      </div>

      <div className="space-y-6">
        {troubleshootingItems.map((item) => (
          <div 
            key={item.id} 
            className="bg-custom-orange text-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-xl font-bold font-aptos mb-2">{item.problem}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-white/90 mb-1">Mögliche Ursache:</h4>
                <p className="text-white/80">{item.cause}</p>
              </div>
              <div>
                <h4 className="font-semibold text-white/90 mb-1">Lösung:</h4>
                <p className="text-white/80">{item.solution}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-custom-orange text-white rounded-lg">
        <h2 className="text-lg font-bold font-aptos mb-2">Allgemeine Tipps:</h2>
        <ul className="list-disc pl-5 space-y-2 text-white/90">
          <li>Überprüfe regelmäßig die Blätter auf Anzeichen von Problemen</li>
          <li>Halte ein Pflanzentagebuch für besseres Monitoring</li>
          <li>Stelle sicher, dass die Belüftung ausreichend ist</li>
          <li>Kontrolliere regelmäßig pH-Wert und Nährstoffversorgung</li>
        </ul>
      </div>
    </div>
    <ContextMenu />
    </>
  );
}
