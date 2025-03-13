'use client';

import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import InfoBox from '../components/InfoBox';
import ProductAd from '../components/ProductAd';
import RelatedTerms from '../components/RelatedTerms';

export default function TemperaturInfoPage() {
  const [selectedGrowPhase, setSelectedGrowPhase] = useState('seedling');
  
  // Product ad data
  const productAd = {
    name: 'Digitales Thermo-Hygrometer Pro',
    image: '/aci.png',
    description: 'Präzise Temperatur- und Luftfeuchtigkeitsmessung mit Datenaufzeichnung und App-Steuerung.',
    regularPrice: '44,99 €',
    salePrice: '39,99 €'
  };
  
  // Related terms
  const relatedTerms = ['lichtzyklus', 'ph', 'luftfeuchtigkeit', 'nährstoffe'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader title="Temperatur" icon="/1.webp" />
      
      {/* Main Content */}
      <main className="container mx-auto max-w-5xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Box 1: Was ist wichtig bei der Temperatur */}
          <InfoBox title="Warum ist Temperatur wichtig?">
            <p className="text-sm">Die Temperatur beeinflusst maßgeblich das Pflanzenwachstum, die Stoffwechselprozesse und die Nährstoffaufnahme. Zu hohe oder zu niedrige Temperaturen können Stress verursachen und das Wachstum hemmen.</p>
            <div className="mt-3 bg-gray-100 p-3 rounded-lg text-sm">
              <p className="font-semibold mb-1">Einfluss auf:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Photosynthese und Stoffwechsel</li>
                <li>Verdunstungsrate und Wasserbedarf</li>
                <li>Nährstoffaufnahme und -transport</li>
                <li>Allgemeine Pflanzengesundheit</li>
              </ul>
            </div>
          </InfoBox>
          
          {/* Box 2: Optimale Temperaturwerte nach Phase */}
          <InfoBox title="Optimale Temperatur">
            <div className="mb-3">
              <div className="flex border rounded overflow-hidden">
                <button 
                  className={`px-3 py-1 text-sm flex-1 ${selectedGrowPhase === 'seedling' ? 'bg-olive-green text-white' : 'bg-gray-100'}`}
                  onClick={() => setSelectedGrowPhase('seedling')}
                >
                  Sämling
                </button>
                <button 
                  className={`px-3 py-1 text-sm flex-1 ${selectedGrowPhase === 'veg' ? 'bg-olive-green text-white' : 'bg-gray-100'}`}
                  onClick={() => setSelectedGrowPhase('veg')}
                >
                  Vegetation
                </button>
                <button 
                  className={`px-3 py-1 text-sm flex-1 ${selectedGrowPhase === 'flower' ? 'bg-olive-green text-white' : 'bg-gray-100'}`}
                  onClick={() => setSelectedGrowPhase('flower')}
                >
                  Blüte
                </button>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Tageszeit</th>
                  <th className="p-2 text-right">Temperatur</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">Tagsüber</td>
                  <td className="p-2 text-right font-mono">
                    {selectedGrowPhase === 'seedling' ? '20-25°C' : 
                     selectedGrowPhase === 'veg' ? '22-28°C' : '20-26°C'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2">Nachts</td>
                  <td className="p-2 text-right font-mono">
                    {selectedGrowPhase === 'seedling' ? '18-22°C' : 
                     selectedGrowPhase === 'veg' ? '18-22°C' : '16-20°C'}
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="mt-2 text-xs text-gray-600 italic">
              Eine Temperaturdifferenz zwischen Tag und Nacht fördert gesundes Wachstum.
            </p>
          </InfoBox>
          
          {/* Box 3: Temperaturmanagement */}
          <InfoBox title="Temperaturmanagement">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-olive-green rounded-full"></div>
                <p><strong>Heizung:</strong> Heizmatten, Raumheizung</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-olive-green rounded-full"></div>
                <p><strong>Kühlung:</strong> Belüftung, Klimaanlage</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-olive-green rounded-full"></div>
                <p><strong>Überwachung:</strong> Digitales Thermometer</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-olive-green rounded-full"></div>
                <p><strong>Automation:</strong> Thermostat mit Zeitschaltuhr</p>
              </div>
            </div>
          </InfoBox>
          
          {/* Box 4: Temperaturprobleme */}
          <InfoBox title="Temperaturprobleme" colSpan="col-span-1 md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="font-bold">Zu niedrige Temperatur</p>
                <p><strong>Symptome:</strong></p>
                <ul className="list-disc pl-5">
                  <li>Verlangsamtes Wachstum</li>
                  <li>Violette/rötliche Blätter</li>
                  <li>Mangelerscheinungen (reduzierte Aufnahme)</li>
                  <li>Erhöhtes Risiko für Pilzerkrankungen</li>
                </ul>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="font-bold">Zu hohe Temperatur</p>
                <p><strong>Symptome:</strong></p>
                <ul className="list-disc pl-5">
                  <li>Welken der Blätter</li>
                  <li>Verfärbte/verbrannte Blattränder</li>
                  <li>Schnell austrocknende Erde</li>
                  <li>Erhöhtes Risiko für Insektenbefall</li>
                </ul>
              </div>
            </div>
          </InfoBox>
          
          {/* Box 5: Spezielle Hinweise */}
          <InfoBox title="Wichtige Hinweise">
            <div className="space-y-3 text-sm">
              <p>
                <strong>Wärme von Lampen:</strong> LED-Lampen erzeugen weniger Wärme als HPS-Lampen. Berücksichtige die Wärmeabgabe deiner Beleuchtung.
              </p>
              <p>
                <strong>VPD-Wert:</strong> Vapor Pressure Deficit - das Zusammenspiel von Temperatur und Luftfeuchtigkeit ist entscheidend für optimales Wachstum.
              </p>
              <p>
                <strong>Messposition:</strong> Immer auf Pflanzenhöhe messen, nicht an den Wänden oder unter Lichtquellen.
              </p>
            </div>
          </InfoBox>
          
          {/* Box 6: Dr. Cannabis Tipp */}
          <InfoBox>
            <div className="bg-yellow-100 p-3 rounded-lg border-l-4 border-yellow-500 h-full">
              <p className="font-semibold">Dr. Cannabis Tipp:</p>
              <p className="text-sm mt-1">Investiere in ein gutes digitales Thermometer mit Min/Max-Anzeige, damit du auch die Temperaturspitzen während deiner Abwesenheit nachvollziehen kannst. Idealerweise mit Datenaufzeichnung für die bessere Analyse.</p>
            </div>
          </InfoBox>
          
          {/* Product Ad */}
          <ProductAd product={productAd} />
          
          {/* Related Terms */}
          <RelatedTerms terms={relatedTerms} />
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-100 py-4 mt-8">
        <div className="container mx-auto max-w-4xl px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Dr. Cannabis - Alle Fachbegriffe und Informationen zum Nachschlagen
        </div>
      </footer>
    </div>
  );
}
