import Image from 'next/image';
import Link from 'next/link';
import { FaSeedling, FaLeaf, FaQuestion, FaQrCode, FaArrowRight } from 'react-icons/fa';
import { GiGrowth, GiPlantWatering } from 'react-icons/gi';
import TutorialVideo from '@/components/TutorialVideo';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center p-4 pb-20 relative">
      {/* Floating login bar */}
      <div className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm py-2 px-4 shadow-md z-50 flex justify-end items-center">
        <Link 
          href="/login" 
          className="inline-flex items-center px-4 py-1.5 text-sm font-medium text-custom-orange hover:text-custom-orange/80 transition-colors duration-200"
        >
          <span className="hidden sm:inline">Bereits registriert?</span> Jetzt einloggen <FaArrowRight className="ml-2" />
        </Link>
      </div>
      {/* Hero Section */}
      <div className="bg-custom-orange text-white rounded-xl shadow-lg p-8 max-w-4xl w-full mt-4 mb-12">
        {/* Logo at the top */}
        <div className="flex justify-center mb-6">
          <div className="bg-white/10 p-5 rounded-lg">
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
        <div className="flex flex-col items-center">
            <h1 className="text-4xl font-bold font-aptos mt-4 text-center md:text-left">
              <span>Dr. Cannabis </span>
              <span style={{color: '#941E71'}}>GrowGuide</span>
            </h1>
            <p className="text-xl font-bold text-white/90 mt-2 text-center md:text-left">
              Digitales Pflanzenmonitoring für einen optimalen Anbau.
            </p>
            <p className="text-xl font-bold text-white/90 mt-8 text-center md:text-left">
              Behalt den Überblick über:
            </p>
            <ul className="list-disc mt-2 ml-8 text-white/90 text-lg flex flex-col gap-4">
              <li className="flex items-center relative py-2 px-4">
                <div className="absolute inset-0 bg-white/50 rounded-lg"></div>
                <FaSeedling className="mr-2 z-10" style={{color: '#941E71'}} />
                <span className="z-10" style={{color: '#941E71'}}>Deine Setups und Zelte</span>
              </li>
              <li className="flex items-center relative py-2 px-4">
                <div className="absolute inset-0 bg-white/50 rounded-lg"></div>
                <GiPlantWatering className="mr-2 z-10" style={{color: '#941E71'}} />
                <span className="z-10" style={{color: '#941E71'}}>Wasser- und Düngung</span>
              </li>
              <li className="flex items-center relative py-2 px-4">
                <div className="absolute inset-0 bg-white/50 rounded-lg"></div>
                <GiGrowth className="mr-2 z-10" style={{color: '#941E71'}} />
                <span className="z-10" style={{color: '#941E71'}}>Temperatur, Feuchtigkeit und Lichtdauer</span>
              </li>
            </ul>

    
            <p className="text-base font-medium text-white/90 mt-5 mb-5 text-center md:text-center md:mx-auto md:max-w-md">
              Und wenn es Probleme gibt, kann Dein Dr. Cannabis GrowCoach 
              deine Pflanze auslesen und so einen schnellen Überblick über mögliche Probleme geben.
            </p>
            <div className="bg-white/40 p-4 rounded-lg shadow-sm mt-6">
              <p className="text-lg font-bold text-center">
                Gemeinsam können wir deinen Anbau optimieren und deine Pflanzen zu Höchstleistungen bringen.
              </p>
            </div>
            
            <div className="mt-6 flex justify-center md:justify-start">
              {/* Registration button */}
              <Link 
                href="/register" 
                className="inline-flex items-center px-8 py-4 text-xl font-semibold bg-olive-green/80 text-white rounded-lg hover:bg-olive-green transition-colors duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Account erstellen <FaSeedling className="ml-2" />
              </Link>
            </div>
        </div>
      </div>
         {/* Beta Announcement */}
      <div className="bg-gray-50 rounded-lg p-6 shadow-sm border border-gray-200 max-w-4xl w-full mb-6">
        <h2 className="text-xl font-bold text-gray-800 text-center mb-3">Beta Phase</h2>
        <p className="text-gray-700 text-center mb-4">
          Wir freuen uns, dass du an unserer Beta teilnimmst! Dein Feedback hilft uns, Dr. Cannabis GrowGuide zu verbessern.
          Klicke auf einen der Buttons oben, um loszulegen.
        </p>
        
        {/* Tutorial Video Section */}
        <div className="mt-4">
          <details className="group">
            <summary className="flex justify-center items-center cursor-pointer text-olive-green font-medium hover:text-olive-green/80 transition-colors">
              <span>Video ansehen: So gibst Du uns Feedback</span>
              <svg className="ml-2 h-5 w-5 transform group-open:rotate-180 transition-transform duration-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </summary>
            <div className="mt-4">
              <TutorialVideo />
            </div>
          </details>
        </div>
      </div>
      {/* Features Section */}
      <div className="w-full max-w-4xl mb-12">
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
      
   
    </main>
  );
}
