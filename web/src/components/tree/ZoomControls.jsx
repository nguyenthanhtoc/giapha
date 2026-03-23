'use client';

import React from 'react';

export default function ZoomControls({ onZoomIn, onZoomOut, isPanelOpen }) {
  return (
    <div className={`absolute left-4 flex gap-2 z-20 transition-all duration-300 ${isPanelOpen ? 'bottom-[420px] sm:bottom-4' : 'bottom-4'}`}>
      <button
        onClick={onZoomIn}
        className="w-12 h-12 sm:w-10 sm:h-10 bg-zinc-900/80 hover:bg-zinc-800 text-white rounded-xl sm:rounded-lg shadow-xl flex items-center justify-center text-xl sm:text-base font-bold transition-all border border-zinc-700/50 backdrop-blur-md"
      >
        +
      </button>
      <button
        onClick={onZoomOut}
        className="w-12 h-12 sm:w-10 sm:h-10 bg-zinc-900/80 hover:bg-zinc-800 text-white rounded-xl sm:rounded-lg shadow-xl flex items-center justify-center text-xl sm:text-base font-bold transition-all border border-zinc-700/50 backdrop-blur-md"
      >
        -
      </button>
    </div>
  );
}
