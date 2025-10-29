import type { FlowElements, JsonNode } from '../types';

let nodeCounter = 0;
const genId = () => `node_${++nodeCounter}`;

const NODE_W = 160;
const NODE_H = 46;
const H_SPACING = 18;
const V_SPACING = 86; 

type TreeNode = {
  id: string;
  type: 'object' | 'array' | 'primitive';
  label: string;
  value: any;
  path: string;
  children: TreeNode[];
};

function buildTree(data: any, path = '$', key = 'root'): TreeNode {
  const id = genId();

  if (data !== null && typeof data === 'object') {
    const isArr = Array.isArray(data);
    const type = isArr ? 'array' : 'object';
    const displayKey = path === '$' ? 'root' : key;
    const label = isArr ? `${displayKey} [${data.length}]` : `${displayKey} {}`;

    const node: TreeNode = { id, type, label, value: data, path, children: [] };

    if (isArr) {
      for (let i = 0; i < data.length; i++) {
        node.children.push(buildTree(data[i], `${path}[${i}]`, `[${i}]`));
      }
    } else {
      Object.keys(data).forEach((childKey) => {
        node.children.push(buildTree(data[childKey], `${path}.${childKey}`, childKey));
      });
    }
    return node;
  } else {
    const displayKey = path === '$' ? 'root' : key;
    const parentNode: TreeNode = {
      id,
      type: 'primitive',
      label: displayKey,
      value: null,
      path,
      children: [
        {
          id: genId(),
          type: 'primitive',
          label: typeof data === 'string' ? `"${data}"` : String(data),
          value: data,
          path: `${path}.value`,
          children: [],
        },
      ],
    };
    return parentNode;
  }
}



type LayoutNode = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  children: LayoutNode[];
};

function calculateLayout(node: TreeNode, x = 0, y = 0): { layout: LayoutNode; totalWidth: number } {
  if (!node.children || node.children.length === 0) {
    const layout: LayoutNode = { id: node.id, x, y, width: NODE_W, height: NODE_H, children: [] };
    return { layout, totalWidth: NODE_W };
  }

  let currentX = x;
  const childLayouts = node.children.map((child) => {
    const { layout: childLayout, totalWidth } = calculateLayout(child, currentX, y + V_SPACING);
    currentX += totalWidth + H_SPACING;
    return { childLayout, totalWidth };
  });

  const totalWidth = childLayouts.reduce((s, c) => s + c.totalWidth, 0) + H_SPACING * (childLayouts.length - 1);

  const firstChildX = childLayouts[0].childLayout.x;
  const lastChildX = childLayouts[childLayouts.length - 1].childLayout.x;
  const parentX = firstChildX + (lastChildX - firstChildX) / 2;

  const layoutNode: LayoutNode = {
    id: node.id,
    x: parentX,
    y,
    width: NODE_W,
    height: NODE_H,
    children: childLayouts.map((c) => c.childLayout),
  };

  return { layout: layoutNode, totalWidth: Math.max(NODE_W, totalWidth) };
}

function layoutToFlow(layout: LayoutNode, tree: TreeNode) {
  const nodes: any[] = [];
  const edges: any[] = [];

  function add(layoutNode: LayoutNode, treeNode: TreeNode) {
    const style =
      treeNode.type === 'object'
        ? {
            background: '#6366f1',
            color: '#fff',
            border: '2px solid #4f46e5',
            borderRadius: 8,
            padding: 8,
          }
        : treeNode.type === 'array'
        ? {
            background: '#10b981',
            color: '#fff',
            border: '2px solid #059669',
            borderRadius: 8,
            padding: 8,
          }
        : {
            background: '#f59e0b',
            color: '#fff',
            border: '2px solid #d97706',
            borderRadius: 6,
            padding: 6,
          };

    nodes.push({
      id: treeNode.id,
      type: 'default',
      position: { x: Math.round(layoutNode.x), y: Math.round(layoutNode.y) },
      data: {
        label: treeNode.label,
        type: treeNode.type,
        value: treeNode.value,
        path: treeNode.path,
        isHighlighted: false,
      },
      style,
      draggable: false,
    });

    for (let i = 0; i < layoutNode.children.length; i++) {
      const childLayout = layoutNode.children[i];
      const childTree = treeNode.children[i];
      edges.push({
        id: `e_${treeNode.id}_${childTree.id}`,
        source: treeNode.id,
        target: childTree.id,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#9ca3af', strokeWidth: 1.6 },
      });
      add(childLayout, childTree);
    }
  }

  add(layout, tree);
  return { nodes, edges };
}

export const convertJsonToFlowElements = (data: any): FlowElements => {
  nodeCounter = 0; 
  const tree = buildTree(data);

  const { layout } = calculateLayout(tree, 0, 30);

  const { nodes, edges } = layoutToFlow(layout, tree);

  const minX = nodes.reduce((m, n) => Math.min(m, n.position.x), Infinity);
  if (minX < 12) {
    const shift = 12 - minX;
    nodes.forEach((n) => (n.position.x = Math.round(n.position.x + shift)));
  }

  return { nodes, edges };
};
