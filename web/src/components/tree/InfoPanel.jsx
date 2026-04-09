import React, { useState, useEffect } from 'react';
import { capitalizeName } from '@/utils/stringUtils';
import InfoField from './InfoField';
import SpouseSection from './SpouseSection';
import AdminActions from './AdminActions';

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
  const [editIsAlive, setEditIsAlive] = useState(true);
  
  const [editSpouseStates, setEditSpouseStates] = useState([]); // Array of spouse objects for editing
  
  const [isSaving, setIsSaving] = useState(false);

  const spouses = allMembers?.filter(m => m.spouseId === selectedPerson?.id) || [];

  useEffect(() => {
    if (selectedPerson) {
      setEditName(selectedPerson.name || '');
      setEditBorn(selectedPerson.born || '');
      setEditDeath(selectedPerson.death || '');
      setEditAddress(selectedPerson.address || '');
      setEditAlias(selectedPerson.alias || '');
      setEditIsAlive(selectedPerson.isAlive !== false);
    }

    const spouseList = spouses.map(s => ({
      id: s.id,
      name: s.name || '',
      born: s.born || '',
      death: s.death || '',
      address: s.address || '',
      alias: s.alias || '',
      gender: s.gender,
      isAlive: s.isAlive !== false
    }));
    setEditSpouseStates(spouseList);
    
    setIsSaving(false);
  }, [selectedPerson, allMembers]);

  const handleSave = async () => {
    const capitalizedName = capitalizeName(editName);
    setEditName(capitalizedName);

    setIsSaving(true);
    try {
      // Update main person
      await onUpdate(selectedPerson.id, capitalizedName, editBorn, editDeath, editAddress, editAlias, editIsAlive);
      
      // Update all spouses
      for (const s of editSpouseStates) {
        const capsName = capitalizeName(s.name);
        await onUpdate(s.id, capsName, s.born, s.death, s.address, s.alias, s.isAlive);
      }
      
      setSelectedPerson(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!selectedPerson) return null;

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

            {/* Status Toggle / Display */}
            <div className="mb-4">
              {isAdmin ? (
                <div className="flex items-center gap-3 bg-white/40 px-4 py-2 rounded-xl border border-amber-800/10">
                  <span className="text-[10px] uppercase font-black text-amber-900/60">Trạng thái:</span>
                  <button 
                    onClick={() => setEditIsAlive(!editIsAlive)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold transition-all ${editIsAlive ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-red-100 text-red-800 border border-red-200'}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${editIsAlive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                    {editIsAlive ? 'CÒN SỐNG' : 'ĐÃ MẤT'}
                  </button>
                </div>
              ) : (
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold ${selectedPerson.isAlive ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                  <div className={`w-2 h-2 rounded-full ${selectedPerson.isAlive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                  {selectedPerson.isAlive ? 'CÒN SỐNG' : 'ĐÃ MẤT'}
                </div>
              )}
            </div>

            <p className="text-[10px] text-amber-800 font-bold uppercase tracking-[0.2em] mb-1 border-b border-amber-800/10 pb-1 w-full text-center">
              {selectedPerson.generation || selectedPerson.role || 'Thành viên'}
            </p>

            {/* Display Alias if exists */}
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
              <InfoField label="Sinh Năm" value={editBorn} onEdit={setEditBorn} placeholder="Năm sinh" isAdmin={isAdmin} />
              <InfoField label="Mất Năm" value={editDeath} onEdit={setEditDeath} placeholder="Năm mất" isAdmin={isAdmin} />
            </div>
            <div className="w-full mb-3">
              <InfoField label="Nơi ở" value={editAddress} onEdit={setEditAddress} placeholder="Địa chỉ hiện tại" isAdmin={isAdmin} />
            </div>

            {/* Spouses Section */}
            <SpouseSection 
              editSpouseStates={editSpouseStates} 
              setEditSpouseStates={setEditSpouseStates} 
              isAdmin={isAdmin} 
            />

            {/* Admin Actions */}
            {isAdmin && (
              <AdminActions 
                selectedPerson={selectedPerson}
                handleSave={handleSave}
                isSaving={isSaving}
                onAddChild={onAddChild}
                onAddSpouse={onAddSpouse}
                onDelete={onDelete}
              />
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
