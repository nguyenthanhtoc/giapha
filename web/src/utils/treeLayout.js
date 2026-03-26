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

  const treeLayout = d3.tree().nodeSize([220, 180]);
  treeLayout(root);

  const links = root.links().filter(l => l.source.id !== virtualRootId);
  const descendants = root.descendants().filter(d => d.id !== virtualRootId);

  const g = svgElement.append('g').attr('class', 'tree-viewport');

  const zoom = d3.zoom()
    .scaleExtent([0.1, 5])
    .on('zoom', (event) => {
      g.attr('transform', event.transform);
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

  if (!isFirstLoad) {
    const currentTransform = d3.zoomTransform(svgRef.current);
    g.attr('transform', currentTransform);
    svgElement.call(zoom.transform, currentTransform);
  }

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

  const nodeWidth = 160, nodeHeight = 65;

  node.each(function (d) {
    const gNode = d3.select(this);
    const person = d.data;
    const personSpouses = spousesMap[person.id] || [];
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

    nodeGroup.append('rect')
      .attr('x', -nodeWidth / 2).attr('y', -nodeHeight / 2)
      .attr('width', nodeWidth).attr('height', nodeHeight)
      .attr('rx', 8)
      .attr('fill', d => {
          if (isSelected) return person.gender === 'male' ? '#fff7ed' : '#fff1f2';
          if (isRelated) return person.gender === 'male' ? '#fefce8' : '#fff1f2';
          return person.gender === 'male' ? '#fffbeb' : '#fdf2f8';
      })
      .attr('stroke', d => {
          if (isSelected) return '#dc2626'; // Vibrant red
          if (isRelated) return '#b45309'; // Warm amber
          return person.gender === 'male' ? '#b45309' : '#be185d';
      })
      .attr('stroke-width', isSelected ? 3.5 : (isRelated ? 2.5 : 1.5))
      .attr('filter', isSelected ? `url(#${selectedFilterId})` : (isUpdating ? null : `url(#${filterId})`));

    // Collapse/Info Buttons for EVERYONE when selected
    if (isSelected && !isUpdating) {
        // Info Button (Top Left)
        const infoBtn = nodeGroup.append('g')
          .attr('class', 'view-action-btn')
          .attr('transform', `translate(${-nodeWidth / 2 + 15}, ${-nodeHeight / 2 - 12})`)
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

        // Collapse/Focus Up Button (Top Right)
        const isFocused = focusId === person.id;
        const focusBtn = nodeGroup.append('g')
          .attr('class', 'view-action-btn')
          .attr('transform', `translate(${nodeWidth / 2 - 15}, ${-nodeHeight / 2 - 12})`)
          .style('cursor', 'pointer')
          .on('click', (e) => {
              e.stopPropagation();
              onFocus(person.id);
          });
        
        focusBtn.append('circle').attr('r', 10).attr('fill', isFocused ? '#1e40af' : '#64748b').attr('stroke', '#fff').attr('stroke-width', 1.5);
        focusBtn.append('text')
          .attr('dy', isFocused ? 3 : 4.5)
          .attr('text-anchor', 'middle')
          .attr('fill', '#fff')
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .text(isFocused ? '↺' : '↑');
        
        // Add a tooltip-like text if hovered? (optional, for now skip to keep clean)

        // Collapse/Expand Down Button (Bottom Center-Right)
        const isCollapsed = collapsedIds.has(person.id);
        const collapseBtn = nodeGroup.append('g')
          .attr('class', 'view-action-btn')
          .attr('transform', `translate(${nodeWidth / 2 - 15}, ${nodeHeight / 2 + 12})`)
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
        const childBtn = nodeGroup.append('g')
          .attr('class', 'quick-add-btn')
          .attr('transform', `translate(0, ${nodeHeight / 2 + 12})`)
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
          .attr('transform', `translate(${nodeWidth / 2 + 12}, 0)`)
          .style('cursor', 'copy')
          .on('click', (e) => {
              e.stopPropagation();
              onQuickAddSpouse(person);
          });
        
        spouseBtn.append('circle').attr('r', 10).attr('fill', '#be123c').attr('stroke', '#fff').attr('stroke-width', 1.5);
        spouseBtn.append('text').attr('dy', 4.5).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', '10px').text('♥');

        // Quick delete button (Top)
        const deleteBtn = nodeGroup.append('g')
          .attr('class', 'quick-delete-btn')
          .attr('transform', `translate(0, ${-nodeHeight / 2 - 12})`)
          .style('cursor', 'pointer')
          .on('click', (e) => {
              e.stopPropagation();
              onQuickDelete(person);
          });
        
        deleteBtn.append('circle').attr('r', 10).attr('fill', '#991b1b').attr('stroke', '#fff').attr('stroke-width', 1.5);
        deleteBtn.append('text').attr('dy', 4).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', '10px').attr('font-weight', 'bold').text('✕');
    }

    // Main person name
    nodeGroup.append('text')
      .attr('dy', personSpouses.length > 0 ? -12 : 5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#1c1917').attr('font-size', '14px').attr('font-weight', 'bold')
      .text(person.name);

    // Spouse names (multi-line)
    if (personSpouses.length > 0) {
      personSpouses.forEach((s, i) => {
        nodeGroup.append('text')
          .attr('dy', 2 + i * 12)
          .attr('text-anchor', 'middle')
          .attr('fill', '#4b5563').attr('font-size', '11px').attr('font-weight', '500')
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

  if (isFirstLoad) {
    const rootNode = descendants.find(d => d.data.name === 'Nguyễn Thanh Dung') || descendants[0];
    if (rootNode) {
      const initialScale = 0.9;
      const transform = d3.zoomIdentity
        .translate(width / 2 - rootNode.x * initialScale, height / 2 - rootNode.y * initialScale)
        .scale(initialScale);
      svgElement.call(zoom.transform, transform);
    }
  }

  return { zoom, g, svgElement };
};
