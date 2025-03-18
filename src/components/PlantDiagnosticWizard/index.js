'use client';

import { useState } from 'react';
import { FaArrowLeft, FaCheck } from 'react-icons/fa';
import StepSelector from './Steps/StepSelector';
import StepRefinement from './Steps/StepRefinement';
import StepDiagnosis from './Steps/StepDiagnosis';

export default function PlantDiagnosticWizard({ onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  // Track diagnostic path
  const [primarySymptom, setPrimarySymptom] = useState(null);
  const [refinementAnswers, setRefinementAnswers] = useState({});
  const [diagnosis, setDiagnosis] = useState(null);
  
  // Navigation functions
  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  
  // Process answers to determine diagnosis
  const processDiagnosis = () => {
    // Simple decision tree logic based on selected symptoms and refinement answers
    let result = {
      title: '',
      description: '',
      causes: [],
      solutions: [],
      severity: 'medium', // low, medium, high
      needsExpertHelp: false
    };
    
    if (primarySymptom.id === 'discoloration') {
      if (refinementAnswers.location === 'lower') {
        result = {
          title: 'Nährstoffmangel - Stickstoff',
          description: 'Die Verfärbung der unteren Blätter deutet auf einen Stickstoffmangel hin.',
          causes: [
            'Unzureichende Nährstoffversorgung',
            'Falsche pH-Werte im Substrat (beeinträchtigt die Nährstoffaufnahme)',
            'Überreife Pflanze (natürlicher Prozess gegen Ende der Blüte)'
          ],
          solutions: [
            'Erhöhe die Stickstoffzufuhr mit geeignetem Dünger',
            'Kontrolliere den pH-Wert des Substrats (optimal: 6.0-6.5 in Erde, 5.5-6.0 in Hydro)',
            'Stelle sicher, dass die Bewässerung regelmäßig erfolgt'
          ],
          severity: 'medium',
          needsExpertHelp: false
        };
      } else if (refinementAnswers.location === 'upper') {
        result = {
          title: 'Nährstoffüberschuss oder Lichtbrand',
          description: 'Verfärbungen an den oberen Blättern können durch zu viel Dünger oder zu intensives Licht verursacht werden.',
          causes: [
            'Überdüngung (Nährstoffüberschuss)',
            'Zu starkes oder zu nahes Licht',
            'Hitzestress'
          ],
          solutions: [
            'Reduziere die Düngermenge',
            'Erhöhe den Abstand zwischen Pflanzen und Lichtquelle',
            'Verbessere die Belüftung, um Hitzestau zu vermeiden'
          ],
          severity: 'medium',
          needsExpertHelp: false
        };
      } else if (refinementAnswers.location === 'spots') {
        result = {
          title: 'Mögliche Pilzinfektion oder Nährstoffungleichgewicht',
          description: 'Flecken auf den Blättern können auf eine Pilzinfektion oder ein Ungleichgewicht bei den Mikronährstoffen hindeuten.',
          causes: [
            'Pilzbefall (z.B. Mehltau)',
            'Magnesiummangel',
            'Calciummangel',
            'Zu hohe Luftfeuchtigkeit'
          ],
          solutions: [
            'Reduziere die Luftfeuchtigkeit',
            'Verbessere die Luftzirkulation',
            'Ergänze Magnesium und Calcium',
            'Erwäge die Anwendung eines biologischen Fungizids'
          ],
          severity: 'high',
          needsExpertHelp: true
        };
      }
    } else if (primarySymptom.id === 'growth-issues') {
      if (refinementAnswers.type === 'stunted') {
        result = {
          title: 'Gehemmtes Wachstum',
          description: 'Das verlangsamte Wachstum könnte auf verschiedene Faktoren zurückzuführen sein.',
          causes: [
            'Unzureichende Lichtverhältnisse',
            'Wurzelprobleme (z.B. eingeschränkter Topfraum)',
            'Temperatur außerhalb des optimalen Bereichs',
            'Unausgewogene Nährstoffversorgung'
          ],
          solutions: [
            'Optimiere die Lichtbedingungen (Intensität und Dauer)',
            'Überprüfe, ob die Pflanzen umgetopft werden müssen',
            'Stelle sicher, dass die Temperatur zwischen 20-28°C liegt',
            'Überprüfe die Nährstoffversorgung und pH-Werte'
          ],
          severity: 'medium',
          needsExpertHelp: false
        };
      } else if (refinementAnswers.type === 'stretching') {
        result = {
          title: 'Übermäßige Streckung',
          description: 'Die Pflanze streckt sich stark, was auf Lichtmangel hindeutet.',
          causes: [
            'Unzureichende Lichtstärke',
            'Zu großer Abstand zur Lichtquelle',
            'Ungleichmäßige Lichtverteilung'
          ],
          solutions: [
            'Erhöhe die Lichtstärke',
            'Reduziere den Abstand zwischen Pflanzen und Lichtquelle',
            'Sorge für eine gleichmäßigere Lichtverteilung'
          ],
          severity: 'medium',
          needsExpertHelp: false
        };
      } else if (refinementAnswers.type === 'wilting') {
        result = {
          title: 'Welkende Pflanze',
          description: 'Eine welkende Pflanze kann auf Probleme mit der Wasserzufuhr oder Krankheiten hindeuten.',
          causes: [
            'Unzureichende Bewässerung (zu wenig oder zu viel)',
            'Wurzelfäule durch Überwässerung',
            'Hitze- oder Trockenstress',
            'Mögliche Wurzelerkrankungen'
          ],
          solutions: [
            'Passe den Bewässerungszyklus an (fühle die Erde)',
            'Stelle sicher, dass der Topf eine gute Drainage hat',
            'Reguliere die Umgebungstemperatur',
            'Überprüfe die Wurzeln auf Anzeichen von Fäulnis'
          ],
          severity: 'high',
          needsExpertHelp: true
        };
      }
    }
    
    setDiagnosis(result);
    nextStep();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md h-full md:h-auto md:max-h-[90vh] md:rounded-lg shadow-lg overflow-y-auto relative">
        <div className="absolute inset-0 pattern-grid opacity-5 pointer-events-none"></div>
        <div className="relative z-10 p-4 md:p-6">
          {/* Header with close button */}
          <div className="flex items-center justify-between mb-2">
            <button 
              type="button" 
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          {/* Progress Indicator */}
          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-6">
            <div 
              className="bg-olive-green h-1.5 rounded-full transition-all duration-300 ease-in-out" 
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}>
            </div>
          </div>
          
          {/* Step Content */}
          {currentStep === 1 && (
            <StepSelector 
              onSelect={(symptom) => {
                setPrimarySymptom(symptom);
                nextStep();
              }}
            />
          )}
          
          {currentStep === 2 && (
            <StepRefinement 
              primarySymptom={primarySymptom}
              answers={refinementAnswers}
              onAnswer={(key, value) => {
                setRefinementAnswers(prev => ({...prev, [key]: value}));
              }}
              onComplete={processDiagnosis}
              onBack={prevStep}
            />
          )}
          
          {currentStep === 3 && (
            <StepDiagnosis 
              diagnosis={diagnosis}
              onRequestHelp={() => {
                // Trigger Dr. Cannabis Hilfe modal from ContextMenu
                window.dispatchEvent(new Event('helpModalClick'));
                onClose();
              }}
              onBack={prevStep}
            />
          )}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <button
                onClick={prevStep}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <FaArrowLeft className="mr-2" size={12} />
                Zurück
              </button>
            )}
            
            {currentStep < 3 && currentStep !== 2 && (
              <button
                onClick={nextStep}
                disabled={!primarySymptom && currentStep === 1}
                className={`ml-auto px-4 py-2 rounded-md text-white flex items-center ${!primarySymptom && currentStep === 1 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-olive-green hover:bg-yellow-green'}`}
              >
                Weiter
                <FaCheck className="ml-2" size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
