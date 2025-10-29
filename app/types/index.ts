export interface JsonNode {
  id: string;
  type: 'object' | 'array' | 'primitive';
  label: string;
  value: any;
  path: string;
  isHighlighted?: boolean;
}

export interface FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: JsonNode;
  style: React.CSSProperties;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  type: string;
}

export interface FlowElements {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface SearchResult {
  nodeId: string;
  path: string;
  value: any;
}