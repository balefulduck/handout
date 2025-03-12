'use client';

import { WiHumidity } from "react-icons/wi";
import { PiThermometerSimple, PiPlantBold, PiTestTubeFill } from "react-icons/pi";
import { LuSunMedium } from "react-icons/lu";
import Image from 'next/image';
import DrcInfoTag from '../DrcInfoTag';

export default function FlowerPhase() {
  return (
    <div className="py-6 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {/* Temperature Card */}
          <div className="rounded-xl shadow overflow-hidden col-span-1">
            <div className="bg-olive-green p-3">
              <div className="flex items-center gap-2">
                <PiThermometerSimple className="text-base text-white" />
                <DrcInfoTag 
                  term="temperatur" 
                  color="olive-green" 
                  tooltipContent="Bei zu hohen Temperaturschwankungen kann das Wachstum der Pflanze gehemmt werden."
                >
                  Temperatur
                </DrcInfoTag>
              </div>
            </div>
            <div className="p-4 border-x border-b border-olive-green/20 rounded-b-xl bg-white">
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
            <div className="bg-olive-green p-3">
              <div className="flex items-center gap-2">
                <WiHumidity className="text-base text-white" />
                <DrcInfoTag 
                  term="luftfeuchtigkeit" 
                  color="olive-green" 
                  tooltipContent="Jungpflanzen gleichen die schwache Wurzelstruktur aus, indem sie vermehrt Feuchtigkeit über das Blattwerk aufnehmen"
                >
                  Luftfeuchtigkeit
                </DrcInfoTag>
              </div>
            </div>
            <div className="p-4 border-x border-b border-olive-green/20 rounded-b-xl bg-white">
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-gray-700">40 - 50% RH</span>
              </div>
            </div>
          </div>

          {/* Light Schedule Card */}
          <div className="rounded-xl shadow overflow-hidden">
            <div className="bg-olive-green p-3">
              <div className="flex items-center gap-2">
                <LuSunMedium className="text-base text-white" />
                <DrcInfoTag 
                  term="lichtzyklus" 
                  color="olive-green" 
                  tooltipContent="Bei photoperiodischen Sorten bestimmt der Lichtzyklus die Wachstumsphasen."
                >
                  Lichtzyklus
                </DrcInfoTag>
              </div>
            </div>
            <div className="p-4 border-x border-b border-olive-green/20 rounded-b-xl bg-white">
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-gray-700">12 / 12</span>
              </div>
            </div>
          </div>

          {/* pH Value Card */}
          <div className="rounded-xl shadow overflow-hidden">
            <div className="bg-olive-green p-3">
              <div className="flex items-center gap-2">
                <PiTestTubeFill className="text-base text-white" />
                <DrcInfoTag 
                  term="ph" 
                  color="olive-green" 
                  tooltipContent="Der pH-Wert beeinflusst die Nährstoffaufnahme, Wurzelgesundheit und Pflanzengesundheit. Ein falscher Wert kann Mangelerscheinungen und Wachstumsprobleme verursachen."
                >
                  pH Wert
                </DrcInfoTag>
              </div>
            </div>
            <div className="p-4 border-x border-b border-olive-green/20 rounded-b-xl bg-white">
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-gray-700">5.8 - 6.2</span>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="rounded-xl shadow overflow-hidden col-span-1 sm:col-span-2 md:col-span-3">
            <div className="bg-olive-green p-3">
              <div className="flex items-center gap-2">
                <PiPlantBold className="text-base text-white" />
                <span className="text-base font-bold text-white">Blütephase</span>
              </div>
            </div>
            <div className="p-4 border-x border-b border-olive-green/20 rounded-b-xl bg-white">
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
