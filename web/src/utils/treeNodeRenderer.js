import * as d3 from 'd3';

export const measureText = (text, size, weight) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  try {
    ctx.font = `${weight} ${size}px sans-serif`;
    return ctx.measureText(text).width;
  } catch (e) {
    return text.length * (weight === 'bold' ? 8.5 : 7);
  }
};

export const renderNode = ({
  gNode, 
  d, 
  spousesMap, 
  updatingIds, 
  selectedId, 
  relatedIds, 
  isAdmin, 
  focusId, 
  collapsedIds,
  onSelectPerson,
  onShowDetails,
  onFocus,
  onToggleCollapse,
  onQuickAddChild,
  onQuickAddSpouse,
  onQuickDelete,
  svgElement,
  data,
  virtualRootId
}) => {
  const person = d.data;
  const personSpouses = spousesMap[person.id] || [];
  const defaultNodeWidth = 160, nodeHeight = 65;

  // Dynamic width calculation
  const nameWidth = measureText(person.name, 14, 'bold');
  const spouseWidths = personSpouses.map(s => {
    const label = s.gender === 'female' ? 'Vợ: ' : 'Chồng: ';
    return measureText(`${label}${s.name}`, 14, 'bold');
  });
  const maxTextWidth = Math.max(nameWidth, ...spouseWidths, 0);
  const nodeWidth = Math.max(defaultNodeWidth, maxTextWidth + 8);

  const isUpdating = updatingIds.has(person.id) || personSpouses.some(s => updatingIds.has(s.id));
  const isSelected = person.id === selectedId;
  const isRelated = selectedId && relatedIds.has(person.id);
  const isFaded = selectedId && !isSelected && !isRelated;
  const nodeIsAlive = person.isAlive || personSpouses.some(s => s.isAlive);

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

  // Root node pattern
  const isRootNode = d.depth === 1;
  const isSpecialRoot = person.name === 'Nguyễn Thanh Dung' || isRootNode;
  if (isSpecialRoot) {
    const pattern = defs.append('pattern')
      .attr('id', 'pattern-root')
      .attr('width', 40).attr('height', 40).attr('patternUnits', 'userSpaceOnUse');
    
    pattern.append('rect').attr('width', 40).attr('height', 40).attr('fill', nodeIsAlive ? '#f0f9ff' : '#fef3c7');
    pattern.append('path').attr('d', 'M0 20 Q10 10 20 20 T40 20 M20 0 Q30 10 20 20 T20 40').attr('fill', 'none').attr('stroke', nodeIsAlive ? '#0369a1' : '#d97706').attr('stroke-width', 1.5).attr('opacity', 0.15);
    pattern.append('circle').attr('cx', 20).attr('cy', 20).attr('r', 3).attr('fill', nodeIsAlive ? '#0369a1' : '#d97706').attr('opacity', 0.2);
  }

  const scaleFactor = isSpecialRoot ? 1.75 : 1.0;
  const finalNodeWidth = nodeWidth * scaleFactor;
  const finalNodeHeight = nodeHeight * scaleFactor;

  nodeGroup.append('rect')
    .attr('x', -finalNodeWidth / 2).attr('y', -finalNodeHeight / 2)
    .attr('width', finalNodeWidth).attr('height', finalNodeHeight)
    .attr('rx', 8 * scaleFactor)
    .attr('fill', () => {
        if (isSpecialRoot) return 'url(#pattern-root)';
        if (isSelected) return nodeIsAlive ? '#f0f9ff' : (person.gender === 'male' ? '#fff7ed' : '#fff1f2');
        if (nodeIsAlive) return person.gender === 'male' ? '#f0f9ff' : '#fdf4ff';
        if (isRelated) return person.gender === 'male' ? '#fefce8' : '#fff1f2';
        return person.gender === 'male' ? '#fffbeb' : '#fdf2f8';
    })
    .attr('stroke', () => {
        if (isSpecialRoot) return nodeIsAlive ? '#0369a1' : '#92400e';
        if (isSelected) return '#dc2626'; 
        if (nodeIsAlive) return person.gender === 'male' ? '#0369a1' : '#c026d3';
        if (isRelated) return '#b45309'; 
        return person.gender === 'male' ? '#b45309' : '#be185d';
    })
    .attr('stroke-width', isSpecialRoot ? 4 : (isSelected ? 3.5 : (isRelated ? 2.5 : 1.5)))
    .attr('filter', isSelected ? `url(#${selectedFilterId})` : (isUpdating ? null : `url(#${filterId})`));

  // Action Buttons
  renderActionButtons({ nodeGroup, isSelected, isUpdating, isAdmin, finalNodeWidth, finalNodeHeight, person, data, virtualRootId, focusId, collapsedIds, onShowDetails, onSelectPerson, onFocus, onToggleCollapse, onQuickAddChild, onQuickAddSpouse, onQuickDelete });

  // Text Content
  renderTextContent({ nodeGroup, person, personSpouses, isSpecialRoot, scaleFactor });

  if (isUpdating) {
    nodeGroup.append('circle')
      .attr('cx', nodeWidth / 2 - 10).attr('cy', -nodeHeight / 2 + 10)
      .attr('r', 4).attr('fill', '#d97706')
      .append('animate')
      .attr('attributeName', 'opacity').attr('values', '0;1;0').attr('dur', '1s').attr('repeatCount', 'indefinite');
  }
};

