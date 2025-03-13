'use client';

import React, { useState, useEffect } from 'react';
import { Line, Bubble } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BubbleController,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BubbleController,
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
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

  // Handle window resize for responsive layout
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Filter out days with no temperature or humidity data
  const daysWithData = days.filter(day => 
    day.temperature !== null && day.temperature !== '' && 
    day.humidity !== null && day.humidity !== ''
  );

  // Filter days with watering data
  const daysWithWateringData = days.filter(day => 
    day.watering_amount !== null && 
    day.watering_amount !== '' && 
    day.watering_amount > 0
  );

  // Sort days by date
  const sortedDays = [...daysWithData].sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );

  const sortedWateringDays = [...daysWithWateringData].sort((a, b) => 
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

  // Prepare bubble chart data for watering
  const wateringData = {
    datasets: [
      {
        label: 'Bewässerung (ml)',
        data: sortedWateringDays.map((day, index) => {
          // Log fertilizer data to debug
          if (day.fertilizers && day.fertilizers.length > 0) {
            console.log('Fertilizer data:', day.fertilizers);
          }
          
          return {
            x: index, // x-axis position (day index)
            y: day.watering_amount, // y-axis value (watering amount)
            r: Math.min(Math.max(day.watering_amount / 50, 5), 25), // bubble radius based on watering amount (min 5, max 25)
            // Store additional data for tooltip and coloring
            hasFertilizer: day.fertilizers && day.fertilizers.length > 0,
            fertilizers: day.fertilizers || [],
            date: day.date
          };
        }),
        backgroundColor: function(context) {
          // Check if we have a data point and if it has fertilizer
          const point = context.raw;
          if (point && point.hasFertilizer) {
            return 'rgba(241, 148, 33, 0.7)'; // custom-orange for fertilizer
          }
          return 'rgba(52, 152, 219, 0.7)'; // blue for water only
        },
        borderColor: function(context) {
          const point = context.raw;
          if (point && point.hasFertilizer) {
            return 'rgba(241, 148, 33, 1)'; // custom-orange border for fertilizer
          }
          return 'rgba(52, 152, 219, 1)'; // blue border for water only
        },
        borderWidth: 1,
      }
    ]
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

  const wateringChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          generateLabels: function(chart) {
            return [
              {
                text: 'Nur Wasser',
                fillStyle: 'rgba(52, 152, 219, 0.7)',
                strokeStyle: 'rgba(52, 152, 219, 1)',
                lineWidth: 1,
                hidden: false
              },
              {
                text: 'Mit Dünger',
                fillStyle: 'rgba(241, 148, 33, 0.7)',
                strokeStyle: 'rgba(241, 148, 33, 1)',
                lineWidth: 1,
                hidden: false
              }
            ];
          }
        }
      },
      tooltip: {
        callbacks: {
          title: function(context) {
            const point = context[0].raw;
            return `Datum: ${new Date(point.date).toLocaleDateString('de-DE')}`;
          },
          label: function(context) {
            const point = context.raw;
            const labels = [
              `Bewässerung: ${point.y} ml`
            ];
            
            if (point.hasFertilizer && point.fertilizers.length > 0) {
              labels.push('Dünger:');
              point.fertilizers.forEach(fert => {
                // Use fertilizer_name if available, otherwise fallback to name property
                const fertName = fert.fertilizer_name || fert.name || 'Unbekannter Dünger';
                const amountText = fert.amount ? `: ${fert.amount} ml` : '';
                labels.push(`  • ${fertName}${amountText}`);
              });
            } else {
              labels.push('Nur Wasser (kein Dünger)');
            }
            
            return labels;
          }
        },
        displayColors: false,
        padding: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
      },
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        ticks: {
          callback: function(value) {
            if (Number.isInteger(value) && value >= 0 && value < sortedWateringDays.length) {
              return new Date(sortedWateringDays[value].date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
            }
            return '';
          }
        },
        title: {
          display: true,
          text: 'Datum'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Wassermenge (ml)'
        },
        ticks: {
          callback: function(value) {
            return value + ' ml';
          }
        }
      }
    },
  };

  // Determine if we should use a single column or two columns layout
  const isLargeScreen = windowWidth >= 768; // md breakpoint in Tailwind

  return (
    <div className="space-y-6 mt-4">
      {sortedDays.length === 0 && sortedWateringDays.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Keine Daten verfügbar. Füge Tageseinträge mit Temperatur-, Feuchtigkeits- oder Bewässerungswerten hinzu.
        </div>
      ) : (
        <div className={`grid ${isLargeScreen ? 'grid-cols-2' : 'grid-cols-1'} gap-6`}>
          {sortedDays.length > 0 && (
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
          
          {sortedWateringDays.length > 0 && (
            <div className={`bg-white p-4 rounded-lg shadow-md ${isLargeScreen && sortedDays.length === 0 ? 'col-span-2' : ''}`}>
              <h3 className="text-lg font-aptos font-medium mb-4">Bewässerungsverlauf</h3>
              <div className="h-80"> {/* Increased height for better visualization */}
                <Bubble data={wateringData} options={wateringChartOptions} />
              </div>
              <div className="mt-2 text-xs text-gray-500 italic text-center">
                Tippe auf eine Blase für Details zu Wassermenge und Düngereinsatz
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
