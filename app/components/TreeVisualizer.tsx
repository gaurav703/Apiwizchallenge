'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { convertJsonToFlowElements } from '../utils/jsonToFlow';
import type { FlowElements } from '../types';
import { useTheme } from '../hooks/useTheme';
import { toPng } from 'html-to-image';

interface TreeVisualizerProps {
  data: any;
  searchTerm: string;
  highlightedNode: string | null;
  onNodeHighlight: (nodeId: string | null) => void;
}

function InnerFlow({
  data,
  searchTerm,
  highlightedNode,
  onNodeHighlight,
}: TreeVisualizerProps) {
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  const { fitView, getNodes } = useReactFlow();
  const flowRef = useRef<HTMLDivElement>(null);
  const [hideUI, setHideUI] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { getViewport, setViewport } = useReactFlow();

  const { theme } = useTheme();

  const flowElements: FlowElements = useMemo(() => convertJsonToFlowElements(data), [data]);

  useEffect(() => {
    setNodes(flowElements.nodes as any);
    setEdges(flowElements.edges as any);
    requestAnimationFrame(() => {
      try {
        fitView({ duration: 600, padding: 0.2 });
      } catch { }
    });
    onNodeHighlight(null);
  }, [flowElements, setNodes, setEdges, fitView, onNodeHighlight]);

  useEffect(() => {
    if (!searchTerm?.trim()) {
      setNodes((nds: any) =>
        nds.map((n: any) => ({
          ...n,
          style: { ...(n.style || {}), boxShadow: 'none', borderColor: n.style?.borderColor },
        })),
      );
      onNodeHighlight(null);
      return;
    }

    const normalizedSearch = searchTerm.replace(/^\$\./, '').toLowerCase();
    const match = flowElements.nodes.find((n) => {
      const path = n.data.path?.toLowerCase() ?? '';
      const label = n.data.label?.toLowerCase() ?? '';
      return path.includes(normalizedSearch) || label.includes(normalizedSearch);
    });

    if (match) {
      const id = match.id;
      onNodeHighlight(id);
      setNodes((nds: any) =>
        nds.map((n: any) => ({
          ...n,
          style: {
            ...(n.style || {}),
            boxShadow: n.id === id ? '0 0 0 6px rgba(16, 185, 129, 0.3)' : 'none',
            borderColor: n.id === id ? '#10b981' : n.style?.borderColor,
          },
        })),
      );
      setTimeout(() => {
        const target = getNodes().find((n) => n.id === id);
        if (target) fitView({ nodes: [target], duration: 600, padding: 0.25 });
      }, 100);
    } else {
      setNodes((nds: any) =>
        nds.map((n: any) => ({
          ...n,
          style: { ...(n.style || {}), boxShadow: '0 0 0 4px rgba(239, 68, 68, 0.3)' },
        })),
      );
      setTimeout(() => {
        setNodes((nds: any) =>
          nds.map((n: any) => ({
            ...n,
            style: { ...(n.style || {}), boxShadow: 'none' },
          })),
        );
      }, 1000);
    }
  }, [searchTerm, flowElements, setNodes, getNodes, fitView, onNodeHighlight]);

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes],
  );
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges],
  );

const handleExportPNG = useCallback(async () => {
  if (!flowRef.current || exporting) return;
  setExporting(true);
  try {
    const currentViewport = getViewport();

    await new Promise((r) => setTimeout(r, 100));
    fitView({ duration: 200, padding: 0.2 });

    await new Promise((r) => setTimeout(r, 300));

    setHideUI(true);

    const dataUrl = await toPng(flowRef.current, {
      cacheBust: true,
      pixelRatio: 3.5,
      backgroundColor: theme === 'dark' ? '#0f172a' : '#f9fafb',
      style: {
        transform: 'none', 
        width: `${flowRef.current.scrollWidth}px`,
        height: `${flowRef.current.scrollHeight}px`,
        padding: '20px',
      },
    });

    // 5️⃣ Trigger download
    const link = document.createElement('a');
    link.download = `json-tree-${new Date().toISOString().split('T')[0]}.png`;
    link.href = dataUrl;
    link.click();

    // 6️⃣ Restore previous zoom/pan
    setViewport(currentViewport);
  } catch (err) {
    console.error('PNG Export failed:', err);
    alert('Failed to export PNG.');
  } finally {
    setHideUI(false);
    setExporting(false);
  }
}, [theme, exporting, getViewport, fitView, setViewport]);

  return (
    <div className="relative w-full h-[640px] bg-gradient-to-br from-white/80 to-slate-50 dark:from-slate-900 dark:to-slate-800 backdrop-blur-md rounded-xl shadow-lg border border-emerald-200 dark:border-slate-700 transition">
      <button
        onClick={handleExportPNG}
        disabled={exporting}
        className={`absolute top-3 left-3 z-10 px-3 py-1 text-sm rounded-md shadow-md transition-all ${exporting
            ? 'bg-gray-400 cursor-not-allowed text-gray-100'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
      >
        {exporting ? 'Exporting...' : 'Export PNG'}
      </button>

      <div ref={flowRef} className="w-full h-full">
        <ReactFlow
          nodes={nodes as any}
          edges={edges as any}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          fitView
          minZoom={0.2}
          maxZoom={1.8}
          attributionPosition="bottom-left"
          className="w-full h-full"
        >
          {!hideUI && <Controls showInteractive={false} position="top-right" />}
          <Background gap={20} size={1} color={theme === 'dark' ? '#334155' : '#a7f3d0'} />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function TreeVisualizer(props: TreeVisualizerProps) {
  return (
    <ReactFlowProvider>
      <InnerFlow {...props} />
    </ReactFlowProvider>
  );
}
