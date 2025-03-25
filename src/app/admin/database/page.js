'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FaDatabase, FaDownload, FaUpload, FaExclamationTriangle, FaFileUpload } from 'react-icons/fa';
import ContextMenu from '@/components/ContextMenu';
import Link from 'next/link';

export default function DatabaseManagementPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastBackup, setLastBackup] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const fileInputRef = useRef(null);

  // Debug session state
  useEffect(() => {
    console.log('Session status:', status);
    console.log('Session data:', session);
    
    // Only redirect if we're sure the user is not an admin
    if (status === 'authenticated' && session?.user && session.user.isAdmin === false) {
      console.log('User is authenticated but not admin, redirecting');
      router.push('/');
    }
  }, [session, status, router]);

  // Handle backup
  const handleBackup = async () => {
    try {
      setLoading(true);
      setMessage(null);
      
      const response = await fetch('/api/admin/database?action=backup');
      const data = await response.json();
      
      if (response.ok) {
        if (data.warning) {
          setMessage({
            type: 'warning',
            text: data.warning,
            details: `Original: ${formatBytes(data.originalSize)}, Backup: ${formatBytes(data.backupSize)}`
          });
        } else {
          setMessage({
            type: 'success',
            text: data.message,
            details: `Size: ${formatBytes(data.originalSize)}`
          });
        }
        setLastBackup(data.timestamp);
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Failed to backup database'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'An error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle restore
  const handleRestore = async () => {
    if (!confirm('Are you sure you want to restore the database from backup? This will overwrite the current database.')) {
      return;
    }
    
    try {
      setLoading(true);
      setMessage(null);
      
      const response = await fetch('/api/admin/database?action=restore');
      const data = await response.json();
      
      if (response.ok) {
        if (data.warning) {
          setMessage({
            type: 'warning',
            text: data.warning,
            details: `Backup: ${formatBytes(data.backupSize)}, Restored: ${formatBytes(data.restoredSize)}`
          });
        } else {
          setMessage({
            type: 'success',
            text: data.message,
            details: `Size: ${formatBytes(data.backupSize)}`
          });
        }
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Failed to restore database'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'An error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle download
  const handleDownload = () => {
    window.location.href = '/api/admin/database?action=download';
  };
  
  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.endsWith('.db')) {
        setMessage({
          type: 'error',
          text: 'Ungültiger Dateityp. Nur .db Dateien sind erlaubt.'
        });
        return;
      }
      setUploadFile(file);
      setMessage({
        type: 'info',
        text: 'Datei ausgewählt',
        details: `${file.name} (${formatBytes(file.size)})`
      });
    }
  };
  
  // Handle file upload
  const handleUpload = async () => {
    if (!uploadFile) {
      setMessage({
        type: 'error',
        text: 'Bitte wählen Sie zuerst eine Datei aus.'
      });
      return;
    }
    
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('file', uploadFile);
      
      const response = await fetch('/api/admin/database?action=upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({
          type: 'success',
          text: data.message,
          details: `Originaldatei: ${data.originalName} (${formatBytes(data.size)})`
        });
        setUploadFile(null);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Fehler beim Hochladen der Datei'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Ein Fehler ist aufgetreten'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Format bytes to human-readable format
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Handle different session states
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-olive-green mb-4"></div>
        <p className="text-gray-600">Lade Sitzungsdaten...</p>
      </div>
    );
  }
  
  // If not authenticated
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Nicht angemeldet</h2>
          <p className="mb-4">Sie müssen angemeldet sein, um auf diese Seite zuzugreifen.</p>
          <Link href="/login" className="w-full bg-olive-green text-white py-2 px-4 rounded hover:bg-olive-green-dark transition-colors block text-center">
            Zum Login
          </Link>
        </div>
      </div>
    );
  }
  
  // If authenticated but not admin
  if (status === 'authenticated' && !session?.user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Zugriff verweigert</h2>
          <p className="mb-4">Sie benötigen Administratorrechte, um auf diese Seite zuzugreifen.</p>
          <Link href="/growguide" className="w-full bg-olive-green text-white py-2 px-4 rounded hover:bg-olive-green-dark transition-colors block text-center">
            Zurück zum Growguide
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <ContextMenu />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 bg-olive-green text-white">
              <h3 className="text-lg leading-6 font-medium">
                <FaDatabase className="inline-block mr-2" />
                Datenbank-Verwaltung
              </h3>
              <p className="mt-1 max-w-2xl text-sm">
                Backup und Wiederherstellung der SQLite-Datenbank
              </p>
            </div>
            
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              {message && (
                <div className={`mb-6 p-4 rounded-md ${
                  message.type === 'success' ? 'bg-green-50 text-green-800' : 
                  message.type === 'warning' ? 'bg-yellow-50 text-yellow-800' : 
                  'bg-red-50 text-red-800'
                }`}>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      {message.type === 'warning' && <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />}
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium">{message.text}</h3>
                      {message.details && <div className="mt-2 text-sm">{message.details}</div>}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Backup erstellen</h3>
                    <div className="mt-2 max-w-xl text-sm text-gray-500">
                      <p>Erstellt ein Backup der aktuellen Datenbank</p>
                    </div>
                    <div className="mt-5">
                      <button
                        type="button"
                        onClick={handleBackup}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-olive-green hover:bg-olive-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-green"
                      >
                        <FaDatabase className="-ml-1 mr-2 h-5 w-5" />
                        Backup erstellen
                      </button>
                    </div>
                    {lastBackup && (
                      <div className="mt-3 text-xs text-gray-500">
                        Letztes Backup: {new Date(lastBackup).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Backup herunterladen</h3>
                    <div className="mt-2 max-w-xl text-sm text-gray-500">
                      <p>Lädt das aktuelle Backup herunter</p>
                    </div>
                    <div className="mt-5">
                      <button
                        type="button"
                        onClick={handleDownload}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-turquoise hover:bg-turquoise-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-turquoise"
                      >
                        <FaDownload className="-ml-1 mr-2 h-5 w-5" />
                        Backup herunterladen
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Datenbank wiederherstellen</h3>
                    <div className="mt-2 max-w-xl text-sm text-gray-500">
                      <p>Stellt die Datenbank aus dem Backup wieder her</p>
                    </div>
                    <div className="mt-5">
                      <button
                        type="button"
                        onClick={handleRestore}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                      >
                        <FaUpload className="-ml-1 mr-2 h-5 w-5" />
                        Wiederherstellen
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Datenbank hochladen</h3>
                    <div className="mt-2 max-w-xl text-sm text-gray-500">
                      <p>Lokale Datenbank-Datei hochladen</p>
                      {uploadFile && (
                        <p className="mt-1 text-xs text-gray-700">
                          Ausgewählt: {uploadFile.name} ({formatBytes(uploadFile.size)})
                        </p>
                      )}
                    </div>
                    <div className="mt-5">
                      <input
                        type="file"
                        accept=".db"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={triggerFileInput}
                        disabled={loading}
                        className="mb-2 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <FaFileUpload className="-ml-1 mr-2 h-5 w-5" />
                        Datei auswählen
                      </button>
                      {uploadFile && (
                        <button
                          type="button"
                          onClick={handleUpload}
                          disabled={loading}
                          className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <FaUpload className="-ml-1 mr-2 h-5 w-5" />
                          Hochladen & Installieren
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 bg-yellow-50 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Wichtiger Hinweis</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Diese Funktionen sind nur für Administratoren verfügbar. Das Backup wird im App-Verzeichnis 
                        gespeichert und bleibt bis zum nächsten Deployment erhalten. Für langfristige Sicherungen 
                        sollten Sie regelmäßig ein Backup herunterladen.
                      </p>
                      <p className="mt-2">
                        <strong>Datenbank hochladen:</strong> Mit dieser Funktion können Sie eine lokale Datenbank-Datei 
                        direkt auf den Server hochladen. Dies ist besonders nützlich nach Deployments, um Ihre Daten 
                        wiederherzustellen. Stellen Sie sicher, dass die hochgeladene Datei ein gültiges SQLite-Datenbankformat hat.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
