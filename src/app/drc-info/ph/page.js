'use client';

import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import InfoBox from '../components/InfoBox';
import ProductAd from '../components/ProductAd';
import RelatedTerms from '../components/RelatedTerms';

export default function PhInfoPage() {
  const [selectedSubstrate, setSelectedSubstrate] = useState('soil');
  
  // Product ad data - temporarily disabled
  /*
  const productAd = {
    name: 'Digital pH Meter Pro',
    image: '/aci.png',
    description: 'Präzise pH-Messung mit 0.01 Genauigkeit. Wasserdicht, einfache Kalibrierung.',
    regularPrice: '39,99 €',
    salePrice: '35,99 €'
  };
  */
  const productAd = null;
  
  // Related terms
  const relatedTerms = ['nährstoffe', 'ec-wert', 'bewässerung', 'lichtplan'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader title="pH Wert" icon="/1.webp" />
      
      {/* Main Content */}
      <main className="container mx-auto max-w-5xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Box 1: What is pH */}
          <InfoBox title="Was ist der pH-Wert?">
            <p className="text-sm">Maß für Säure/Base einer Lösung (Skala 0-14)</p>
            <div className="mt-3 bg-gray-100 p-3 rounded-lg text-sm">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-red-100 rounded">
                  <p className="font-bold">{'<'}7</p>
                  <p>Sauer</p>
                </div>
                <div className="text-center p-2 bg-green-100 rounded">
                  <p className="font-bold">7</p>
                  <p>Neutral</p>
                </div>
                <div className="text-center p-2 bg-blue-100 rounded">
                  <p className="font-bold">{'>'}7</p>
                  <p>Basisch</p>
                </div>
              </div>
            </div>
          </InfoBox>
          
          {/* Box 2: Optimal pH values */}
          <InfoBox title="Optimale Werte">
            <div className="mb-3">
              <div className="flex border rounded overflow-hidden">
                <button 
                  className={`px-3 py-1 text-sm flex-1 ${selectedSubstrate === 'soil' ? 'bg-olive-green text-white' : 'bg-gray-100'}`}
                  onClick={() => setSelectedSubstrate('soil')}
                >
                  Erde
                </button>
                <button 
                  className={`px-3 py-1 text-sm flex-1 ${selectedSubstrate === 'coco' ? 'bg-olive-green text-white' : 'bg-gray-100'}`}
                  onClick={() => setSelectedSubstrate('coco')}
                >
                  Kokos
                </button>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Phase</th>
                  <th className="p-2 text-right">pH Bereich</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">Sämling</td>
                  <td className="p-2 text-right font-mono">
                    {selectedSubstrate === 'soil' ? '6.0 - 6.8' : '5.5 - 6.3'}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Vegetation</td>
                  <td className="p-2 text-right font-mono">
                    {selectedSubstrate === 'soil' ? '6.0 - 6.5' : '5.5 - 6.2'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2">Blüte</td>
                  <td className="p-2 text-right font-mono">
                    {selectedSubstrate === 'soil' ? '6.0 - 6.3' : '5.5 - 6.0'}
                  </td>
                </tr>
              </tbody>
            </table>
          </InfoBox>
          
          {/* Box 3: Measurement methods */}
          <InfoBox title="Messmethoden">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-olive-green rounded-full"></div>
                <p><strong>Digital:</strong> Präzise, einfach kalibrierbar</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-olive-green rounded-full"></div>
                <p><strong>Teststreifen:</strong> Schnell, weniger genau</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-olive-green rounded-full"></div>
                <p><strong>Flüssig-Kit:</strong> Gute Balance aus beidem</p>
              </div>
            </div>
          </InfoBox>
          
          {/* Box 4: Common problems - Wide box */}
          <InfoBox title="Häufige Probleme" colSpan="col-span-1 md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="font-bold">Zu niedriger pH (sauer)</p>
                <p>Toxizität von Mikroelementen (Fe, Mn, Zn)</p>
                <p>Gelbe Blätter, verfärbte Ränder</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="font-bold">Zu hoher pH (basisch)</p>
                <p>Mangelerscheinungen (Fe, Mg)</p>
                <p>Chlorose zwischen Blattadern</p>
              </div>
            </div>
          </InfoBox>
          
          {/* Box 5: Dr. Cannabis Tip */}
          <InfoBox>
            <div className="bg-yellow-100 p-3 rounded-lg border-l-4 border-yellow-500 h-full">
              <p className="font-semibold">Dr. Cannabis Tipp:</p>
              <p className="text-sm mt-1">Überprüfe den pH-Wert bei jeder Bewässerung, besonders wenn du Nährstoffe hinzufügst. Führe ein Protokoll für bessere Ergebnisse.</p>
            </div>
          </InfoBox>
          
          {/* Product Ad - temporarily disabled */}
          {/* <ProductAd product={productAd} /> */}
          
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
