import * as d3 from 'd3';

export const renderLinks = ({ g, links, selectedId, relatedIds, showFromGen15 }) => {
  const linkGenerator = d => {
    const xSource = d.source.x, ySource = d.source.y;
    const xTarget = d.target.x, yTarget = d.target.y;
    const sourcePerson = d.source.data;
    const isSourceRoot = d.source.depth === 1;
    const isSourceSpecial = sourcePerson.name === 'Nguyễn Thanh Dung' || isSourceRoot;
    const sourceHeight = d.source.dynamicNodeHeight || 65;
    const targetHeight = d.target.dynamicNodeHeight || 65;
    const sourceOffset = (sourceHeight * (isSourceSpecial ? 1.75 : 1.0)) / 2;
    const targetOffset = targetHeight / 2;

    const startY = ySource + sourceOffset;
    const endY = yTarget - targetOffset;

    if (showFromGen15 && d.source.depth < 5) {
      // Source node was filtered out (not shifted), so use target's x and
      // a fixed entry point just above the target node instead.
      const trunkY = endY - 40;
      return `M${xTarget},${trunkY} V${endY}`;
    }

    const midY = (startY + endY) / 2;
    return `M${xSource},${startY} V${midY} H${xTarget} V${endY}`;
  };

  return g.append('g')
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
};
