'use client';

import { WiHumidity } from "react-icons/wi";
import { PiThermometerSimple, PiPlantBold, PiTestTubeFill } from "react-icons/pi";
import { LuSunMedium } from "react-icons/lu";
import Image from 'next/image';
import DrcInfoTag from '../DrcInfoTag';

export default function VegetationPhase() {
  return (
    <div className="py-6 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {/* Temperature Card */}
          <div className="rounded-xl shadow overflow-hidden col-span-1">
            <div className="bg-yellow-green p-3">
              <div className="flex items-center gap-2">
                <PiThermometerSimple className="text-base text-white" />
                <DrcInfoTag 
                  term="temperatur" 
                  color="yellow-green" 
                  bgMode="dark"
                  tooltipContent="Bei zu hohen Temperaturschwankungen kann das Wachstum der Pflanze gehemmt werden."
                >
                  Temperatur
                </DrcInfoTag>
              </div>
            </div>
            <div className="p-4 border-x border-b border-yellow-green/20 rounded-b-xl bg-white">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-gray-700">22 - 28°C Tagsüber</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-gray-700">18 - 22°C Nachts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Humidity Card */}
          <div className="rounded-xl shadow overflow-hidden col-span-1">
            <div className="bg-yellow-green p-3">
              <div className="flex items-center gap-2">
                <WiHumidity className="text-base text-white" />
                <DrcInfoTag 
                  term="luftfeuchtigkeit" 
                  color="yellow-green" 
                  bgMode="dark"
                  tooltipContent="Etablierte Pflanzen können ausreichend Wasser über die Wurzeln aufnehmen. Eine geringere Luftfeuchtigkeit als während der Keimlingsphase kann das Schädlingsrisiko verringern."
                >
                  Luftfeuchtigkeit
                </DrcInfoTag>
              </div>
            </div>
            <div className="p-4 border-x border-b border-yellow-green/20 rounded-b-xl bg-white">
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-gray-700">60 - 70% RH</span>
              </div>
            </div>
          </div>

          {/* Light Schedule Card */}
          <div className="rounded-xl shadow overflow-hidden">
            <div className="bg-yellow-green p-3">
              <div className="flex items-center gap-2">
                <LuSunMedium className="text-base text-white" />
                <DrcInfoTag 
                  term="lichtzyklus" 
                  color="yellow-green" 
                  bgMode="dark"
                  tooltipContent="Bei photoperiodischen Sorten bestimmt der Lichtzyklus die Wachstumsphasen."
                >
                  Lichtzyklus
                </DrcInfoTag>
              </div>
            </div>
            <div className="p-4 border-x border-b border-yellow-green/20 rounded-b-xl bg-white">
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-gray-700">18 / 6</span>
              </div>
            </div>
          </div>

          {/* pH Value Card */}
          <div className="rounded-xl shadow overflow-hidden">
            <div className="bg-yellow-green p-3">
              <div className="flex items-center gap-2">
                <PiTestTubeFill className="text-base text-white" />
                <DrcInfoTag 
                  term="pH" 
                  color="yellow-green"
                  bgMode="dark" 
                  tooltipContent="Der pH-Wert beeinflusst die Nährstoffaufnahme, Wurzelgesundheit und Pflanzengesundheit. Ein falscher Wert kann Mangelerscheinungen und Wachstumsprobleme verursachen."
                >
                  pH Wert
                </DrcInfoTag>
              </div>
            </div>
            <div className="p-4 border-x border-b border-yellow-green/20 rounded-b-xl bg-white">
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-gray-700">5.8 - 6.5</span>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="rounded-xl shadow overflow-hidden col-span-1 sm:col-span-2 md:col-span-3">
            <div className="bg-yellow-green p-3">
              <div className="flex items-center gap-2">
                <PiPlantBold className="text-base text-white" />
                <span className="text-base font-bold text-white">Wachstumsphase</span>
              </div>
            </div>
            <div className="p-4 border-x border-b border-yellow-green/20 rounded-b-xl bg-white">
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-700">
                <div className="flex items-center gap-1">
                  <span>Dauer:</span>
                  <span>2-8 Wochen</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>Training:</span>
                  <span>LST, Topping, Scrog</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
