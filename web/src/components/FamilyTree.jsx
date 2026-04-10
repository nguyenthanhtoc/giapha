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
  const [showDetails, setShowDetails] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(0.85);
  const [showFromGen15, setShowFromGen15] = useState(true);
  const [isMinimalMode, setIsMinimalMode] = useState(false);
  
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
      onSelectPerson: (person) => {
        setSelectedPerson(person);
        setShowDetails(false); // Reset details when selection changes
      },
      onFocus: (id) => setFocusId(prev => prev === id ? null : id),
      onToggleCollapse: (id) => {
        setCollapsedIds(prev => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
      },
      onShowDetails: () => setShowDetails(true),
      onQuickAddChild: (person) => setQuickAdd({ targetPerson: person, type: 'child' }),
      onQuickAddSpouse: (person) => setQuickAdd({ targetPerson: person, type: 'spouse' }),
      onQuickDelete: handleAdminDelete,
      onZoom: (k) => setZoomLevel(k),
      isFirstLoad: isFirstLoad.current,
      showFromGen15
    });
    
    if (mergedData.length > 0) {
      isFirstLoad.current = false;
    }
  }, [mergedData, updatingIds, isAdmin, selectedPerson, focusId, collapsedIds, showFromGen15]);

  const handleAdminUpdate = async (id, name, born, death, address, alias, isAlive) => {
    await handleUpdate(id, name, born, death, address, alias, isAlive);
  };

  const handleAdminDelete = async (person) => {
    if (!confirm(`Bạn có chắc muốn xóa ${person.name}? Các con của người này sẽ không còn cha/mẹ.`)) return;
    const res = await handleDelete(person.id);
    if (res.success) {
      setSelectedPerson(null);
    }
  };

  const handleQuickSave = async ({ targetId, type, person, spousePerson }) => {
    if (type === 'spouse') {
      const target = mergedData.find(m => m.id === targetId);
      await handleAddMember({
        name: person.name,
        gender: target?.gender === 'male' ? 'female' : 'male',
        spouseId: targetId,
        role: target?.gender === 'male' ? 'Phu nhân' : 'Phu quân',
        born: person.born || null,
        death: person.isAlive ? null : (person.death || null),
        alias: person.alias || null,
        address: person.address || null,
        isAlive: person.isAlive,
      });
    } else {
      const res = await handleAddMember({
        name: person.name,
        gender: 'male',
        parentId: targetId,
        role: 'Thế Hệ Tiếp',
        born: person.born || null,
        death: person.isAlive ? null : (person.death || null),
        alias: person.alias || null,
        address: person.address || null,
        isAlive: person.isAlive,
      });
      if (res.success && spousePerson?.name && res.data?.id) {
        await handleAddMember({
          name: spousePerson.name,
          gender: 'female',
          spouseId: res.data.id,
          role: 'Phu nhân',
          born: spousePerson.born || null,
          death: spousePerson.isAlive ? null : (spousePerson.death || null),
          alias: spousePerson.alias || null,
          address: spousePerson.address || null,
          isAlive: spousePerson.isAlive,
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
      {/* Minimal Mode Toggle — restore UI button (only visible in minimal mode) */}
      {isMinimalMode && (
        <button
          onClick={(e) => { e.stopPropagation(); setIsMinimalMode(false); }}
          className="absolute top-6 right-8 z-50 flex items-center justify-center w-9 h-9 rounded-full bg-amber-900/80 hover:bg-amber-900 text-[#fffbeb] shadow-xl border border-amber-700/50 transition-colors duration-200"
          title="Hiện UI"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.5a.75.75 0 0 1-1.08 0l-5.25-5.5a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z" clipRule="evenodd" />
          </svg>
        </button>
      )}

      {/* Decorative Header Banner */}
      <div className={`absolute top-4 sm:top-6 left-1/2 transform -translate-x-1/2 z-20 select-none w-[90%] sm:w-auto transition-all duration-300 ${isMinimalMode ? 'opacity-0 pointer-events-none -translate-y-4' : 'opacity-100 pointer-events-none'}`}>
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
        selectedPerson={showDetails && !isMinimalMode ? selectedPerson : null}
        setSelectedPerson={(p) => {
          if (!p) setShowDetails(false);
          setSelectedPerson(p);
        }}
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

      {/* Zoom Indicator — top-left on sm+, bottom-left on mobile */}
      <div className={`absolute bottom-4 left-4 sm:bottom-auto sm:top-6 sm:left-8 z-30 pointer-events-none select-none transition-all duration-300 ${isMinimalMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="bg-[#fffbeb]/90 backdrop-blur-sm border border-amber-900/30 px-3 py-1.5 rounded shadow-lg flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-amber-900/60 uppercase tracking-tighter">Thu Phóng</span>
            <span className="text-sm font-black text-amber-900 font-spectral">
              {Math.round(zoomLevel * 100)}%
            </span>
          </div>
          <div className="w-[1px] h-8 bg-amber-900/20" />
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">Live</span>
          </div>
        </div>
      </div>

      {/* Generation Filter Toggle — top-right on sm+, bottom-right on mobile */}
      <div className={`absolute bottom-4 right-4 sm:bottom-auto sm:top-6 sm:right-8 z-30 flex items-center gap-2 transition-all duration-300 ${isMinimalMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {/* Hide UI Toggle Button */}
        <button
          onClick={(e) => { e.stopPropagation(); setIsMinimalMode(true); }}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-[#fffbeb]/90 hover:bg-[#fffbeb] border border-amber-900/30 hover:border-amber-900/60 text-amber-900/60 hover:text-amber-900 shadow-lg transition-all duration-200 hover:scale-110"
          title="Ẩn UI"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
            <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setShowFromGen15(!showFromGen15); }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all duration-300 shadow-lg ${
            showFromGen15
              ? 'bg-amber-900 border-amber-900 text-[#fffbeb]'
              : 'bg-[#fffbeb]/90 border-amber-900/30 text-amber-900 hover:border-amber-900/60'
          }`}
        >
          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${showFromGen15 ? 'bg-emerald-400 animate-pulse' : 'bg-amber-900/20'}`} />
          <span className="text-xs font-black font-spectral uppercase tracking-wider whitespace-nowrap">
            {showFromGen15 ? 'Từ Đệ 15' : 'Từ Đệ 11'}
          </span>
        </button>
      </div>
    </div>
  );
}
