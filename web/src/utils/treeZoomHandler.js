import * as d3 from 'd3';

export const setupZoom = ({ svgElement, svgRef, g, onZoom, height, width, focusId, descendants, selectedNode, isFirstLoad, selectedId }) => {
  const zoom = d3.zoom()
    .scaleExtent([0.1, 5])
    .on('zoom', (event) => {
      g.attr('transform', event.transform);
      if (onZoom) onZoom(event.transform.k);
    });

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
          targetY = height / 3;
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
    svgElement.call(zoom.transform, currentTransform);
    g.attr('transform', currentTransform);
  }

  svgRef.current.__lastFocusId = focusId;
  svgRef.current.__lastSelectedId = selectedId;
  svgElement.call(zoom);

  return zoom;
};
