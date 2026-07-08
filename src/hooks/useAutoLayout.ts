import dagre from '@dagrejs/dagre';
import { type Node, type Edge } from '@xyflow/react';

/**
 * Automatically layout whiteboard nodes using Dagre engine.
 * Supports Horizontal (LR) and Vertical (TB) layouts.
 */
export function getLayoutedElements(nodes: Node[], edges: Edge[], direction: 'TB' | 'LR' = 'LR') {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 260, height: 120 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 260 / 2,
        y: nodeWithPosition.y - 120 / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}
