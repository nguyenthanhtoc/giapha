import * as d3 from 'd3';

export const drawFamilyTree = ({ 
  svgRef, 
  containerRef, 
  data, 
  updatingIds = new Set(),
  isAdmin = false,
  onSelectPerson, 
  onQuickAddChild,
  onQuickAddSpouse,
  onQuickDelete,
  selectedPerson,
  focusId,
  collapsedIds,
  onFocus,
  onToggleCollapse,
  onShowDetails,
  onZoom,
  isFirstLoad 
}) => {
  if (!svgRef.current || !containerRef.current || data.length === 0) return;

  const svgElement = d3.select(svgRef.current);
  const width = containerRef.current.clientWidth;
  const height = containerRef.current.clientHeight || 600;

  // Clear previous content
  svgElement.selectAll('*').remove();

  const spousesMap = {};
  data.forEach(person => {
    if (person.spouseId) {
      if (!spousesMap[person.spouseId]) spousesMap[person.spouseId] = [];
      spousesMap[person.spouseId].push(person);
    }
  });

  const treeNodes = data.filter(person => !person.spouseId);

  // Virtual Root to handle multiple roots
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

  const rootFull = stratify(dataWithVirtualRoot);
  let root = rootFull;

  if (focusId) {
    const focusNode = rootFull.descendants().find(d => d.id === focusId);
    if (focusNode) {
      root = focusNode;
      // We don't detach it, d3.tree will just lay out the focusNode's subtree
    }
  }

  // Apply collapses
  if (collapsedIds && collapsedIds.size > 0) {
    root.descendants().forEach(d => {
      if (collapsedIds.has(d.id)) {
        d._children = d.children;
        d.children = null;
      }
    });
  }

  const treeLayout = d3.tree().nodeSize([170, 200]); // Reduced horizontal spacing to ~10px gap (160 node + 10 gap)
  treeLayout(root);

  const generationLabels = [
    "Đệ Thập Nhất Thế Tổ",
    "Đệ Thập Nhị Thế Tổ",
    "Đệ Thập Tam Thế Tổ",
    "Đệ Thập Tứ Thế",
    "Đệ Thập Ngũ Thế",
    "Đệ Thập Lục Thế",
    "Đệ Thập Thất Thế",
    "Đệ Thập Bát Thế",
    "Đệ Thập Cửu Thế"
  ];

  const links = root.links().filter(l => l.source.id !== virtualRootId);
  const descendants = root.descendants().filter(d => d.id !== virtualRootId);

  // Add generation info to nodes
  descendants.forEach(d => {
    if (d.depth > 0) {
      const genIndex = d.depth - 1;
      const genLabel = generationLabels[genIndex] || `Thế Hệ ${d.depth + 10}`;
      d.data.generation = genLabel;
      
      // Also apply to spouses
      const personSpouses = spousesMap[d.data.id] || [];
      personSpouses.forEach(s => {
        s.generation = genLabel;
      });
    }
  });

  const g = svgElement.append('g').attr('class', 'tree-viewport');

  const zoom = d3.zoom()
    .scaleExtent([0.1, 5])
    .on('zoom', (event) => {
      g.attr('transform', event.transform);
      if (onZoom) onZoom(event.transform.k);
    });

  // Highlight logic
  const selectedId = selectedPerson?.id;
  const relatedIds = new Set();
  const selectedNode = selectedId ? descendants.find(d => d.id === selectedId) : null;
  
  if (selectedNode) {
    selectedNode.ancestors().forEach(d => {
      if (d.id !== virtualRootId) relatedIds.add(d.id);
    });
    selectedNode.descendants().forEach(d => {
      relatedIds.add(d.id);
    });
  }

  // Handle Zoom persistence and transitions
  const currentTransform = d3.zoomTransform(svgRef.current);
  const isFocusBack = !focusId && svgRef.current.__lastFocusId;
  const isFocusNew = focusId && svgRef.current.__lastFocusId !== focusId;
  const isSelectedNew = selectedId && svgRef.current.__lastSelectedId !== selectedId;
  const shouldResetView = isFirstLoad || isFocusNew || isFocusBack || isSelectedNew;

  if (shouldResetView) {
    const targetNode = isSelectedNew ? selectedNode : (descendants.find(d => d.id === (focusId || descendants[0]?.id)) || descendants[0]);
    if (targetNode) {
      let targetScale;
      let targetY = height / 2;

      if (isFirstLoad) {
          targetScale = 0.4;
          targetY = height / 3; // Position at 1/3 from top
      } else if (isSelectedNew || focusId) {
          const isMobile = width < 640;
          const nodeBaseWidth = 160;
          targetScale = isMobile ? (width / 5) / nodeBaseWidth : (width / 10) / nodeBaseWidth;
      } else {
          targetScale = 0.85;
      }

      const targetTransform = d3.zoomIdentity
        .translate(width / 2 - targetNode.x * targetScale, targetY - targetNode.y * targetScale)
        .scale(targetScale);
      
      if (isFirstLoad) {
        svgElement.call(zoom.transform, targetTransform);
        g.attr('transform', targetTransform);
        if (onZoom) onZoom(targetScale);
      } else {
        svgElement.transition().duration(800).ease(d3.easeCubicInOut)
          .call(zoom.transform, targetTransform)
          .on('end', () => { if (onZoom) onZoom(targetScale); });
      }
    }
  } else {
    // Regular update (like collapse/expand), keep the camera stable
    svgElement.call(zoom.transform, currentTransform);
    g.attr('transform', currentTransform);
  }
  
  svgRef.current.__lastFocusId = focusId;
  svgRef.current.__lastSelectedId = selectedId;

  svgElement.call(zoom);
  svgElement.on('click', () => onSelectPerson(null));

  const linkGenerator = d => {
    const xSource = d.source.x, ySource = d.source.y;
    const xTarget = d.target.x, yTarget = d.target.y;
    return `M${xSource},${ySource} V${(ySource + yTarget) / 2} H${xTarget} V${yTarget}`;
  };

  g.append('g')
    .attr('fill', 'none')
    .attr('stroke', '#a16207')
    .attr('stroke-opacity', 0.5)
    .attr('stroke-width', 1.5)
    .selectAll('path')
    .data(links)
    .join('path')
    .attr('d', linkGenerator)
    .attr('stroke', d => {
        if (!selectedId) return '#a16207';
        const isRelated = relatedIds.has(d.source.id) && relatedIds.has(d.target.id);
        return isRelated ? '#92400e' : '#d1d5db';
    })
    .attr('stroke-opacity', d => {
        if (!selectedId) return 0.5;
        const isRelated = relatedIds.has(d.source.id) && relatedIds.has(d.target.id);
        return isRelated ? 0.9 : 0.2;
    })
    .attr('stroke-width', d => {
        if (!selectedId) return 1.5;
        const isRelated = relatedIds.has(d.source.id) && relatedIds.has(d.target.id);
        return isRelated ? 3 : 1;
    });

  const node = g.append('g')
    .selectAll('g')
    .data(descendants)
    .join('g')
    .attr('transform', d => `translate(${d.x},${d.y})`);

  const defaultNodeWidth = 160, nodeHeight = 65;

  // Measurement helper
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const measureText = (text, size, weight) => {
    try {
      ctx.font = `${weight} ${size}px sans-serif`;
      return ctx.measureText(text).width;
    } catch (e) {
      return text.length * (weight === 'bold' ? 8.5 : 7);
    }
  };

  node.each(function (d) {
    const gNode = d3.select(this);
    const person = d.data;
    const personSpouses = spousesMap[person.id] || [];

    // Dynamic width calculation with 8px padding
    const nameWidth = measureText(person.name, 14, 'bold');
    const spouseWidths = personSpouses.map(s => measureText(`(${s.name})`, 11, '500'));
    const maxTextWidth = Math.max(nameWidth, ...spouseWidths, 0);
    const nodeWidth = Math.max(defaultNodeWidth, maxTextWidth + 8); // 4px padding on each side

    const isUpdating = updatingIds.has(person.id) || personSpouses.some(s => updatingIds.has(s.id));

    const isSelected = person.id === selectedId;
    const isRelated = selectedId && relatedIds.has(person.id);
    const isFaded = selectedId && !isSelected && !isRelated;

    const nodeGroup = gNode.append('g')
      .attr('class', `person-node ${isUpdating ? 'animate-pulse' : ''}`)
      .style('opacity', isFaded ? 0.35 : 1)
      .on('click', (event) => {
        event.stopPropagation();
        onSelectPerson(person);
      })
      .style('cursor', isUpdating ? 'wait' : 'pointer');

    const filterId = `shadow-${person.id}`;
    const selectedFilterId = `selected-glow-${person.id}`;
    
    const defs = svgElement.select('defs').node() ? svgElement.select('defs') : svgElement.append('defs');
    
    defs.append('filter').attr('id', filterId)
      .append('feDropShadow').attr('dx', 0).attr('dy', 4).attr('stdDeviation', 4)
      .attr('flood-color', '#000000').attr('flood-opacity', 0.15);

    if (isSelected) {
      defs.append('filter').attr('id', selectedFilterId)
        .append('feDropShadow').attr('dx', 0).attr('dy', 0).attr('stdDeviation', 6)
        .attr('flood-color', '#dc2626').attr('flood-opacity', 0.5);
    }

    // Special pattern for root node
    const isRootNode = d.depth === 1;
    const isSpecialRoot = person.name === 'Nguyễn Thanh Dung' || isRootNode;
    if (isSpecialRoot) {
      const pattern = defs.append('pattern')
        .attr('id', 'pattern-root')
        .attr('width', 40)
        .attr('height', 40)
        .attr('patternUnits', 'userSpaceOnUse');
      
      pattern.append('rect')
        .attr('width', 40).attr('height', 40)
        .attr('fill', '#fef3c7'); // Background of pattern

      pattern.append('path')
        .attr('d', 'M0 20 Q10 10 20 20 T40 20 M20 0 Q30 10 20 20 T20 40')
        .attr('fill', 'none')
        .attr('stroke', '#d97706')
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.15);
        
      pattern.append('circle')
        .attr('cx', 20).attr('cy', 20).attr('r', 3)
        .attr('fill', '#d97706')
        .attr('opacity', 0.2);
    }

    const scaleFactor = isSpecialRoot ? 1.75 : 1.0;
    const finalNodeWidth = nodeWidth * scaleFactor;
    const finalNodeHeight = nodeHeight * scaleFactor;

    nodeGroup.append('rect')
      .attr('x', -finalNodeWidth / 2).attr('y', -finalNodeHeight / 2)
      .attr('width', finalNodeWidth).attr('height', finalNodeHeight)
      .attr('rx', 8 * scaleFactor)
      .attr('fill', d => {
          if (isSpecialRoot) return 'url(#pattern-root)';
          if (isSelected) return person.gender === 'male' ? '#fff7ed' : '#fff1f2';
          if (isRelated) return person.gender === 'male' ? '#fefce8' : '#fff1f2';
          return person.gender === 'male' ? '#fffbeb' : '#fdf2f8';
      })
      .attr('stroke', d => {
          if (isSpecialRoot) return '#92400e'; // Root specific border
          if (isSelected) return '#dc2626'; // Vibrant red
          if (isRelated) return '#b45309'; // Warm amber
          return person.gender === 'male' ? '#b45309' : '#be185d';
      })
      .attr('stroke-width', isSpecialRoot ? 4 : (isSelected ? 3.5 : (isRelated ? 2.5 : 1.5)))
      .attr('filter', isSelected ? `url(#${selectedFilterId})` : (isUpdating ? null : `url(#${filterId})`));

    // Collapse/Info Buttons for EVERYONE when selected
    if (isSelected && !isUpdating) {
        // Info Button (Top Left)
        const infoBtn = nodeGroup.append('g')
          .attr('class', 'view-action-btn')
          .attr('transform', `translate(${finalNodeWidth / 2 - 15}, ${-finalNodeHeight / 2 - 12})`)
          .style('cursor', 'pointer')
          .on('click', (e) => {
              e.stopPropagation();
              onShowDetails();
          });
        
        infoBtn.append('circle').attr('r', 10).attr('fill', '#92400e').attr('stroke', '#fff').attr('stroke-width', 1.5);
        infoBtn.append('text')
          .attr('dy', 4)
          .attr('text-anchor', 'middle')
          .attr('fill', '#fff')
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .text('i');

        // Go to Parent Button (Top Left)
        if (person.parentId && person.parentId !== virtualRootId) {
            const parentBtn = nodeGroup.append('g')
              .attr('class', 'view-action-btn')
              .attr('transform', `translate(${-finalNodeWidth / 2 + 15}, ${-finalNodeHeight / 2 - 12})`)
              .style('cursor', 'pointer')
              .on('click', (e) => {
                  e.stopPropagation();
                  onFocus(person.parentId);
              });
            
            parentBtn.append('circle').attr('r', 10).attr('fill', '#64748b').attr('stroke', '#fff').attr('stroke-width', 1.5);
            parentBtn.append('text')
              .attr('dy', 4)
              .attr('text-anchor', 'middle')
              .attr('fill', '#fff')
              .attr('font-size', '12px')
              .attr('font-weight', 'bold')
              .text('↑');
        }

        // Collapse/Focus Up Button (Top Right)
        const isFocused = focusId === person.id;
        const focusBtn = nodeGroup.append('g')
          .attr('class', 'view-action-btn')
          .attr('transform', `translate(0, ${-finalNodeHeight / 2 - 12})`)
          .style('cursor', 'pointer')
          .on('click', (e) => {
              e.stopPropagation();
              onFocus(person.id);
          });
        
        focusBtn.append('circle').attr('r', 10).attr('fill', isFocused ? '#1e40af' : '#64748b').attr('stroke', '#fff').attr('stroke-width', 1.5);
        focusBtn.append('text')
          .attr('dy', 4)
          .attr('text-anchor', 'middle')
          .attr('fill', '#fff')
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .text(isFocused ? '+' : '−');
        
        // Add a tooltip-like text if hovered? (optional, for now skip to keep clean)

        // Collapse/Expand Down Button (Bottom Center-Right)
        const isCollapsed = collapsedIds.has(person.id);
        const collapseBtn = nodeGroup.append('g')
          .attr('class', 'view-action-btn')
          .attr('transform', `translate(0, ${finalNodeHeight / 2 + 12})`)
          .style('cursor', 'pointer')
          .on('click', (e) => {
              e.stopPropagation();
              onToggleCollapse(person.id);
          });
        
        collapseBtn.append('circle').attr('r', 10).attr('fill', isCollapsed ? '#15803d' : '#64748b').attr('stroke', '#fff').attr('stroke-width', 1.5);
        collapseBtn.append('text')
          .attr('dy', 4)
          .attr('text-anchor', 'middle')
          .attr('fill', '#fff')
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .text(isCollapsed ? '+' : '−');
    }

    if (isAdmin && !isUpdating) {
        // Child add button (Bottom)
        // Child add button (Bottom Left)
        const childBtn = nodeGroup.append('g')
          .attr('class', 'quick-add-btn')
          .attr('transform', `translate(${-finalNodeWidth / 2 + 15}, ${finalNodeHeight / 2 + 12})`)
          .style('cursor', 'copy')
          .on('click', (e) => {
              e.stopPropagation();
              onQuickAddChild(person);
          });
        
        childBtn.append('circle').attr('r', 10).attr('fill', '#166534').attr('stroke', '#fff').attr('stroke-width', 1.5);
        childBtn.append('text').attr('dy', 4).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', '14px').attr('font-weight', 'bold').text('+');

        // Spouse add button (Right)
        const spouseBtn = nodeGroup.append('g')
          .attr('class', 'quick-add-btn')
          .attr('transform', `translate(${finalNodeWidth / 2 + 12}, 0)`)
          .style('cursor', 'copy')
          .on('click', (e) => {
              e.stopPropagation();
              onQuickAddSpouse(person);
          });
        
        spouseBtn.append('circle').attr('r', 10).attr('fill', '#be123c').attr('stroke', '#fff').attr('stroke-width', 1.5);
        spouseBtn.append('text').attr('dy', 4.5).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', '10px').text('♥');

        // Quick delete button (Top Left)
        const deleteBtn = nodeGroup.append('g')
          .attr('class', 'quick-delete-btn')
          .attr('transform', `translate(${-finalNodeWidth / 2 + 15}, ${-finalNodeHeight / 2 - 12})`)
          .style('cursor', 'pointer')
          .on('click', (e) => {
              e.stopPropagation();
              onQuickDelete(person);
          });
        
        deleteBtn.append('circle').attr('r', 10).attr('fill', '#991b1b').attr('stroke', '#fff').attr('stroke-width', 1.5);
        deleteBtn.append('text').attr('dy', 4).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', '10px').attr('font-weight', 'bold').text('✕');
    }

    // Calculate vertical positions for centering (Name + Spouses)
    const totalSpouses = personSpouses.length;
    const rowHeight = 14; 
    const nameDy = (5 - (totalSpouses * rowHeight) / 2) * scaleFactor;
    
    // Main person name
    nodeGroup.append('text')
      .attr('dy', nameDy)
      .attr('text-anchor', 'middle')
      .attr('fill', isSpecialRoot ? '#78350f' : '#1c1917')
      .attr('font-size', isSpecialRoot ? '28px' : '14px')
      .attr('font-weight', 'black')
      .attr('class', isSpecialRoot ? 'font-spectral' : '')
      .text(person.name);

    // Spouse names (multi-line)
    if (totalSpouses > 0) {
      personSpouses.forEach((s, i) => {
        nodeGroup.append('text')
          .attr('dy', nameDy + (i + 1) * rowHeight * scaleFactor)
          .attr('text-anchor', 'middle')
          .attr('fill', '#4b5563')
          .attr('font-size', isSpecialRoot ? '22px' : '11px')
          .attr('font-weight', '500')
          .text(`(${s.name})`);
      });
    }

    if (isUpdating) {
      nodeGroup.append('circle')
        .attr('cx', nodeWidth / 2 - 10).attr('cy', -nodeHeight / 2 + 10)
        .attr('r', 4).attr('fill', '#d97706')
        .append('animate')
        .attr('attributeName', 'opacity').attr('values', '0;1;0').attr('dur', '1s').attr('repeatCount', 'indefinite');
    }
  });

  return { zoom, g, svgElement };
};
