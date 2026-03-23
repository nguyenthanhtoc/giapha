'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import familyData from '@/data/family.json';

export default function FamilyTree() {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [mergedData, setMergedData] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBorn, setEditBorn] = useState('');
  const isFirstLoad = useRef(true);

  const loadData = async () => {
    try {
      const res = await fetch('/api/members');
      const data = await res.json();
      setMergedData(data);
    } catch (e) {
      console.error('Error loading members:', e);
      setMergedData(familyData);
    }
  };

  useEffect(() => {
    loadData();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true') {
        setIsAdmin(true);
      }
    }
  }, []);

  useEffect(() => {
    if (selectedPerson) {
      setEditName(selectedPerson.name || '');
      setEditBorn(selectedPerson.born || '');
    }
  }, [selectedPerson]);

  // Draw D3
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || mergedData.length === 0) return;

    // Clear existing content
    d3.select(svgRef.current).selectAll('*').remove();

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 600;

    const spousesMap = {};
    mergedData.forEach(person => {
      if (person.spouseId) {
        if (!spousesMap[person.spouseId]) spousesMap[person.spouseId] = [];
        spousesMap[person.spouseId].push(person);
      }
    });

    const treeNodes = mergedData.filter(person => !person.spouseId);

    // Add a virtual root to handle multiple roots (orphans)
    const virtualRootId = 'VIRTUAL_ROOT_HIDDEN';
    const dataWithVirtualRoot = [
      { id: virtualRootId, parentId: null, name: 'VIRTUAL' },
      ...treeNodes.map(node => ({
        ...node,
        parentId: node.parentId && treeNodes.some(n => n.id === node.parentId) 
          ? node.parentId 
          : virtualRootId
      }))
    ];

    const stratify = d3.stratify()
      .id(d => d.id)
      .parentId(d => d.parentId);

    const root = stratify(dataWithVirtualRoot);

    const treeLayout = d3.tree().nodeSize([180, 160]);
    treeLayout(root);

    // Filter out the virtual root for drawing
    const links = root.links().filter(l => l.source.id !== virtualRootId);
    const descendants = root.descendants().filter(d => d.id !== virtualRootId);

    const svg = d3.select(svgRef.current)
      .attr('width', '100%')
      .attr('height', '100%');

    const g = svg.append('g').attr('class', 'tree-viewport');

    const zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Orthogonal link generator
    const linkGenerator = d => {
      const xSource = d.source.x;
      const ySource = d.source.y;
      const xTarget = d.target.x;
      const yTarget = d.target.y;
      return `M${xSource},${ySource} ` +
        `V${(ySource + yTarget) / 2} ` +
        `H${xTarget} ` +
        `V${yTarget}`;
    };

    g.append('g')
      .attr('fill', 'none')
      .attr('stroke', '#a16207') // Gold/Amber connector
      .attr('stroke-opacity', 0.8)
      .attr('stroke-width', 2)
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('d', linkGenerator);

    const node = g.append('g')
      .selectAll('g')
      .data(descendants)
      .join('g')
      .attr('transform', d => `translate(${d.x},${d.y})`);

    const nodeWidth = 160;
    const nodeHeight = 50;
    const spouseWidth = 130;
    const spouseHeight = 45;
    const spouseOffset = 180;

    node.each(function (d) {
      const gNode = d3.select(this);
      const data = d.data;
      const personSpouses = spousesMap[data.id] || [];

      let nodeGroup = gNode.append('g')
        .attr('class', 'person-node')
        .on('click', () => {
          setSelectedPerson(data);
        })
        .style('cursor', 'pointer');

      const filterId = `shadow-${data.id}`;
      svg.append('defs').append('filter')
        .attr('id', filterId)
        .append('feDropShadow')
        .attr('dx', 0).attr('dy', 4).attr('stdDeviation', 4)
        .attr('flood-color', '#000000').attr('flood-opacity', 0.3);

      nodeGroup.append('rect')
        .attr('x', -nodeWidth / 2)
        .attr('y', -nodeHeight / 2)
        .attr('width', nodeWidth)
        .attr('height', nodeHeight)
        .attr('rx', 2) // Sharp edges
        .attr('fill', '#fffbeb') // Soft yellow/cream
        .attr('stroke', '#b45309') // Amber border
        .attr('stroke-width', 1.5)
        .attr('filter', `url(#${filterId})`);

      nodeGroup.append('text')
        .attr('dy', data.role ? -4 : 4)
        .attr('text-anchor', 'middle')
        .attr('fill', '#1c1917') // Dark text
        .attr('font-size', '13px')
        .attr('font-weight', 'bold')
        .text(data.name);

      if (data.role) {
        nodeGroup.append('text')
          .attr('dy', 14)
          .attr('text-anchor', 'middle')
          .attr('fill', '#b91c1c') // Traditional Red
          .attr('font-size', '10px')
          .attr('font-weight', '500')
          .text(data.role);
      }

      if (data.highlight) {
        nodeGroup.append('rect')
          .attr('x', -nodeWidth / 2 - 3)
          .attr('y', -nodeHeight / 2 - 3)
          .attr('width', nodeWidth + 6)
          .attr('height', nodeHeight + 6)
          .attr('rx', 3)
          .attr('fill', 'none')
          .attr('stroke', '#b91c1c') // Traditional accent border
          .attr('stroke-width', 1.5)
          .attr('stroke-dasharray', '4, 2');
      }

      personSpouses.forEach((spouse, index) => {
        const spouseGroup = gNode.append('g')
          .attr('class', 'spouse-node')
          .attr('transform', `translate(${spouseOffset * (index + 1)}, 0)`)
          .on('click', () => {
            setSelectedPerson(spouse);
          })
          .style('cursor', 'pointer');

        const lineX1 = -spouseOffset + nodeWidth / 2;
        const lineX2 = -spouseWidth / 2;

        spouseGroup.append('line')
          .attr('x1', lineX1)
          .attr('y1', 0)
          .attr('x2', lineX2)
          .attr('y2', 0)
          .attr('stroke', '#be9154')
          .attr('stroke-width', 1.2)
          .attr('stroke-dasharray', '3, 2');

        spouseGroup.append('rect')
          .attr('x', -spouseWidth / 2)
          .attr('y', -spouseHeight / 2)
          .attr('width', spouseWidth)
          .attr('height', spouseHeight)
          .attr('rx', 2)
          .attr('fill', '#fffbeb') // Cream yellow for spouse
          .attr('stroke', '#b45309')
          .attr('stroke-width', 1);

        spouseGroup.append('text')
          .attr('dy', 4)
          .attr('text-anchor', 'middle')
          .attr('fill', '#1c1917')
          .attr('font-size', '12px')
          .attr('font-weight', '500')
          .text(spouse.name);
      });
    });

    if (isFirstLoad.current) {
      const transform = d3.zoomIdentity
        .translate(width / 2, 100)
        .scale(0.8);
      svg.call(zoom.transform, transform);
      isFirstLoad.current = false;
    }

  }, [mergedData]);

  const handleSave = async () => {
    if (!selectedPerson) return;

    const body = {
      [selectedPerson.id]: {
        name: editName,
        born: editBorn
      }
    };

    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        await loadData();
        alert('Lưu thay đổi thành công!');
      } else {
        alert('Lỗi khi lưu.');
      }
    } catch (e) {
      alert('Lỗi kết nối API.');
    }
  };

  const handleDelete = async () => {
    if (!selectedPerson) return;
    if (!confirm(`Bạn có chắc muốn xóa ${selectedPerson.name}? Các con của người này sẽ không còn cha/mẹ.`)) return;

    try {
      const res = await fetch(`/api/members?id=${selectedPerson.id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setSelectedPerson(null);
        await loadData();
        alert('Đã xóa thành công!');
      } else {
        alert('Lỗi khi xóa.');
      }
    } catch (e) {
      alert('Lỗi kết nối API.');
    }
  };

  const handleAddChild = async () => {
    if (!selectedPerson) return;
    const name = prompt(`Nhập tên con của ${selectedPerson.name}:`);
    if (!name) return;

    const data = {
      name,
      gender: 'male', // Default male
      parentId: selectedPerson.id,
      role: 'Thế Hệ Tiếp'
    };

    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', data })
      });

      if (res.ok) {
        await loadData();
        alert('Thành công!');
      }
    } catch (e) {
      alert('Lỗi.');
    }
  };

  const handleAddSpouse = async () => {
    if (!selectedPerson) return;
    const name = prompt(`Nhập tên vợ/chồng của ${selectedPerson.name}:`);
    if (!name) return;

    const data = {
      name,
      gender: selectedPerson.gender === 'male' ? 'female' : 'male',
      spouseId: selectedPerson.id,
      role: 'Phu nhân/Phu quân'
    };

    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', data })
      });

      if (res.ok) {
        await loadData();
        alert('Thành công!');
      }
    } catch (e) {
      alert('Lỗi.');
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-cover bg-center"
      style={{ backgroundImage: "url('./bg_parchment.png')" }}
    >

      {/* Decorative Header Banner */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10 select-none pointer-events-none">
        <div className="relative bg-[#fffbeb] border-2 border-amber-800 px-10 py-3 rounded-md shadow-2xl flex items-center justify-center min-w-[300px]">
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-[110%] bg-amber-900 rounded-full shadow-md" />
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-[110%] bg-amber-900 rounded-full shadow-md" />
          <h1 className="text-xl font-extrabold text-red-800 tracking-widest uppercase">
            Gia Phả Dòng Họ
          </h1>
        </div>
      </div>

      <svg ref={svgRef} className="w-full h-full" />

      {selectedPerson && (
        <div className="absolute top-4 right-4 max-w-sm w-full bg-zinc-900/90 border border-zinc-800 rounded-xl p-6 backdrop-blur-md shadow-2xl text-white">
          <button
            onClick={() => setSelectedPerson(null)}
            className="absolute top-2 right-2 text-zinc-400 hover:text-white"
          >
            ✕
          </button>
          <div className="flex flex-col items-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${selectedPerson.gender === 'male' ? 'bg-blue-900/40 text-blue-400' : 'bg-pink-900/40 text-pink-400'}`}>
              {selectedPerson.name.charAt(0)}
            </div>

            {isAdmin ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="mt-4 text-center bg-zinc-800 text-zinc-100 border border-zinc-700 rounded px-2 py-1 text-xl font-bold w-full"
                placeholder="Tên thành viên"
              />
            ) : (
              <h2 className="mt-4 text-xl font-bold text-zinc-100">{selectedPerson.name}</h2>
            )}

            <p className="text-sm text-zinc-400 mt-1">{selectedPerson.role || 'Thành viên'}</p>

            <div className="mt-4 w-full border-t border-zinc-800 pt-3 text-sm grid grid-cols-2 gap-2">
              <span className="text-zinc-500">Năm sinh:</span>
              {isAdmin ? (
                <input
                  type="text"
                  value={editBorn}
                  onChange={(e) => setEditBorn(e.target.value)}
                  className="bg-zinc-800 text-zinc-300 border border-zinc-700 rounded px-2 py-1 text-sm text-center w-full"
                  placeholder="Năm sinh"
                />
              ) : (
                <span className="text-zinc-300">{selectedPerson.born || 'N/A'}</span>
              )}
              <span className="text-zinc-500">Năm mất:</span>
              <span className="text-zinc-300">{selectedPerson.death || 'Hiện tại'}</span>
            </div>

            {isAdmin && (
              <div className="mt-6 w-full space-y-2">
                <button
                  onClick={handleSave}
                  className="w-full bg-amber-700 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Lưu Thay Đổi
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleAddChild}
                    className="bg-zinc-800 hover:bg-zinc-700 text-amber-500 border border-amber-900/30 font-medium py-2 px-2 rounded-lg text-xs transition-colors"
                  >
                    + Thêm Con
                  </button>
                  <button
                    onClick={handleAddSpouse}
                    className="bg-zinc-800 hover:bg-zinc-700 text-amber-500 border border-amber-900/30 font-medium py-2 px-2 rounded-lg text-xs transition-colors"
                  >
                    + Thêm Vợ/Chồng
                  </button>
                </div>
                <button
                  onClick={handleDelete}
                  className="w-full bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-900/50 font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
                >
                  Xóa Thành Viên
                </button>
              </div>
            )}

            {selectedPerson.highlight && !isAdmin && (
              <div className="mt-4 p-3 bg-amber-900/20 border border-amber-800/40 rounded-lg text-xs text-amber-300">
                ⭐ {selectedPerson.highlightDesc}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-4 flex gap-2">
        <button
          onClick={() => {
            const svg = d3.select(svgRef.current);
            svg.transition().call(d3.zoom().scaleBy, 1.3);
          }}
          className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg shadow-lg flex items-center justify-center font-bold"
        >
          +
        </button>
        <button
          onClick={() => {
            const svg = d3.select(svgRef.current);
            svg.transition().call(d3.zoom().scaleBy, 0.7);
          }}
          className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg shadow-lg flex items-center justify-center font-bold"
        >
          -
        </button>
      </div>
    </div>
  );
}
