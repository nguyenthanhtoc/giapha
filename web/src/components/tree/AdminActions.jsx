import React from 'react';

export default function AdminActions({ 
  selectedPerson, 
  handleSave, 
  isSaving, 
  onAddChild, 
  onAddSpouse, 
  onDelete 
}) {
  return (
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
  );
}
