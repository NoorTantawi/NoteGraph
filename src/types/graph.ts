/**
 * Knowledge graph types for NoteGraph.
 * Used by the graph indexer and the react-force-graph visualization.
 */

export interface GraphNode {
  /** File ID this node represents */
  id: string;
  /** Display name (file name without extension) */
  name: string;
  /** Node size — proportional to connection count */
  val: number;
  /** Tags extracted from the file */
  tags: string[];
  /** Node color — assigned by tag cluster or default */
  color?: string;
  /** Word count of the file */
  wordCount: number;
}

export interface GraphEdge {
  /** Source file ID */
  source: string;
  /** Target file ID */
  target: string;
  /** Label for the edge (optional) */
  label?: string;
}

export interface GraphData {
  /** All nodes in the graph */
  nodes: GraphNode[];
  /** All edges (links) in the graph */
  links: GraphEdge[];
}

/** Filter options for the graph view */
export interface GraphFilter {
  /** Only show nodes with these tags (empty = show all) */
  tags: string[];
  /** Minimum connection count to display */
  minConnections: number;
  /** Search query to highlight matching nodes */
  searchQuery: string;
}
