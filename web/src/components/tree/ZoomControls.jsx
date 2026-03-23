'use client';

import React from 'react';

export default function ZoomControls({ onZoomIn, onZoomOut }) {
  return (
    <div className="absolute bottom-4 left-4 flex gap-2 z-20">
      <button
        onClick={onZoomIn}
        className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg shadow-lg flex items-center justify-center font-bold transition-all border border-zinc-700/50"
      >
        +
      </button>
      <button
        onClick={onZoomOut}
        className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg shadow-lg flex items-center justify-center font-bold transition-all border border-zinc-700/50"
      >
        -
      </button>
    </div>
  );
}
