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

// Custom plugin to auto-hide tooltips after 6 seconds
const autoHideTooltipPlugin = {
  id: 'autoHideTooltip',
  beforeEvent(chart, args) {
    const { type } = args.event;
    
    // When a new tooltip is shown, set a timeout to hide it
    if (type === 'mousemove' || type === 'touchstart') {
      // Clear any existing timeout
      if (chart.tooltipTimeout) {
        clearTimeout(chart.tooltipTimeout);
      }
      
      // Set new timeout
      chart.tooltipTimeout = setTimeout(() => {
        const tooltip = chart.tooltip;
        if (tooltip.getActiveElements().length > 0) {
          tooltip.setActiveElements([], { x: 0, y: 0 });
          chart.update();
        }
      }, 6000); // 6 seconds
    }
  }
};

// Register our custom plugin
ChartJS.register(autoHideTooltipPlugin);

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

  const temperatureChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Temperatur: ${context.parsed.y}°C`;
          },
          title: function(context) {
            return `Datum: ${context[0].label}`;
          }
        },
        displayColors: false,
        padding: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
      },
      autoHideTooltip: {}, // Register our custom plugin
    },
    scales: {
      y: {
        min: 12,
        ticks: {
          callback: function(value) {
            return value + '°C';
          }
        }
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  const humidityChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Luftfeuchtigkeit: ${context.parsed.y}%`;
          },
          title: function(context) {
            return `Datum: ${context[0].label}`;
          }
        },
        displayColors: false,
        padding: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
      },
      autoHideTooltip: {}, // Register our custom plugin
    },
    scales: {
      y: {
        min: 30,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
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
            <Line data={temperatureData} options={temperatureChartOptions} />
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-aptos font-medium mb-4">Luftfeuchtigkeitsverlauf</h3>
            <Line data={humidityData} options={humidityChartOptions} />
          </div>
        </>
      )}
    </div>
  );
}
