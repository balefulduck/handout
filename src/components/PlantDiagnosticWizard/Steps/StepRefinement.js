'use client';

import { useState, useEffect } from 'react';
import { FaLeaf, FaSeedling, FaArrowRight, FaBug, FaWater } from 'react-icons/fa';
import { GiGrowth, GiFlowerPot, GiMushroomCloud } from 'react-icons/gi';
import { BiRootAlt } from 'react-icons/bi';

export default function StepRefinement({ primarySymptom, answers, onAnswer, onComplete, onBack }) {
  const [canProceed, setCanProceed] = useState(false);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    // Expanded questions based on the primary symptom
    switch(primarySymptom?.id) {
      // Leaf Discoloration refinement questions
      case 'discoloration':
        setQuestions([
          {
            id: 'location',
            question: 'Wo sind die Verfärbungen hauptsächlich zu sehen?',
            options: [
              { value: 'lower', label: 'Untere Blätter', icon: '⬇️' },
              { value: 'upper', label: 'Obere Blätter', icon: '⬆️' },
              { value: 'spots', label: 'Flecken auf allen Blättern', icon: '🔍' }
            ]
          },
          {
            id: 'color',
            question: 'Welche Farbe haben die Verfärbungen?',
            options: [
              { value: 'yellow', label: 'Gelb', icon: '🟡' },
              { value: 'brown', label: 'Braun/Rost', icon: '🍃' },
              { value: 'purple', label: 'Lila/Rot', icon: '🌻' },
              { value: 'white', label: 'Weiß/Grau', icon: '⬜️' }
            ]
          }
        ]);
        break;
        
      // Leaf Deformities refinement questions
      case 'leaf-deformities':
        setQuestions([
          {
            id: 'deformity_type',
            question: 'Wie sehen die Verformungen aus?',
            options: [
              { value: 'curling', label: 'Gekräuselt/Eingerollt', icon: '🍂' },
              { value: 'clawing', label: 'Krallen-Form', icon: '🦎' },
              { value: 'twisted', label: 'Verdreht/Verzerrt', icon: '🕫' },
              { value: 'bubbling', label: 'Blasig/Buckelig', icon: '💭' }
            ]
          },
          {
            id: 'affected_leaves',
            question: 'Welche Blätter sind betroffen?',
            options: [
              { value: 'new', label: 'Neue/Junge Blätter', icon: '🌱' },
              { value: 'old', label: 'Alte/Reife Blätter', icon: '🍁' },
              { value: 'all', label: 'Alle Blätter', icon: '🌿' }
            ]
          }
        ]);
        break;
      
      // Growth Issues refinement questions
      case 'growth-issues':
        setQuestions([
          {
            id: 'type',
            question: 'Welche Art von Wachstumsproblem beobachtest du?',
            options: [
              { value: 'stunted', label: 'Gehemmtes Wachstum', icon: '🐌' },
              { value: 'stretching', label: 'Übermäßige Streckung', icon: '📏' },
              { value: 'wilting', label: 'Welken / Schlaffe Blätter', icon: '💧' }
            ]
          },
          {
            id: 'duration',
            question: 'Wie lange besteht das Problem schon?',
            options: [
              { value: 'recent', label: 'Kürzlich aufgetreten (1-3 Tage)', icon: '🕒' },
              { value: 'weeks', label: 'Seit einigen Wochen', icon: '📆' },
              { value: 'long', label: 'Seit Beginn des Wachstums', icon: '📅' }
            ]
          }
        ]);
        break;
        
      // Stem Issues refinement questions
      case 'stem-issues':
        setQuestions([
          {
            id: 'stem_symptom',
            question: 'Was beobachtest du am Stängel?',
            options: [
              { value: 'weak', label: 'Schwach/Dünn', icon: '🚬' },
              { value: 'discolored', label: 'Verfärbt/Fleckig', icon: '🎨' },
              { value: 'split', label: 'Gespalten/Gebrochen', icon: '⚡' },
              { value: 'hollow', label: 'Hohl/Weich', icon: '👖' }
            ]
          },
          {
            id: 'stem_location',
            question: 'Wo am Stängel tritt das Problem auf?',
            options: [
              { value: 'base', label: 'An der Basis/Boden', icon: '🌍' },
              { value: 'middle', label: 'In der Mitte', icon: '⭕' },
              { value: 'top', label: 'An der Spitze/Oben', icon: '⬆️' },
              { value: 'all', label: 'Überall am Stängel', icon: '🌱' }
            ]
          }
        ]);
        break;
        
      // Pests refinement questions
      case 'pests':
        setQuestions([
          {
            id: 'pest_type',
            question: 'Welche Art von Schädlingen vermutest du?',
            options: [
              { value: 'spider_mites', label: 'Spinnmilben', icon: '🕷️' },
              { value: 'aphids', label: 'Blattläuse', icon: '🐜' },
              { value: 'thrips', label: 'Thripse', icon: '🦟' },
              { value: 'fungus_gnats', label: 'Trauermücken', icon: '🦟' },
              { value: 'other', label: 'Andere/Unbekannt', icon: '❓' }
            ]
          },
          {
            id: 'visible_signs',
            question: 'Welche Anzeichen siehst du?',
            options: [
              { value: 'insects', label: 'Sichtbare Insekten', icon: '🐛' },
              { value: 'webbing', label: 'Spinnweben/Fäden', icon: '🕸️' },
              { value: 'eggs', label: 'Eier/Larven', icon: '🥚' },
              { value: 'damage', label: 'Fraßspuren/Löcher', icon: '🕳️' },
              { value: 'sticky', label: 'Klebrige Substanz', icon: '🍯' }
            ]
          }
        ]);
        break;
        
      // Mold & Mildew refinement questions
      case 'mold-mildew':
        setQuestions([
          {
            id: 'mold_type',
            question: 'Wie sieht der Schimmel/Mehltau aus?',
            options: [
              { value: 'powdery', label: 'Weißes Pulver (Echter Mehltau)', icon: '❄️' },
              { value: 'downy', label: 'Filziger Belag (Falscher Mehltau)', icon: '🌫️' },
              { value: 'gray', label: 'Grau/Braun (Botrytis)', icon: '🍄' },
              { value: 'black', label: 'Schwarzer Schimmel', icon: '⚫' }
            ]
          },
          {
            id: 'mold_location',
            question: 'Wo tritt der Schimmel/Mehltau auf?',
            options: [
              { value: 'leaves', label: 'Auf den Blättern', icon: '🍂' },
              { value: 'stems', label: 'An den Stängeln', icon: '🌱' },
              { value: 'buds', label: 'An den Blüten/Knospen', icon: '🌺' },
              { value: 'soil', label: 'Im/Auf dem Substrat', icon: '🌍' }
            ]
          }
        ]);
        break;
      
      // Flower Issues refinement questions
      case 'flower-issues':
        setQuestions([
          {
            id: 'flower_symptom',
            question: 'Was beobachtest du an den Blüten?',
            options: [
              { value: 'small', label: 'Kleine/Unterentwickelte Blüten', icon: '💎' },
              { value: 'discolored', label: 'Verfärbte Blüten', icon: '🌼' },
              { value: 'deformed', label: 'Deformierte Blüten', icon: '🦪' },
              { value: 'dying', label: 'Absterbende Blüten', icon: '🍀' },
              { value: 'no_growth', label: 'Keine Blütenbildung', icon: '❌' }
            ]
          },
          {
            id: 'flowering_time',
            question: 'In welcher Blütephase befindet sich die Pflanze?',
            options: [
              { value: 'early', label: 'Frühe Blüte (Wochen 1-3)', icon: '🕒' },
              { value: 'mid', label: 'Mittlere Blüte (Wochen 4-6)', icon: '🕓' },
              { value: 'late', label: 'Späte Blüte (Wochen 7+)', icon: '🕔' }
            ]
          }
        ]);
        break;
        
      // Watering Issues refinement questions
      case 'watering-issues':
        setQuestions([
          {
            id: 'water_symptom',
            question: 'Welche Symptome beobachtest du?',
            options: [
              { value: 'drooping', label: 'Hängende/Welke Blätter', icon: '🍂' },
              { value: 'yellow', label: 'Vergilbte Blätter', icon: '🟡' },
              { value: 'crispy', label: 'Knusprige/Brüchige Blätter', icon: '💥' },
              { value: 'slow_growth', label: 'Langsames Wachstum', icon: '🐢' },
              { value: 'root_issues', label: 'Wurzelprobleme sichtbar', icon: '🌱' }
            ]
          },
          {
            id: 'watering_frequency',
            question: 'Wie oft bewässerst du die Pflanze?',
            options: [
              { value: 'daily', label: 'Täglich', icon: '📆' },
              { value: 'few_days', label: 'Alle 2-3 Tage', icon: '📅' },
              { value: 'weekly', label: 'Wöchentlich oder seltener', icon: '🗓️' },
              { value: 'when_dry', label: 'Nur wenn trocken (nach Gefühl)', icon: '🦧' }
            ]
          }
        ]);
        break;
        
      default:
        setQuestions([{
          id: 'general',
          question: 'Beschreibe das Problem näher:',
          options: [
            { value: 'mild', label: 'Leichtes Problem', icon: '🚩' },
            { value: 'moderate', label: 'Mäßiges Problem', icon: '⚠️' },
            { value: 'severe', label: 'Schweres Problem', icon: '💥' }
          ]
        }]);
    }
  }, [primarySymptom]);

  // Check if all questions have been answered
  useEffect(() => {
    const requiredAnswers = questions.map(q => q.id);
    const answeredQuestions = Object.keys(answers);
    
    // Phase 2: Require only the first question to be answered to proceed
    // This makes it more user-friendly while still getting essential information
    const firstQuestionAnswered = requiredAnswers.length > 0 ? 
      answeredQuestions.includes(requiredAnswers[0]) : false;
    
    setCanProceed(firstQuestionAnswered);
  }, [questions, answers]);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 rounded-full bg-olive-green/20">
          {primarySymptom?.id === 'discoloration' || primarySymptom?.id === 'leaf-deformities' ? (
            <FaLeaf className="text-xl text-olive-green" />
          ) : primarySymptom?.id === 'growth-issues' ? (
            <GiGrowth className="text-xl text-olive-green" />
          ) : primarySymptom?.id === 'stem-issues' ? (
            <BiRootAlt className="text-xl text-olive-green" />
          ) : primarySymptom?.id === 'pests' ? (
            <FaBug className="text-xl text-olive-green" />
          ) : primarySymptom?.id === 'mold-mildew' ? (
            <GiMushroomCloud className="text-xl text-olive-green" />
          ) : primarySymptom?.id === 'flower-issues' ? (
            <GiFlowerPot className="text-xl text-olive-green" />
          ) : primarySymptom?.id === 'watering-issues' ? (
            <FaWater className="text-xl text-olive-green" />
          ) : (
            <FaSeedling className="text-xl text-olive-green" />
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{primarySymptom?.label}</h2>
          <p className="text-sm text-gray-600">Hilf uns, das Problem genauer zu bestimmen</p>
        </div>
      </div>

      {/* Questions based on primary symptom */}
      <div className="space-y-8">
        {questions.map(question => (
          <div key={question.id} className="border-2 border-olive-green/20 rounded-lg bg-olive-green/5 relative p-4">
            <div className="absolute -top-3 left-4 bg-white px-2 text-olive-green font-medium">
              {question.question}
            </div>
            
            <div className="mt-3 grid gap-3">
              {question.options.map(option => (
                <button
                  key={option.value}
                  onClick={() => onAnswer(question.id, option.value)}
                  className={`flex items-center p-3 rounded-md transition-all ${
                    answers[question.id] === option.value
                      ? 'bg-olive-green text-white shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-3 text-xl">{option.icon}</span>
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Next button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={onComplete}
          disabled={!canProceed}
          className={`px-5 py-2.5 rounded-md flex items-center ${
            canProceed
              ? 'bg-olive-green text-white hover:bg-yellow-green'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          Zur Diagnose
          <FaArrowRight className="ml-2" size={12} />
        </button>
      </div>
    </div>
  );
}
