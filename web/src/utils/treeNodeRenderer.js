import * as d3 from 'd3';
import { parseYear } from '@/utils/stringUtils';

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

const formatLifespan = (person) => {
  const born = parseYear(person.born);
  const death = parseYear(person.death);
  if (!born && !death) return null;
  // isAlive: true = còn sống, undefined/null (data cũ không có trường này) = dùng năm mất để suy luận
  const alive = person.isAlive === true || (person.isAlive == null && !death);
  if (alive) return born ? `${born} - nay` : null;
  if (born && death) return `${born} - ${death}`;
  if (born) return `${born} - ?`;
  if (death) return `? - ${death}`;
  return null;
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
  const dynamicNodeHeight = d.dynamicNodeHeight || 65;

  const nameWidth = measureText(person.name, 14, 'bold');
  const spouseWidths = personSpouses.map(s => {
    const label = s.gender === 'female' ? 'Vợ: ' : 'Chồng: ';
    return measureText(`${label}${s.name}`, 14, 'bold');
  });
  const lifespanWidth = measureText(formatLifespan(person) || '', 11, 'normal');
  const addressWidth = (person.address && person.address.trim())
    ? measureText(`📍 ${person.address}`, 11, 'normal') : 0;
  const maxTextWidth = Math.max(nameWidth, ...spouseWidths, lifespanWidth, addressWidth, 0);
  const defaultNodeWidth = 180;
  const nodeWidth = Math.max(defaultNodeWidth, maxTextWidth + 20);

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
  const finalNodeHeight = dynamicNodeHeight * scaleFactor;
  const rx = 10 * scaleFactor;

  const fillColor = (() => {
    if (isSpecialRoot) return 'url(#pattern-root)';
    if (isSelected) return nodeIsAlive ? '#eff6ff' : (person.gender === 'male' ? '#fff7ed' : '#fff1f2');
    if (nodeIsAlive) return person.gender === 'male' ? '#eff6ff' : '#fdf4ff';
    if (isRelated) return person.gender === 'male' ? '#fefce8' : '#fff1f2';
    return person.gender === 'male' ? '#fffbeb' : '#fdf2f8';
  })();

  const strokeColor = (() => {
    if (isSpecialRoot) return nodeIsAlive ? '#0369a1' : '#92400e';
    if (isSelected) return '#dc2626';
    if (nodeIsAlive) return person.gender === 'male' ? '#2563eb' : '#a21caf';
    if (isRelated) return '#b45309';
    return person.gender === 'male' ? '#b45309' : '#be185d';
  })();

  const strokeWidth = isSpecialRoot ? 4 : (isSelected ? 3 : (isRelated ? 2 : 1.5));

  // Main card background
  nodeGroup.append('rect')
    .attr('x', -finalNodeWidth / 2).attr('y', -finalNodeHeight / 2)
    .attr('width', finalNodeWidth).attr('height', finalNodeHeight)
    .attr('rx', rx)
    .attr('fill', fillColor)
    .attr('stroke', strokeColor)
    .attr('stroke-width', strokeWidth)
    .attr('filter', isSelected ? `url(#${selectedFilterId})` : (isUpdating ? null : `url(#${filterId})`));

  // Top accent bar (gender color strip) — clipped inside the card border
  if (!isSpecialRoot) {
    const accentColor = nodeIsAlive
      ? (person.gender === 'male' ? '#2563eb' : '#a21caf')
      : (person.gender === 'male' ? '#b45309' : '#be185d');
    const accentH = 6;
    const accentClipId = `accent-clip-${person.id}`;
    // Define a clipPath matching the card shape so the accent stays within rounded corners
    defs.append('clipPath').attr('id', accentClipId)
      .append('rect')
      .attr('x', -finalNodeWidth / 2 + strokeWidth / 2)
      .attr('y', -finalNodeHeight / 2 + strokeWidth / 2)
      .attr('width', finalNodeWidth - strokeWidth)
      .attr('height', finalNodeHeight - strokeWidth)
      .attr('rx', rx - strokeWidth / 2)
      .attr('ry', rx - strokeWidth / 2);
    nodeGroup.append('rect')
      .attr('x', -finalNodeWidth / 2 + strokeWidth / 2)
      .attr('y', -finalNodeHeight / 2 + strokeWidth / 2)
      .attr('width', finalNodeWidth - strokeWidth)
      .attr('height', accentH)
      .attr('fill', accentColor)
      .attr('clip-path', `url(#${accentClipId})`)
      .attr('opacity', isSelected ? 1 : 0.75);
  }

  // Action Buttons
  renderActionButtons({ nodeGroup, isSelected, isUpdating, isAdmin, finalNodeWidth, finalNodeHeight, person, data, virtualRootId, focusId, collapsedIds, onShowDetails, onSelectPerson, onFocus, onToggleCollapse, onQuickAddChild, onQuickAddSpouse, onQuickDelete });

  // Text Content
  renderTextContent({ nodeGroup, person, personSpouses, isSpecialRoot, scaleFactor, dynamicNodeHeight, finalNodeWidth });

  if (isUpdating) {
    nodeGroup.append('circle')
      .attr('cx', nodeWidth / 2 - 10).attr('cy', -dynamicNodeHeight / 2 + 10)
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

const renderTextContent = ({ nodeGroup, person, personSpouses, isSpecialRoot, scaleFactor, dynamicNodeHeight, finalNodeWidth }) => {
    const hasAlias = !!(person.alias && person.alias.trim());
    // Address shown once at the bottom: use main person's address (shared for whole family)
    const sharedAddress = (person.address && person.address.trim()) ? person.address.trim() : null;
    const hasAddress = !!sharedAddress;

    // Row heights and gaps — must match treeDataHelpers.js exactly
    const NAME_H = 16, SUB_H = 12, GAP = 3;
    const SP_NAME_H = 14, SP_SUB_H = 11;
    // SP_DIV_GAP: total gap between last main row and spouse name row
    // = gap before divider line + gap after divider line
    // Using GAP*2 + line(1) ≈ 7, rounded to 8 for visual comfort
    const SP_DIV_GAP = 8;

    // Pre-compute main lifespan
    const mainLifespan = formatLifespan(person);

    // Calculate total text height for vertical centering.
    // This MUST match the calculation in treeDataHelpers.js (minus verticalPadding).
    let totalH = NAME_H;
    if (hasAlias) totalH += GAP + SUB_H;
    if (mainLifespan) totalH += GAP + SUB_H;
    personSpouses.forEach(s => {
      // SP_DIV_GAP replaces GAP between last row and spouse name
      totalH += SP_DIV_GAP + SP_NAME_H;
      if (formatLifespan(s)) totalH += GAP + SP_SUB_H;
    });
    if (hasAddress) totalH += GAP + SUB_H;

    // currentY = center of first row, measured from text block center
    let currentY = -totalH / 2 + NAME_H / 2;
    let prevH = NAME_H;

    // advance moves currentY from center of prev row to center of next row
    const advance = (prevRowH, nextRowH, gap = GAP) => {
      currentY += prevRowH / 2 + gap + nextRowH / 2;
      prevH = nextRowH;
    };

    // accentH offset: shift text block down by half the accent bar height
    // so text appears centered in the card area below the accent bar
    const accentOffset = isSpecialRoot ? 0 : 3;

    const appendText = (attrs) => {
      const t = nodeGroup.append('text')
        .attr('y', currentY * scaleFactor + accentOffset)
        .attr('dominant-baseline', 'central')
        .attr('text-anchor', 'middle');
      Object.entries(attrs).forEach(([k, v]) => t.attr(k, v));
      return t;
    };

    // Main person name
    appendText({
      fill: isSpecialRoot ? '#78350f' : '#1c1917',
      'font-size': isSpecialRoot ? '28px' : '14px',
      'font-weight': 'bold',
      class: isSpecialRoot ? 'font-spectral' : '',
    }).text(person.name);

    if (hasAlias) {
      advance(NAME_H, SUB_H);
      appendText({
        fill: isSpecialRoot ? '#92400e' : '#6b7280',
        'font-size': isSpecialRoot ? '20px' : '11px',
        'font-style': 'italic',
        class: isSpecialRoot ? 'font-spectral' : '',
      }).text(`(${person.alias})`);
    }

    if (mainLifespan) {
      advance(prevH, SUB_H);
      const lifespanColor = person.isAlive ? '#16a34a' : '#78350f';
      appendText({
        fill: isSpecialRoot ? '#92400e' : lifespanColor,
        'font-size': isSpecialRoot ? '18px' : '11px',
      }).text(mainLifespan);
    }

    // Spouses
    personSpouses.forEach((s) => {
      const spouseLifespan = formatLifespan(s);
      const spouseColor = s.gender === 'female' ? '#be185d' : '#1e40af';

      // Divider line sits halfway through SP_DIV_GAP between prev row and spouse name
      const dividerY = (currentY + prevH / 2 + SP_DIV_GAP / 2) * scaleFactor + accentOffset;
      nodeGroup.append('line')
        .attr('x1', -finalNodeWidth * 0.4).attr('x2', finalNodeWidth * 0.4)
        .attr('y1', dividerY).attr('y2', dividerY)
        .attr('stroke', isSpecialRoot ? '#92400e' : spouseColor)
        .attr('stroke-width', 0.6)
        .attr('opacity', 0.35);

      // Advance using SP_DIV_GAP instead of default GAP
      advance(prevH, SP_NAME_H, SP_DIV_GAP);

      appendText({
        fill: isSpecialRoot ? '#92400e' : spouseColor,
        'font-size': isSpecialRoot ? '24px' : '13px',
        'font-weight': 'bold',
        class: isSpecialRoot ? 'font-spectral' : '',
      }).text(s.name);

      if (spouseLifespan) {
        advance(prevH, SP_SUB_H);
        const spouseLifespanColor = s.isAlive ? '#16a34a' : (s.gender === 'female' ? '#9d174d' : '#1e3a8a');
        appendText({
          fill: isSpecialRoot ? '#92400e' : spouseLifespanColor,
          'font-size': isSpecialRoot ? '16px' : '10px',
        }).text(spouseLifespan);
      }
    });

    // Shared address shown once at the bottom
    if (hasAddress) {
      advance(prevH, SUB_H);
      appendText({
        fill: isSpecialRoot ? '#92400e' : '#6b7280',
        'font-size': isSpecialRoot ? '18px' : '11px',
      }).text(`📍 ${sharedAddress}`);
    }
};
