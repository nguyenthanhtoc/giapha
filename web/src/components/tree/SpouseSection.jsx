import React from 'react';
import InfoField from './InfoField';

export default function SpouseSection({ 
  editSpouseStates, 
  setEditSpouseStates, 
  isAdmin, 
  renderField // Supporting old renderField if needed, but we should use InfoField
}) {
  if (editSpouseStates.length === 0 && !isAdmin) {
    return (
      <div className="w-full mt-4 pt-4 border-t-2 border-dashed border-amber-900/10">
        <p className="text-center text-red-900/40 text-[10px] italic py-2">Chưa có thông tin phối ngẫu</p>
      </div>
    );
  }

  return (
    <div className="w-full mt-4 pt-4 border-t-2 border-dashed border-amber-900/10">
      <div className="flex items-center gap-2 mb-3 justify-center">
        <div className="h-[1px] flex-1 bg-amber-900/10"></div>
        <span className="text-amber-900/40 text-[9px] uppercase tracking-widest font-black">
          Thông tin Phối ngẫu ({editSpouseStates.length})
        </span>
        <div className="h-[1px] flex-1 bg-amber-900/10"></div>
      </div>

      {editSpouseStates.map((s, index) => (
        <div key={s.id} className={`mb-6 p-3 rounded-xl bg-amber-900/5 border border-amber-900/10 ${index > 0 ? 'mt-6 pt-6 border-t-2 border-dashed' : ''}`}>
          {isAdmin ? (
            <div className="w-full flex flex-col gap-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-amber-900/40 text-[9px] uppercase tracking-widest font-bold">Người Phối ngẫu {index + 1}</span>
                <button 
                  onClick={() => {
                    const newStates = [...editSpouseStates];
                    newStates[index] = { ...newStates[index], isAlive: !newStates[index].isAlive };
                    setEditSpouseStates(newStates);
                  }}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-bold transition-all ${s.isAlive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}
                >
                  <div className={`w-2 h-2 rounded-full ${s.isAlive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                  {s.isAlive ? 'CÒN SỐNG' : 'ĐÃ MẤT'}
                </button>
              </div>
              <input
                type="text"
                value={s.name}
                onChange={(e) => {
                  const newStates = [...editSpouseStates];
                  newStates[index] = { ...newStates[index], name: e.target.value };
                  setEditSpouseStates(newStates);
                }}
                className="text-center bg-white/60 text-red-900 border-2 border-amber-800/20 rounded-lg py-1.5 text-lg font-bold w-full outline-none font-spectral focus:border-amber-800/40"
                placeholder="Tên vợ/chồng..."
              />
            </div>
          ) : (
            <div className="text-center mb-2">
              <div className="flex items-center justify-center gap-2 mb-1">
                <h3 className="text-lg sm:text-xl font-black text-red-900 uppercase tracking-wide font-spectral leading-tight">
                  {s.gender === 'female' ? 'Vợ: ' : 'Chồng: '}{s.name}
                </h3>
                <div className={`w-1.5 h-1.5 rounded-full ${s.isAlive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              </div>
              {s.alias && <p className="text-xs italic font-spectral text-amber-900/60">({s.alias})</p>}
            </div>
          )}

          {isAdmin && (
            <div className="w-full mb-3">
              <span className="text-amber-900/40 text-[9px] uppercase tracking-widest font-bold block text-center mb-1">Bí danh</span>
              <input
                type="text"
                value={s.alias}
                onChange={(e) => {
                  const newStates = [...editSpouseStates];
                  newStates[index] = { ...newStates[index], alias: e.target.value };
                  setEditSpouseStates(newStates);
                }}
                className="text-center bg-white/60 text-red-900 border border-amber-800/20 rounded py-1 text-sm italic w-full outline-none font-spectral focus:border-amber-800/40"
                placeholder="(Bí danh)"
              />
            </div>
          )}

          <div className="w-full grid grid-cols-2 gap-3 mb-3">
            <InfoField 
              label="Sinh Năm" 
              value={s.born} 
              onEdit={(val) => {
                const newStates = [...editSpouseStates];
                newStates[index] = { ...newStates[index], born: val };
                setEditSpouseStates(newStates);
              }}
              placeholder="Năm sinh"
              isAdmin={isAdmin}
            />
            <InfoField 
              label="Mất Năm" 
              value={s.death} 
              onEdit={(val) => {
                const newStates = [...editSpouseStates];
                newStates[index] = { ...newStates[index], death: val };
                setEditSpouseStates(newStates);
              }}
              placeholder="Năm mất"
              isAdmin={isAdmin}
            />
          </div>
          <div className="w-full mb-1">
            <InfoField 
              label="Nơi ở" 
              value={s.address} 
              onEdit={(val) => {
                const newStates = [...editSpouseStates];
                newStates[index] = { ...newStates[index], address: val };
                setEditSpouseStates(newStates);
              }}
              placeholder="Địa chỉ hiện tại"
              isAdmin={isAdmin}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
