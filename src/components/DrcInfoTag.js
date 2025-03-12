'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);
  
  // Normalize the term for URL purposes
  const normalizedTerm = term.toLowerCase().replace(/\s+/g, '-');

  // Navigate to detail page
  const navigateToDetailPage = () => {
    router.push(`/drc-info/${normalizedTerm}`);
  };
  
  // Toggle tooltip visibility
  const showTooltip = () => setIsTooltipVisible(true);
  const hideTooltip = () => setIsTooltipVisible(false);
  
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
    } else {
      // Toggle tooltip on tap for mobile
      setIsTooltipVisible(!isTooltipVisible);
    }
  };

  // Handle click outside to close tooltip
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target) && 
          triggerRef.current && !triggerRef.current.contains(event.target)) {
        setIsTooltipVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [longPressTimer]);

  return (
    <span className="drc-info-tag-container inline-flex items-center relative">
      <span
        ref={triggerRef}
        className={`drc-info-tag bg-${color} text-white rounded px-1.5 font-bold relative hover:brightness-95 transition-all cursor-pointer`}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onClick={() => setIsTooltipVisible(!isTooltipVisible)}
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
      
      {isTooltipVisible && (
        <div 
          ref={tooltipRef}
          className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full z-50 mt-2 animate-fadeIn"
          style={{ 
            minWidth: '280px',
            maxWidth: '320px',
            marginTop: '8px', 
            animationDuration: '300ms' 
          }}
        >
          <div className="max-w-xs rounded-lg overflow-hidden shadow-lg">
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
          {/* Arrow pointer */}
          <div 
            className={`absolute left-1/2 -top-2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[8px] border-l-transparent border-r-transparent border-b-${color}`}
          ></div>
        </div>
      )}
    </span>
  );
}
