import { useEffect, useRef, useState } from 'react';
import ForceGraph2D, { type ForceGraphMethods } from 'react-force-graph-2d';
import { useGraphData, type GraphNode } from '../../hooks/useGraphData';
import { useEditorStore } from '../../stores/editorStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useTheme } from '../../hooks/useTheme';
import { X, Maximize, ZoomIn, ZoomOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ErrorBoundary } from '../ui/ErrorBoundary';

export function GraphView() {
  const { graphViewOpen, toggleGraphView, openFile } = useEditorStore();
  const { resolvedTheme } = useTheme();
  const graphData = useGraphData();
  const fgRef = useRef<any>(null);
  
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!graphViewOpen) return;
    
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [graphViewOpen]);

  // Handle node click
  const handleNodeClick = (node: any) => {
    const graphNode = node as GraphNode;
    if (!graphNode.isGhost) {
      openFile(graphNode.id);
      toggleGraphView();
    }
  };

  const isDark = resolvedTheme === 'dark';
  const bgColor = isDark ? '#0f111a' : '#f8f9fc'; // matches --bg-primary
  const nodeColor = isDark ? '#8b5cf6' : '#6d28d9'; // matches --accent
  const ghostNodeColor = isDark ? '#4b5563' : '#9ca3af';
  const linkColor = isDark ? '#374151' : '#d1d5db'; // matches --border
  const textColor = isDark ? '#e5e7eb' : '#1f2937'; // matches --text-primary

  return (
    <AnimatePresence>
      {graphViewOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex flex-col bg-[var(--bg-primary)]"
          ref={containerRef}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)] shrink-0 bg-[var(--bg-secondary)] shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Knowledge Graph</h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => fgRef.current?.zoomToFit(400)}
                className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-colors"
                title="Zoom to Fit"
              >
                <Maximize size={18} />
              </button>
              <button 
                onClick={toggleGraphView}
                className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-colors"
                title="Close Graph"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Graph Area */}
          <div className="flex-1 relative overflow-hidden bg-[var(--bg-primary)]">
            {dimensions.width > 0 && dimensions.height > 0 && (
              <ErrorBoundary name="Graph Renderer">
                <ForceGraph2D
                  ref={fgRef}
                  width={dimensions.width}
                  height={dimensions.height}
                  graphData={graphData}
                  nodeLabel="name"
                  nodeColor={n => (n as GraphNode).isGhost ? ghostNodeColor : nodeColor}
                  linkColor={() => linkColor}
                  backgroundColor={bgColor}
                  onNodeClick={handleNodeClick}
                  nodeCanvasObject={(node: any, ctx, globalScale) => {
                    const label = node.name as string;
                    const fontSize = 12 / globalScale;
                    ctx.font = `${fontSize}px Inter, Sans-Serif`;
                    const textWidth = ctx.measureText(label).width;
                    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); 
          
                    ctx.fillStyle = bgColor;
                    ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);
          
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = node.isGhost ? ghostNodeColor : textColor;
                    ctx.fillText(label, node.x, node.y);
          
                    node.__bckgDimensions = bckgDimensions; 
                  }}
                  nodePointerAreaPaint={(node: any, color, ctx) => {
                    ctx.fillStyle = color;
                    const bckgDimensions = node.__bckgDimensions;
                    if (bckgDimensions) {
                      ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);
                    }
                  }}
                />
              </ErrorBoundary>
            )}
            
            {/* Graph Stats Overlay */}
            <div className="absolute bottom-4 left-4 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] shadow-lg text-xs text-[var(--text-secondary)] flex flex-col gap-1 pointer-events-none glass-surface">
              <div className="flex justify-between gap-4">
                <span>Notes:</span>
                <span className="text-[var(--text-primary)] font-medium">{graphData.nodes.filter(n => !n.isGhost).length}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Unresolved Links:</span>
                <span className="text-[var(--text-primary)] font-medium">{graphData.nodes.filter(n => n.isGhost).length}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Connections:</span>
                <span className="text-[var(--text-primary)] font-medium">{graphData.links.length}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
