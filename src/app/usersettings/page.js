'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaCog, FaUser, FaEnvelope, FaSlidersH, FaWater, FaLeaf, FaSave } from 'react-icons/fa';
import Link from 'next/link';
import ContextMenu from '@/components/ContextMenu';

export default function UserSettingsPage() {
  const { data: session } = useSession();
  const [settingsData, setSettingsData] = useState({
    waterMax: 1000,
    darkMode: false,
    notifications: true,
    email: '',
    name: '',
    setupWaterLimits: {}
  });
  
  const [setups, setSetups] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activePhase, setActivePhase] = useState('settings');
  

  
  // Load user settings and setups
  useEffect(() => {
    if (session?.user) {
      // In a real app, we would fetch the user's settings from an API
      // For now, we'll just populate with session data + defaults
      setSettingsData(prev => ({
        ...prev,
        email: session.user.email || '',
        name: session.user.name || ''
      }));
      
      // Fetch all setups to configure water limits for each
      const fetchSetups = async () => {
        try {
          const response = await fetch('/api/plant-setups');
          if (response.ok) {
            const data = await response.json();
            setSetups(data.setups);
            
            // Initialize water limits for each setup if not already set
            const setupLimits = {};
            data.setups.forEach(setup => {
              setupLimits[setup.id] = setup.water_limit || 1000;
            });
            
            setSettingsData(prev => ({
              ...prev,
              setupWaterLimits: {
                ...prev.setupWaterLimits,
                ...setupLimits
              }
            }));
          }
        } catch (error) {
          console.error('Error fetching setups:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchSetups();
    }
  }, [session]);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettingsData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear any previous success message
    setSaveSuccess(false);
  };
  
  const handleSetupWaterLimitChange = (setupId, value) => {
    setSettingsData(prev => ({
      ...prev,
      setupWaterLimits: {
        ...prev.setupWaterLimits,
        [setupId]: parseInt(value) || 0
      }
    }));
    
    // Clear any previous success message
    setSaveSuccess(false);
  };
  
  function handleSave(e) {
    if (e) e.preventDefault();
    
    // In the future, this will save settings to the database
    // For now, we'll just simulate a successful save
    setSaveSuccess(true);
    
    // Update each setup in the database with their new water limit
    const updateSetups = async () => {
      try {
        // Make parallel requests to update each setup's water_limit
        const updatePromises = Object.entries(settingsData.setupWaterLimits).map(([setupId, waterLimit]) => {
          // For each setup, send an update request
          return fetch(`/api/plant-setups/${setupId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              water_limit: waterLimit,
              // Include other required fields to prevent them from being nullified
              name: setups.find(s => s.id === parseInt(setupId))?.name || ''
            }),
          });
        });
        
        // Wait for all updates to complete
        await Promise.all(updatePromises);
        
        // You would also save the user settings:
        /*
        await fetch('/api/user/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            waterMax: settingsData.waterMax,
            darkMode: settingsData.darkMode,
            notifications: settingsData.notifications,
            // Only pass public profile data to the API
            name: settingsData.name,
            email: settingsData.email,
          }),
        });
        */
      } catch (error) {
        console.error('Error saving settings:', error);
      }
    };
    
    // Call the update function
    updateSetups();
    
    // Scroll to top to show the success message
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };
  
  if (!session) {
    return (
      <div className="flex min-h-screen bg-gray-100 justify-center items-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Bitte melde dich an</h1>
          <p className="text-gray-600 mb-6">Du musst angemeldet sein, um diese Seite zu sehen.</p>
          <Link 
            href="/login"
            className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90"
          >
            Zum Login
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <ContextMenu
        activePhase={activePhase}
        onPhaseSelect={setActivePhase}
      />
      
      <div className="min-h-screen bg-gray-100 pt-16 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center mt-4 mb-6">
            <FaCog className="mr-2 text-brand-primary" />
            Einstellungen
          </h1>
        
        {saveSuccess && (
          <div className="mb-6 p-4 rounded-md bg-green-50 border border-green-200">
            <p className="text-green-800 font-medium">Einstellungen erfolgreich gespeichert!</p>
          </div>
        )}
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">Lade Einstellungen...</p>
            </div>
          ) : (
            <form onSubmit={handleSave}>
              {/* Profile Section */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaUser className="mr-2 text-brand-primary" />
                  Profil
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={settingsData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      E-Mail
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={settingsData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                    />
                  </div>
                </div>
              </div>
              
              {/* App Settings Section */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaSlidersH className="mr-2 text-brand-primary" />
                  App-Einstellungen
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="darkMode" className="font-medium text-gray-700">
                        Dark Mode
                      </label>
                      <p className="text-sm text-gray-500">Dark Mode für die gesamte App aktivieren</p>
                    </div>
                    <div className="relative inline-block w-12 mr-2 align-middle select-none">
                      <input
                        type="checkbox"
                        id="darkMode"
                        name="darkMode"
                        checked={settingsData.darkMode}
                        onChange={handleInputChange}
                        className="absolute block w-6 h-6 bg-white border-4 rounded-full appearance-none cursor-pointer checked:right-0 checked:border-brand-primary"
                      />
                      <label
                        htmlFor="darkMode"
                        className="block h-6 overflow-hidden bg-gray-300 rounded-full cursor-pointer"
                      ></label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between opacity-50">
                    <div>
                      <label htmlFor="notifications" className="font-medium text-gray-500">
                        Benachrichtigungen
                      </label>
                      <p className="text-sm text-gray-500">App-Benachrichtigungen aktivieren (Coming soon)</p>
                    </div>
                    <div className="relative inline-block w-12 mr-2 align-middle select-none">
                      <input
                        type="checkbox"
                        id="notifications"
                        name="notifications"
                        checked={false}
                        onChange={() => {}}
                        className="absolute block w-6 h-6 bg-white border-4 rounded-full appearance-none cursor-not-allowed"
                        disabled
                      />
                      <label
                        htmlFor="notifications"
                        className="block h-6 overflow-hidden bg-gray-300 rounded-full cursor-not-allowed"
                      ></label>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Grow Settings Section */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaLeaf className="mr-2 text-brand-primary" />
                  Anbau-Einstellungen
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="waterMax" className="block text-sm font-medium text-gray-700 mb-1">
                      <div className="flex items-center">
                        <FaWater className="mr-1 text-brand-primary" />
                        Standard-Wassermaximum (ml)
                      </div>
                    </label>
                    <input
                      type="number"
                      id="waterMax"
                      name="waterMax"
                      value={settingsData.waterMax}
                      onChange={handleInputChange}
                      min="100"
                      step="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Dieser Wert bestimmt das anfängliche Maximum des Wassermenge-Sliders
                    </p>
                  </div>
                  
                  {/* Setup-specific water limits */}
                  {setups.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-medium text-gray-700 mb-3">Wassermenge pro Setup</h3>
                      <div className="space-y-3 bg-gray-50 p-4 rounded-md">
                        {setups.map(setup => (
                          <div key={setup.id} className="flex flex-col">
                            <div className="flex items-center justify-between mb-1">
                              <label htmlFor={`setup-${setup.id}`} className="text-sm font-medium text-gray-700">
                                {setup.name}
                                <span className="ml-2 text-xs text-gray-500">({setup.plants.length} Pflanzen)</span>
                              </label>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  id={`setup-${setup.id}`}
                                  value={settingsData.setupWaterLimits[setup.id] || 1000}
                                  onChange={(e) => handleSetupWaterLimitChange(setup.id, e.target.value)}
                                  min="100"
                                  step="100"
                                  className="w-24 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                                />
                                <span className="text-sm text-gray-500">ml</span>
                              </div>
                            </div>
                            <div className="relative pt-1">
                              <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                                <div 
                                  style={{ width: `${Math.min(100, (settingsData.setupWaterLimits[setup.id] || 1000) / 20)}%` }} 
                                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-brand-primary"
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Diese Werte bestimmen das maximale Wasservolumen, das für jedes Setup verfügbar ist
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Save info notice */}
              <div className="p-6 flex justify-center text-sm text-gray-500">
                <p>Klicke auf "Speichern" in der Menüleiste unten, um deine Änderungen zu speichern.</p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
