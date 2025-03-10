'use client';

import { WiHumidity } from "react-icons/wi";
import { PiThermometerSimple, PiPlantBold, PiTestTubeFill } from "react-icons/pi";
import { LuSunMedium } from "react-icons/lu";

export default function VegetationPhase() {
  return (
    <div className="py-4 px-3">
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Climate Card */}
          <div className="bg-white rounded-xl shadow p-3 border-l-2 border-lime col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 mb-2">
              <WiHumidity className="text-lg text-lime" />
              <span className="text-sm font-medium">60-70% RH</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <PiThermometerSimple className="text-lg text-lime" />
                <span className="text-sm">22-28°C Tag</span>
              </div>
              <div className="flex items-center gap-1.5">
                <PiThermometerSimple className="text-lg text-lime/70" />
                <span className="text-sm">18-22°C Nacht</span>
              </div>
            </div>
          </div>

          {/* Light Schedule - Compact Card */}
          <div className="bg-white rounded-xl shadow p-3 flex items-center justify-center gap-2">
            <LuSunMedium className="text-lg text-amber-500" />
            <span className="text-sm font-medium">18/6</span>
          </div>

          {/* pH Value - Small Square Card */}
          <div className="bg-white rounded-xl shadow p-3 flex flex-col items-center justify-center">
            <PiTestTubeFill className="text-lg text-lime mb-1" />
            <div className="text-center">
              <div className="text-xs font-medium text-gray-600">pH</div>
              <div className="text-sm">5.8-6.5</div>
            </div>
          </div>

          {/* Substrate Card - Full Width */}
          <div className="bg-white rounded-xl shadow p-3 border-l-2 border-lime col-span-2 sm:col-span-3">
            <div className="flex items-center gap-2 mb-1.5">
              <PiPlantBold className="text-lg text-lime" />
              <span className="text-sm font-medium">Wachstumsphase</span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <div className="flex items-center gap-1">
                <span>Dauer:</span>
                <span className="text-gray-600">2-8 Wochen</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Training:</span>
                <span className="text-gray-600">LST, Topping, Scrog</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
