'use client';

import { WiHumidity } from "react-icons/wi";
import { PiThermometerSimple, PiPlantBold, PiTestTubeFill } from "react-icons/pi";
import { LuSunMedium } from "react-icons/lu";

export default function HarvestPhase() {
  return (
    <div className="py-6 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
          {/* Temperature Card */}
          <div className="rounded-xl shadow overflow-hidden col-span-1">
            <div className="bg-turquoise p-3">
              <div className="flex items-center gap-2">
                <PiThermometerSimple className="text-base text-white" />
                <span className="text-base font-bold text-white">Temperatur</span>
              </div>
            </div>
            <div className="p-4 border-x border-b border-turquoise/20 rounded-b-xl bg-white">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-gray-700">16 - 21°C</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-gray-700">Gute Luftzirkulation</span>
                </div>
              </div>
            </div>
          </div>

          {/* Humidity Card */}
          <div className="rounded-xl shadow overflow-hidden col-span-1">
            <div className="bg-turquoise p-3">
              <div className="flex items-center gap-2">
                <WiHumidity className="text-base text-white" />
                <span className="text-base font-bold text-white">Luftfeuchtigkeit</span>
              </div>
            </div>
            <div className="p-4 border-x border-b border-turquoise/20 rounded-b-xl bg-white">
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-gray-700">45 - 55% RH</span>
              </div>
            </div>
          </div>

          {/* Drying Time Card */}
          <div className="rounded-xl shadow overflow-hidden">
            <div className="bg-turquoise p-3">
              <div className="flex items-center gap-2">
                <PiPlantBold className="text-base text-white" />
                <span className="text-base font-bold text-white">Trocknungszeit</span>
              </div>
            </div>
            <div className="p-4 border-x border-b border-turquoise/20 rounded-b-xl bg-white">
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-gray-700">10 - 14 Tage</span>
              </div>
            </div>
          </div>

          {/* Process Card */}
          <div className="rounded-xl shadow overflow-hidden col-span-2 sm:col-span-3">
            <div className="bg-turquoise p-3">
              <div className="flex items-center gap-2">
                <PiPlantBold className="text-base text-white" />
                <span className="text-base font-bold text-white">Ernteprozess</span>
              </div>
            </div>
            <div className="p-4 border-x border-b border-turquoise/20 rounded-b-xl bg-white">
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-700">
                <div className="flex items-center gap-1">
                  <span>Schnitt:</span>
                  <span>Große Blätter entfernen</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>Trocknung:</span>
                  <span>Kopfüber aufhängen</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