const renderActionButtons = ({ nodeGroup, isSelected, isUpdating, isAdmin, finalNodeWidth, finalNodeHeight, person, data, virtualRootId, focusId, collapsedIds, onShowDetails, onSelectPerson, onFocus, onToggleCollapse, onQuickAddChild, onQuickAddSpouse, onQuickDelete }) => {
    if (isSelected && !isUpdating) {
        // Info Button
        const infoBtn = nodeGroup.append('g').attr('class', 'view-action-btn').attr('transform', `translate(${finalNodeWidth / 2 - 15}, ${-finalNodeHeight / 2 - 12})`).style('cursor', 'pointer').on('click', (e) => { e.stopPropagation(); onShowDetails(); });
        infoBtn.append('circle').attr('r', 10).attr('fill', '#92400e').attr('stroke', '#fff').attr('stroke-width', 1.5);
        infoBtn.append('text').attr('dy', 4).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', '12px').attr('font-weight', 'bold').text('i');

        // Parent Button
        if (person.parentId && person.parentId !== virtualRootId) {
            const parentBtn = nodeGroup.append('g').attr('class', 'view-action-btn').attr('transform', `translate(${-finalNodeWidth / 2 + 15}, ${-finalNodeHeight / 2 - 12})`).style('cursor', 'pointer').on('click', (e) => { e.stopPropagation(); onSelectPerson(data.find(p => p.id === person.parentId)); });
            parentBtn.append('circle').attr('r', 10).attr('fill', '#4f46e5').attr('stroke', '#fff').attr('stroke-width', 1.5);
            parentBtn.append('text').attr('dy', 4).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', '12px').attr('font-weight', 'bold').text('↑');
        }

        // Focus Button
        const isFocused = focusId === person.id;
        const focusBtn = nodeGroup.append('g').attr('class', 'view-action-btn').attr('transform', `translate(0, ${-finalNodeHeight / 2 - 12})`).style('cursor', 'pointer').on('click', (e) => { e.stopPropagation(); onFocus(person.id); });
        focusBtn.append('circle').attr('r', 10).attr('fill', isFocused ? '#1e40af' : '#64748b').attr('stroke', '#fff').attr('stroke-width', 1.5);
        focusBtn.append('text').attr('dy', 4).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', '12px').attr('font-weight', 'bold').text(isFocused ? '+' : '−');

        // Collapse Button
        const isCollapsed = collapsedIds.has(person.id);
        const collapseBtn = nodeGroup.append('g').attr('class', 'view-action-btn').attr('transform', `translate(0, ${finalNodeHeight / 2 + 12})`).style('cursor', 'pointer').on('click', (e) => { e.stopPropagation(); onToggleCollapse(person.id); });
        collapseBtn.append('circle').attr('r', 10).attr('fill', isCollapsed ? '#15803d' : '#64748b').attr('stroke', '#fff').attr('stroke-width', 1.5);
        collapseBtn.append('text').attr('dy', 4).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', '12px').attr('font-weight', 'bold').text(isCollapsed ? '+' : '−');
    }

    if (isAdmin && !isUpdating) {
        // Quick Add buttons
        const childBtn = nodeGroup.append('g').attr('class', 'quick-add-btn').attr('transform', `translate(${-finalNodeWidth / 2 + 15}, ${finalNodeHeight / 2 + 12})`).style('cursor', 'copy').on('click', (e) => { e.stopPropagation(); onQuickAddChild(person); });
        childBtn.append('circle').attr('r', 10).attr('fill', '#166534').attr('stroke', '#fff').attr('stroke-width', 1.5);
        childBtn.append('text').attr('dy', 4).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', '14px').attr('font-weight', 'bold').text('+');

        const spouseBtn = nodeGroup.append('g').attr('class', 'quick-add-btn').attr('transform', `translate(${finalNodeWidth / 2 + 12}, 0)`).style('cursor', 'copy').on('click', (e) => { e.stopPropagation(); onQuickAddSpouse(person); });
        spouseBtn.append('circle').attr('r', 10).attr('fill', '#be123c').attr('stroke', '#fff').attr('stroke-width', 1.5);
        spouseBtn.append('text').attr('dy', 4.5).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', '10px').text('♥');

        const deleteBtn = nodeGroup.append('g').attr('class', 'quick-delete-btn').attr('transform', `translate(${-finalNodeWidth / 2 + 15}, ${-finalNodeHeight / 2 - 12})`).style('cursor', 'pointer').on('click', (e) => { e.stopPropagation(); onQuickDelete(person); });
        deleteBtn.append('circle').attr('r', 10).attr('fill', '#991b1b').attr('stroke', '#fff').attr('stroke-width', 1.5);
        deleteBtn.append('text').attr('dy', 4).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', '10px').attr('font-weight', 'bold').text('✕');
    }
};

