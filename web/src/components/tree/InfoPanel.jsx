'use client';

import React, { useState, useEffect } from 'react';
import { capitalizeName } from '@/utils/stringUtils';

export default function InfoPanel({ 
  selectedPerson, 
  setSelectedPerson, 
  allMembers,
  isAdmin, 
  onUpdate, 
  onDelete, 
  onAddChild, 
  onAddSpouse 
}) {
  const [editName, setEditName] = useState('');
  const [editBorn, setEditBorn] = useState('');
  const [editDeath, setEditDeath] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editAlias, setEditAlias] = useState('');
  
  const [editSpouseName, setEditSpouseName] = useState('');
  const [editSpouseBorn, setEditSpouseBorn] = useState('');
  const [editSpouseDeath, setEditSpouseDeath] = useState('');
  const [editSpouseAddress, setEditSpouseAddress] = useState('');
  const [editSpouseAlias, setEditSpouseAlias] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);

  const spouses = allMembers?.filter(m => m.spouseId === selectedPerson?.id) || [];
  const spouse = spouses[0];

  useEffect(() => {
    if (selectedPerson) {
      setEditName(selectedPerson.name || '');
      setEditBorn(selectedPerson.born || '');
      setEditDeath(selectedPerson.death || '');
      setEditAlias(selectedPerson.alias || '');
    }
    if (spouse) {
      setEditSpouseName(spouse.name || '');
      setEditSpouseBorn(spouse.born || '');
      setEditSpouseDeath(spouse.death || '');
      setEditSpouseAddress(spouse.address || '');
      setEditSpouseAlias(spouse.alias || '');
    } else {
      setEditSpouseName('');
      setEditSpouseBorn('');
      setEditSpouseDeath('');
      setEditSpouseAddress('');
      setEditSpouseAlias('');
    }
    setIsSaving(false);
  }, [selectedPerson, spouse]);

  const handleSave = async () => {
    const capitalizedName = capitalizeName(editName);
    const capitalizedSpouseName = capitalizeName(editSpouseName);
    
    setEditName(capitalizedName);
    setEditSpouseName(capitalizedSpouseName);

    setIsSaving(true);
    try {
      // Update main person
      await onUpdate(selectedPerson.id, capitalizedName, editBorn, editDeath, editAddress, editAlias);
      
      // Update spouse if exists
      if (spouse) {
        await onUpdate(spouse.id, capitalizedSpouseName, editSpouseBorn, editSpouseDeath, editSpouseAddress, editSpouseAlias);
      }
      
      setSelectedPerson(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!selectedPerson) return null;

  const renderField = (label, value, onEdit, placeholder, isBold = false) => {
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
  };

  return (
    <div 
      className="absolute bottom-0 left-0 right-0 sm:bottom-auto sm:left-auto sm:top-1/2 sm:right-1/2 sm:translate-x-1/2 sm:-translate-y-1/2 max-w-none sm:max-w-md w-full z-40 transition-all duration-300 transform translate-y-0 p-4 sm:p-0"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative bg-[#fdf2d9] border-2 border-amber-900/20 shadow-2xl rounded-2xl overflow-hidden flex flex-col backdrop-blur-sm">
        <div className="flex-1 px-5 py-6 relative text-red-900 max-h-[85vh] overflow-y-auto custom-scrollbar">
          <button
            onClick={() => setSelectedPerson(null)}
            className="absolute top-3 right-3 text-amber-900/40 hover:text-amber-900 transition-colors text-xl"
          >
            ✕
          </button>

          <div className="flex flex-col items-center">
            {/* Avatar & Header */}
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold ${selectedPerson.gender === 'male' ? 'bg-blue-100 text-blue-900' : 'bg-pink-100 text-pink-900'} border-4 border-white shadow-md mb-2`}>
              {selectedPerson.name.charAt(0)}
            </div>

            {/* Main Person Name */}
            {isAdmin ? (
               <div className="w-full mb-4">
                  <span className="text-amber-900/40 text-[9px] uppercase tracking-widest font-bold block text-center mb-1">Họ Tên</span>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="text-center bg-white/60 text-red-900 border-2 border-amber-800/20 rounded-lg py-2 text-xl font-black w-full outline-none font-spectral focus:border-amber-800/40"
                    placeholder="Tên thành viên"
                  />
               </div>
            ) : (
              <h2 className="text-xl sm:text-2xl font-black text-red-900 uppercase tracking-wide text-center font-spectral leading-tight">
                {selectedPerson.name}
              </h2>
            )}

            <p className="text-[10px] text-amber-800 font-bold uppercase tracking-[0.2em] mb-1 border-b border-amber-800/10 pb-1 w-full text-center">
              {selectedPerson.generation || selectedPerson.role || 'Thành viên'}
            </p>

            {/* Display Alias if exists (Non-Admin mode or just as info) */}
            {!isAdmin && selectedPerson.alias && (
              <p className="text-sm font-spectral italic text-amber-900/70 mb-4">
                ({selectedPerson.alias})
              </p>
            )}

            {isAdmin && (
               <div className="w-full mb-4">
                  <span className="text-amber-900/40 text-[9px] uppercase tracking-widest font-bold block text-center mb-1">Bí danh / Tên tự</span>
                  <input
                    type="text"
                    value={editAlias}
                    onChange={(e) => setEditAlias(e.target.value)}
                    className="text-center bg-white/60 text-red-900 border border-amber-800/20 rounded py-1 text-sm italic w-full outline-none font-spectral focus:border-amber-800/40"
                    placeholder="(Nếu có)"
                  />
               </div>
            )}

            {/* Main Person Fields */}
            <div className="w-full grid grid-cols-2 gap-3 mb-3">
              {renderField('Sinh Năm', editBorn, setEditBorn, 'Năm sinh')}
              {renderField('Mất Năm', editDeath, setEditDeath, 'Năm mất')}
            </div>
            <div className="w-full mb-3">
              {renderField('Nơi ở', editAddress, setEditAddress, 'Địa chỉ hiện tại')}
            </div>

            {/* Spouse Section */}
            {(spouse || isAdmin) && (
              <div className="w-full mt-4 pt-4 border-t-2 border-dashed border-amber-900/10">
                <div className="flex items-center gap-2 mb-3 justify-center">
                   <div className="h-[1px] flex-1 bg-amber-900/10"></div>
                   <span className="text-amber-900/40 text-[9px] uppercase tracking-widest font-black">Thông tin Phối ngẫu</span>
                   <div className="h-[1px] flex-1 bg-amber-900/10"></div>
                </div>

                {isAdmin ? (
                   <div className="w-full mb-4">
                      <span className="text-amber-900/40 text-[9px] uppercase tracking-widest font-bold block text-center mb-1">Tên Vợ/Chồng</span>
                      <input
                        type="text"
                        value={editSpouseName}
                        onChange={(e) => setEditSpouseName(e.target.value)}
                        className="text-center bg-white/60 text-red-900 border-2 border-amber-800/20 rounded-lg py-1.5 text-lg font-bold w-full outline-none font-spectral focus:border-amber-800/40"
                        placeholder="Thêm vợ/chồng..."
                      />
                   </div>
                ) : (
                  spouse && (
                    <div className="text-center mb-2">
                      <h3 className="text-lg sm:text-xl font-black text-red-900 uppercase tracking-wide font-spectral leading-tight">
                        {spouse.gender === 'female' ? 'Vợ: ' : 'Chồng: '}{spouse.name}
                      </h3>
                      {spouse.alias && <p className="text-xs italic font-spectral text-amber-900/60">({spouse.alias})</p>}
                    </div>
                  )
                )}

                {isAdmin && (
                   <div className="w-full mb-3">
                      <span className="text-amber-900/40 text-[9px] uppercase tracking-widest font-bold block text-center mb-1">Bí danh Phối ngẫu</span>
                      <input
                        type="text"
                        value={editSpouseAlias}
                        onChange={(e) => setEditSpouseAlias(e.target.value)}
                        className="text-center bg-white/60 text-red-900 border border-amber-800/20 rounded py-1 text-sm italic w-full outline-none font-spectral focus:border-amber-800/40"
                        placeholder="(Bí danh vợ/chồng)"
                      />
                   </div>
                )}

                {/* Show spouse details only if spouse exists or we are in admin mode to add them */}
                {(spouse || (isAdmin && editSpouseName)) && (
                   <>
                      <div className="w-full grid grid-cols-2 gap-3 mb-3">
                        {renderField('Sinh Năm', editSpouseBorn, setEditSpouseBorn, 'Năm sinh')}
                        {renderField('Mất Năm', editSpouseDeath, setEditSpouseDeath, 'Năm mất')}
                      </div>
                      <div className="w-full mb-3">
                        {renderField('Nơi ở', editSpouseAddress, setEditSpouseAddress, 'Địa chỉ hiện tại')}
                      </div>
                   </>
                )}
              </div>
            )}

            {/* Admin Actions */}
            {isAdmin && (
              <div className="w-full space-y-2 mt-4 pt-4 border-t border-amber-800/10">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full bg-red-800 hover:bg-red-700 disabled:bg-gray-400 active:scale-[0.98] text-amber-50 font-bold py-3 px-4 rounded-xl transition-all shadow-md uppercase tracking-wider text-[11px]"
                >
                  {isSaving ? 'Đang cập nhật...' : 'Lưu Thay Đổi'}
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
                  className="w-full text-red-800/40 hover:text-red-800 font-bold py-1 text-[9px] transition-all uppercase tracking-widest"
                >
                  Xóa khỏi hệ thống
                </button>
              </div>
            )}

            {selectedPerson.highlight && !isAdmin && (
              <div className="mt-4 p-4 bg-red-900/5 border border-amber-800/10 rounded-xl text-center italic text-red-900/80 font-spectral text-sm leading-snug">
                " {selectedPerson.highlightDesc} "
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
