'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  const [mounted, setMounted] = useState(false);
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);
  const autoCloseTimerRef = useRef(null);
  
  // Handle client-side rendering for portals
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  // Normalize the term for URL purposes
  const normalizedTerm = term.toLowerCase().replace(/\s+/g, '-');

  // Navigate to detail page
  const navigateToDetailPage = () => {
    router.push(`/drc-info/${normalizedTerm}`);
  };
  
  // Toggle tooltip visibility
  const showTooltip = () => {
    // Clear any existing auto-close timer
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
    }
    
    // Immediately show tooltip - position is pre-calculated in the render
    setIsTooltipVisible(true);
    
    // Set auto-close timer (8 seconds)
    autoCloseTimerRef.current = setTimeout(() => {
      setIsTooltipVisible(false);
    }, 8000);
  };
  
  const hideTooltip = () => {
    // We're not using this for mouseleave anymore, but keeping it for other cases
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
    setIsTooltipVisible(false);
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
    } else {
      // Toggle tooltip on tap for mobile
      setIsTooltipVisible(!isTooltipVisible);
    }
  };

  // Calculate tooltip position
  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return { left: '0px', top: '0px' };
    
    const triggerRect = triggerRef.current.getBoundingClientRect();
    return {
      left: `${triggerRect.left + (triggerRect.width / 2)}px`,
      top: `${triggerRect.bottom + 10}px`
    };
  }, []);
  
  // Update tooltip position when it's visible
  const updateTooltipPosition = useCallback(() => {
    if (!isTooltipVisible || !tooltipRef.current || !triggerRef.current) return;
    
    const { left, top } = calculatePosition();
    tooltipRef.current.style.left = left;
    tooltipRef.current.style.top = top;
  }, [isTooltipVisible, calculatePosition]);
  
  // Handle click outside to close tooltip and update position on scroll/resize
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target) && 
          triggerRef.current && !triggerRef.current.contains(event.target)) {
        setIsTooltipVisible(false);
        if (autoCloseTimerRef.current) {
          clearTimeout(autoCloseTimerRef.current);
          autoCloseTimerRef.current = null;
        }
      }
    };
    
    // Add event listeners for position updates
    window.addEventListener('scroll', updateTooltipPosition, true);
    window.addEventListener('resize', updateTooltipPosition);
    document.addEventListener('mousedown', handleClickOutside);
    
    // Initial position update
    updateTooltipPosition();
    
    return () => {
      window.removeEventListener('scroll', updateTooltipPosition, true);
      window.removeEventListener('resize', updateTooltipPosition);
      document.removeEventListener('mousedown', handleClickOutside);
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
    };
  }, [longPressTimer, updateTooltipPosition]);

  return (
    <div className="drc-info-tag-container inline-block">
      <span
        ref={triggerRef}
        className={`drc-info-tag bg-${color} text-white rounded px-1.5 font-bold hover:brightness-95 transition-all cursor-pointer`}
        onMouseEnter={showTooltip}
        onClick={() => {
          // Toggle tooltip and reset auto-close timer if showing
          setIsTooltipVisible(!isTooltipVisible);
          if (!isTooltipVisible) {
            showTooltip();
          } else {
            hideTooltip();
          }
        }}
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
      
      {mounted && isTooltipVisible && (() => {
        // Pre-calculate position before rendering
        const { left, top } = calculatePosition();
        return createPortal(
          <div 
            ref={tooltipRef}
            className="fixed z-[9999] animate-fadeIn"
            style={{ 
              minWidth: '280px',
              maxWidth: '320px',
              animationDuration: '200ms',
              left: left,
              top: top,
              transform: 'translateX(-50%)',
              transformOrigin: 'top center'
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
                onClick={(e) => {
                  e.stopPropagation();
                  navigateToDetailPage();
                }}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-${color} hover:bg-${color}/90 transition-colors rounded-md w-full justify-center mt-2`}
              >
                <span>Mehr erfahren</span>
                <FaArrowRight size={12} />
              </button>
            </div>
          </div>
          <div 
            className={`absolute left-1/2 -top-2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[8px] border-l-transparent border-r-transparent border-b-${color}`}
          ></div>
          </div>,
          document.body
        );
      })()}     
    </div>
  );
}
