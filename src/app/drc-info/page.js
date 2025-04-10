'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaSearch, FaLeaf, FaTemperatureHigh, FaWater, FaLightbulb, FaFlask } from 'react-icons/fa';

// List of available terms with metadata
const availableTerms = [
  {
    id: 'ph',
    title: 'pH Wert',
    description: 'Maß für Säure/Base einer Lösung (Skala 0-14)',
    icon: <FaFlask className="text-olive-green" />,
    category: 'chemie'
  },
  {
    id: 'temperatur',
    title: 'Temperatur',
    description: 'Optimale Temperaturbereiche für verschiedene Wachstumsphasen',
    icon: <FaTemperatureHigh className="text-yellow-600" />,
    category: 'umgebung'
  },
  {
    id: 'luftfeuchtigkeit',
    title: 'Luftfeuchtigkeit',
    description: 'Einfluss und Kontrolle der Luftfeuchtigkeit auf das Pflanzenwachstum',
    icon: <FaWater className="text-blue-500" />,
    category: 'umgebung'
  },
  {
    id: 'lichtzyklus',
    title: 'Lichtzyklus',
    description: 'Lichtzyklen für vegetative und Blütephasen',
    icon: <FaLightbulb className="text-yellow-400" />,
    category: 'licht'
  },
  {
    id: 'lichtplan',
    title: 'Lichtplan',
    description: 'Optimale Beleuchtungsstrategien für maximale Erträge',
    icon: <FaLightbulb className="text-yellow-400" />,
    category: 'licht'
  },
  {
    id: 'nährstoffe',
    title: 'Nährstoffe',
    description: 'Grundlegende Informationen zu Pflanzennährstoffen und ihrer Bedeutung für das Wachstum',
    icon: <FaLeaf className="text-green-500" />,
    category: 'ernährung'
  },
  {
    id: 'ec-wert',
    title: 'EC-Wert',
    description: 'Der EC-Wert misst die elektrische Leitfähigkeit einer Nährlösung',
    icon: <FaFlask className="text-olive-green" />,
    category: 'chemie'
  }
];

// Categories with colors
const categories = {
  'umgebung': { name: 'Umgebung', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  'licht': { name: 'Licht', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  'ernährung': { name: 'Ernährung', color: 'bg-green-100 text-green-800 border-green-200' },
  'chemie': { name: 'Chemie', color: 'bg-purple-100 text-purple-800 border-purple-200' }
};

export default function DrcInfoLanding() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTerms, setFilteredTerms] = useState(availableTerms);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filter terms based on search and category
  useEffect(() => {
    let results = availableTerms;
    
    // Filter by search term
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      results = results.filter(term => 
        term.title.toLowerCase().includes(lowercasedSearch) || 
        term.description.toLowerCase().includes(lowercasedSearch)
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      results = results.filter(term => term.category === selectedCategory);
    }
    
    setFilteredTerms(results);
  }, [searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-olive-green text-white p-6 shadow-md relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" 
          style={{
            backgroundImage: `url('/cb.jpg')`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            filter: 'blur(1px)'
          }}
        ></div>
        <div className="container mx-auto max-w-5xl relative z-10">
          <Link href="/growguide" className="flex items-center gap-2 w-fit text-white/80 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Zurück zum Grow Guide</span>
          </Link>
          
          <div className="flex items-center gap-4 mt-6">
            <Image 
              src="/1.webp" 
              width={70} 
              height={70} 
              alt="Dr. Cannabis"
              className="rounded-full border-2 border-white shadow-lg" 
            />
            <div>
              <h1 className="text-3xl font-bold">Dr. Cannabis Lexikon</h1>
              <p className="text-white/80 mt-1">Dein Nachschlagewerk für alle Fachbegriffe rund um den Cannabis-Anbau</p>
            </div>
          </div>
        </div>
      </header>
      
      {/* Search Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto max-w-5xl py-4 px-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-olive-green focus:border-olive-green"
              placeholder="Suche nach Begriffen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="container mx-auto max-w-5xl px-6 py-8">
        {/* Category Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'all' ? 'bg-olive-green text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setSelectedCategory('all')}
          >
            Alle Begriffe
          </button>
          
          {Object.entries(categories).map(([id, category]) => (
            <button
              key={id}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === id ? 'bg-olive-green text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedCategory(id)}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTerms.length > 0 ? (
            filteredTerms.map(term => (
              <Link 
                href={`/drc-info/${term.id}`} 
                key={term.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      {term.icon}
                    </div>
                    <h3 className="font-bold text-gray-800">{term.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{term.description}</p>
                  <div className={`text-xs inline-block px-2 py-1 rounded-full border ${categories[term.category].color}`}>
                    {categories[term.category].name}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <div className="text-gray-400 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-1">Keine Ergebnisse gefunden</h3>
              <p className="text-gray-500">Versuche einen anderen Suchbegriff oder wähle eine andere Kategorie</p>
            </div>
          )}
        </div>
        
        {/* Coming Soon Section */}
        <div className="mt-12 bg-blue-50 rounded-xl p-6 border border-blue-100">
          <h2 className="text-xl font-bold text-blue-800 mb-3">Das Lexikon wächst!</h2>
          <p className="text-blue-700 mb-4">
            Wir erweitern unser Dr. Cannabis Lexikon ständig mit neuen Begriffen und detaillierten Informationen. 
            Schau regelmäßig vorbei, um neue Einträge zu entdecken.
          </p>
          <div className="flex flex-wrap gap-3">
            <div className="bg-white px-3 py-2 rounded-lg border border-blue-200 text-sm text-blue-800">
              Demnächst: Schädlingsbekämpfung
            </div>
            <div className="bg-white px-3 py-2 rounded-lg border border-blue-200 text-sm text-blue-800">
              Demnächst: Genetik & Sorten
            </div>
            <div className="bg-white px-3 py-2 rounded-lg border border-blue-200 text-sm text-blue-800">
              Demnächst: Anbaumethoden
            </div>
          </div>
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
