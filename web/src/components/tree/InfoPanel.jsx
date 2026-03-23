'use client';

import React, { useState, useEffect } from 'react';

export default function InfoPanel({ 
  selectedPerson, 
  setSelectedPerson, 
  isAdmin, 
  onUpdate, 
  onDelete, 
  onAddChild, 
  onAddSpouse 
}) {
  const [editName, setEditName] = useState('');
  const [editBorn, setEditBorn] = useState('');

  useEffect(() => {
    if (selectedPerson) {
      setEditName(selectedPerson.name || '');
      setEditBorn(selectedPerson.born || '');
    }
  }, [selectedPerson]);

  if (!selectedPerson) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 sm:bottom-auto sm:left-auto sm:top-1/2 sm:right-1/2 sm:translate-x-1/2 sm:-translate-y-1/2 max-w-none sm:max-w-md w-full z-40 transition-all duration-500 transform translate-y-0 p-4 sm:p-0">
      {/* Scroll Background Container */}
      <div className="relative bg-[#fdf2d9] border-x-[12px] border-amber-900/10 shadow-2xl rounded-sm overflow-hidden min-h-[400px] flex flex-col">
        {/* Top Roller */}
        <div className="h-4 bg-gradient-to-b from-amber-950 to-amber-900 w-full shadow-inner relative">
          <div className="absolute -left-2 -top-1 w-6 h-6 bg-amber-900 rounded-full border border-amber-950 shadow-md" />
          <div className="absolute -right-2 -top-1 w-6 h-6 bg-amber-900 rounded-full border border-amber-950 shadow-md" />
        </div>

        {/* Parchment Content */}
        <div className="flex-1 px-8 py-10 relative overflow-y-auto max-h-[80vh] sm:max-h-[600px] scrollbar-thin scrollbar-thumb-amber-900/20 text-red-900">
          <button
            onClick={() => setSelectedPerson(null)}
            className="absolute top-2 right-2 text-amber-900/40 hover:text-amber-900 transition-colors"
          >
            ✕
          </button>

          <div className="flex flex-col items-center">
            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-3xl sm:text-4xl font-bold ${selectedPerson.gender === 'male' ? 'bg-blue-100 text-blue-900' : 'bg-pink-100 text-pink-900'} border-4 border-white shadow-xl mb-6`}>
              {selectedPerson.name.charAt(0)}
            </div>

            {isAdmin ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-center bg-transparent text-red-900 border-b-2 border-amber-800/30 px-3 py-2 text-3xl font-black w-full outline-none font-spectral"
                placeholder="Tên thành viên"
              />
            ) : (
              <h2 className="text-3xl sm:text-4xl font-black text-red-900 uppercase tracking-wide text-center font-spectral leading-tight">
                {selectedPerson.name}
              </h2>
            )}

            <div className="flex items-center gap-3 mt-4">
               <div className="h-px w-8 bg-amber-800/30" />
               <p className="text-sm text-amber-800 font-bold uppercase tracking-[0.2em]">{selectedPerson.role || 'Thành viên'}</p>
               <div className="h-px w-8 bg-amber-800/30" />
            </div>

            <div className="mt-10 w-full grid grid-cols-2 gap-8 text-center border-y border-amber-800/10 py-6">
              <div className="flex flex-col">
                <span className="text-amber-900/50 text-xs uppercase tracking-widest font-bold">Sinh Năm</span>
                {isAdmin ? (
                  <input
                    type="text"
                    value={editBorn}
                    onChange={(e) => setEditBorn(e.target.value)}
                    className="mt-2 bg-white/50 text-red-900 border border-amber-800/20 rounded px-2 py-1 text-base text-center w-full"
                    placeholder="Năm sinh"
                  />
                ) : (
                  <span className="mt-2 text-red-900 text-xl font-bold font-spectral">{selectedPerson.born || 'N/A'}</span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-amber-900/50 text-xs uppercase tracking-widest font-bold">Mất Năm</span>
                <span className="mt-2 text-red-900 text-xl font-bold font-spectral">{selectedPerson.death || 'Hiện tại'}</span>
              </div>
            </div>

            {isAdmin && (
              <div className="mt-10 w-full space-y-4">
                <button
                  onClick={() => onUpdate(selectedPerson.id, editName, editBorn)}
                  className="w-full bg-red-800 hover:bg-red-700 active:scale-[0.98] text-amber-50 font-bold py-4 px-6 rounded-sm transition-all shadow-lg border-b-4 border-red-950 uppercase tracking-widest text-sm"
                >
                  Cập Nhật Gia Phả
                </button>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => onAddChild(selectedPerson)}
                    className="bg-amber-100 hover:bg-amber-200 active:scale-95 text-amber-900 border border-amber-800/30 font-bold py-3 px-2 rounded-sm text-xs transition-all uppercase tracking-wider"
                  >
                    + Thêm Hậu Duệ
                  </button>
                  <button
                    onClick={() => onAddSpouse(selectedPerson)}
                    className="bg-amber-100 hover:bg-amber-200 active:scale-95 text-amber-900 border border-amber-800/30 font-bold py-3 px-2 rounded-sm text-xs transition-all uppercase tracking-wider"
                  >
                    + Thêm Phối Ngẫu
                  </button>
                </div>
                <button
                  onClick={() => onDelete(selectedPerson)}
                  className="w-full text-red-800/60 hover:text-red-800 font-bold py-2 text-xs transition-all uppercase tracking-widest mt-4"
                >
                  Loại bỏ khỏi gia phả
                </button>
              </div>
            )}

            {selectedPerson.highlight && !isAdmin && (
              <div className="mt-8 p-6 bg-red-900/5 border-y-2 border-amber-800/10 rounded-sm text-center italic text-red-900/80 font-spectral text-lg">
                " {selectedPerson.highlightDesc} "
              </div>
            )}
          </div>
        </div>

        {/* Bottom Roller */}
        <div className="h-4 bg-gradient-to-t from-amber-950 to-amber-900 w-full shadow-inner relative">
          <div className="absolute -left-2 -bottom-1 w-6 h-6 bg-amber-900 rounded-full border border-amber-950 shadow-md" />
          <div className="absolute -right-2 -bottom-1 w-6 h-6 bg-amber-900 rounded-full border border-amber-950 shadow-md" />
        </div>
      </div>
    </div>
  );
}
