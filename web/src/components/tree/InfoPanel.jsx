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
    <div 
      className="absolute bottom-0 left-0 right-0 sm:bottom-auto sm:left-auto sm:top-1/2 sm:right-1/2 sm:translate-x-1/2 sm:-translate-y-1/2 max-w-none sm:max-w-sm w-full z-40 transition-all duration-300 transform translate-y-0 p-4 sm:p-0"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative bg-[#fdf2d9] border-2 border-amber-900/20 shadow-2xl rounded-2xl overflow-hidden flex flex-col backdrop-blur-sm">
        <div className="flex-1 px-5 py-6 relative text-red-900">
          <button
            onClick={() => setSelectedPerson(null)}
            className="absolute top-3 right-3 text-amber-900/40 hover:text-amber-900 transition-colors text-xl"
          >
            ✕
          </button>

          <div className="flex flex-col items-center">
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold ${selectedPerson.gender === 'male' ? 'bg-blue-100 text-blue-900' : 'bg-pink-100 text-pink-900'} border-4 border-white shadow-md mb-3`}>
              {selectedPerson.name.charAt(0)}
            </div>

            {isAdmin ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-center bg-white/50 text-red-900 border-b border-amber-800/20 px-2 py-0.5 text-xl font-black w-full outline-none font-spectral"
                placeholder="Tên thành viên"
              />
            ) : (
              <h2 className="text-xl sm:text-2xl font-black text-red-900 uppercase tracking-wide text-center font-spectral leading-tight">
                {selectedPerson.name}
              </h2>
            )}

            <p className="text-[10px] text-amber-800 font-bold uppercase tracking-[0.2em] mt-1 mb-4 border-b border-amber-800/10 pb-0.5">{selectedPerson.role || 'Thành viên'}</p>

            <div className="w-full grid grid-cols-2 gap-4 text-center mb-4">
              <div className="flex flex-col">
                <span className="text-amber-900/40 text-[9px] uppercase tracking-widest font-bold">Sinh Năm</span>
                {isAdmin ? (
                  <input
                    type="text"
                    value={editBorn}
                    onChange={(e) => setEditBorn(e.target.value)}
                    className="mt-1 bg-white/50 text-red-900 border border-amber-800/10 rounded px-1 py-0.5 text-xs text-center w-full"
                    placeholder="Năm sinh"
                  />
                ) : (
                  <span className="mt-0.5 text-red-900 text-base font-bold font-spectral">{selectedPerson.born || 'N/A'}</span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-amber-900/40 text-[9px] uppercase tracking-widest font-bold">Mất Năm</span>
                <span className="mt-0.5 text-red-900 text-base font-bold font-spectral">{selectedPerson.death || 'Hiện tại'}</span>
              </div>
            </div>

            {isAdmin && (
              <div className="w-full space-y-2">
                <button
                  onClick={() => onUpdate(selectedPerson.id, editName, editBorn)}
                  className="w-full bg-red-800 hover:bg-red-700 active:scale-[0.98] text-amber-50 font-bold py-2.5 px-4 rounded-lg transition-all shadow-md uppercase tracking-wider text-[10px]"
                >
                  Cập Nhật Thông Tin
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onAddChild(selectedPerson)}
                    className="bg-amber-50 hover:bg-amber-100 active:scale-95 text-amber-900 border border-amber-800/20 font-bold py-2 px-1 rounded-lg text-[9px] transition-all uppercase tracking-wider"
                  >
                    + Thêm Hậu Duệ
                  </button>
                  <button
                    onClick={() => onAddSpouse(selectedPerson)}
                    className="bg-amber-50 hover:bg-amber-100 active:scale-95 text-amber-900 border border-amber-800/20 font-bold py-2 px-1 rounded-lg text-[9px] transition-all uppercase tracking-wider"
                  >
                    + Thêm Phối Ngẫu
                  </button>
                </div>
                <button
                  onClick={() => onDelete(selectedPerson)}
                  className="w-full text-red-800/40 hover:text-red-800 font-bold py-0.5 text-[9px] transition-all uppercase tracking-widest"
                >
                  Xóa khỏi hệ thống
                </button>
              </div>
            )}

            {selectedPerson.highlight && !isAdmin && (
              <div className="mt-2 p-3 bg-red-900/5 border border-amber-800/10 rounded-xl text-center italic text-red-900/80 font-spectral text-sm leading-snug">
                " {selectedPerson.highlightDesc} "
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
