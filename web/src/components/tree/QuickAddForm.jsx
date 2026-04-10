'use client';

import React, { useState, useEffect } from 'react';
import { capitalizeName } from '@/utils/stringUtils';

const emptyPerson = () => ({
  name: '',
  born: '',
  death: '',
  alias: '',
  isAlive: true,
});

function PersonFields({ label, data, onChange, autoFocus, required }) {
  return (
    <div className="space-y-3">
      {label && (
        <div className="text-[10px] font-bold text-amber-900/50 uppercase tracking-widest border-b border-amber-900/10 pb-1">
          {label}
        </div>
      )}

      {/* Tên */}
      <div>
        <label className="block text-[10px] font-bold text-amber-900/40 uppercase tracking-widest mb-1">
          Họ và tên {required && <span className="text-red-600">*</span>}
        </label>
        <input
          autoFocus={autoFocus}
          required={required}
          type="text"
          value={data.name}
          onChange={e => onChange('name', e.target.value)}
          placeholder="Nhập họ và tên..."
          className="w-full bg-white border border-amber-900/10 rounded-lg px-3 py-2 text-amber-900 outline-none focus:border-amber-900/30 transition-all font-spectral text-base"
        />
      </div>

      {/* Năm sinh & Năm mất */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-bold text-amber-900/40 uppercase tracking-widest mb-1">
            Năm sinh
          </label>
          <input
            type="text"
            value={data.born}
            onChange={e => onChange('born', e.target.value)}
            placeholder="VD: 1980"
            className="w-full bg-white border border-amber-900/10 rounded-lg px-3 py-2 text-amber-900 outline-none focus:border-amber-900/30 transition-all font-spectral text-sm"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-amber-900/40 uppercase tracking-widest mb-1">
            Năm mất
          </label>
          <input
            type="text"
            value={data.death}
            disabled={data.isAlive}
            onChange={e => onChange('death', e.target.value)}
            placeholder={data.isAlive ? '—' : 'VD: 2020'}
            className="w-full bg-white border border-amber-900/10 rounded-lg px-3 py-2 text-amber-900 outline-none focus:border-amber-900/30 transition-all font-spectral text-sm disabled:bg-amber-50/50 disabled:text-amber-900/30"
          />
        </div>
      </div>

      {/* Còn sống */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange('isAlive', !data.isAlive)}
          className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${data.isAlive ? 'bg-emerald-500' : 'bg-gray-300'}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${data.isAlive ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
        <span className="text-xs text-amber-900/60 font-semibold">
          {data.isAlive ? 'Còn sống' : 'Đã mất'}
        </span>
      </div>

      {/* Bí danh */}
      <div>
        <label className="block text-[10px] font-bold text-amber-900/40 uppercase tracking-widest mb-1">
          Bí danh / Tên thường gọi
        </label>
        <input
          type="text"
          value={data.alias}
          onChange={e => onChange('alias', e.target.value)}
          placeholder="Tên khác (nếu có)..."
          className="w-full bg-white border border-amber-900/10 rounded-lg px-3 py-2 text-amber-900/70 outline-none focus:border-amber-900/30 transition-all font-spectral text-sm"
        />
      </div>
    </div>
  );
}

export default function QuickAddForm({ show, targetPerson, type, onClose, onSave }) {
  const [person, setPerson] = useState(emptyPerson());
  const [spouse, setSpouse] = useState(emptyPerson());
  const [sharedAddress, setSharedAddress] = useState('');
  const [showSpouseFields, setShowSpouseFields] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!show) return;
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [show, onClose]);

  useEffect(() => {
    if (show) {
      setPerson(emptyPerson());
      setSpouse(emptyPerson());
      setSharedAddress('');
      setShowSpouseFields(false);
    }
  }, [show]);

  if (!show) return null;

  const updatePerson = (field, value) => setPerson(prev => ({ ...prev, [field]: value }));
  const updateSpouse = (field, value) => setSpouse(prev => ({ ...prev, [field]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!person.name.trim()) return;

    const capitalize = (p) => ({ ...p, name: capitalizeName(p.name) });
    const cap = { ...capitalize(person), address: sharedAddress };
    const capSpouse = { ...capitalize(spouse), address: sharedAddress };

    setIsSaving(true);
    try {
      await onSave({
        targetId: targetPerson.id,
        type,
        person: cap,
        spousePerson: (showSpouseFields && capSpouse.name.trim()) ? capSpouse : null,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
      setPerson(emptyPerson());
      setSpouse(emptyPerson());
      setSharedAddress('');
      setShowSpouseFields(false);
    }
  };

  const spouseLabel = targetPerson.gender === 'female' ? 'chồng' : 'vợ';
  const title = type === 'child'
    ? `Thêm con cho ${targetPerson.name}`
    : `Thêm ${spouseLabel} cho ${targetPerson.name}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#fefce8] border-2 border-amber-900/20 shadow-2xl rounded-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-amber-900/5 px-6 py-4 border-b border-amber-900/10 flex justify-between items-center shrink-0">
          <h3 className="font-spectral font-black uppercase text-amber-900 tracking-wide text-sm">
            {title}
          </h3>
          <button onClick={onClose} className="text-amber-900/40 hover:text-amber-900">✕</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="overflow-y-auto">
          <div className="p-6 space-y-5">
            <PersonFields
              label={type === 'child' ? 'Thông tin người con' : `Thông tin ${spouseLabel}`}
              data={person}
              onChange={updatePerson}
              autoFocus
              required
            />

            {/* Spouse section — only for child */}
            {type === 'child' && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowSpouseFields(v => !v)}
                  className="flex items-center gap-2 text-[10px] font-bold text-amber-900/50 uppercase tracking-widest hover:text-amber-900/80 transition-colors"
                >
                  <span className={`text-base leading-none transition-transform ${showSpouseFields ? 'rotate-45' : ''}`}>+</span>
                  {showSpouseFields ? 'Ẩn thông tin vợ' : 'Thêm thông tin vợ'}
                </button>

                {showSpouseFields && (
                  <div className="mt-4">
                    <PersonFields
                      label="Thông tin vợ (không bắt buộc)"
                      data={spouse}
                      onChange={updateSpouse}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Shared address — always shown, applies to both husband & wife */}
            <div className="border-t border-amber-900/10 pt-4">
              <label className="block text-[10px] font-bold text-amber-900/40 uppercase tracking-widest mb-1">
                Nơi ở {type === 'child' && showSpouseFields ? '(cả vợ chồng)' : ''}
              </label>
              <input
                type="text"
                value={sharedAddress}
                onChange={e => setSharedAddress(e.target.value)}
                placeholder="Nơi sinh sống hiện tại..."
                className="w-full bg-white border border-amber-900/10 rounded-lg px-3 py-2 text-amber-900/70 outline-none focus:border-amber-900/30 transition-all font-spectral text-sm"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 pt-2 flex gap-3 shrink-0 border-t border-amber-900/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-amber-900/10 text-amber-900/60 font-bold text-xs uppercase tracking-widest hover:bg-amber-900/5 transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving || !person.name.trim()}
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
