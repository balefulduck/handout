'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowLeft, FaShoppingCart } from 'react-icons/fa';
import { useParams } from 'next/navigation';

// This is a map of all available detailed information
// We'll add more terms as needed
const termDetails = {
  'ph': {
    title: 'pH Wert',
    icon: '/1.webp',
    // Content is now managed in the component for better layout control
    relatedTerms: ['nährstoffe', 'ec-wert', 'bewässerung'],
    productAd: {
      name: 'Digital pH Meter Pro',
      image: '/aci.png',
      description: 'Präzise pH-Messung mit 0.01 Genauigkeit. Wasserdicht, einfache Kalibrierung.',
      regularPrice: '39,99 €',
      salePrice: '35,99 €'
    }
  }
  // Add more terms here as needed
};

export default function DrcInfoPage() {
  const params = useParams();
  const term = params.term;
  
  // Get the term details, default to empty if not found
  const details = termDetails[term] || {
    title: term,
    icon: '/1.webp',
    content: '<p>Detaillierte Informationen zu diesem Begriff sind noch nicht verfügbar.</p>',
    relatedTerms: []
  };

  // Content specifically for pH term (could be moved to a separate component for cleaner code)
  const renderPhContent = () => {
    if (term !== 'ph') return null;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Box 1: What is pH */}
        <div className="bg-white rounded-xl shadow-sm p-5 col-span-1">
          <h2 className="text-xl font-semibold mb-3">Was ist der pH-Wert?</h2>
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
        </div>
        
        {/* Box 2: Optimal pH values */}
        <div className="bg-white rounded-xl shadow-sm p-5 col-span-1">
          <h2 className="text-xl font-semibold mb-3">Optimale Werte</h2>
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
                <td className="p-2 text-right font-mono">5.8 - 6.8</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">Vegetation</td>
                <td className="p-2 text-right font-mono">5.8 - 6.5</td>
              </tr>
              <tr>
                <td className="p-2">Blüte</td>
                <td className="p-2 text-right font-mono">5.8 - 6.2</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Box 3: Measurement methods */}
        <div className="bg-white rounded-xl shadow-sm p-5 col-span-1">
          <h2 className="text-xl font-semibold mb-3">Messmethoden</h2>
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
        </div>
        
        {/* Box 4: Common problems - Wide box */}
        <div className="bg-white rounded-xl shadow-sm p-5 col-span-1 md:col-span-2">
          <h2 className="text-xl font-semibold mb-3">Häufige Probleme</h2>
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
        </div>
        
        {/* Box 5: Dr. Cannabis Tip */}
        <div className="bg-white rounded-xl shadow-sm p-5 col-span-1">
          <div className="bg-yellow-100 p-3 rounded-lg border-l-4 border-yellow-500 h-full">
            <p className="font-semibold">Dr. Cannabis Tipp:</p>
            <p className="text-sm mt-1">Überprüfe den pH-Wert bei jeder Bewässerung, besonders wenn du Nährstoffe hinzufügst. Führe ein Protokoll für bessere Ergebnisse.</p>
          </div>
        </div>
        
        {/* Box 6: Product Ad */}
        <div className="bg-white rounded-xl shadow-sm p-5 col-span-1 md:col-span-3 relative overflow-hidden">
          <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg transform rotate-3 text-sm font-bold z-10">
            -10 % für Dich als Dr. Cannabis Workshop Besucher
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="md:w-1/4 flex-shrink-0">
              <Image 
                src={details.productAd.image} 
                width={250} 
                height={250} 
                alt={details.productAd.name}
                className="rounded-lg" 
              />
            </div>
            <div className="md:w-3/4">
              <h3 className="text-xl font-bold mb-2">{details.productAd.name}</h3>
              <p className="text-gray-600 mb-3">{details.productAd.description}</p>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-gray-400 line-through">{details.productAd.regularPrice}</span>
                <span className="text-xl font-bold text-green-600">{details.productAd.salePrice}</span>
              </div>
              <button className="px-4 py-2 bg-olive-green text-white rounded-lg hover:bg-olive-green/90 transition-colors flex items-center gap-2">
                <FaShoppingCart size={14} />
                <span>In den Warenkorb</span>
              </button>
            </div>
          </div>
        </div>

        {/* Related Terms */}
        {details.relatedTerms && details.relatedTerms.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-5 col-span-1 md:col-span-3 mt-4">
            <h3 className="text-lg font-semibold mb-3">Verwandte Begriffe:</h3>
            <div className="flex flex-wrap gap-2">
              {details.relatedTerms.map((relatedTerm) => (
                <Link 
                  key={relatedTerm}
                  href={`/drc-info/${relatedTerm}`}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors"
                >
                  {relatedTerm}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-olive-green text-white p-4 shadow-md">
        <div className="container mx-auto max-w-5xl">
          <Link href="/growguide" className="flex items-center gap-2 w-fit text-white hover:text-yellow-50 transition-colors">
            <FaArrowLeft />
            <span>Zurück zum Grow Guide</span>
          </Link>
          <div className="flex items-center gap-3 mt-4">
            <Image 
              src={details.icon} 
              width={60} 
              height={60} 
              alt="Dr. Cannabis Icon" 
              className="rounded-full border-2 border-white" 
              priority 
            />
            <h1 className="text-2xl font-bold">{details.title}</h1>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto max-w-5xl py-6 px-4">
        {term === 'ph' ? renderPhContent() : (
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="prose max-w-none">
              <p>Detaillierte Informationen zu diesem Begriff sind noch nicht verfügbar.</p>
            </div>
            
            {/* Related Terms for non-pH terms */}
            {details.relatedTerms && details.relatedTerms.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-3">Verwandte Begriffe:</h3>
                <div className="flex flex-wrap gap-2">
                  {details.relatedTerms.map((relatedTerm) => (
                    <Link 
                      key={relatedTerm}
                      href={`/drc-info/${relatedTerm}`}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors"
                    >
                      {relatedTerm}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-100 py-4 mt-8">
        <div className="container mx-auto max-w-4xl px-4 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Dr. Cannabis - Alle Fachbegriffe und Informationen zum Nachschlagen
        </div>
      </footer>
    </div>
  );
}
