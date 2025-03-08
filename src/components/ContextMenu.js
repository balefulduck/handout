'use client';

import { useState } from 'react';
import { WiHumidity } from "react-icons/wi";
import { PiPlantBold } from "react-icons/pi";
import { LuSunMedium } from "react-icons/lu";
import { GiPlantSeed, GiGrowth, GiFlowerPot, GiScythe } from "react-icons/gi";
import { BsChatDots, BsPlusLg } from "react-icons/bs";
import { FaFirstAid } from "react-icons/fa";
import { useRouter, usePathname } from 'next/navigation';

export default function ContextMenu({ activePhase, onPhaseSelect }) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-custom-orange shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-3">
            <button
              onClick={() => router.push('/dashboard')}
              className={`flex items-center justify-center py-1.5 transition-colors relative ${pathname === '/dashboard' ? 'bg-white/20 font-semibold' : 'hover:bg-white/10 font-semibold'}`}
            >
              <span className="text-sm font-semibold text-icon-purple px-2">Dashboard</span>
              {pathname !== '/dashboard' && <div className="absolute right-0 top-1/2 -translate-y-1/2 h-4/5 w-px bg-white/20" />}
            </button>
            <button
              onClick={() => router.push('/plants')}
              className={`flex items-center justify-center py-1.5 transition-colors relative ${pathname === '/plants' ? 'bg-white/20 font-semibold' : 'hover:bg-white/10 font-semibold'}`}
            >
              <span className="text-sm font-semibold text-icon-purple px-2">Pflanzen</span>
              {pathname !== '/plants' && <div className="absolute right-0 top-1/2 -translate-y-1/2 h-4/5 w-px bg-white/20" />}
            </button>
            <button
              onClick={() => router.push('/help')}
              className={`flex items-center justify-center py-1.5 transition-colors ${pathname === '/help' ? 'bg-white/20 font-semibold' : 'hover:bg-white/10 font-semibold'}`}
            >
              <span className="text-sm font-semibold text-icon-purple px-2">Erste Hilfe</span>
            </button>
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-custom-orange shadow-lg border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          {pathname === '/dashboard' && (
            <div className="grid grid-cols-4 gap-3 py-2 px-2">
              <button
                onClick={() => onPhaseSelect('seedling')}
                className={`flex flex-col items-center gap-2 transition-colors`}
              >
                <div className={`p-2 rounded-lg bg-gray-50/95 ${activePhase === 'seedling' ? 'text-icon-purple' : 'text-gray-600 hover:text-icon-purple'}`}>
                  <GiPlantSeed className="text-lg" />
                </div>
                <span className="text-xs text-white font-semibold">Keimling</span>
              </button>

              <button
                onClick={() => onPhaseSelect('vegetation')}
                className={`flex flex-col items-center gap-2 transition-colors`}
              >
                <div className={`p-2 rounded-lg bg-gray-50/95 ${activePhase === 'vegetation' ? 'text-icon-lime' : 'text-gray-600 hover:text-icon-lime'}`}>
                  <GiGrowth className="text-lg" />
                </div>
                <span className="text-xs text-white font-semibold">Vegetation</span>
              </button>

              <button
                onClick={() => onPhaseSelect('flower')}
                className={`flex flex-col items-center gap-2 transition-colors`}
              >
                <div className={`p-2 rounded-lg bg-gray-50/95 ${activePhase === 'flower' ? 'text-icon-olive' : 'text-gray-600 hover:text-icon-olive'}`}>
                  <GiFlowerPot className="text-lg" />
                </div>
                <span className="text-xs text-white font-semibold">Blüte</span>
              </button>

              <button
                onClick={() => onPhaseSelect('harvest')}
                className={`flex flex-col items-center gap-2 transition-colors`}
              >
                <div className={`p-2 rounded-lg bg-gray-50/95 ${activePhase === 'harvest' ? 'text-icon-purple' : 'text-gray-600 hover:text-icon-purple'}`}>
                  <GiScythe className="text-lg" />
                </div>
                <span className="text-xs text-white font-semibold">Ernte</span>
              </button>
            </div>
          )}

          {pathname === '/help' && (
            <div className="grid grid-cols-2 gap-3 py-2 px-2">
              <button
                onClick={() => {/* TODO: Implement Discord integration */}}
                className="flex flex-col items-center gap-2 transition-colors"
              >
                <div className="p-2 rounded-lg bg-gray-50/95 text-gray-600 hover:text-icon-lime">
                  <BsChatDots className="text-lg" />
                </div>
                <span className="text-xs text-white font-semibold">Discord</span>
              </button>

              <button
                onClick={() => {/* TODO: Implement Dr. Cannabis help */}}
                className="flex flex-col items-center gap-2 transition-colors"
              >
                <div className="p-2 rounded-lg bg-gray-50/95 text-gray-600 hover:text-icon-olive">
                  <FaFirstAid className="text-lg" />
                </div>
                <span className="text-xs text-white font-semibold">Dr. Cannabis Hilfe</span>
              </button>
            </div>
          )}

          {pathname === '/plants' && (
            <div className="grid grid-cols-1 py-2 px-2">
              <button
                onClick={() => {/* TODO: Implement new plant functionality */}}
                className="flex flex-col items-center gap-2 transition-colors"
              >
                <div className="p-2 rounded-lg bg-gray-50/95 text-gray-600 hover:text-icon-purple">
                  <BsPlusLg className="text-lg" />
                </div>
                <span className="text-xs text-white font-semibold">Neue Pflanze</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
