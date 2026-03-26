'use client';

import React, { useState } from 'react';
import { capitalizeName } from '@/utils/stringUtils';

export default function QuickAddForm({ show, targetPerson, type, onClose, onSave }) {
  const [name, setName] = useState('');
  const [spouseName, setSpouseName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!show) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    const capitalizedName = capitalizeName(name);
    const capitalizedSpouseName = capitalizeName(spouseName);

    setName(capitalizedName);
    setSpouseName(capitalizedSpouseName);

    setIsSaving(true);
    try {
      await onSave({
        targetId: targetPerson.id,
        type,
        name: capitalizedName,
        spouseName: capitalizedSpouseName
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
      setName('');
      setSpouseName('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-[#fefce8] border-2 border-amber-900/20 shadow-2xl rounded-2xl w-full max-w-sm overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-amber-900/5 px-6 py-4 border-b border-amber-900/10 flex justify-between items-center">
          <h3 className="font-spectral font-black uppercase text-amber-900 tracking-wide">
            {type === 'child' ? `Thêm con cho ${targetPerson.name}` : `Thêm vợ cho ${targetPerson.name}`}
          </h3>
          <button onClick={onClose} className="text-amber-900/40 hover:text-amber-900">✕</button>
        </div>
        
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-amber-900/40 uppercase tracking-widest mb-1.5">
              Tên {type === 'child' ? 'người con' : 'vợ'}
            </label>
            <input
              autoFocus
              required
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nhập họ và tên..."
              className="w-full bg-white border border-amber-900/10 rounded-lg px-4 py-2.5 text-amber-900 outline-none focus:border-amber-900/30 transition-all font-spectral text-lg"
            />
          </div>

          {type === 'child' && (
            <div>
              <label className="block text-[10px] font-bold text-amber-900/40 uppercase tracking-widest mb-1.5">
                Tên vợ (không bắt buộc)
              </label>
              <input
                type="text"
                value={spouseName}
                onChange={e => setSpouseName(e.target.value)}
                placeholder="Nếu có vợ..."
                className="w-full bg-white border border-amber-900/10 rounded-lg px-4 py-2 text-amber-900/70 outline-none focus:border-amber-900/30 transition-all font-spectral"
              />
            </div>
          )}

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-amber-900/10 text-amber-900/60 font-bold text-xs uppercase tracking-widest hover:bg-amber-900/5 transition-all"
            >
              Hủy
            </button>
            <button
              disabled={isSaving || !name.trim()}
              className="flex-[2] bg-red-800 text-amber-50 px-4 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-red-700 active:scale-95 transition-all disabled:bg-gray-400"
            >
              {isSaving ? 'Đang lưu...' : 'Lưu thông tin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
