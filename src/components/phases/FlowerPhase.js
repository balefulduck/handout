'use client';

// Icon imports removed
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
              <div>
                <DrcInfoTag 
                  term="temperatur" 
                  color="olive-green" 
                  bgMode="dark"
                  tooltipContent="Bei zu hohen Temperaturschwankungen kann das Wachstum der Pflanze gehemmt werden."
                >
                  <span className="break-words w-full">Temperatur</span>
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
              <div>
                <DrcInfoTag 
                  term="luftfeuchtigkeit" 
                  color="olive-green" 
                  bgMode="dark"
                  tooltipContent="Jungpflanzen gleichen die schwache Wurzelstruktur aus, indem sie vermehrt Feuchtigkeit über das Blattwerk aufnehmen"
                >
                  <span className="break-words w-full">Luftfeuchtigkeit</span>
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
              <div>
                <DrcInfoTag 
                  term="lichtzyklus" 
                  color="olive-green" 
                  bgMode="dark"
                  tooltipContent="Bei photoperiodischen Sorten bestimmt der Lichtzyklus die Wachstumsphasen."
                >
                  <span className="break-words w-full">Lichtzyklus</span>
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
              <div>
                <DrcInfoTag 
                  term="pH" 
                  color="olive-green" 
                  bgMode="dark"
                  tooltipContent="Der pH-Wert beeinflusst die Nährstoffaufnahme, Wurzelgesundheit und Pflanzengesundheit. Ein falscher Wert kann Mangelerscheinungen und Wachstumsprobleme verursachen."
                >
                  <span className="break-words w-full">pH Wert</span>
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
              <div>
                <span className="text-base font-bold text-white break-words w-full">Blütephase</span>
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
