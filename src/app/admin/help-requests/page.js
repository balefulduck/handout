'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminHelpRequestsPage() {
  const [helpRequests, setHelpRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchHelpRequests();
    }
  }, [status]);

  const fetchHelpRequests = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/help-requests');
      
      if (!response.ok) {
        throw new Error(`Fehler: ${response.status}`);
      }
      
      const data = await response.json();
      setHelpRequests(data.helpRequests || []);
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

  const getStatusBadgeClass = (status) => {
    switch (status) {
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

  const getStatusText = (status) => {
    switch (status) {
      case 'new':
        return 'Neu';
      case 'in_progress':
        return 'In Bearbeitung';
      case 'resolved':
        return 'Gelöst';
      default:
        return status;
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center p-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">Lade Hilfe-Anfragen...</p>
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
                  Fehler beim Laden der Hilfe-Anfragen: {error}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={fetchHelpRequests}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-olive-green hover:bg-yellow-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-green"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Dr. Cannabis Hilfe-Anfragen</h1>
          <p className="text-gray-600">Alle eingegangenen Hilfe-Anfragen von Benutzern.</p>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={fetchHelpRequests}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-olive-green hover:bg-yellow-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-green"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Aktualisieren
            </button>
          </div>
          <div className="text-sm text-gray-500">
            {helpRequests.length} Anfrage(n) gefunden
          </div>
        </div>

        {helpRequests.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-500">Keine Hilfe-Anfragen vorhanden.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {helpRequests.map((request) => (
                <li key={request.id}>
                  <div className="px-4 py-5 sm:px-6 hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/admin/help-requests/${request.id}`)}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {request.subject}
                        </h3>
                        <div className="mt-1 flex items-center">
                          <span className="text-sm text-gray-500 mr-2">
                            von {request.name} ({request.email})
                          </span>
                          <span className="text-xs text-gray-400">
                            • {request.username}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0 flex items-center">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(request.status)}`}>
                          {getStatusText(request.status)}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          {formatDate(request.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {request.message}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      {JSON.parse(request.selected_plant_ids || '[]').length > 0 && (
                        <span className="mr-3 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-olive-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {JSON.parse(request.selected_plant_ids || '[]').length} Pflanze(n) ausgewählt
                        </span>
                      )}
                      {JSON.parse(request.file_urls || '[]').length > 0 && (
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {JSON.parse(request.file_urls || '[]').length} Foto(s)
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
