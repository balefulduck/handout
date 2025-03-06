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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-custom-orange shadow-lg border-t border-gray-200 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-3 divide-x divide-gray-200 border-b border-gray-200">
          <button
            onClick={() => router.push('/dashboard')}
            className={`flex items-center justify-center py-1.5 transition-colors ${pathname === '/dashboard' ? 'bg-white/20 font-semibold' : 'hover:bg-white/10 font-semibold'}`}
          >
            <span className="text-sm font-semibold">Daten</span>
          </button>
          <button
            onClick={() => router.push('/plants')}
            className={`flex items-center justify-center py-1.5 transition-colors ${pathname === '/plants' ? 'bg-white/20 font-semibold' : 'hover:bg-white/10 font-semibold'}`}
          >
            <span className="text-sm font-semibold">Pflanzen</span>
          </button>
          <button
            onClick={() => router.push('/help')}
            className={`flex items-center justify-center py-1.5 transition-colors ${pathname === '/help' ? 'bg-white/20 font-semibold' : 'hover:bg-white/10 font-semibold'}`}
          >
            <span className="text-sm font-semibold">Erste Hilfe</span>
          </button>
        </div>
        {pathname === '/dashboard' && (
          <div className="grid grid-cols-4 divide-x divide-gray-200">
            <button
              onClick={() => onPhaseSelect('seedling')}
              className={`flex flex-col items-center gap-1 py-3 transition-colors ${activePhase === 'seedling' ? 'text-icon-purple font-semibold' : 'text-white/80 hover:text-icon-purple font-semibold'}`}
            >
              <GiPlantSeed className="text-2xl" />
              <span className="text-sm">Keimling</span>
            </button>

            <button
              onClick={() => onPhaseSelect('vegetation')}
              className={`flex flex-col items-center gap-1 py-3 transition-colors ${activePhase === 'vegetation' ? 'text-icon-lime font-semibold' : 'text-white/80 hover:text-icon-lime font-semibold'}`}
            >
              <GiGrowth className="text-2xl" />
              <span className="text-sm">Vegetation</span>
            </button>

            <button
              onClick={() => onPhaseSelect('flower')}
              className={`flex flex-col items-center gap-1 py-3 transition-colors ${activePhase === 'flower' ? 'text-icon-olive font-semibold' : 'text-white/80 hover:text-icon-olive font-semibold'}`}
            >
              <GiFlowerPot className="text-2xl" />
              <span className="text-sm">Blüte</span>
            </button>

            <button
              onClick={() => onPhaseSelect('harvest')}
              className={`flex flex-col items-center gap-1 py-3 transition-colors ${activePhase === 'harvest' ? 'text-icon-purple font-semibold' : 'text-white/80 hover:text-icon-purple font-semibold'}`}
            >
              <GiScythe className="text-2xl" />
              <span className="text-sm">Ernte</span>
            </button>
          </div>
        )}

        {pathname === '/help' && (
          <div className="grid grid-cols-2 divide-x divide-gray-200">
            <button
              onClick={() => {/* TODO: Implement Discord integration */}}
              className="flex flex-col items-center gap-1 py-3 transition-colors text-white/80 hover:text-icon-lime font-semibold"
            >
              <BsChatDots className="text-2xl" />
              <span className="text-sm">Discord</span>
            </button>

            <button
              onClick={() => {/* TODO: Implement Dr. Cannabis help */}}
              className="flex flex-col items-center gap-1 py-3 transition-colors text-white/80 hover:text-icon-olive font-semibold"
            >
              <FaFirstAid className="text-2xl" />
              <span className="text-sm">Dr. Cannabis Hilfe</span>
            </button>
          </div>
        )}

        {pathname === '/plants' && (
          <div className="grid grid-cols-1 divide-x divide-gray-200">
            <button
              onClick={() => {/* TODO: Implement new plant functionality */}}
              className="flex flex-col items-center gap-1 py-3 transition-colors text-white/80 hover:text-icon-purple font-semibold"
            >
              <BsPlusLg className="text-2xl" />
              <span className="text-sm">Neue Pflanze</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
