'use client';

import { WiHumidity } from "react-icons/wi";
import { PiThermometerSimple, PiPlantBold, PiTestTubeFill } from "react-icons/pi";
import { LuSunMedium } from "react-icons/lu";

export default function SeedlingPhase() {
  return (
    <div className="py-4 px-3">
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Temperature Card */}
          <div className="bg-white rounded-xl shadow p-3 border-l-2 border-teal col-span-1">
            <div className="flex items-center gap-2 mb-1.5">
              <PiThermometerSimple className="text-lg text-teal" />
              <span className="text-lg font-medium underline">Temperatur</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                
                <span className="text-sm">20 - 25°C Tagsüber</span>
              </div>
              <div className="flex items-center gap-1.5">
         
                <span className="text-sm">18 - 22°C Nachts</span>
              </div>
            </div>
          </div>

          {/* Humidity Card */}
          <div className="bg-white rounded-xl shadow p-3 border-l-2 border-teal col-span-1">
            <div className="flex items-center gap-2 mb-1.5">
              <WiHumidity className="text-lg text-teal" />
              <span className="text-lg font-medium underline">Luftfeuchtigkeit</span>
            </div>
            <div className="flex items-center gap-1.5">
           
              <span className="text-sm">80 - 90% RH</span>
            </div>
          </div>

          {/* Light Schedule Card */}
          <div className="bg-white rounded-xl shadow p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <LuSunMedium className="text-lg text-amber-500" />
              <span className="text-lg font-medium underline">Lichtzyklus</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm">18 / 6</span>
            </div>
          </div>

          {/* pH Value Card */}
          <div className="bg-white rounded-xl shadow p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <PiTestTubeFill className="text-lg text-teal" />
              <span className="text-lg font-medium underline">pH Wert</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm">5.8 - 6.8</span>
            </div>
          </div>

          {/* Pot Sizes Card */}
          <div className="bg-white rounded-xl shadow p-3 border-l-2 border-teal col-span-2 sm:col-span-3">
            <div className="flex items-center gap-2 mb-1.5">
              <PiPlantBold className="text-lg text-teal" />
              <span className="text-lg font-medium underline">Topfgrößen</span>
            </div>
            <p className="mb-5"><strong>Photoperiodische Sorten</strong> sollten in 0,25 - 1 L Töpfe gepflanzt und nach vollständiger Durchwurzelung in ein Endgefäß mit einem Fassungsvermögen zwischen
              9 und 25 Litern transplantiert werden.
            </p>
            <p><strong>Automatische Sorten</strong> sollten direkt in den Endtopf gepflant werden.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
