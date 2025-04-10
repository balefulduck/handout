'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import PageHeader from '../components/PageHeader';
import InfoBox from '../components/InfoBox';
import ProductAd from '../components/ProductAd';
import RelatedTerms from '../components/RelatedTerms';

// This is a map of basic information for terms without dedicated pages
// More complex terms should have their own page files
const termDetails = {
  'nährstoffe': {
    title: 'Nährstoffe',
    icon: '/1.webp',
    description: 'Grundlegende Informationen zu Pflanzennährstoffen und ihrer Bedeutung für das Wachstum.',
    relatedTerms: ['ph', 'ec-wert', 'bewässerung', 'lichtplan'],
    productAd: null
    /* Temporarily disabled
    productAd: {
      name: 'Dünger-Komplett-Set',
      image: '/aci.png',
      description: 'Vollständiges Dünger-Set für den gesamten Lebenszyklus deiner Pflanzen.',
      regularPrice: '49,99 €',
      salePrice: '42,99 €'
    }
    */
  },
  'ec-wert': {
    title: 'EC-Wert',
    icon: '/1.webp',
    description: 'Der EC-Wert (Electrical Conductivity) misst die elektrische Leitfähigkeit einer Nährlösung und zeigt die Konzentration gelöster Salze an.',
    relatedTerms: ['ph', 'nährstoffe', 'bewässerung'],
    productAd: null
    /* Temporarily disabled
    productAd: {
      name: 'Digital EC Messgerät',
      image: '/aci.png',
      description: 'Präzise EC-Messung mit automatischer Temperaturkompensation. Ideal für Hydrokultur und Bodenanbau.',
      regularPrice: '29,99 €',
      salePrice: '24,99 €'
    }
    */
  },
  // Add more basic terms here as needed
};

export default function DrcInfoPage() {
  const params = useParams();
  const term = params.term;
  
  // Try to find the term in our database, default to generic if not found
  const details = termDetails[term] || {
    title: term.charAt(0).toUpperCase() + term.slice(1), // Capitalize the first letter
    icon: '/1.webp',
    description: 'Detaillierte Informationen zu diesem Begriff sind noch nicht verfügbar.',
    relatedTerms: ['ph', 'lichtplan', 'nährstoffe'],
    productAd: null
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader title={details.title} icon={details.icon} />
      
      {/* Main Content */}
      <main className="container mx-auto max-w-5xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Main Description */}
          <InfoBox title="Beschreibung" colSpan="col-span-1 md:col-span-3">
            <p>{details.description}</p>
          </InfoBox>
          
          {/* Coming Soon Message */}
          <InfoBox colSpan="col-span-1 md:col-span-3">
            <div className="bg-blue-50 p-5 rounded-lg text-center">
              <h3 className="text-lg font-semibold mb-3">Ausführliche Informationen folgen bald</h3>
              <p className="text-sm">
                Wir arbeiten daran, ausführliche Informationen zu diesem Begriff bereitzustellen. 
                Besuche diese Seite bald wieder oder schau dir die verwandten Begriffe an.
              </p>
            </div>
          </InfoBox>
          
          {/* Product Ad - temporarily disabled */}
          {/* {details.productAd && <ProductAd product={details.productAd} />} */}
          
          {/* Related Terms */}
          <RelatedTerms terms={details.relatedTerms} />
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
