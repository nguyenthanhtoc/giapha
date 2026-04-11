'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useFamilyData } from '@/hooks/useFamilyData';
import { drawFamilyTree } from '@/utils/treeLayout';
import InfoPanel from './tree/InfoPanel';
import QuickAddForm from './tree/QuickAddForm';
import SearchPanel from './tree/SearchPanel';

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
  const [searchOpen, setSearchOpen] = useState(false);
  const searchPanelRef = useRef(null);
  
  const {
    mergedData,
    handleUpdate,
    handleDelete,
    handleAddMember,
    handleMoveNode,
    updatingIds
  } = useFamilyData();

  // Keyboard navigation: arrow keys to move between nodes
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedPerson) return;
      // Enter opens the detail popup
      if (e.key === 'Enter') {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (!showDetails && !isMinimalMode) { e.preventDefault(); setShowDetails(true); }
        return;
      }
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(e.key) === -1) return;
      // Don't interfere when typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      e.preventDefault();

      // Only navigate among non-spouse nodes (spouseId === undefined/null)
      const mainNodes = mergedData.filter(m => !m.spouseId);
      const current = mainNodes.find(m => m.id === selectedPerson.id);
      if (!current) return;

      if (e.key === 'ArrowUp') {
        // Select parent — block if showFromGen15 and parent would be hidden
        const parent = mainNodes.find(m => m.id === current.parentId);
        if (parent) {
          if (showFromGen15) {
            // Compute depth of parent by walking up the tree
            const getDepth = (node) => {
              let d = 0, n = node;
              while (n.parentId) { n = mainNodes.find(m => m.id === n.parentId); if (!n) break; d++; }
              return d;
            };
            if (getDepth(parent) < 4) return;
          }
          setSelectedPerson(parent);
        }
      } else if (e.key === 'ArrowDown') {
        // Select first child
        const firstChild = mainNodes.find(m => m.parentId === current.id);
        if (firstChild) setSelectedPerson(firstChild);
      } else {
        // Siblings: same parentId, sorted by their order in data
        const siblings = mainNodes.filter(m => m.parentId === current.parentId && m.parentId != null);
        const idx = siblings.findIndex(m => m.id === current.id);
        if (idx === -1) return;
        if (e.key === 'ArrowLeft' && idx > 0) {
          setSelectedPerson(siblings[idx - 1]);
        } else if (e.key === 'ArrowRight' && idx < siblings.length - 1) {
          setSelectedPerson(siblings[idx + 1]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPerson, mergedData, showDetails, isMinimalMode]);

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
      onMoveNode: async (id, direction) => {
        await handleMoveNode(id, direction);
        // Keep the same node selected after move
        const moved = mergedData.find(m => m.id === id);
        if (moved) setSelectedPerson(moved);
      },
      onZoom: (k) => setZoomLevel(k),
      isFirstLoad: isFirstLoad.current,
      showFromGen15
    });
    
    if (mergedData.length > 0) {
      isFirstLoad.current = false;
    }
  }, [mergedData, updatingIds, isAdmin, selectedPerson, focusId, collapsedIds, showFromGen15]);

  const handleSearchSelect = (person) => {
    // If the selected person is a spouse, navigate to the main spouse node
    // so the tree can zoom to them (spouses are rendered on main nodes)
    let target = person;
    if (person.spouseId) {
      const main = mergedData.find(m => m.id === person.spouseId);
      if (main) target = main;
    }

    // If the node would be hidden by the gen filter, disable it
    if (showFromGen15) {
      const getDepth = (node) => {
        let d = 0, n = node;
        const mainNodes = mergedData.filter(m => !m.spouseId);
        while (n.parentId) { n = mainNodes.find(m => m.id === n.parentId); if (!n) break; d++; }
        return d;
      };
      if (getDepth(target) < 4) {
        setShowFromGen15(false);
      }
    }

    // Force zoom even if re-selecting the same node by resetting the zoom tracker
    if (svgRef.current) {
      svgRef.current.__lastSelectedId = null;
    }

    setSelectedPerson(target);
    setShowDetails(false);
  };

  const handleAdminUpdate = async (id, name, born, death, address, alias, isAlive, dacVi, gender) => {
    await handleUpdate(id, name, born, death, address, alias, isAlive, dacVi, gender);
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
        gender: person.gender || (target?.gender === 'male' ? 'female' : 'male'),
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
        gender: person.gender || 'male',
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
          gender: spousePerson.gender || (person.gender === 'female' ? 'male' : 'female'),
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
      style={{ backgroundImage: "url('/giapha/bg_parchment.png')" }}
      onClick={() => setSelectedPerson(null)}
    >
      {/* Minimal Mode Toggle — restore UI button (only visible in minimal mode, same position/size as hide button) */}
      {isMinimalMode && (
        <button
          onClick={(e) => { e.stopPropagation(); setIsMinimalMode(false); }}
          className="fixed z-50 flex items-center justify-center w-8 h-8 rounded-full bg-amber-900/80 hover:bg-amber-900 text-[#fffbeb] shadow-xl border border-amber-700/50 transition-colors duration-200 ui-float-right"
          title="Hiện UI"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.5a.75.75 0 0 1-1.08 0l-5.25-5.5a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z" clipRule="evenodd" />
          </svg>
        </button>
      )}

      {/* Decorative Header Banner */}
      <div className={`fixed z-30 select-none transition-opacity duration-300 ${isMinimalMode ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-none'}`} style={{ top: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)', left: '50%', transform: 'translateX(-50%)' }}>
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

      <SearchPanel
        ref={searchPanelRef}
        members={mergedData}
        onSelect={handleSearchSelect}
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        isMinimal={isMinimalMode}
      />

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

      {/* Zoom Indicator + Search Button — top-left on sm+, bottom-left on mobile */}
      <div className={`fixed z-30 flex items-center gap-2 transition-all duration-300 ${isMinimalMode ? 'opacity-0 pointer-events-none' : 'opacity-100'} ui-float-left`}>
        <div className="pointer-events-none select-none bg-[#fffbeb]/90 backdrop-blur-sm border border-amber-900/30 px-3 py-1.5 rounded shadow-lg flex items-center gap-3">
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
        {/* Search toggle button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            const opening = !searchOpen;
            setSearchOpen(opening);
            if (opening) searchPanelRef.current?.focusInput();
          }}
          className={`flex items-center justify-center w-8 h-8 rounded-full border shadow-lg transition-all duration-200 hover:scale-110 ${
            searchOpen
              ? 'bg-amber-900 border-amber-900 text-[#fffbeb]'
              : 'bg-[#fffbeb]/90 hover:bg-[#fffbeb] border-amber-900/30 hover:border-amber-900/60 text-amber-900/60 hover:text-amber-900'
          }`}
          title="Tìm kiếm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Generation Filter Toggle — top-right on sm+, bottom-right on mobile */}
      <div className={`fixed z-30 flex items-center gap-2 transition-all duration-300 ${isMinimalMode ? 'opacity-0 pointer-events-none' : 'opacity-100'} ui-float-right`}>
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
        {/* Hide UI Toggle Button */}
        <button
          onClick={(e) => { e.stopPropagation(); setIsMinimalMode(true); }}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-[#fffbeb]/90 hover:bg-[#fffbeb] border border-amber-900/30 hover:border-amber-900/60 text-amber-900/60 hover:text-amber-900 shadow-lg transition-all duration-200 hover:scale-110"
          title="Ẩn UI"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17Z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}
