import * as d3 from 'd3';

export const prepareTreeData = (data, collapsedIds, focusId, showFromGen15) => {
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

  const treeLayout = d3.tree().nodeSize([200, 192]); 
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

  let descendants = root.descendants().filter(d => d.id !== virtualRootId);
  let links = root.links().filter(l => l.source.id !== virtualRootId);

  // Add generation info and pre-calculate heights
  descendants.forEach(d => {
    // Height calculation
    const person = d.data;
    const personSpouses = spousesMap[person.id] || [];
    const hasAlias = person.alias && person.alias.trim() !== '';
    const totalSpouses = personSpouses.length;
    const rowHeight = 14, spacing = 4;
    const totalRows = 1 + (hasAlias ? 1 : 0) + totalSpouses;
    const textContentHeight = totalRows * rowHeight + (totalRows - 1) * spacing;
    const verticalPadding = 25;
    d.dynamicNodeHeight = Math.max(65, textContentHeight + verticalPadding);

    // Generation info
    if (d.depth > 0) {
      const genIndex = d.depth - 1;
      const genLabel = generationLabels[genIndex] || `Thế Hệ ${d.depth + 10}`;
      d.data.generation = genLabel;
      
      personSpouses.forEach(s => {
        s.generation = genLabel;
      });
    }
  });

  if (showFromGen15) {
    const minDepth = 5;
    descendants = descendants.filter(d => d.depth >= minDepth);
    links = links.filter(l => l.target.depth >= minDepth);
    
    const offsetY = minDepth * 200 - 100;
    descendants.forEach(d => {
      d.y -= offsetY;
    });
  }

  return { root, descendants, links, spousesMap, virtualRootId };
};
