'use client';

import { useState, useEffect } from 'react';
import { WiHumidity } from "react-icons/wi";
import { PiThermometerSimple, PiPlantBold, PiTestTubeFill } from "react-icons/pi";
import { LuSunMedium } from "react-icons/lu";
import DrcInfoTag from '../DrcInfoTag';

// Icon mapping based on content type
const contentTypeIcons = {
  temperature: PiThermometerSimple,
  humidity: WiHumidity,
  light: LuSunMedium,
  ph: PiTestTubeFill,
  pots: PiPlantBold,
  info: PiPlantBold,
  ready: PiPlantBold,
  methods: PiPlantBold,
  drying: PiPlantBold,
  curing: PiPlantBold,
  default: PiPlantBold
};

export default function PhaseContent({ phaseName }) {
  const [phaseData, setPhaseData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPhaseContent = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/phases?phase=${phaseName}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch phase content: ${response.status}`);
        }
        const data = await response.json();
        setPhaseData(data.phaseContent || []);
      } catch (err) {
        console.error('Error fetching phase content:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (phaseName) {
      fetchPhaseContent();
    }
  }, [phaseName]);



  if (isLoading) {
    return (
      <div className="py-6 px-4 text-center">
        <div className="animate-pulse p-8 bg-gray-100 rounded-xl">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 px-4 text-center">
        <div className="bg-red-50 p-8 rounded-xl border border-red-200">
          <h3 className="text-red-600 font-bold">Fehler beim Laden der Daten</h3>
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Neu laden
          </button>
        </div>
      </div>
    );
  }

  // Early return if no data
  if (!phaseData.length) {
    return (
      <div className="py-6 px-4 text-center">
        <p>Keine Daten verfügbar für diese Phase.</p>
      </div>
    );
  }

  return (
    <div className="py-6 px-4">
      
      <div className="max-w-3xl mx-auto mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 auto-rows-fr">
          {phaseData.map((item, itemIndex) => {
            const Icon = contentTypeIcons[item.content_type] || contentTypeIcons.default;
            
            // Determine if this should be full-width
            const isFullWidth = item.content_type === 'pots' || item.content_type === 'info';
            
            return (
              <div 
                key={`${item.phase}-${item.content_type}`} 
                className={`rounded-xl shadow-lg overflow-hidden relative flex flex-col h-full ${isFullWidth ? 'col-span-1 sm:col-span-2 md:col-span-3' : ''}`}
              >
                {/* Single background image for the entire card */}
                <div 
                  className="absolute inset-0 z-0" 
                  style={{
                    backgroundImage: `url('/cb.jpg')`,
                    backgroundPosition: `${(itemIndex % 5) * 25}% ${(itemIndex % 3) * 33}%`,
                    backgroundSize: 'cover',
                    filter: 'blur(1px) brightness(0.5)',
                    opacity: 0.85
                  }}
                ></div>
                <div className="absolute inset-0 bg-black opacity-50 z-1"></div>
                
                <div className="bg-olive-green/80 p-3 relative overflow-hidden z-10">
                  <div className="flex items-center gap-2 relative z-20">
                    <Icon className="text-base text-white" />
                    {item.tooltip ? (
                      <DrcInfoTag 
                        term={item.content_type} 
                        color={item.color_theme} 
                        bgMode="dark"
                        tooltipContent={item.tooltip}
                      >
                        {item.title}
                      </DrcInfoTag>
                    ) : (
                      <span className="text-base font-bold text-white">{item.title}</span>
                    )}
                  </div>
                </div>
                <div className="p-4 rounded-b-xl relative overflow-hidden font-dosis z-10 flex-grow" style={{ color: 'white' }}>
                  {/* Additional dark overlay for better text readability - fill entire card */}
                  <div className="absolute inset-0 bg-black opacity-30 z-1"></div>
                  {item.values.map((value, valueIndex) => (
                    <div key={valueIndex} className={`${valueIndex > 0 ? 'mt-2' : ''} relative z-20`}>
                      <span className="text-base text-white font-dosis tracking-wide">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
