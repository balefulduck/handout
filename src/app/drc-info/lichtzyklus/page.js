'use client';

import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import InfoBox from '../components/InfoBox';
import ProductAd from '../components/ProductAd';
import RelatedTerms from '../components/RelatedTerms';

export default function LichtzyklysInfoPage() {
  const [selectedGrowType, setSelectedGrowType] = useState('photo');
  
  // Product ad data
  const productAd = {
    name: 'LED Grow Lampe Pro Serie',
    image: '/aci.png',
    description: 'Vollspektrum LED mit programmierbarem Timer. Energieeffizient und ideal für alle Wachstumsphasen.',
    regularPrice: '129,99 €',
    salePrice: '109,99 €'
  };
  
  // Related terms
  const relatedTerms = ['nährstoffe', 'ph', 'temperatur', 'luftfeuchtigkeit'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader title="Lichtzyklus" icon="/1.webp" />
      
      {/* Main Content */}
      <main className="container mx-auto max-w-5xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Box 1: Was ist ein Lichtzyklus */}
          <InfoBox title="Was ist ein Lichtzyklus?">
            <p className="text-sm">Der Lichtzyklus legt fest, wie lange Pflanzen täglich Licht erhalten sollen. Dieser Zyklus ändert sich je nach Wachstumsphase und Pflanzentyp.</p>
            <div className="mt-3 bg-gray-100 p-3 rounded-lg text-sm">
              <p className="font-semibold mb-1">Warum wichtig?</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Initiiert Blütephase bei photoperiodischen Pflanzen</li>
                <li>Beeinflusst Wachstumsrate und Pflanzenmorphologie</li>
                <li>Optimiert Energienutzung der Pflanze</li>
              </ul>
            </div>
          </InfoBox>
          
          {/* Box 2: Lichtzyklen */}
          <InfoBox title="Optimale Lichtzeiten">
            <div className="mb-3">
              <div className="flex border rounded overflow-hidden">
                <button 
                  className={`px-3 py-1 text-sm flex-1 ${selectedGrowType === 'photo' ? 'bg-olive-green text-white' : 'bg-gray-100'}`}
                  onClick={() => setSelectedGrowType('photo')}
                >
                  Photoperiodisch
                </button>
                <button 
                  className={`px-3 py-1 text-sm flex-1 ${selectedGrowType === 'auto' ? 'bg-olive-green text-white' : 'bg-gray-100'}`}
                  onClick={() => setSelectedGrowType('auto')}
                >
                  Autoflower
                </button>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Phase</th>
                  <th className="p-2 text-right">Licht/Tag</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">Sämlinge</td>
                  <td className="p-2 text-right font-mono">
                    {selectedGrowType === 'photo' ? '18-24 Std.' : '18-20 Std.'}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Vegetation</td>
                  <td className="p-2 text-right font-mono">
                    {selectedGrowType === 'photo' ? '18 Std.' : '18-20 Std.'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2">Blüte</td>
                  <td className="p-2 text-right font-mono">
                    {selectedGrowType === 'photo' ? '12 Std.' : '18-20 Std.'}
                  </td>
                </tr>
              </tbody>
            </table>
          </InfoBox>
          
          {/* Box 3: Lichtintensität */}
          <InfoBox title="Lichtintensität">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-olive-green rounded-full"></div>
                <p><strong>Sämlinge:</strong> 10.000-15.000 Lux</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-olive-green rounded-full"></div>
                <p><strong>Vegetation:</strong> 15.000-40.000 Lux</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-olive-green rounded-full"></div>
                <p><strong>Blüte:</strong> 40.000-65.000 Lux</p>
              </div>
              <p className="mt-2 text-xs text-gray-600 italic">Hinweis: Die optimale Intensität variiert je nach Sorte und Anbaumethode.</p>
            </div>
          </InfoBox>
          
          {/* Box 4: Lichtspektrum */}
          <InfoBox title="Lichtspektrum" colSpan="col-span-1 md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="font-bold">Blaues Spektrum (400-500nm)</p>
                <p><strong>Ideal für:</strong> Vegetation</p>
                <p><strong>Vorteile:</strong> Kompaktes Wachstum, dicke Stängel, starke Wurzelbildung</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="font-bold">Rotes Spektrum (620-780nm)</p>
                <p><strong>Ideal für:</strong> Blüte</p>
                <p><strong>Vorteile:</strong> Fördert Blütenbildung und Entwicklung, erhöht Erträge</p>
              </div>
            </div>
            <div className="mt-3 bg-yellow-50 p-3 rounded-lg">
              <p className="font-bold">Vollspektrum</p>
              <p><strong>Ideal für:</strong> Gesamten Lebenszyklus</p>
              <p><strong>Vorteile:</strong> Ausgewogenes Wachstum, keine Lampen wechseln nötig</p>
            </div>
          </InfoBox>
          
          {/* Box 5: Dr. Cannabis Tipp */}
          <InfoBox>
            <div className="bg-yellow-100 p-3 rounded-lg border-l-4 border-yellow-500 h-full">
              <p className="font-semibold">Dr. Cannabis Tipp:</p>
              <p className="text-sm mt-1">Achte auf eine genaue Zeiteinhaltung besonders bei photoperiodischen Pflanzen. Schon kleine Lichtstörungen während der Dunkelphase können Stress und Hermaphroditismus auslösen.</p>
            </div>
          </InfoBox>
          
          {/* Box 6: Häufige Fehler */}
          <InfoBox title="Häufige Fehler">
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>Zu hohe Lichtintensität bei Sämlingen (Verbrennungen)</li>
              <li>Unregelmäßige Lichtzeiten (Stress)</li>
              <li>Lichteinstrahlung während der Dunkelphase</li>
              <li>Zu großer Abstand zwischen Pflanzen und Lampe</li>
              <li>Falsches Lichtspektrum für die jeweilige Phase</li>
            </ul>
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
