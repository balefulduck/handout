'use client';

import { useState } from 'react';
import { WiHumidity } from "react-icons/wi";
import { PiPlantBold } from "react-icons/pi";
import { LuSunMedium } from "react-icons/lu";
import { GiPlantSeed, GiGrowth, GiFlowerPot, GiScythe } from "react-icons/gi";

export default function ContextMenu({ activePhase, onPhaseSelect }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-lg border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-4 divide-x divide-gray-200">
          <button
            onClick={() => onPhaseSelect('seedling')}
            className={`flex flex-col items-center gap-1 py-3 transition-colors ${activePhase === 'seedling' ? 'text-teal' : 'text-gray-600 hover:text-teal'}`}
          >
            <GiPlantSeed className="text-2xl" />
            <span className="text-sm">Keimling</span>
          </button>

          <button
            onClick={() => onPhaseSelect('vegetation')}
            className={`flex flex-col items-center gap-1 py-3 transition-colors ${activePhase === 'vegetation' ? 'text-lime' : 'text-gray-600 hover:text-lime'}`}
          >
            <GiGrowth className="text-2xl" />
            <span className="text-sm">Vegetation</span>
          </button>

          <button
            onClick={() => onPhaseSelect('flower')}
            className={`flex flex-col items-center gap-1 py-3 transition-colors ${activePhase === 'flower' ? 'text-orange' : 'text-gray-600 hover:text-orange'}`}
          >
            <GiFlowerPot className="text-2xl" />
            <span className="text-sm">Blüte</span>
          </button>

          <button
            onClick={() => onPhaseSelect('harvest')}
            className={`flex flex-col items-center gap-1 py-3 transition-colors ${activePhase === 'harvest' ? 'text-purple' : 'text-gray-600 hover:text-purple'}`}
          >
            <GiScythe className="text-2xl" />
            <span className="text-sm">Ernte</span>
          </button>
        </div>
      </div>
    </div>
  );
}
