import { useMemo } from 'react';
import { useFileStore } from '../stores/fileStore';
import type { FileNode } from '../types/file';

export interface GraphNode {
  id: string;
  name: string;
  val: number; // For sizing
  isGhost?: boolean; // True if it's a link to a file that doesn't exist
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export function useGraphData(): GraphData {
  const files = useFileStore(s => s.files);

  return useMemo(() => {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    
    // Quick lookup for files by name to resolve links
    const filesByName = new Map<string, FileNode>();
    for (const file of Object.values(files)) {
      if (file.type === 'file') {
        filesByName.set(file.name.toLowerCase(), file);
        // Also map without extension
        const nameWithoutExt = file.name.replace(/\.md$/i, '').toLowerCase();
        filesByName.set(nameWithoutExt, file);
      }
    }

    const addedNodeIds = new Set<string>();

    const addNode = (id: string, name: string, isGhost: boolean = false) => {
      if (!addedNodeIds.has(id)) {
        addedNodeIds.add(id);
        nodes.push({ id, name, val: 1, isGhost });
      }
    };

    // Parse all files for links
    for (const file of Object.values(files)) {
      if (file.type !== 'file') continue;

      addNode(file.id, file.name);

      // Simple regex to find [[links]]
      const linkRegex = /\[\[(.*?)\]\]/g;
      let match;
      while ((match = linkRegex.exec(file.content)) !== null) {
        const linkTarget = match[1];
        if (!linkTarget) continue;

        const targetLower = linkTarget.toLowerCase();
        const targetFile = filesByName.get(targetLower);

        if (targetFile) {
          addNode(targetFile.id, targetFile.name);
          links.push({ source: file.id, target: targetFile.id });
        } else {
          // Ghost node (link to non-existent file)
          const ghostId = `ghost-${targetLower}`;
          addNode(ghostId, linkTarget, true);
          links.push({ source: file.id, target: ghostId });
        }
      }
    }

    // Calculate node sizes based on degree (number of connections)
    for (const node of nodes) {
      const degree = links.filter(l => l.source === node.id || l.target === node.id).length;
      node.val = Math.max(1, Math.min(10, 1 + degree * 0.5));
    }

    return { nodes, links };
  }, [files]);
}
