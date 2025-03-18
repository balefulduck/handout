'use client';

import { useState, useEffect } from 'react';
import { FaLeaf, FaSeedling, FaArrowRight } from 'react-icons/fa';
import { GiGrowth } from 'react-icons/gi';

export default function StepRefinement({ primarySymptom, answers, onAnswer, onComplete, onBack }) {
  const [canProceed, setCanProceed] = useState(false);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    // Determine questions based on the primary symptom
    if (primarySymptom?.id === 'discoloration') {
      setQuestions([
        {
          id: 'location',
          question: 'Wo sind die Verfärbungen hauptsächlich zu sehen?',
          options: [
            { value: 'lower', label: 'Untere Blätter', icon: '⬇️' },
            { value: 'upper', label: 'Obere Blätter', icon: '⬆️' },
            { value: 'spots', label: 'Flecken auf allen Blättern', icon: '🔍' }
          ]
        }
      ]);
    } else if (primarySymptom?.id === 'growth-issues') {
      setQuestions([
        {
          id: 'type',
          question: 'Welche Art von Wachstumsproblem beobachtest du?',
          options: [
            { value: 'stunted', label: 'Gehemmtes Wachstum', icon: '🐌' },
            { value: 'stretching', label: 'Übermäßige Streckung', icon: '📏' },
            { value: 'wilting', label: 'Welken / Schlaffe Blätter', icon: '💧' }
          ]
        }
      ]);
    }
  }, [primarySymptom]);

  // Check if all questions have been answered
  useEffect(() => {
    const requiredAnswers = questions.map(q => q.id);
    const answeredQuestions = Object.keys(answers);
    
    // Check if all required questions have been answered
    const allAnswered = requiredAnswers.every(q => answeredQuestions.includes(q));
    setCanProceed(allAnswered);
  }, [questions, answers]);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 rounded-full bg-olive-green/20">
          {primarySymptom?.id === 'discoloration' ? (
            <FaLeaf className="text-xl text-olive-green" />
          ) : primarySymptom?.id === 'growth-issues' ? (
            <GiGrowth className="text-xl text-olive-green" />
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
