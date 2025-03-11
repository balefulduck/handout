'use client';

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function StatisticsTab({ days }) {
  // Filter out days with no temperature or humidity data
  const daysWithData = days.filter(day => 
    day.temperature !== null && day.temperature !== '' && 
    day.humidity !== null && day.humidity !== ''
  );

  // Sort days by date
  const sortedDays = [...daysWithData].sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );

  // Prepare data for charts
  const labels = sortedDays.map(day => new Date(day.date).toLocaleDateString());
  
  const temperatureData = {
    labels,
    datasets: [
      {
        label: 'Temperatur (°C)',
        data: sortedDays.map(day => day.temperature),
        borderColor: '#f19421', // custom-orange
        backgroundColor: 'rgba(241, 148, 33, 0.2)',
        tension: 0.3,
      },
    ],
  };

  const humidityData = {
    labels,
    datasets: [
      {
        label: 'Luftfeuchtigkeit (%)',
        data: sortedDays.map(day => day.humidity),
        borderColor: '#8b9d4b', // icon-olive
        backgroundColor: 'rgba(139, 157, 75, 0.2)',
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="space-y-6 mt-4">
      {sortedDays.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Keine Daten verfügbar. Füge Tageseinträge mit Temperatur- und Feuchtigkeitswerten hinzu.
        </div>
      ) : (
        <>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-aptos font-medium mb-4">Temperaturverlauf</h3>
            <Line data={temperatureData} options={chartOptions} />
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-aptos font-medium mb-4">Luftfeuchtigkeitsverlauf</h3>
            <Line data={humidityData} options={chartOptions} />
          </div>
        </>
      )}
    </div>
  );
}
