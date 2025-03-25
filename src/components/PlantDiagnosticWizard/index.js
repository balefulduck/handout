'use client';

import { useState, useEffect } from 'react';
import { FaArrowLeft, FaCheck } from 'react-icons/fa';
import StepSelector from './Steps/StepSelector';
import StepRefinement from './Steps/StepRefinement';
import StepDiagnosis from './Steps/StepDiagnosis';
import { getDiagnosticIssues } from '@/lib/diagnosticData';

export default function PlantDiagnosticWizard({ onClose, userPlantData }) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  // Track diagnostic path
  const [primarySymptom, setPrimarySymptom] = useState(null);
  const [refinementAnswers, setRefinementAnswers] = useState({});
  const [diagnosis, setDiagnosis] = useState(null);
  const [diagnosticIssues, setDiagnosticIssues] = useState([]);
  
  // Fetch diagnostic issues from our database
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const issues = await getDiagnosticIssues();
        setDiagnosticIssues(issues);
      } catch (error) {
        console.error('Failed to fetch diagnostic issues:', error);
        // Use fallback data if fetch fails
        setDiagnosticIssues([]);
      }
    };
    
    fetchIssues();
  }, []);
  
  // Navigation functions
  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  
  // Process answers to determine diagnosis
  const processDiagnosis = () => {
    // Default result structure
    let result = {
      title: 'Unbekanntes Problem',
      description: 'Die genaue Ursache konnte nicht ermittelt werden.',
      causes: ['Mehrere Faktoren könnten eine Rolle spielen'],
      solutions: ['Kontaktiere einen Experten für eine detaillierte Diagnose'],
      severity: 'medium', // low, medium, high
      needsExpertHelp: true,
      images: [] // Reference images for the diagnosis
    };
    
    // First try to match from our database of diagnostic issues
    if (diagnosticIssues.length > 0) {
      // Find matching issues based on symptom category and refinement answers
      const matchingIssues = diagnosticIssues.filter(issue => {
        // Match primary symptom category
        if (issue.category !== primarySymptom.category) return false;
        
        // Check for specific symptom match
        if (issue.symptomId === primarySymptom.id) {
          // For each refinement answer, check if it matches the issue's criteria
          for (const [key, value] of Object.entries(refinementAnswers)) {
            // If the issue has a criteria for this refinement and it doesn't match, return false
            if (issue.criteria && issue.criteria[key] && issue.criteria[key] !== value) {
              return false;
            }
          }
          return true;
        }
        return false;
      });
      
      // If we found matching issues, use the most relevant one (first match for now)
      if (matchingIssues.length > 0) {
        const bestMatch = matchingIssues[0];
        result = {
          title: bestMatch.title,
          description: bestMatch.description,
          causes: bestMatch.causes,
          solutions: bestMatch.solutions,
          severity: bestMatch.severity || 'medium',
          needsExpertHelp: bestMatch.needsExpertHelp || false,
          images: bestMatch.images || []
        };
      }
    }
    
    // If no database match, fall back to our hardcoded decision tree
    if (!result.title || result.title === 'Unbekanntes Problem') {
      // Expanded decision tree for various symptoms
      switch(primarySymptom.id) {
        // Leaf discoloration problems
        case 'discoloration':
          // Further refine based on location and color
          if (refinementAnswers.location === 'lower') {
            if (refinementAnswers.color === 'yellow') {
              result = {
                title: 'Stickstoffmangel',
                description: 'Die gelbe Verfärbung der unteren Blätter deutet auf einen Stickstoffmangel hin.',
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
                needsExpertHelp: false,
                images: ['/images/diagnose/nitrogen-deficiency.jpg']
              };
            } else if (refinementAnswers.color === 'brown') {
              result = {
                title: 'Phosphormangel',
                description: 'Braune/lila Verfärbungen an unteren Blättern deuten auf Phosphormangel hin.',
                causes: [
                  'Unzureichende Phosphorversorgung',
                  'Zu niedrige Temperatur (behindert die Phosphoraufnahme)',
                  'pH-Wert außerhalb des optimalen Bereichs'
                ],
                solutions: [
                  'Verwende einen phosphorreichen Dünger',
                  'Erhöhe die Wurzeltemperatur auf mindestens 18°C',
                  'Passe den pH-Wert an (6.0-6.5 in Erde)'
                ],
                severity: 'medium',
                needsExpertHelp: false,
                images: ['/images/diagnose/phosphorus-deficiency.jpg']
              };
            }
          } else if (refinementAnswers.location === 'upper') {
            if (refinementAnswers.color === 'yellow') {
              result = {
                title: 'Eisenmangel',
                description: 'Gelbe Verfärbungen an den oberen/neuen Blättern weisen auf Eisenmangel hin.',
                causes: [
                  'Unzureichende Eisenversorgung',
                  'Zu hoher pH-Wert im Substrat (blockiert die Eisenaufnahme)',
                  'Überwässerung'
                ],
                solutions: [
                  'Verwende einen eisenhaltigen Dünger oder Eisen-Chelat',
                  'Senke den pH-Wert leicht ab',
                  'Verbessere die Drainage im Substrat'
                ],
                severity: 'medium',
                needsExpertHelp: false,
                images: ['/images/diagnose/iron-deficiency.jpg']
              };
            } else if (refinementAnswers.color === 'brown') {
              result = {
                title: 'Nährstoffüberschuss oder Lichtbrand',
                description: 'Braune Verfärbungen an den oberen Blättern können auf Überdüngung oder Lichtschäden hindeuten.',
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
                needsExpertHelp: false,
                images: ['/images/diagnose/light-burn.jpg']
              };
            }
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
              needsExpertHelp: true,
              images: ['/images/diagnose/leaf-spots.jpg']
            };
          }
          break;
        
        // Leaf deformities
        case 'leaf-deformities':
          if (refinementAnswers.deformity_type === 'curling') {
            result = {
              title: 'Hitzestress oder Überdüngung',
              description: 'Gekräuselte oder sich einrollende Blätter können auf Hitze oder zu viel Dünger hinweisen.',
              causes: [
                'Zu hohe Temperaturen',
                'Überdüngung',
                'Wassermangel'
              ],
              solutions: [
                'Optimiere die Umgebungstemperatur (20-28°C ideal)',
                'Reduziere die Düngermenge',
                'Stelle eine regelmäßige Bewässerung sicher'
              ],
              severity: 'medium',
              needsExpertHelp: false,
              images: ['/images/diagnose/leaf-curl.jpg']
            };
          } else if (refinementAnswers.deformity_type === 'clawing') {
            result = {
              title: 'Stickstoffüberschuss',
              description: 'Krallenförmige Blätter deuten oft auf zu viel Stickstoff hin.',
              causes: [
                'Überdüngung (besonders mit stickstoffreichem Dünger)',
                'pH-Ungleichgewicht'
              ],
              solutions: [
                'Reduziere die Düngermenge',
                'Verwende ausgewogenen Dünger mit weniger Stickstoff',
                'Spüle das Substrat vorsichtig durch, um überschüssige Nährstoffe auszuwaschen'
              ],
              severity: 'medium',
              needsExpertHelp: false,
              images: ['/images/diagnose/nitrogen-toxicity.jpg']
            };
          }
          break;
          
        // Growth Issues
        case 'growth-issues':
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
              needsExpertHelp: false,
              images: ['/images/diagnose/stunted-growth.jpg']
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
              needsExpertHelp: false,
              images: ['/images/diagnose/stretching.jpg']
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
              needsExpertHelp: true,
              images: ['/images/diagnose/wilting.jpg']
            };
          }
          break;
        
        // Handle other cases (new symptoms) with simple default responses
        case 'pests':
          result = {
            title: 'Schädlingsbefall erkannt',
            description: `Es wurden möglicherweise ${refinementAnswers.pest_type || 'Schädlinge'} identifiziert.`,
            causes: [
              'Einschleppung von außen',
              'Unsteriles Substrat oder Werkzeug',
              'Befallene Nachbarpflanzen'
            ],
            solutions: [
              'Isoliere befallene Pflanzen',
              'Behandle mit geeigneten biologischen Mitteln',
              'Verbessere präventive Maßnahmen (regelmäßige Kontrolle)'
            ],
            severity: 'high',
            needsExpertHelp: true,
            images: ['/images/diagnose/pests.jpg']
          };
          break;
          
        case 'mold-mildew':
          result = {
            title: 'Schimmel oder Mehltau erkannt',
            description: `Es wurde ${refinementAnswers.mold_type === 'powdery' ? 'Echter Mehltau' : refinementAnswers.mold_type === 'downy' ? 'Falscher Mehltau' : 'Schimmel'} identifiziert.`,
            causes: [
              'Zu hohe Luftfeuchtigkeit',
              'Unzureichende Luftzirkulation',
              'Übermäßiges Gießen',
              'Sporen in der Umgebung'
            ],
            solutions: [
              'Reduziere die Luftfeuchtigkeit auf 40-50% während der Blüte',
              'Verbessere die Luftzirkulation mit Lüftern',
              'Entferne stark befallene Blätter vorsichtig',
              'Behandle mit speziellen biologischen Fungiziden'
            ],
            severity: 'high',
            needsExpertHelp: true,
            images: ['/images/diagnose/mildew.jpg']
          };
          break;
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
                // Prepare plant data and diagnosis information for help request
                const helpData = {
                  type: 'diagnostic',
                  plantData: userPlantData,
                  diagnosisInfo: {
                    symptom: primarySymptom?.label,
                    refinement: Object.values(refinementAnswers).join(', '),
                    diagnosis: diagnosis?.title,
                    severity: diagnosis?.severity
                  }
                };
                
                // Store diagnosis data for help request in sessionStorage
                sessionStorage.setItem('diagnosticHelpData', JSON.stringify(helpData));
                
                // Trigger Dr. Cannabis Hilfe modal from ContextMenu
                window.dispatchEvent(new CustomEvent('diagnosticHelpClick', { detail: helpData }));
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
};
