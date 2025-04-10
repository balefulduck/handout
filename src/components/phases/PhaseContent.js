'use client';

import React, { useState, useEffect } from 'react';
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

// Color mapping based on content type for consistent theming
const contentTypeColors = {
  temperature: 'text-orange-500 bg-orange-50 border-orange-200',
  humidity: 'text-blue-500 bg-blue-50 border-blue-200',
  light: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  ph: 'text-purple-500 bg-purple-50 border-purple-200',
  pots: 'text-olive-green bg-olive-green/10 border-olive-green/30',
  info: 'text-medium-blue bg-medium-blue/10 border-medium-blue/30',
  ready: 'text-green-600 bg-green-50 border-green-200',
  methods: 'text-indigo-500 bg-indigo-50 border-indigo-200',
  drying: 'text-amber-600 bg-amber-50 border-amber-200',
  curing: 'text-teal-600 bg-teal-50 border-teal-200',
  default: 'text-gray-700 bg-gray-50 border-gray-200'
};

// Helper function to determine if content should be centered
const shouldCenterContent = (values) => {
  // Center if all values are short (less than 50 characters)
  return values.every(value => value.length < 50);
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
      <div className="py-4">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-lg border border-gray-200"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h3 className="text-red-600 font-bold">Fehler beim Laden der Daten</h3>
          <p className="text-red-500 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors"
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
      <div className="py-4">
        <p className="text-gray-500 text-center">Keine Daten verfügbar für diese Phase.</p>
      </div>
    );
  }

  // Group data by category for better organization
  const groupedData = {
    environmental: phaseData.filter(item => 
      ['temperature', 'humidity', 'light', 'ph'].includes(item.content_type)
    ),
    growing: phaseData.filter(item => 
      ['pots', 'ready', 'methods'].includes(item.content_type)
    ),
    harvest: phaseData.filter(item => 
      ['drying', 'curing'].includes(item.content_type)
    ),
    info: phaseData.filter(item => 
      ['info'].includes(item.content_type)
    )
  };

  return (
    <div className="py-3">
      {/* Info cards - full width and prominent if they exist */}
      {groupedData.info.length > 0 && (
        <div className="mb-6">
          {groupedData.info.map((item) => (
            <div 
              key={`${item.phase}-${item.content_type}`}
              className="bg-white rounded-lg border border-gray-200 p-4 mb-4 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                {contentTypeIcons[item.content_type] && (
                  <span className={`p-2 rounded-full ${contentTypeColors[item.content_type] || contentTypeColors.default}`}>
                    {React.createElement(contentTypeIcons[item.content_type], { className: "text-lg" })}
                  </span>
                )}
                {item.tooltip ? (
                  <DrcInfoTag 
                    term={item.content_type}
                    color={item.color_theme}
                    tooltipContent={item.tooltip}
                  >
                    <h3 className="font-bold text-gray-800">{item.title}</h3>
                  </DrcInfoTag>
                ) : (
                  <h3 className="font-bold text-gray-800">{item.title}</h3>
                )}
              </div>
              <div className="font-dosis space-y-1 pl-10">
                {item.values.map((value, valueIndex) => (
                  <p key={valueIndex} className="text-gray-700">{value}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Environmental parameters - compact grid */}
      {groupedData.environmental.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm uppercase text-gray-500 font-semibold mb-3">Umgebungsparameter</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {groupedData.environmental.map((item) => {
              const Icon = contentTypeIcons[item.content_type] || contentTypeIcons.default;
              const colorClasses = contentTypeColors[item.content_type] || contentTypeColors.default;
              const centerContent = shouldCenterContent(item.values);
              
              return (
                <div 
                  key={`${item.phase}-${item.content_type}`}
                  className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className={`text-lg ${colorClasses.split(' ')[0]}`} />
                    {item.tooltip ? (
                      <DrcInfoTag 
                        term={item.content_type}
                        color={item.color_theme}
                        tooltipContent={item.tooltip}
                      >
                        <span className="text-sm font-bold text-gray-800">{item.title}</span>
                      </DrcInfoTag>
                    ) : (
                      <span className="text-sm font-bold text-gray-800">{item.title}</span>
                    )}
                  </div>
                  <div className={`font-dosis pl-6 space-y-0.5 ${centerContent ? 'text-center pl-0' : ''}`}>
                    {item.values.map((value, valueIndex) => (
                      <p key={valueIndex} className="text-sm text-gray-700">{value}</p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Growing techniques - medium cards */}
      {groupedData.growing.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm uppercase text-gray-500 font-semibold mb-3">Anbautechniken</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {groupedData.growing.map((item) => {
              const Icon = contentTypeIcons[item.content_type] || contentTypeIcons.default;
              const colorClasses = contentTypeColors[item.content_type] || contentTypeColors.default;
              const centerContent = shouldCenterContent(item.values);
              
              return (
                <div 
                  key={`${item.phase}-${item.content_type}`}
                  className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="mb-2">
                    {item.tooltip ? (
                      <DrcInfoTag 
                        term={item.content_type}
                        color={item.color_theme}
                        tooltipContent={item.tooltip}
                      >
                        <span className="font-bold text-gray-800 break-words w-full">{item.title}</span>
                      </DrcInfoTag>
                    ) : (
                      <span className="font-bold text-gray-800 break-words w-full">{item.title}</span>
                    )}
                  </div>
                  <div className={`font-dosis space-y-1 ${centerContent ? 'text-center' : ''}`}>
                    {item.values.map((value, valueIndex) => (
                      <p key={valueIndex} className="text-sm text-gray-700">{value}</p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Harvest techniques - medium cards */}
      {groupedData.harvest.length > 0 && (
        <div>
          <h4 className="text-sm uppercase text-gray-500 font-semibold mb-3">Erntetechniken</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {groupedData.harvest.map((item) => {
              const Icon = contentTypeIcons[item.content_type] || contentTypeIcons.default;
              const colorClasses = contentTypeColors[item.content_type] || contentTypeColors.default;
              const centerContent = shouldCenterContent(item.values);
              
              return (
                <div 
                  key={`${item.phase}-${item.content_type}`}
                  className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="mb-2">
                    {item.tooltip ? (
                      <DrcInfoTag 
                        term={item.content_type}
                        color={item.color_theme}
                        tooltipContent={item.tooltip}
                      >
                        <span className="font-bold text-gray-800 break-words w-full">{item.title}</span>
                      </DrcInfoTag>
                    ) : (
                      <span className="font-bold text-gray-800 break-words w-full">{item.title}</span>
                    )}
                  </div>
                  <div className={`font-dosis space-y-1 ${centerContent ? 'text-center' : ''}`}>
                    {item.values.map((value, valueIndex) => (
                      <p key={valueIndex} className="text-sm text-gray-700">{value}</p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
