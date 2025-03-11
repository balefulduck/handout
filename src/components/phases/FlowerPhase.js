'use client';

import { WiHumidity } from "react-icons/wi";
import { PiThermometerSimple, PiPlantBold, PiTestTubeFill } from "react-icons/pi";
import { LuSunMedium } from "react-icons/lu";
import { BsQuestionCircle } from "react-icons/bs";
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';
import Image from 'next/image';

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
                <span className="text-base font-bold text-white">Temperatur</span>
                <Tippy 
                  content={
                    <div className="max-w-xs bg-white p-3 rounded-lg" style={{ border: '1px solid violet' }}>
                      <div className="font-bold text-olive-green mb-1 flex items-center gap-2">
                        <Image src="/1.webp" width={45} height={45} alt="Icon" priority />
                        <span>Dr. Cannabis informiert:</span>
                      </div>
                      <div className="text-sm text-gray-700">
                        Bei zu hohen Temperaturschwankungen kann das Wachstum der Pflanze gehemmt werden.
                      </div>
                    </div>
                  }
                  animation="scale"
                  duration={[300, 250]}
                  hideOnClick={true}
                  trigger="mouseenter click"
                  interactive={true}
                  maxWidth={300}
                  onShow={(instance) => {
                    setTimeout(() => {
                      instance.hide();
                    }, 5000);
                  }}
                  theme="light"
                >
                  <span>
                    <BsQuestionCircle className="text-white text-sm cursor-help ml-1 opacity-80 hover:opacity-100 transition-opacity" style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.2))' }} />
                  </span>
                </Tippy>
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
                <span className="text-base font-bold text-white">Luftfeuchtigkeit</span>
                <Tippy 
                  content={
                    <div className="max-w-xs bg-white p-3 rounded-lg" style={{ border: '1px solid violet' }}>
                      <div className="font-bold text-olive-green mb-1 flex items-center gap-2">
                        <Image src="/1.webp" width={45} height={45} alt="Icon" priority />
                        <span>Dr. Cannabis informiert:</span>
                      </div>
                      <div className="text-sm text-gray-700">
                        Jungpflanzen gleichen die schwache Wurzelstruktur aus, indem sie vermehrt Feuchtigkeit über das Blattwerk aufnehmen
                      </div>
                    </div>
                  }
                  animation="scale"
                  duration={[300, 250]}
                  hideOnClick={true}
                  trigger="mouseenter click"
                  interactive={true}
                  maxWidth={300}
                  onShow={(instance) => {
                    setTimeout(() => {
                      instance.hide();
                    }, 5000);
                  }}
                  theme="light"
                >
                  <span>
                    <BsQuestionCircle className="text-white text-sm cursor-help ml-1 opacity-80 hover:opacity-100 transition-opacity" style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.2))' }} />
                  </span>
                </Tippy>
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
                <span className="text-base font-bold text-white">Lichtzyklus</span>
                <Tippy 
                  content={
                    <div className="max-w-xs bg-white p-3 rounded-lg" style={{ border: '1px solid violet' }}>
                      <div className="font-bold text-olive-green mb-1 flex items-center gap-2">
                        <Image src="/1.webp" width={45} height={45} alt="Icon" priority />
                        <span>Dr. Cannabis informiert:</span>
                      </div>
                      <div className="text-sm text-gray-700">
                        Bei photoperiodischen Sorten bestimmt der Lichtzyklus die Wachstumsphasen.
                      </div>
                    </div>
                  }
                  animation="scale"
                  duration={[300, 250]}
                  hideOnClick={true}
                  trigger="mouseenter click"
                  interactive={true}
                  maxWidth={300}
                  onShow={(instance) => {
                    setTimeout(() => {
                      instance.hide();
                    }, 5000);
                  }}
                  theme="light"
                >
                  <span>
                    <BsQuestionCircle className="text-white text-sm cursor-help ml-1 opacity-80 hover:opacity-100 transition-opacity" style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.2))' }} />
                  </span>
                </Tippy>
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
                <span className="text-base font-bold text-white">pH Wert</span>
                <Tippy 
                  content={
                    <div className="max-w-xs bg-white p-3 rounded-lg" style={{ border: '1px solid violet' }}>
                      <div className="font-bold text-olive-green mb-1 flex items-center gap-2">
                        <Image src="/1.webp" width={45} height={45} alt="Icon" priority />
                        <span>Dr. Cannabis informiert:</span>
                      </div>
                      <div className="text-sm text-gray-700">
                        Der pH-Wert beeinflusst die Nährstoffaufnahme, Wurzelgesundheit und Pflanzengesundheit. Ein falscher Wert kann Mangelerscheinungen und Wachstumsprobleme verursachen.
                      </div>
                    </div>
                  }
                  animation="scale"
                  duration={[300, 250]}
                  hideOnClick={true}
                  trigger="mouseenter click"
                  interactive={true}
                  maxWidth={300}
                  onShow={(instance) => {
                    setTimeout(() => {
                      instance.hide();
                    }, 5000);
                  }}
                  theme="light"
                >
                  <span>
                    <BsQuestionCircle className="text-white text-sm cursor-help ml-1 opacity-80 hover:opacity-100 transition-opacity" style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.2))' }} />
                  </span>
                </Tippy>
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
