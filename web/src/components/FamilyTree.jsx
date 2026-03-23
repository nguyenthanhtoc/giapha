'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useFamilyData } from '@/hooks/useFamilyData';
import { drawFamilyTree } from '@/utils/treeLayout';
import InfoPanel from './tree/InfoPanel';
import ZoomControls from './tree/ZoomControls';

export default function FamilyTree() {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const isFirstLoad = useRef(true);
  
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const { 
    mergedData, 
    handleUpdate, 
    handleDelete, 
    handleAddMember 
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
      onSelectPerson: setSelectedPerson,
      isFirstLoad: isFirstLoad.current
    });
    isFirstLoad.current = false;
  }, [mergedData]);

  const onZoom = (scale) => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().call(d3.zoom().scaleBy, scale);
  };

  const handleAdminUpdate = async (id, name, born) => {
    const res = await handleUpdate(id, name, born);
    if (res.success) alert('Cập nhật thành công!');
  };

  const handleAdminDelete = async (person) => {
    if (!confirm(`Bạn có chắc muốn xóa ${person.name}? Các con của người này sẽ không còn cha/mẹ.`)) return;
    const res = await handleDelete(person.id);
    if (res.success) {
      setSelectedPerson(null);
      alert('Đã xóa thành công!');
    }
  };

  const handleAddChild = async (person) => {
    const name = prompt(`Nhập tên con của ${person.name}:`);
    if (!name) return;
    const res = await handleAddMember({
      name,
      gender: 'male',
      parentId: person.id,
      role: 'Thế Hệ Tiếp'
    });
    if (res.success) alert('Thành công!');
  };

  const handleAddSpouse = async (person) => {
    const name = prompt(`Nhập tên vợ/chồng của ${person.name}:`);
    if (!name) return;
    const res = await handleAddMember({
      name,
      gender: person.gender === 'male' ? 'female' : 'male',
      spouseId: person.id,
      role: 'Phu nhân/Phu quân'
    });
    if (res.success) alert('Thành công!');
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-cover bg-center"
      style={{ backgroundImage: "url('./bg_parchment.png')" }}
    >
      {/* Decorative Header Banner */}
      <div className="absolute top-4 sm:top-6 left-1/2 transform -translate-x-1/2 z-20 select-none pointer-events-none w-[90%] sm:w-auto">
        <div className="relative bg-[#fffbeb] border border-amber-800 sm:border-2 px-4 sm:px-10 py-2 sm:py-3 rounded-md shadow-2xl flex items-center justify-center min-w-[200px] sm:min-w-[300px]">
          <div className="absolute -left-1 sm:-left-2 top-1/2 -translate-y-1/2 w-2 sm:w-3 h-[110%] bg-amber-900 rounded-full shadow-md" />
          <div className="absolute -right-1 sm:-right-2 top-1/2 -translate-y-1/2 w-2 sm:w-3 h-[110%] bg-amber-900 rounded-full shadow-md" />
          <h1 className="text-lg sm:text-2xl font-extrabold text-red-800 tracking-wider sm:tracking-widest uppercase font-spectral text-center">
            Gia Phả Dòng Họ
          </h1>
        </div>
      </div>

      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing touch-none" />

      <InfoPanel
        selectedPerson={selectedPerson}
        setSelectedPerson={setSelectedPerson}
        isAdmin={isAdmin}
        onUpdate={handleAdminUpdate}
        onDelete={handleAdminDelete}
        onAddChild={handleAddChild}
        onAddSpouse={handleAddSpouse}
      />

      <ZoomControls 
        onZoomIn={() => onZoom(1.3)} 
        onZoomOut={() => onZoom(0.7)} 
        isPanelOpen={!!selectedPerson}
      />
    </div>
  );
}
