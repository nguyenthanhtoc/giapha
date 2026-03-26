import * as d3 from 'd3';

export const drawFamilyTree = ({ 
  svgRef, 
  containerRef, 
  data, 
  onSelectPerson, 
  isFirstLoad 
}) => {
  if (!svgRef.current || !containerRef.current || data.length === 0) return;

  const svgElement = d3.select(svgRef.current);
  svgElement.selectAll('*').remove();

  const width = containerRef.current.clientWidth;
  const height = containerRef.current.clientHeight || 600;

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

  const root = stratify(dataWithVirtualRoot);
  const treeLayout = d3.tree().nodeSize([180, 160]);
  treeLayout(root);

  const links = root.links().filter(l => l.source.id !== virtualRootId);
  const descendants = root.descendants().filter(d => d.id !== virtualRootId);

  const g = svgElement.append('g').attr('class', 'tree-viewport');

  const zoom = d3.zoom()
    .scaleExtent([0.1, 5])
    .on('zoom', (event) => {
      g.attr('transform', event.transform);
    });

  svgElement.call(zoom);
  
  // Deselect on background click
  svgElement.on('click', () => onSelectPerson(null));

  const linkGenerator = d => {
    const xSource = d.source.x, ySource = d.source.y;
    const xTarget = d.target.x, yTarget = d.target.y;
    return `M${xSource},${ySource} V${(ySource + yTarget) / 2} H${xTarget} V${yTarget}`;
  };

  g.append('g')
    .attr('fill', 'none')
    .attr('stroke', '#a16207')
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

  const nodeWidth = 160, nodeHeight = 65;

  node.each(function (d) {
    const gNode = d3.select(this);
    const person = d.data;
    const personSpouses = spousesMap[person.id] || [];

    const nodeGroup = gNode.append('g')
      .attr('class', 'person-node')
      .on('click', (event) => {
        event.stopPropagation();
        onSelectPerson(person);
      })
      .style('cursor', 'pointer');

    const filterId = `shadow-${person.id}`;
    svgElement.append('defs').append('filter').attr('id', filterId)
      .append('feDropShadow').attr('dx', 0).attr('dy', 4).attr('stdDeviation', 4)
      .attr('flood-color', '#000000').attr('flood-opacity', 0.2);

    nodeGroup.append('rect')
      .attr('x', -nodeWidth / 2).attr('y', -nodeHeight / 2)
      .attr('width', nodeWidth).attr('height', nodeHeight)
      .attr('rx', 3).attr('fill', person.gender === 'male' ? '#fffbeb' : '#fdf2f8')
      .attr('stroke', person.gender === 'male' ? '#b45309' : '#be185d').attr('stroke-width', 1.5)
      .attr('filter', `url(#${filterId})`);

    // Main person name
    nodeGroup.append('text')
      .attr('dy', personSpouses.length > 0 ? -8 : 5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#1c1917').attr('font-size', '14px').attr('font-weight', 'bold')
      .text(person.name);

    // Spouse names inside the node
    if (personSpouses.length > 0) {
      const spouseLabel = personSpouses[0].gender === 'female' ? 'Vợ' : 'Chồng';
      const spouseNames = personSpouses.map(s => s.name).join(', ');
      nodeGroup.append('text')
        .attr('dy', 14)
        .attr('text-anchor', 'middle')
        .attr('fill', '#4b5563').attr('font-size', '11px').attr('font-weight', '500')
        .text(`(${spouseLabel}: ${spouseNames})`);
    }
  });

  if (isFirstLoad) {
    const transform = d3.zoomIdentity.translate(width / 2, 100).scale(0.8);
    svgElement.call(zoom.transform, transform);
  }

  return { zoom, g, svgElement };
};
