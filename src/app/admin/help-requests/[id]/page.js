'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';

export default function HelpRequestDetailPage() {
  const [helpRequest, setHelpRequest] = useState(null);
  const [plantData, setPlantData] = useState([]);
  const [adminResponse, setAdminResponse] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
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
      setHelpRequest(data.helpRequest);
      setStatus(data.helpRequest.status);
      setAdminResponse(data.helpRequest.admin_response || '');
      setAdminNotes(data.helpRequest.admin_notes || '');
      
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

  const handleUpdateRequest = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/help-requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          admin_response: adminResponse,
          admin_notes: adminNotes,
        }),
      });

      if (!response.ok) {
        throw new Error('Fehler beim Aktualisieren der Anfrage');
      }

      const data = await response.json();
      setSuccessMessage('Anfrage erfolgreich aktualisiert');
      
      // Refresh the data
      fetchHelpRequestDetails();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
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
            <button
              onClick={() => router.push('/admin/help-requests')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-green"
            >
              Zurück zur Übersicht
            </button>
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
                  Hilfe-Anfrage nicht gefunden
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push('/admin/help-requests')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-olive-green hover:bg-yellow-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-green"
          >
            Zurück zur Übersicht
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{helpRequest.subject}</h1>
            <div className="mt-1 text-sm text-gray-500">
              Anfrage #{helpRequest.id} • Erstellt am {formatDate(helpRequest.created_at)}
            </div>
          </div>
          <div>
            <button
              onClick={() => router.push('/admin/help-requests')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-green"
            >
              Zurück zur Übersicht
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Benutzerinformationen</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(helpRequest.status)}`}>
                {getStatusText(helpRequest.status)}
              </span>
            </div>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{helpRequest.name}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">E-Mail</dt>
                <dd className="mt-1 text-sm text-gray-900">{helpRequest.email}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Nachricht</dt>
                <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">{helpRequest.message}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Images/Files */}
        {helpRequest.file_urls && JSON.parse(helpRequest.file_urls).length > 0 && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Hochgeladene Bilder</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {JSON.parse(helpRequest.file_urls).map((url, index) => (
                  <div key={index} className="relative">
                    <a href={url} target="_blank" rel="noopener noreferrer" className="block">
                      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100">
                        <img src={url} alt={`Uploaded image ${index + 1}`} className="object-cover" />
                      </div>
                      <div className="mt-2 text-sm text-gray-500 truncate">Bild {index + 1}</div>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Selected Plants */}
        {plantData.length > 0 && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Ausgewählte Pflanzen</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-6">
                {plantData.map((plant) => (
                  <div key={plant.id} className="border rounded-md p-4 bg-gray-50">
                    {/* Plant Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{plant.name}</h4>
                        {plant.strain && (
                          <p className="text-sm text-gray-500">Sorte: {plant.strain}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        plant.phase === 'flowering' ? 'bg-purple-100 text-purple-800' : 
                        plant.phase === 'vegetative' ? 'bg-green-100 text-green-800' : 
                        plant.phase === 'seedling' ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {plant.phase === 'flowering' ? 'Blüte' : 
                         plant.phase === 'vegetative' ? 'Vegetative' : 
                         plant.phase === 'seedling' ? 'Sämling' : 
                         'Unbekannt'}
                      </span>
                    </div>
                    
                    {/* Basic Plant Info */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                      <div>
                        <dt className="text-xs font-medium text-gray-500">Pflanze ID</dt>
                        <dd className="text-sm text-gray-900">{plant.id}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-gray-500">Alter</dt>
                        <dd className="text-sm text-gray-900">{plant.age_days ? Math.floor(plant.age_days) : '-'} Tage</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-gray-500">Erstellt am</dt>
                        <dd className="text-sm text-gray-900">
                          {plant.created_at ? 
                            new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(plant.created_at))
                            : 'N/A'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-gray-500">Blütephase seit</dt>
                        <dd className="text-sm text-gray-900">
                          {plant.flowering_start_date ? formatDate(plant.flowering_start_date).split(',')[0] : 'Noch nicht'}
                        </dd>
                      </div>
                      {plant.substrate && (
                        <div className="sm:col-span-2">
                          <dt className="text-xs font-medium text-gray-500">Substrat</dt>
                          <dd className="text-sm text-gray-900">{plant.substrate}</dd>
                        </div>
                      )}
                    </div>
                    
                    {/* Environmental Data */}
                    {plant.grow_details && (
                      plant.grow_details.avg_temperature || 
                      plant.grow_details.avg_humidity
                    ) && (
                      <div className="mb-4 border-t border-gray-200 pt-3">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Umgebungsdaten</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {plant.grow_details.avg_temperature && (
                            <div>
                              <dt className="text-xs font-medium text-gray-500">Durchschn. Temperatur</dt>
                              <dd className="text-sm text-gray-900">{plant.grow_details.avg_temperature}°C</dd>
                            </div>
                          )}
                          {plant.grow_details.avg_humidity && (
                            <div>
                              <dt className="text-xs font-medium text-gray-500">Durchschn. Luftfeuchtigkeit</dt>
                              <dd className="text-sm text-gray-900">{plant.grow_details.avg_humidity}%</dd>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Latest Measurements */}
                    {plant.measurements && plant.measurements.length > 0 && (
                      <div className="mb-4 border-t border-gray-200 pt-3">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Letzte Messungen</h5>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum</th>
                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wasser</th>
                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">pH</th>
                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temp.</th>
                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feucht.</th>
                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dünger</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {plant.measurements.map((measurement, idx) => (
                                <tr key={idx}>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">{formatDate(measurement.date || measurement.created_at).split(',')[0]}</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">{measurement.watered || '-'}</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">{measurement.ph || '-'}</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">{measurement.temperature ? `${measurement.temperature}°C` : '-'}</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">{measurement.humidity ? `${measurement.humidity}%` : '-'}</td>
                                  <td className="px-3 py-2 text-xs text-gray-900">
                                    {measurement.fertilizers && measurement.fertilizers.length > 0 ? (
                                      <div className="max-w-[200px]">
                                        {measurement.fertilizers.map((fertilizer, fidx) => (
                                          <div key={fidx} className="mb-1 last:mb-0">
                                            <span className="font-medium">{fertilizer.name}</span>
                                            {fertilizer.amount && (
                                              <span className="ml-1">({fertilizer.amount})</span>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      '-'
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    
                    {/* Latest Images */}
                    {plant.last_images && plant.last_images.length > 0 && (
                      <div className="border-t border-gray-200 pt-3">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Letzte Bilder</h5>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {plant.last_images.map((image, idx) => (
                            <div key={idx} className="relative">
                              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100">
                                <img 
                                  src={image.url || image.image_url || ''} 
                                  alt={`Plant image ${idx + 1}`} 
                                  className="object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/placeholder-plant.jpg';
                                  }}
                                />
                              </div>
                              <div className="mt-1 text-xs text-gray-500">
                                {formatDate((image.date || image.created_at || '').split(',')[0])}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Notes */}
                    {plant.notes && (
                      <div className="border-t border-gray-200 pt-3 mt-3">
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Notizen</h5>
                        <p className="text-sm text-gray-600 whitespace-pre-line">{plant.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Admin response form */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Administrator Antwort</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleUpdateRequest}>
              <div className="space-y-6">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-olive-green focus:border-olive-green sm:text-sm rounded-md"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={isSubmitting}
                  >
                    <option value="new">Neu</option>
                    <option value="in_progress">In Bearbeitung</option>
                    <option value="resolved">Gelöst</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="adminNotes" className="block text-sm font-medium text-gray-700">
                    Interne Notizen (für Administratoren)
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="adminNotes"
                      name="adminNotes"
                      rows={3}
                      className="shadow-sm focus:ring-olive-green focus:border-olive-green block w-full sm:text-sm border-gray-300 rounded-md"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Diese Notizen sind nur für Administratoren sichtbar und werden nicht an den Benutzer gesendet.
                  </p>
                </div>

                <div>
                  <label htmlFor="adminResponse" className="block text-sm font-medium text-gray-700">
                    Antwort an den Benutzer
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="adminResponse"
                      name="adminResponse"
                      rows={6}
                      className="shadow-sm focus:ring-olive-green focus:border-olive-green block w-full sm:text-sm border-gray-300 rounded-md"
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Diese Antwort wird an die E-Mail-Adresse des Benutzers gesendet.
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-green mr-3"
                    onClick={() => router.push('/admin/help-requests')}
                    disabled={isSubmitting}
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-olive-green hover:bg-yellow-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-green"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Speichern...
                      </>
                    ) : (
                      'Speichern'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
