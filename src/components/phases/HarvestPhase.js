'use client';

// Icon imports removed

export default function HarvestPhase() {
  return (
    <div className="py-6 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {/* Temperature Card */}
          <div className="rounded-xl shadow overflow-hidden col-span-1">
            <div className="bg-turquoise p-3">
              <div>
                <span className="text-base font-bold text-white break-words w-full">Temperatur</span>
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
              <div>
                <span className="text-base font-bold text-white break-words w-full">Luftfeuchtigkeit</span>
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
              <div>
                <span className="text-base font-bold text-white break-words w-full">Trocknungszeit</span>
              </div>
            </div>
            <div className="p-4 border-x border-b border-turquoise/20 rounded-b-xl bg-white">
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-gray-700">10 - 14 Tage</span>
              </div>
            </div>
          </div>

          {/* Process Card */}
          <div className="rounded-xl shadow overflow-hidden col-span-1 sm:col-span-2 md:col-span-3">
            <div className="bg-turquoise p-3">
              <div>
                <span className="text-base font-bold text-white break-words w-full">Ernteprozess</span>
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
