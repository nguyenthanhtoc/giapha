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

  const nodeWidth = 160, nodeHeight = 50;
  const spouseWidth = 130, spouseHeight = 45, spouseOffset = 180;

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
      .attr('flood-color', '#000000').attr('flood-opacity', 0.3);

    nodeGroup.append('rect')
      .attr('x', -nodeWidth / 2).attr('y', -nodeHeight / 2)
      .attr('width', nodeWidth).attr('height', nodeHeight)
      .attr('rx', 2).attr('fill', '#fffbeb').attr('stroke', '#b45309').attr('stroke-width', 1.5)
      .attr('filter', `url(#${filterId})`);

    nodeGroup.append('text')
      .attr('dy', person.role ? -4 : 4).attr('text-anchor', 'middle')
      .attr('fill', '#1c1917').attr('font-size', '13px').attr('font-weight', 'bold')
      .text(person.name);

    if (person.role) {
      nodeGroup.append('text')
        .attr('dy', 14).attr('text-anchor', 'middle')
        .attr('fill', '#b91c1c').attr('font-size', '10px').attr('font-weight', '500')
        .text(person.role);
    }

    personSpouses.forEach((spouse, index) => {
      const spouseGroup = gNode.append('g')
        .attr('class', 'spouse-node')
        .attr('transform', `translate(${spouseOffset * (index + 1)}, 0)`)
        .on('click', (e) => { e.stopPropagation(); onSelectPerson(spouse); })
        .style('cursor', 'pointer');

      spouseGroup.append('line')
        .attr('x1', -spouseOffset + nodeWidth / 2).attr('y1', 0)
        .attr('x2', -spouseWidth / 2).attr('y2', 0)
        .attr('stroke', '#be9154').attr('stroke-width', 1.2).attr('stroke-dasharray', '3, 2');

      spouseGroup.append('rect')
        .attr('x', -spouseWidth / 2).attr('y', -spouseHeight / 2)
        .attr('width', spouseWidth).attr('height', spouseHeight)
        .attr('rx', 2).attr('fill', '#fffbeb').attr('stroke', '#b45309').attr('stroke-width', 1);

      spouseGroup.append('text')
        .attr('dy', 4).attr('text-anchor', 'middle')
        .attr('fill', '#1c1917').attr('font-size', '12px').attr('font-weight', '500')
        .text(spouse.name);
    });
  });

  if (isFirstLoad) {
    const transform = d3.zoomIdentity.translate(width / 2, 100).scale(0.8);
    svgElement.call(zoom.transform, transform);
  }

  return { zoom, g, svgElement };
};
