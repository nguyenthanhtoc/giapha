import React from 'react';

export default function InfoField({ label, value, onEdit, placeholder, isAdmin, isBold = false }) {
  if (isAdmin) {
    return (
      <div className="flex flex-col">
        <span className="text-amber-900/40 text-[9px] uppercase tracking-widest font-bold">{label}</span>
        <input
          type="text"
          value={value}
          onChange={(e) => onEdit(e.target.value)}
          className={`mt-1 bg-white/50 text-red-900 border border-amber-800/10 rounded px-2 py-1 text-xs outline-none focus:border-amber-800/40 transition-colors ${isBold ? 'font-black' : ''}`}
          placeholder={placeholder}
        />
      </div>
    );
  }
  return (
    <div className="flex flex-col">
      <span className="text-amber-900/40 text-[9px] uppercase tracking-widest font-bold">{label}</span>
      <span className={`mt-0.5 font-spectral ${value ? 'text-red-900 text-sm font-bold' : 'text-red-900/40 text-[10px] font-medium italic'}`}>
        {value || 'Chưa có thông tin'}
      </span>
    </div>
  );
}
