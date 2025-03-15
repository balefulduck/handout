'use client';

import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import InfoBox from '../components/InfoBox';
import ProductAd from '../components/ProductAd';
import RelatedTerms from '../components/RelatedTerms';

export default function LuftfeuchtigkeitInfoPage() {
  const [selectedGrowPhase, setSelectedGrowPhase] = useState('seedling');
  
  // Product ad data
  const productAd = {
    name: 'Digitaler Luftbefeuchter mit Hygrometer',
    image: '/aci.png',
    description: 'Automatische Feuchtigkeitsregulierung mit präziser Messgenauigkeit. Ideal für Grow-Räume aller Größen.',
    regularPrice: '59,99 €',
    salePrice: '49,99 €'
  };
  
  // Related terms
  const relatedTerms = ['lichtzyklus', 'ph', 'temperatur', 'nährstoffe'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader title="Luftfeuchtigkeit" icon="/1.webp" />
      
      {/* Main Content */}
      <main className="container mx-auto max-w-5xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Box 1: Was ist Luftfeuchtigkeit */}
          <InfoBox title="Was ist Luftfeuchtigkeit?">
            <p className="text-sm">Luftfeuchtigkeit beschreibt den Gehalt an Wasserdampf in der Luft. In der Pflanzenzucht wird sie meist als relative Luftfeuchtigkeit (RH) in Prozent angegeben und beeinflusst maßgeblich die Verdunstung und Nährstoffaufnahme.</p>
            <div className="mt-3 bg-gray-100 p-3 rounded-lg text-sm">
              <p className="font-semibold mb-1">Warum ist sie wichtig?</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Beeinflusst die Transpiration (Wasserabgabe) der Pflanze</li>
                <li>Steuert indirekt die Nährstoffaufnahme</li>
                <li>Wirkt sich auf die Blatt- und Wurzelentwicklung aus</li>
                <li>Kann Schädlings- und Krankheitsbefall beeinflussen</li>
              </ul>
            </div>
          </InfoBox>
          
          {/* Box 2: Optimale Luftfeuchtigkeit nach Phase */}
          <InfoBox title="Optimale Luftfeuchtigkeit">
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
            <div className="p-3 rounded-lg bg-gray-50 text-center mb-3">
              <div className="text-2xl font-bold">
                {selectedGrowPhase === 'seedling' ? '70-80%' : 
                 selectedGrowPhase === 'veg' ? '50-70%' : '40-50%'}
              </div>
              <div className="text-sm text-gray-500">
                Relative Luftfeuchtigkeit (RH)
              </div>
            </div>
            <p className="text-sm">
              {selectedGrowPhase === 'seedling' 
                ? 'Hohe Luftfeuchtigkeit unterstützt Sämlinge, da das Wurzelsystem noch nicht voll entwickelt ist. Sie nehmen Wasser auch über die Blätter auf.' 
                : selectedGrowPhase === 'veg' 
                ? 'Während der Vegetation sollte die Luftfeuchtigkeit schrittweise reduziert werden, um die Entwicklung eines starken Wurzelsystems zu fördern.' 
                : 'Niedrigere Luftfeuchtigkeit während der Blüte reduziert das Risiko von Schimmel und fördert die Harzproduktion.'}
            </p>
          </InfoBox>
          
          {/* Box 3: Luftfeuchtigkeitsmanagement */}
          <InfoBox title="Management der Luftfeuchtigkeit">
            <div className="space-y-2 text-sm">
              <div className="bg-green-50 p-2 rounded-lg mb-2">
                <p className="font-bold">Erhöhung der Luftfeuchtigkeit</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>Luftbefeuchter einsetzen</li>
                  <li>Wasserschalen aufstellen</li>
                  <li>Pflanzen leicht besprühen</li>
                  <li>Belüftung reduzieren</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-2 rounded-lg">
                <p className="font-bold">Senkung der Luftfeuchtigkeit</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>Belüftung erhöhen</li>
                  <li>Luftentfeuchter einsetzen</li>
                  <li>Temperatur leicht erhöhen</li>
                  <li>Weniger Pflanzen pro Fläche</li>
                </ul>
              </div>
            </div>
          </InfoBox>
          
          {/* Box 4: Probleme mit Luftfeuchtigkeit */}
          <InfoBox title="Probleme mit Luftfeuchtigkeit" colSpan="col-span-1 md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="font-bold">Zu niedrige Luftfeuchtigkeit</p>
                <p><strong>Symptome:</strong></p>
                <ul className="list-disc pl-5">
                  <li>Verlangsamstes Wachstum</li>
                  <li>Welkende, trockene Blätter</li>
                  <li>Erhöhter Wasserbedarf</li>
                  <li>Anfälligkeit für Spinnmilben</li>
                </ul>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="font-bold">Zu hohe Luftfeuchtigkeit</p>
                <p><strong>Symptome:</strong></p>
                <ul className="list-disc pl-5">
                  <li>Mehltau und Schimmelbildung</li>
                  <li>Wurzelfäule</li>
                  <li>Botrytis (Grauschimmel)</li>
                  <li>Schwächere Nährstoffaufnahme</li>
                </ul>
              </div>
            </div>
          </InfoBox>
          
          {/* Box 5: VPD-Wert */}
          <InfoBox title="VPD-Wert">
            <p className="text-sm">Der VPD-Wert (Vapor Pressure Deficit) beschreibt das Zusammenspiel von Luftfeuchtigkeit und Temperatur. Er ist ein präziserer Wert als nur die relative Luftfeuchtigkeit, um ideale Wachstumsbedingungen zu bestimmen.</p>
            <div className="mt-3 bg-gray-100 p-3 rounded-lg text-sm">
              <p className="font-semibold">Optimale VPD-Werte:</p>
              <ul className="list-none pl-2 mt-1 space-y-1">
                <li><strong>Sämlinge:</strong> 0.4 - 0.8 kPa</li>
                <li><strong>Vegetation:</strong> 0.8 - 1.2 kPa</li>
                <li><strong>Frühe Blüte:</strong> 1.0 - 1.5 kPa</li>
                <li><strong>Späte Blüte:</strong> 1.2 - 1.8 kPa</li>
              </ul>
            </div>
          </InfoBox>
          
          {/* Box 6: Dr. Cannabis Tipp */}
          <InfoBox>
            <div className="bg-yellow-100 p-3 rounded-lg border-l-4 border-yellow-500 h-full">
              <p className="font-semibold">Dr. Cannabis Tipp:</p>
              <p className="text-sm mt-1">Investiere in ein gutes Hygrometer und einen Luftfeuchtigkeitsregler mit automatischer Funktion. Platziere mehrere Messstationen in verschiedenen Höhen im Raum, da Luftfeuchtigkeit nicht gleichmäßig verteilt ist.</p>
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
