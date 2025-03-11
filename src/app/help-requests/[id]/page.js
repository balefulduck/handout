'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function UserHelpRequestDetailPage() {
  const [helpRequest, setHelpRequest] = useState(null);
  const [plantData, setPlantData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const params = useParams();
  const requestId = params.id;

  useEffect(() => {
    // Redirect if not authenticated
    if (sessionStatus === 'unauthenticated') {
      router.push('/login');
    }
  }, [sessionStatus, router]);

  useEffect(() => {
    if (sessionStatus === 'authenticated' && requestId) {
      fetchHelpRequestDetails();
    }
  }, [sessionStatus, requestId]);

  const fetchHelpRequestDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/help-requests/${requestId}`);
      
      if (!response.ok) {
        throw new Error(`Fehler: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Verify that the user is the owner of this help request
      if (session.user.name !== data.helpRequest.username) {
        throw new Error('Sie haben keinen Zugriff auf diese Hilfe-Anfrage');
      }
      
      setHelpRequest(data.helpRequest);
      
      // Parse plant data
      if (data.helpRequest.plant_data) {
        try {
          const parsedPlantData = JSON.parse(data.helpRequest.plant_data);
          setPlantData(parsedPlantData);
        } catch (err) {
          console.error('Error parsing plant data:', err);
          setPlantData([]);
        }
      }
      
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('de-DE', options);
  };

  const getStatusBadgeClass = (statusValue) => {
    switch (statusValue) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (statusValue) => {
    switch (statusValue) {
      case 'new':
        return 'Neu';
      case 'in_progress':
        return 'In Bearbeitung';
      case 'resolved':
        return 'Gelöst';
      default:
        return statusValue;
    }
  };

  if (sessionStatus === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center p-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">Lade Hilfe-Anfrage...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  Fehler beim Laden der Hilfe-Anfrage: {error}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={fetchHelpRequestDetails}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-olive-green hover:bg-yellow-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-green"
            >
              Erneut versuchen
            </button>
            <Link href="/plants" className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-green">
              Zurück zu Meine Pflanzen
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!helpRequest) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Hilfe-Anfrage nicht gefunden.
                </p>
              </div>
            </div>
          </div>
          <Link href="/plants" className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-green">
            Zurück zu Meine Pflanzen
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Hilfe-Anfrage Details</h1>
          <Link href="/plants" className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-green">
            Zurück zu Meine Pflanzen
          </Link>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {helpRequest.subject}
              </h3>
              <p className="max-w-2xl text-sm text-gray-500 mt-1">
                Erstellt am {formatDate(helpRequest.created_at)}
              </p>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(helpRequest.status)}`}>
              {getStatusText(helpRequest.status)}
            </span>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Anfrage von
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {helpRequest.name} ({helpRequest.email})
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Betreff
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {helpRequest.subject}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Nachricht
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 whitespace-pre-line">
                  {helpRequest.message}
                </dd>
              </div>
              
              {helpRequest.admin_response && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Antwort von Dr. Cannabis
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 whitespace-pre-line bg-green-50 p-3 rounded-md">
                    {helpRequest.admin_response}
                  </dd>
                </div>
              )}
              
              {plantData.length > 0 && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Ausgewählte Pflanzen
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    <ul className="divide-y divide-gray-200 rounded-md border border-gray-200">
                      {plantData.map((plant) => (
                        <li key={plant.id} className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                          <div className="flex w-0 flex-1 items-center">
                            <svg className="h-5 w-5 flex-shrink-0 text-olive-green" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.606 12.97a.75.75 0 01-.134 1.051 2.494 2.494 0 00-.93 2.437 2.494 2.494 0 002.437-.93.75.75 0 111.186.918 3.995 3.995 0 01-4.482 1.332.75.75 0 01-.461-.461 3.994 3.994 0 011.332-4.482.75.75 0 011.052.134z" clipRule="evenodd" />
                              <path fillRule="evenodd" d="M5.752 12A13.07 13.07 0 008 14.248v4.002c0 .414.336.75.75.75a5 5 0 004.797-6.48 12.984 12.984 0 005.45-10.848.75.75 0 00-.735-.735 12.984 12.984 0 00-10.849 5.45A5 5 0 001.5 8.75a.75.75 0 00.75.75h4.002z" clipRule="evenodd" />
                            </svg>
                            <span className="ml-2 w-0 flex-1 truncate">{plant.name} ({plant.strain})</span>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <Link 
                              href={`/plants/${plant.id}`} 
                              className="font-medium text-olive-green hover:text-yellow-green"
                            >
                              Anzeigen
                            </Link>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
              
              {helpRequest.file_urls && JSON.parse(helpRequest.file_urls || '[]').length > 0 && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Angehängte Dateien
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    <ul className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {JSON.parse(helpRequest.file_urls).map((url, index) => (
                        <li key={index} className="relative group">
                          <a 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="block"
                          >
                            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                              <Image 
                                src={url} 
                                alt={`Angehängte Datei ${index + 1}`} 
                                layout="fill" 
                                objectFit="cover" 
                                className="group-hover:opacity-75 transition-opacity"
                                unoptimized
                              />
                            </div>
                            <span className="mt-2 block text-sm font-medium text-gray-900">
                              Bild {index + 1}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
