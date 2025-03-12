'use client';

import React, { useState, useEffect } from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaArrowRight } from 'react-icons/fa';

/**
 * DrcInfoTag - Component for Dr. Cannabis terminology that provides 
 * both tooltip information and links to detailed information pages.
 * 
 * @param {Object} props
 * @param {string} props.term - The term to be highlighted (e.g., "pH")
 * @param {React.ReactNode} props.children - The content to be displayed
 * @param {string} props.tooltipContent - The content for the tooltip
 * @param {string} props.color - The accent color for the tooltip header (default: "olive-green")
 */
export default function DrcInfoTag({ term, children, tooltipContent, color = "olive-green" }) {
  const router = useRouter();
  const [isLongPress, setIsLongPress] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState(null);
  
  // Normalize the term for URL purposes
  const normalizedTerm = term.toLowerCase().replace(/\s+/g, '-');

  // Navigate to detail page
  const navigateToDetailPage = () => {
    router.push(`/drc-info/${normalizedTerm}`);
  };
  
  // Mobile long press handlers
  const handleTouchStart = () => {
    const timer = setTimeout(() => {
      setIsLongPress(true);
    }, 500); // 500ms threshold for long press
    
    setLongPressTimer(timer);
  };
  
  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
    }
    
    if (isLongPress) {
      navigateToDetailPage();
      setIsLongPress(false);
    }
  };
  
  // Clean up the timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [longPressTimer]);

  return (
    <span className="drc-info-tag-container inline-flex items-center">
      <Tippy
        content={
          <div className="max-w-xs rounded-lg overflow-hidden" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <div className={`bg-${color} p-3 flex items-center gap-2`}>
              <Image src="/1.webp" width={45} height={45} alt="Icon" priority className="rounded-full border-2 border-white/70" />
              <span className="text-white font-bold">Dr. Cannabis informiert:</span>
            </div>
            <div className="p-3 bg-white">
              <div className="text-sm text-gray-700 mb-3">
                {tooltipContent}
              </div>
              <button 
                onClick={navigateToDetailPage}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-${color} hover:bg-${color}/90 transition-colors rounded-md w-full justify-center mt-2`}
              >
                <span>Mehr erfahren</span>
                <FaArrowRight size={12} />
              </button>
            </div>
          </div>
        }
        animation="scale"
        duration={[300, 250]}
        hideOnClick={false}
        trigger="mouseenter click"
        interactive={true}
        maxWidth={300}
        placement="bottom"
        theme="light"
      >
        <span
          className={`drc-info-tag bg-${color} text-white rounded px-1.5 font-bold relative hover:brightness-95 transition-all cursor-pointer`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            textDecoration: 'underline',
            textDecorationStyle: 'dotted',
            textDecorationColor: 'rgba(255,255,255,0.7)',
            textUnderlineOffset: '2px'
          }}
        >
          {children}
        </span>
      </Tippy>
    </span>
  );
}
