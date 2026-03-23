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
    <div className="absolute bottom-0 left-0 right-0 sm:bottom-auto sm:left-auto sm:top-4 sm:right-4 max-w-none sm:max-w-sm w-full bg-zinc-900/95 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-xl p-6 backdrop-blur-xl shadow-2xl text-white z-30 transition-all duration-300">
      {/* Mobile Handle */}
      <div className="sm:hidden w-12 h-1.5 bg-zinc-700/50 rounded-full mx-auto mb-4 -mt-2" />
      
      <button
        onClick={() => setSelectedPerson(null)}
        className="absolute top-4 right-4 text-zinc-400 hover:text-white sm:top-2 sm:right-2"
      >
        ✕
      </button>
      <div className="flex flex-col items-center">
        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold ${selectedPerson.gender === 'male' ? 'bg-blue-900/40 text-blue-400' : 'bg-pink-900/40 text-pink-400'} border-2 border-current/20`}>
          {selectedPerson.name.charAt(0)}
        </div>

        {isAdmin ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="mt-6 text-center bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-lg px-3 py-2 text-xl font-bold w-full focus:ring-2 focus:ring-amber-500/50 outline-none transition-all"
            placeholder="Tên thành viên"
          />
        ) : (
          <h2 className="mt-6 text-2xl font-bold text-zinc-100 uppercase tracking-wide text-center">{selectedPerson.name}</h2>
        )}

        <p className="text-sm text-amber-500/80 mt-2 font-medium bg-amber-900/20 px-3 py-1 rounded-full">{selectedPerson.role || 'Thành viên'}</p>

        <div className="mt-6 w-full border-t border-zinc-800 pt-5 text-sm grid grid-cols-2 gap-y-4 gap-x-2">
          <div className="flex flex-col">
            <span className="text-zinc-500 text-xs uppercase tracking-wider">Năm sinh:</span>
            {isAdmin ? (
              <input
                type="text"
                value={editBorn}
                onChange={(e) => setEditBorn(e.target.value)}
                className="mt-1 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded px-2 py-1 text-sm w-full"
                placeholder="Năm sinh"
              />
            ) : (
              <span className="mt-1 text-zinc-300 font-medium">{selectedPerson.born || 'N/A'}</span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-zinc-500 text-xs uppercase tracking-wider">Năm mất:</span>
            <span className="mt-1 text-zinc-300 font-medium">{selectedPerson.death || 'Hiện tại'}</span>
          </div>
        </div>

        {isAdmin && (
          <div className="mt-8 w-full space-y-3 pb-2">
            <button
              onClick={() => onUpdate(selectedPerson.id, editName, editBorn)}
              className="w-full bg-amber-600 hover:bg-amber-500 active:scale-[0.98] text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-amber-900/20"
            >
              Lưu Thay Đổi
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onAddChild(selectedPerson)}
                className="bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-amber-500 border border-amber-900/30 font-bold py-3 px-2 rounded-xl text-sm transition-all"
              >
                + Thêm Con
              </button>
              <button
                onClick={() => onAddSpouse(selectedPerson)}
                className="bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-amber-500 border border-amber-900/30 font-bold py-3 px-2 rounded-xl text-sm transition-all"
              >
                + Thêm Vợ/Chồng
              </button>
            </div>
            <button
              onClick={() => onDelete(selectedPerson)}
              className="w-full bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/30 font-bold py-3 px-4 rounded-xl text-sm transition-all"
            >
              Xóa Thành Viên
            </button>
          </div>
        )}

        {selectedPerson.highlight && !isAdmin && (
          <div className="mt-4 p-3 bg-amber-900/20 border border-amber-800/40 rounded-lg text-xs text-amber-300">
            ⭐ {selectedPerson.highlightDesc}
          </div>
        )}
      </div>
    </div>
  );
}
