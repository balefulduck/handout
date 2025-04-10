'use client';

import React from 'react';

const TutorialVideo = () => {
  const handleVideoClick = (e) => {
    if (window.innerWidth <= 768) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        e.target.requestFullscreen();
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="rounded-lg overflow-hidden shadow-lg w-full max-w-2xl">
        <video 
          src="/tutorial.mp4" 
          className="w-full h-auto" 
          autoPlay 
          loop 
          muted 
          playsInline
          onClick={handleVideoClick}
        />
      </div>
      <p className="text-xs text-gray-500 mt-2 md:hidden">Tippe auf das Video für Vollbild</p>
    </div>
  );
};

export default TutorialVideo;