const renderTextContent = ({ nodeGroup, person, personSpouses, isSpecialRoot, scaleFactor }) => {
    const hasAlias = person.alias && person.alias.trim() !== '';
    const totalSpouses = personSpouses.length;
    const rowHeight = 14, spacing = 4;
    const totalRows = 1 + (hasAlias ? 1 : 0) + totalSpouses;
    let currentDy = (5 - ((totalRows - 1) * (rowHeight + spacing)) / 2) * scaleFactor;
    
    nodeGroup.append('text')
      .attr('dy', currentDy).attr('text-anchor', 'middle').attr('fill', isSpecialRoot ? '#78350f' : '#1c1917')
      .attr('font-size', isSpecialRoot ? '28px' : '14px').attr('font-weight', 'bold').attr('class', isSpecialRoot ? 'font-spectral' : '')
      .text(person.name);

    if (hasAlias) {
      currentDy += (rowHeight + spacing) * scaleFactor;
      nodeGroup.append('text').attr('dy', currentDy).attr('text-anchor', 'middle').attr('fill', isSpecialRoot ? '#92400e' : '#44403c').attr('font-size', isSpecialRoot ? '22px' : '11px').attr('font-weight', 'medium').attr('font-style', 'italic').attr('class', isSpecialRoot ? 'font-spectral' : '').text(`(${person.alias})`);
    }

    if (totalSpouses > 0) {
      personSpouses.forEach((s) => {
        currentDy += (rowHeight + spacing) * scaleFactor;
        const label = s.gender === 'female' ? 'Vợ: ' : 'Chồng: ';
        const spouseColor = s.gender === 'female' ? '#be185d' : '#1e40af'; 
        nodeGroup.append('text').attr('dy', currentDy).attr('text-anchor', 'middle').attr('fill', isSpecialRoot ? '#92400e' : spouseColor).attr('font-size', isSpecialRoot ? '28px' : '14px').attr('font-weight', 'bold').attr('class', isSpecialRoot ? 'font-spectral' : '').text(`${label}${s.name}`);
      });
    }
};
