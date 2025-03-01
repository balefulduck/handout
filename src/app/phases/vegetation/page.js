'use client';

import { WiHumidity } from "react-icons/wi";
import { PiThermometerSimple, PiPlantBold } from "react-icons/pi";
import { LuSunMedium } from "react-icons/lu";

export default function VegetationPhasePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-4 px-3">
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Climate Young Plants */}
          <div className="bg-white rounded-xl shadow p-3 border-l-2 border-lime">
            <div className="flex items-center gap-1.5 mb-1">
              <PiPlantBold className="text-lg text-lime/70" />
              <span className="text-xs font-medium">Jung</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <PiThermometerSimple className="text-lg text-lime" />
                <span className="text-sm">22-25°C Tag</span>
              </div>
              <div className="flex items-center gap-1.5">
                <PiThermometerSimple className="text-lg text-lime/70" />
                <span className="text-sm">18-22°C Nacht</span>
              </div>
            </div>
          </div>

          {/* Climate Mature Plants */}
          <div className="bg-white rounded-xl shadow p-3 border-l-2 border-lime">
            <div className="flex items-center gap-1.5 mb-1">
              <PiPlantBold className="text-lg text-lime" />
              <span className="text-xs font-medium">Reif</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <PiThermometerSimple className="text-lg text-lime" />
                <span className="text-sm">22-28°C Tag</span>
              </div>
              <div className="flex items-center gap-1.5">
                <PiThermometerSimple className="text-lg text-lime/70" />
                <span className="text-sm">18-24°C Nacht</span>
              </div>
            </div>
          </div>

          {/* Humidity Card */}
          <div className="bg-white rounded-xl shadow p-3 flex items-center justify-center gap-2">
            <WiHumidity className="text-xl text-lime" />
            <span className="text-sm font-medium">65-75%</span>
          </div>

          {/* Light Schedule - Compact Card */}
          <div className="bg-white rounded-xl shadow p-3 flex items-center justify-center gap-2 col-span-2 sm:col-span-3">
            <LuSunMedium className="text-lg text-amber-500" />
            <span className="text-sm font-medium">18/6</span>
          </div>
        </div>
      </div>
    </div>
  );
}
