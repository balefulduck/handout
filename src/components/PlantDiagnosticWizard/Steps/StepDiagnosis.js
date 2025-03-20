// File: /src/components/PlantDiagnosticWizard/Steps/StepDiagnosis.js
'use client';

import { useState } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaLightbulb, FaQuestionCircle, FaImages, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Image from 'next/image';

export default function StepDiagnosis({ diagnosis, onRequestHelp, onBack }) {
  const [showingImageIndex, setShowingImageIndex] = useState(0);
  
  if (!diagnosis) return null;

  // Determine severity styling
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low':
        return 'text-green-500 bg-green-50 border-green-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high':
        return 'text-red-500 bg-red-50 border-red-200';
      default:
        return 'text-blue-500 bg-blue-50 border-blue-200';
    }
  };

  const severityClass = getSeverityColor(diagnosis.severity);
  
  // Handle reference image navigation
  const hasImages = diagnosis.images && diagnosis.images.length > 0;
  const nextImage = () => {
    if (hasImages) {
      setShowingImageIndex((prev) => (prev + 1) % diagnosis.images.length);
    }
  };
  
  const prevImage = () => {
    if (hasImages) {
      setShowingImageIndex((prev) => (prev === 0 ? diagnosis.images.length - 1 : prev - 1));
    }
  };

  return (
    <div className="space-y-6">
      <div className={`border rounded-md p-4 ${severityClass}`}>
        <div className="flex items-start">
          {diagnosis.severity === 'high' ? (
            <FaExclamationTriangle className="flex-shrink-0 mt-0.5 mr-3" size={18} />
          ) : (
            <FaCheckCircle className="flex-shrink-0 mt-0.5 mr-3" size={18} />
          )}
          <div>
            <h2 className="font-bold text-lg">{diagnosis.title}</h2>
            <p className="mt-1">{diagnosis.description}</p>
          </div>
        </div>
      </div>

      {/* Reference Images Gallery */}
      {hasImages && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center">
            <FaImages className="text-olive-green mr-2" />
            <h3 className="font-medium">Referenzbilder</h3>
          </div>
          <div className="relative aspect-video bg-gray-100">
            <Image 
              src={diagnosis.images[showingImageIndex]} 
              alt={`Referenzbild für ${diagnosis.title}`}
              fill
              className="object-contain"
            />
            
            {diagnosis.images.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50"
                >
                  <FaChevronLeft />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white hover:bg-black/50"
                >
                  <FaChevronRight />
                </button>
                <div className="absolute bottom-2 w-full flex justify-center">
                  <div className="bg-black/30 rounded-full px-3 py-1 text-white text-sm">
                    {showingImageIndex + 1} / {diagnosis.images.length}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Possible Causes */}
      <div className="border border-gray-200 rounded-lg">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center">
          <FaQuestionCircle className="text-olive-green mr-2" />
          <h3 className="font-medium">Mögliche Ursachen</h3>
        </div>
        <div className="p-4">
          <ul className="list-disc ml-5 space-y-1 text-gray-700">
            {diagnosis.causes.map((cause, index) => (
              <li key={index}>{cause}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommended Solutions */}
      <div className="border border-gray-200 rounded-lg">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center">
          <FaLightbulb className="text-olive-green mr-2" />
          <h3 className="font-medium">Lösungsvorschläge</h3>
        </div>
        <div className="p-4">
          <ul className="list-disc ml-5 space-y-2 text-gray-700">
            {diagnosis.solutions.map((solution, index) => (
              <li key={index}>{solution}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Expert Help Section */}
      {diagnosis.needsExpertHelp && (
        <div className="mt-6 p-4 bg-olive-green/10 border border-olive-green/20 rounded-lg">
          <div className="flex items-start">
            <FaExclamationTriangle className="text-olive-green flex-shrink-0 mt-0.5 mr-3" />
            <div>
              <h3 className="font-medium text-olive-green">Professionelle Hilfe empfohlen</h3>
              <p className="mt-1 text-sm text-gray-600 mb-3">
                Dieses Problem könnte eine genauere Analyse erfordern. Unsere Experten helfen dir gerne weiter.
              </p>
              <button
                onClick={onRequestHelp}
                className="px-4 py-2 bg-olive-green text-white rounded-md hover:bg-yellow-green transition-all"
              >
                Dr. Cannabis Hilfe kontaktieren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Try Again Button */}
      <div className="flex justify-center mt-8">
        <button
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          Neue Diagnose starten
        </button>
      </div>
    </div>
  );
}