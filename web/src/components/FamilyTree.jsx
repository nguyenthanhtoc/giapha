'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useFamilyData } from '@/hooks/useFamilyData';
import { drawFamilyTree } from '@/utils/treeLayout';
import InfoPanel from './tree/InfoPanel';
import QuickAddForm from './tree/QuickAddForm';

export default function FamilyTree() {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const isFirstLoad = useRef(true);
  
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [quickAdd, setQuickAdd] = useState(null); // { targetPerson, type }
  const [focusId, setFocusId] = useState(null);
  const [collapsedIds, setCollapsedIds] = useState(new Set());
  
  const { 
    mergedData, 
    handleUpdate, 
    handleDelete, 
    handleAddMember,
    updatingIds
  } = useFamilyData();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setIsAdmin(params.get('admin') === 'true');
    }
  }, []);

  useEffect(() => {
    drawFamilyTree({
      svgRef,
      containerRef,
      data: mergedData,
      updatingIds,
      isAdmin,
      selectedPerson,
      focusId,
      collapsedIds,
      onSelectPerson: setSelectedPerson,
      onFocus: (id) => setFocusId(prev => prev === id ? null : id),
      onToggleCollapse: (id) => {
        setCollapsedIds(prev => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
      },
      onQuickAddChild: (person) => setQuickAdd({ targetPerson: person, type: 'child' }),
      onQuickAddSpouse: (person) => setQuickAdd({ targetPerson: person, type: 'spouse' }),
      onQuickDelete: handleAdminDelete,
      isFirstLoad: isFirstLoad.current
    });
    
    if (mergedData.length > 0) {
      isFirstLoad.current = false;
    }
  }, [mergedData, updatingIds, isAdmin, selectedPerson, focusId, collapsedIds]);

  const handleAdminUpdate = async (id, name, born) => {
    await handleUpdate(id, name, born);
  };

  const handleAdminDelete = async (person) => {
    if (!confirm(`Bạn có chắc muốn xóa ${person.name}? Các con của người này sẽ không còn cha/mẹ.`)) return;
    const res = await handleDelete(person.id);
    if (res.success) {
      setSelectedPerson(null);
    }
  };

  const handleQuickSave = async ({ targetId, type, name, spouseName }) => {
    if (type === 'spouse') {
      const target = mergedData.find(m => m.id === targetId);
      await handleAddMember({
        name,
        gender: target?.gender === 'male' ? 'female' : 'male',
        spouseId: targetId,
        role: target?.gender === 'male' ? 'Phu nhân' : 'Phu quân'
      });
    } else {
      const res = await handleAddMember({
        name,
        gender: 'male',
        parentId: targetId,
        role: 'Thế Hệ Tiếp'
      });
      if (res.success && spouseName && res.data?.id) {
        await handleAddMember({
          name: spouseName,
          gender: 'female',
          spouseId: res.data.id,
          role: 'Phu nhân'
        });
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-cover bg-center"
      style={{ backgroundImage: "url('./bg_parchment.png')" }}
      onClick={() => setSelectedPerson(null)}
    >
      {/* Decorative Header Banner */}
      <div className="absolute top-4 sm:top-6 left-1/2 transform -translate-x-1/2 z-20 select-none pointer-events-none w-[90%] sm:w-auto">
        <div className="relative bg-[#fffbeb] border border-amber-800 sm:border-2 px-4 sm:px-10 py-2 sm:py-3 rounded-md shadow-2xl flex items-center justify-center min-w-[200px] sm:min-w-[300px]">
          <div className="absolute -left-1 sm:-left-2 top-1/2 -translate-y-1/2 w-2 sm:w-3 h-[110%] bg-amber-900 rounded-full shadow-md" />
          <div className="absolute -right-1 sm:-right-2 top-1/2 -translate-y-1/2 w-2 sm:w-3 h-[110%] bg-amber-900 rounded-full shadow-md" />
          <h1 className="flex flex-col items-center text-center uppercase font-spectral select-none py-1">
            <span className="text-xs sm:text-sm font-bold text-amber-900/80 tracking-[0.3em] mb-1">
              Gia Phả Dòng Họ
            </span>
            <span className="text-xl sm:text-3xl font-black text-red-800 tracking-wider drop-shadow-sm">
              Nguyễn Thanh Tộc
            </span>
          </h1>
        </div>
      </div>

      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing touch-none" />

      <InfoPanel
        selectedPerson={selectedPerson}
        setSelectedPerson={setSelectedPerson}
        allMembers={mergedData}
        isAdmin={isAdmin}
        onUpdate={handleAdminUpdate}
        onDelete={handleAdminDelete}
        onAddChild={(person) => setQuickAdd({ targetPerson: person, type: 'child' })}
        onAddSpouse={(person) => setQuickAdd({ targetPerson: person, type: 'spouse' })}
      />

      <QuickAddForm
        show={!!quickAdd}
        targetPerson={quickAdd?.targetPerson}
        type={quickAdd?.type}
        onClose={() => setQuickAdd(null)}
        onSave={handleQuickSave}
      />
    </div>
  );
}
