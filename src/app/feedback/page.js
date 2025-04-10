import React from 'react';
import TutorialVideo from '@/components/TutorialVideo';
import { FaCommentAlt, FaBars, FaPhone, FaEnvelope } from 'react-icons/fa';

export default function FeedbackPage() {
  return (
    <main className="min-h-screen flex flex-col items-center p-4 pb-20 relative">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl w-full mt-4 mb-12">
        <h1 className="text-3xl font-bold text-olive-green text-center mb-6">Feedback</h1>
        
        <div className="bg-custom-orange text-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-center">Dein Feedback ist uns wichtig!</h2>
          
          <p className="text-lg mb-6">
            Wir möchten den Dr. Cannabis GrowGuide kontinuierlich verbessern und deine Meinung ist dabei entscheidend. 
            Deine Erfahrungen und Vorschläge helfen uns, die App noch besser an deine Bedürfnisse anzupassen.
          </p>
          
          <div className="bg-white/20 p-4 rounded-lg mb-6">
            <h3 className="text-xl font-semibold mb-3 flex items-center">
              <FaBars className="mr-2" /> So kannst du Feedback geben:
            </h3>
            <p className="mb-4">
              1. Tippe auf das Logo in der oberen Navigationsleiste, um das Menü auszuklappen.
            </p>
            <p className="mb-4">
              2. Im Menü findest du den Button "Feedback geben" mit einem <FaCommentAlt className="inline mx-1" /> Symbol.
            </p>
            <p>
              3. Gib dein Feedback ein und sende es ab - fertig!
            </p>
          </div>
          
          <div className="bg-white/20 p-4 rounded-lg mb-6">
            <h3 className="text-xl font-semibold mb-3">Wir freuen uns besonders über Feedback zu:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Benutzerfreundlichkeit:</strong> Ist die App intuitiv bedienbar? Gibt es Funktionen, die schwer zu finden oder zu nutzen sind?</li>
              <li><strong>Design:</strong> Wie gefällt dir das Erscheinungsbild der App? Ist alles gut lesbar und ansprechend gestaltet?</li>
              <li><strong>Fehler:</strong> Hast du Bugs oder Probleme entdeckt? Jeder Hinweis hilft uns, die App stabiler zu machen.</li>
              <li><strong>Funktionen:</strong> Welche Features vermisst du? Was könnte verbessert werden?</li>
            </ul>
          </div>
          
          <div className="bg-white/20 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Alternative Kontaktmöglichkeiten:</h3>
            <p className="mb-3">
              Du kannst uns auch direkt kontaktieren:
            </p>
            <div className="flex flex-col space-y-3">
              <div className="flex items-center">
                <FaPhone className="mr-3 text-white" />
                <span className="font-medium">Telefon: 06806 99 79 420</span>
              </div>
              <div className="flex items-center">
                <FaEnvelope className="mr-3 text-white" />
                <span className="font-medium">E-Mail: riegelsberg@drcannabis.de</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tutorial Video Section */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-olive-green text-center mb-4">Video-Anleitung: So gibst Du uns Feedback</h3>
          <TutorialVideo />
        </div>
        
    
      </div>
    </main>
  );
}
