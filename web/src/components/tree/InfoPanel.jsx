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
    <div className="absolute top-4 right-4 max-w-sm w-full bg-zinc-900/90 border border-zinc-800 rounded-xl p-6 backdrop-blur-md shadow-2xl text-white z-20">
      <button
        onClick={() => setSelectedPerson(null)}
        className="absolute top-2 right-2 text-zinc-400 hover:text-white"
      >
        ✕
      </button>
      <div className="flex flex-col items-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${selectedPerson.gender === 'male' ? 'bg-blue-900/40 text-blue-400' : 'bg-pink-900/40 text-pink-400'}`}>
          {selectedPerson.name.charAt(0)}
        </div>

        {isAdmin ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="mt-4 text-center bg-zinc-800 text-zinc-100 border border-zinc-700 rounded px-2 py-1 text-xl font-bold w-full"
            placeholder="Tên thành viên"
          />
        ) : (
          <h2 className="mt-4 text-xl font-bold text-zinc-100 uppercase tracking-wide">{selectedPerson.name}</h2>
        )}

        <p className="text-sm text-zinc-400 mt-1">{selectedPerson.role || 'Thành viên'}</p>

        <div className="mt-4 w-full border-t border-zinc-800 pt-3 text-sm grid grid-cols-2 gap-2">
          <span className="text-zinc-500">Năm sinh:</span>
          {isAdmin ? (
            <input
              type="text"
              value={editBorn}
              onChange={(e) => setEditBorn(e.target.value)}
              className="bg-zinc-800 text-zinc-300 border border-zinc-700 rounded px-2 py-1 text-sm text-center w-full"
              placeholder="Năm sinh"
            />
          ) : (
            <span className="text-zinc-300">{selectedPerson.born || 'N/A'}</span>
          )}
          <span className="text-zinc-500">Năm mất:</span>
          <span className="text-zinc-300">{selectedPerson.death || 'Hiện tại'}</span>
        </div>

        {isAdmin && (
          <div className="mt-6 w-full space-y-2">
            <button
              onClick={() => onUpdate(selectedPerson.id, editName, editBorn)}
              className="w-full bg-amber-700 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Lưu Thay Đổi
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onAddChild(selectedPerson)}
                className="bg-zinc-800 hover:bg-zinc-700 text-amber-500 border border-amber-900/30 font-medium py-2 px-2 rounded-lg text-xs transition-colors"
              >
                + Thêm Con
              </button>
              <button
                onClick={() => onAddSpouse(selectedPerson)}
                className="bg-zinc-800 hover:bg-zinc-700 text-amber-500 border border-amber-900/30 font-medium py-2 px-2 rounded-lg text-xs transition-colors"
              >
                + Thêm Vợ/Chồng
              </button>
            </div>
            <button
              onClick={() => onDelete(selectedPerson)}
              className="w-full bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-900/50 font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
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
