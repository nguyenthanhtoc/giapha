import * as d3 from 'd3';

export const renderLinks = ({ g, links, selectedId, relatedIds, showFromGen15 }) => {
  // Group children by parent so we can draw a shared trunk per parent
  const childrenByParent = new Map();
  links.forEach(d => {
    const pid = d.source.id;
    if (!childrenByParent.has(pid)) childrenByParent.set(pid, []);
    childrenByParent.get(pid).push(d);
  });

  const isSpecialNode = (node) => {
    const isRootNode = node.depth === 1;
    return node.data.name === 'Nguyễn Thanh Dung' || isRootNode;
  };

  const getBottomY = (node) => {
    const h = node.dynamicNodeHeight || 65;
    const scale = isSpecialNode(node) ? 1.75 : 1.0;
    return node.y + (h * scale) / 2;
  };

  const getTopY = (node) => {
    const h = node.dynamicNodeHeight || 65;
    return node.y - h / 2;
  };

  const isRelatedLink = (d) =>
    selectedId && relatedIds.has(d.source.id) && relatedIds.has(d.target.id);

  // Trunk/rail is highlighted if the parent is related AND at least one child in the group is related
  const isGroupRelated = (groupLinks) =>
    selectedId &&
    relatedIds.has(groupLinks[0].source.id) &&
    groupLinks.some(d => relatedIds.has(d.target.id));

  const getStroke = (d) => {
    if (!selectedId) return '#a16207';
    return isRelatedLink(d) ? '#92400e' : '#d1d5db';
  };
  const getGroupStroke = (groupLinks) => {
    if (!selectedId) return '#a16207';
    return isGroupRelated(groupLinks) ? '#92400e' : '#d1d5db';
  };
  const getOpacity = (d) => {
    if (!selectedId) return 0.5;
    return isRelatedLink(d) ? 0.9 : 0.2;
  };
  const getGroupOpacity = (groupLinks) => {
    if (!selectedId) return 0.5;
    return isGroupRelated(groupLinks) ? 0.9 : 0.2;
  };
  const getWidth = (d) => {
    if (!selectedId) return 1.5;
    return isRelatedLink(d) ? 3 : 1;
  };
  const getGroupWidth = (groupLinks) => {
    if (!selectedId) return 1.5;
    return isGroupRelated(groupLinks) ? 3 : 1;
  };

  const pathSegments = [];

  childrenByParent.forEach((groupLinks) => {
    const source = groupLinks[0].source;
    const targets = groupLinks.map(d => d.target);
    const minX = Math.min(...targets.map(t => t.x));
    const maxX = Math.max(...targets.map(t => t.x));
    const minChildTopY = Math.min(...targets.map(t => getTopY(t)));

    if (showFromGen15 && source.depth < 5) {
      // Parent node is hidden (filtered out). Still draw the sibling rail so
      // children of the same parent are visually grouped, but don't draw a
      // trunk up to the (invisible) parent.
      // Rail sits a fixed distance above the children.
      const STUB_H = 28;
      const railY = minChildTopY - STUB_H;

      // Horizontal rail spanning all siblings (only if more than one)
      if (targets.length > 1) {
        pathSegments.push({ d: `M${minX},${railY} H${maxX}`, link: groupLinks[0], groupLinks });
      }

      // Branch from rail down to each child top
      groupLinks.forEach(d => {
        const endY = getTopY(d.target);
        pathSegments.push({ d: `M${d.target.x},${railY} V${endY}`, link: d });
      });
      return;
    }

    const startY = getBottomY(source);
    const sourceX = source.x;

    // Trunk drops from parent bottom to a horizontal rail midway between
    // the parent bottom and the topmost child top
    const railY = startY + (minChildTopY - startY) * 0.55;

    // Draw trunk: parent bottom → rail (highlight based on group)
    pathSegments.push({ d: `M${sourceX},${startY} V${railY}`, link: groupLinks[0], groupLinks });

    // Draw horizontal rail spanning all children (only if more than one child)
    if (targets.length > 1) {
      pathSegments.push({ d: `M${minX},${railY} H${maxX}`, link: groupLinks[0], groupLinks });
    }

    // Draw branch from rail down to each child top
    groupLinks.forEach(d => {
      const endY = getTopY(d.target);
      pathSegments.push({ d: `M${d.target.x},${railY} V${endY}`, link: d });
    });
  });

  const linkGroup = g.append('g').attr('fill', 'none');

  linkGroup.selectAll('path')
    .data(pathSegments)
    .join('path')
    .attr('d', seg => seg.d)
    .attr('stroke', seg => seg.groupLinks ? getGroupStroke(seg.groupLinks) : getStroke(seg.link))
    .attr('stroke-opacity', seg => seg.groupLinks ? getGroupOpacity(seg.groupLinks) : getOpacity(seg.link))
    .attr('stroke-width', seg => seg.groupLinks ? getGroupWidth(seg.groupLinks) : getWidth(seg.link))
    .attr('stroke-linejoin', 'round');

  return linkGroup;
};
