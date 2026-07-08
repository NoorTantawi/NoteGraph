import { useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useFileStore } from '../../stores/fileStore';
import { useEditorStore } from '../../stores/editorStore';
import { X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { FileNodeWidget } from './FileNodeWidget';

const nodeTypes = {
  fileNode: FileNodeWidget,
};

export function GraphView() {
  const { graphViewOpen, toggleGraphView } = useEditorStore();
  const files = useFileStore((s) => s.files);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Synchronize files from fileStore to React Flow nodes/edges state
  useEffect(() => {
    if (!graphViewOpen) return;

    // Create lookup for files by name/path to resolve wikilinks
    const filesByName = new Map<string, any>();
    for (const file of Object.values(files)) {
      if (file.type === 'file') {
        filesByName.set(file.name.toLowerCase(), file);
        const nameWithoutExt = file.name.replace(/\.md$/i, '').toLowerCase();
        filesByName.set(nameWithoutExt, file);
      }
    }

    // Capture current nodes coordinates to preserve user dragging positions
    const positionMap = new Map<string, { x: number; y: number }>();
    for (const node of nodes) {
      positionMap.set(node.id, node.position);
    }

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // Map files to React Flow Nodes
    let index = 0;
    for (const file of Object.values(files)) {
      if (file.type !== 'file') continue;

      // Check if we already have a position for this node. If not, generate staggered spiral coordinates.
      let position = positionMap.get(file.id);
      if (!position) {
        const angle = index * 0.5;
        const radius = 120 + index * 50;
        position = {
          x: 350 + Math.cos(angle) * radius,
          y: 250 + Math.sin(angle) * radius,
        };
      }

      newNodes.push({
        id: file.id,
        type: 'fileNode',
        position,
        data: {
          label: file.name,
          content: file.content || '',
        },
      });

      // Parse wikilinks inside the file to create edges
      const linkRegex = /\[\[(.*?)\]\]/g;
      let match;
      while ((match = linkRegex.exec(file.content || '')) !== null) {
        const linkTarget = match[1];
        if (!linkTarget) continue;

        const targetLower = linkTarget.toLowerCase();
        const targetFile = filesByName.get(targetLower);

        if (targetFile) {
          const edgeId = `edge-${file.id}-${targetFile.id}`;
          newEdges.push({
            id: edgeId,
            source: file.id,
            target: targetFile.id,
            animated: true,
            style: { stroke: 'var(--accent)', strokeWidth: 1.5 },
          });
        }
      }

      index++;
    }

    setNodes(newNodes);
    setEdges(newEdges);
  }, [files, graphViewOpen, setNodes, setEdges]);

  // Recenter / Rearrange nodes in a clean spiral layout manually if requested
  const handleRearrange = () => {
    const rearrangedNodes = nodes.map((node, index) => {
      const angle = index * 0.5;
      const radius = 120 + index * 50;
      return {
        ...node,
        position: {
          x: 350 + Math.cos(angle) * radius,
          y: 250 + Math.sin(angle) * radius,
        },
      };
    });
    setNodes(rearrangedNodes);
  };

  return (
    <AnimatePresence>
      {graphViewOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="w-full h-full flex flex-col bg-[var(--bg-primary)] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)] shrink-0 bg-[var(--bg-secondary)] shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Spatial Whiteboard</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRearrange}
                className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                title="Reset layout"
              >
                <RefreshCw size={18} />
              </button>
              <button 
                onClick={toggleGraphView}
                className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                title="Close Canvas"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 relative overflow-hidden bg-[var(--bg-primary)]">
            <ErrorBoundary name="Spatial Whiteboard Canvas">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                className="bg-[var(--bg-primary)]"
              >
                <Background color="var(--border)" gap={20} size={1} />
                <Controls className="!bg-[var(--bg-secondary)] !border-[var(--border)] !text-[var(--text-primary)] fill-[var(--text-primary)] !shadow-lg" />
                <MiniMap
                  className="!bg-[var(--bg-secondary)] !border-[var(--border)] !rounded-lg !shadow-lg"
                  nodeColor="var(--accent-muted)"
                  maskColor="rgba(0, 0, 0, 0.3)"
                />
              </ReactFlow>
            </ErrorBoundary>
            
            {/* Whiteboard Stats Overlay */}
            <div className="absolute bottom-4 left-4 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] shadow-lg text-xs text-[var(--text-secondary)] flex flex-col gap-1 pointer-events-none glass-surface z-10">
              <div className="flex justify-between gap-4">
                <span>Notes:</span>
                <span className="text-[var(--text-primary)] font-medium">
                  {nodes.length}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Connections:</span>
                <span className="text-[var(--text-primary)] font-medium">
                  {edges.length}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
