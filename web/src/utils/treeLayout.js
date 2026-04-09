import * as d3 from 'd3';
import { prepareTreeData } from './treeDataHelpers';
import { renderLinks } from './treeLinkRenderer';
import { renderNode } from './treeNodeRenderer';
import { setupZoom } from './treeZoomHandler';

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
  isFirstLoad,
  showFromGen15
}) => {
  if (!svgRef.current || !containerRef.current || data.length === 0) return;

  const svgElement = d3.select(svgRef.current);
  const width = containerRef.current.clientWidth;
  const height = containerRef.current.clientHeight || 600;

  // Clear previous content
  svgElement.selectAll('*').remove();

  // 1. Prepare Data
  const { descendants, links, spousesMap, virtualRootId } = prepareTreeData(data, collapsedIds, focusId, showFromGen15);

  const g = svgElement.append('g').attr('class', 'tree-viewport');

  // 2. Highlight logic
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

  // 3. Setup Zoom
  const zoom = setupZoom({ 
    svgElement, svgRef, g, onZoom, height, width, focusId, descendants, selectedNode, isFirstLoad, selectedId 
  });

  svgElement.on('click', () => onSelectPerson(null));

  // 4. Draw Links
  renderLinks({ g, links, selectedId, relatedIds, showFromGen15 });

  // 5. Draw Nodes
  const node = g.append('g')
    .selectAll('g')
    .data(descendants)
    .join('g')
    .attr('transform', d => `translate(${d.x},${d.y})`);

  node.each(function (d) {
    renderNode({
      gNode: d3.select(this),
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
    });
  });

  return { zoom, g, svgElement };
};
