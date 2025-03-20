import Image from 'next/image';
import Link from 'next/link';
import { FaSeedling, FaLeaf, FaQuestion, FaQrCode, FaArrowRight } from 'react-icons/fa';
import { GiGrowth, GiPlantWatering } from 'react-icons/gi';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center p-4 pb-20">
      {/* Hero Section */}
      <div className="bg-custom-orange text-white rounded-xl shadow-lg p-8 max-w-4xl w-full mt-4 mb-12">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-8 md:mb-0 md:mr-8">
            <h1 className="text-4xl font-bold font-aptos mt-4 text-center md:text-left">
              Dr. Cannabis GrowGuide
            </h1>
            <p className="text-xl font-light text-white/90 mt-2 text-center md:text-left">
              Digitales Pflanzenmonitoring für einen optimalen Anbau
            </p>
            
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link 
                href="/login" 
                className="inline-flex items-center px-6 py-3 text-lg font-semibold bg-white text-custom-orange rounded-lg hover:bg-white/90 transition-colors duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Jetzt einloggen <FaArrowRight className="ml-2" />
              </Link>
              <Link 
                href="/register" 
                className="inline-flex items-center px-6 py-3 text-lg font-semibold bg-olive-green/80 text-white rounded-lg hover:bg-olive-green transition-colors duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Account erstellen <FaSeedling className="ml-2" />
              </Link>
            </div>
          </div>
          
          <div className="flex-shrink-0 bg-white/10 p-5 rounded-lg">
            <Image
              src="/drca.svg"
              alt="DRCA Logo"
              width={160}
              height={160}
              className="mx-auto"
              priority
            />
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="w-full max-w-4xl mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Warum Dr. Cannabis GrowGuide?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Plant Monitoring Feature */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
            <div className="bg-olive-green p-5 text-white">
              <div className="flex items-center">
                <FaLeaf className="text-2xl mr-3" />
                <h3 className="text-xl font-semibold">Pflanzenmonitoring</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Verfolge das Wachstum deiner Cannabis-Pflanzen mit präzisen Daten. Überwache die Entwicklung von der Keimung bis zur Ernte mit unserem digitalen Tagebuch.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-600">
                  <FaSeedling className="text-olive-green mr-2" />
                  <span>Detaillierte Pflanzenprofile anlegen</span>
                </li>
                <li className="flex items-center text-gray-600">
                  <GiGrowth className="text-olive-green mr-2" />
                  <span>Wachstumsphasen dokumentieren</span>
                </li>
                <li className="flex items-center text-gray-600">
                  <GiPlantWatering className="text-olive-green mr-2" />
                  <span>Bewässerungs- und Düngeprotokoll</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Help Services Feature */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
            <div className="bg-olive-green p-5 text-white">
              <div className="flex items-center">
                <FaQuestion className="text-2xl mr-3" />
                <h3 className="text-xl font-semibold">Hilfe & Support</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Probleme mit deinen Pflanzen? Unser Expertenteam steht bereit, um dir bei der Diagnose zu helfen und Lösungen anzubieten.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-600">
                  <FaLeaf className="text-olive-green mr-2" />
                  <span>Pflanzen-Diagnose Tool</span>
                </li>
                <li className="flex items-center text-gray-600">
                  <FaQuestion className="text-olive-green mr-2" />
                  <span>Problemlösung für häufige Schwierigkeiten</span>
                </li>
                <li className="flex items-center text-gray-600">
                  <FaArrowRight className="text-olive-green mr-2" />
                  <span>Direkter Support durch Experten</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Beta Announcement */}
      <div className="bg-gray-50 rounded-lg p-6 shadow-sm border border-gray-200 max-w-4xl w-full">
        <h2 className="text-xl font-bold text-gray-800 text-center mb-3">Offene Beta Phase</h2>
        <p className="text-gray-700 text-center">
          Wir freuen uns, dass du an unserer offenen Beta teilnimmst! Dein Feedback hilft uns, Dr. Cannabis GrowGuide zu verbessern.
          Klicke auf einen der Buttons oben, um loszulegen.
        </p>
      </div>
    </main>
  );
}
