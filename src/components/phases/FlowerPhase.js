'use client';

import { WiHumidity } from "react-icons/wi";
import { PiThermometerSimple, PiPlantBold, PiTestTubeFill } from "react-icons/pi";
import { LuSunMedium } from "react-icons/lu";

export default function FlowerPhase() {
  return (
    <div className="py-4 px-3">
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Temperature Card */}
          <div className="rounded-xl shadow overflow-hidden col-span-1">
            <div className="bg-custom-orange p-3">
              <div className="flex items-center gap-2">
                <PiThermometerSimple className="text-lg text-white" />
                <span className="text-lg font-bold text-white">Temperatur</span>
              </div>
            </div>
            <div className="p-3 border-x border-b border-custom-orange/20 rounded-b-xl">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-gray-700">20 - 26°C Tagsüber</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-gray-700">18 - 20°C Nachts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Humidity Card */}
          <div className="rounded-xl shadow overflow-hidden col-span-1">
            <div className="bg-custom-orange p-3">
              <div className="flex items-center gap-2">
                <WiHumidity className="text-lg text-white" />
                <span className="text-lg font-bold text-white">Luftfeuchtigkeit</span>
              </div>
            </div>
            <div className="p-3 border-x border-b border-custom-orange/20 rounded-b-xl">
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-gray-700">40 - 50% RH</span>
              </div>
            </div>
          </div>

          {/* Light Schedule Card */}
          <div className="rounded-xl shadow overflow-hidden">
            <div className="bg-custom-orange p-3">
              <div className="flex items-center gap-2">
                <LuSunMedium className="text-lg text-white" />
                <span className="text-lg font-bold text-white">Lichtzyklus</span>
              </div>
            </div>
            <div className="p-3 border-x border-b border-custom-orange/20 rounded-b-xl">
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-gray-700">12 / 12</span>
              </div>
            </div>
          </div>

          {/* pH Value Card */}
          <div className="rounded-xl shadow overflow-hidden">
            <div className="bg-custom-orange p-3">
              <div className="flex items-center gap-2">
                <PiTestTubeFill className="text-lg text-white" />
                <span className="text-lg font-bold text-white">pH Wert</span>
              </div>
            </div>
            <div className="p-3 border-x border-b border-custom-orange/20 rounded-b-xl">
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-gray-700">5.8 - 6.2</span>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="rounded-xl shadow overflow-hidden col-span-2 sm:col-span-3">
            <div className="bg-custom-orange p-3">
              <div className="flex items-center gap-2">
                <PiPlantBold className="text-lg text-white" />
                <span className="text-lg font-bold text-white">Blütephase</span>
              </div>
            </div>
            <div className="p-3 border-x border-b border-custom-orange/20 rounded-b-xl">
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-700">
                <div className="flex items-center gap-1">
                  <span>Dauer:</span>
                  <span>8-12 Wochen</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
