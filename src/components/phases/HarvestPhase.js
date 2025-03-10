'use client';

import { WiHumidity } from "react-icons/wi";
import { PiThermometerSimple, PiPlantBold, PiTestTubeFill } from "react-icons/pi";
import { LuSunMedium } from "react-icons/lu";

export default function HarvestPhase() {
  return (
    <div className="py-4 px-3">
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Climate Card */}
          <div className="bg-white rounded-xl shadow p-3 border-l-2 border-purple col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 mb-2">
              <WiHumidity className="text-lg text-purple" />
              <span className="text-sm font-medium">45-55% RH</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <PiThermometerSimple className="text-lg text-purple" />
                <span className="text-sm">16-21°C</span>
              </div>
              <div className="flex items-center gap-1.5">
                <PiThermometerSimple className="text-lg text-purple/70" />
                <span className="text-sm">Gute Luftzirkulation</span>
              </div>
            </div>
          </div>

          {/* Drying Time Card */}
          <div className="bg-white rounded-xl shadow p-3 flex items-center justify-center gap-2">
            <PiPlantBold className="text-lg text-purple" />
            <span className="text-sm font-medium">10-14 Tage</span>
          </div>


          {/* Process Card - Full Width */}
          <div className="bg-white rounded-xl shadow p-3 border-l-2 border-purple col-span-2 sm:col-span-3">
            <div className="flex items-center gap-2 mb-1.5">
              <PiPlantBold className="text-lg text-purple" />
              <span className="text-sm font-medium">Ernteprozess</span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <div className="flex items-center gap-1">
                <span>Schnitt:</span>
                <span className="text-gray-600">Große Blätter entfernen</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Trocknung:</span>
                <span className="text-gray-600">Kopfüber aufhängen</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
