'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaArrowLeft, FaTint, FaTemperatureHigh, FaLeaf } from 'react-icons/fa';
import { WiHumidity } from 'react-icons/wi';

export default function DayDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [dayEntry, setDayEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDayEntry = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/plants/${params.id}/days/${params.day}`);
        if (!response.ok) {
          throw new Error('Failed to fetch day entry');
        }
        const data = await response.json();
        setDayEntry(data.day);
        setError(null);
      } catch (err) {
        console.error('Error fetching day entry:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id && params.day) {
      fetchDayEntry();
    }
  }, [params.id, params.day]);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!dayEntry) {
    return <div className="p-4">Day entry not found</div>;
  }

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">
          Tag {dayEntry.day_number} - {new Date(dayEntry.date).toLocaleDateString('de-DE')}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center bg-blue-50 p-4 rounded-lg">
            <FaTint className="text-blue-500 text-xl mr-3" />
            <div>
              <p className="text-sm text-gray-600">Bewässerung</p>
              <p className="font-semibold">{dayEntry.watering_amount} ml</p>
            </div>
          </div>

          <div className="flex items-center bg-red-50 p-4 rounded-lg">
            <FaTemperatureHigh className="text-red-500 text-xl mr-3" />
            <div>
              <p className="text-sm text-gray-600">Temperatur</p>
              <p className="font-semibold">{dayEntry.temperature}°C</p>
            </div>
          </div>

          <div className="flex items-center bg-green-50 p-4 rounded-lg">
            <WiHumidity className="text-green-500 text-2xl mr-3" />
            <div>
              <p className="text-sm text-gray-600">Luftfeuchtigkeit</p>
              <p className="font-semibold">{dayEntry.humidity}%</p>
            </div>
          </div>
        </div>

        {dayEntry.fertilizers && dayEntry.fertilizers.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Dünger</h2>
            <div className="space-y-2">
              {dayEntry.fertilizers.map((fertilizer, index) => (
                <div key={index} className="flex items-center bg-yellow-50 p-3 rounded-lg">
                  <FaLeaf className="text-yellow-600 mr-3" />
                  <div>
                    <p className="font-medium">{fertilizer.name}</p>
                    <p className="text-sm text-gray-600">{fertilizer.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {dayEntry.notes && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Notizen</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="whitespace-pre-wrap">{dayEntry.notes}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
