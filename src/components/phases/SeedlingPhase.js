'use client';

import { WiHumidity } from "react-icons/wi";
import { PiThermometerSimple, PiPlantBold, PiTestTubeFill } from "react-icons/pi";
import { LuSunMedium } from "react-icons/lu";
import { BsQuestionCircle } from "react-icons/bs";
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';
import Image from 'next/image';

export default function SeedlingPhase() {
  return (
    <div className="py-4 px-3">
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Temperature Card */}
          <div className="rounded-xl shadow overflow-hidden col-span-1">
            <div className="bg-custom-orange p-3">
              <div className="flex items-center gap-2">
                <PiThermometerSimple className="text-base text-white" />
                <span className="text-base font-bold text-white">Temperatur</span>
              </div>
            </div>
            <div className="p-3 border-x border-b border-custom-orange/20 rounded-b-xl">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-gray-700">20 - 25°C Tagsüber</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-gray-700">18 - 22°C Nachts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Humidity Card */}
          <div className="rounded-xl shadow overflow-hidden col-span-1">
            <div className="bg-custom-orange p-3">
              <div className="flex items-center gap-2">
                <WiHumidity className="text-base text-white" />
                <span className="text-base font-bold text-white">Luftfeuchtigkeit</span>
              </div>
            </div>
            <div className="p-3 border-x border-b border-custom-orange/20 rounded-b-xl">
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-gray-700">80 - 90% RH</span>
              </div>
            </div>
          </div>

          {/* Light Schedule Card */}
          <div className="rounded-xl shadow overflow-hidden">
            <div className="bg-custom-orange p-3">
              <div className="flex items-center gap-2">
                <LuSunMedium className="text-base text-white" />
                <span className="text-base font-bold text-white">Lichtzyklus</span>
              </div>
            </div>
            <div className="p-3 border-x border-b border-custom-orange/20 rounded-b-xl">
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-gray-700">18 / 6</span>
              </div>
            </div>
          </div>

          {/* pH Value Card */}
          <div className="rounded-xl shadow overflow-hidden">
            <div className="bg-custom-orange p-3">
              <div className="flex items-center gap-2">
                <PiTestTubeFill className="text-base text-white" />
                <span className="text-base font-bold text-white">pH Wert</span>
                <Tippy 
                  content={
                    <div className="max-w-xs bg-white p-3 rounded-lg" style={{ border: '1px solid violet' }}>
                      <div className="font-bold text-custom-orange mb-1 flex items-center gap-2">
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
            <div className="p-3 border-x border-b border-custom-orange/20 rounded-b-xl">
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-gray-700">5.8 - 6.8</span>
              </div>
            </div>
          </div>

          {/* Pot Sizes Card */}
          <div className="rounded-xl shadow overflow-hidden col-span-2 sm:col-span-3">
            <div className="bg-custom-orange p-3">
              <div className="flex items-center gap-2">
                <PiPlantBold className="text-base text-white" />
                <span className="text-base font-bold text-white">Topfgrößen</span>
              </div>
            </div>
            <div className="p-3 border-x border-b border-custom-orange/20 rounded-b-xl">
              <p className="mb-5 text-gray-700"><strong>Photoperiodische Sorten</strong> sollten in 0,25 - 1 L Töpfe gepflanzt und nach vollständiger Durchwurzelung in ein Endgefäß mit einem Fassungsvermögen zwischen
                9 und 25 Litern transplantiert werden.
              </p>
              <p className="text-gray-700"><strong>Automatische Sorten</strong> sollten direkt in den Endtopf gepflant werden.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
