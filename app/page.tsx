'use client';

import { useState, useCallback } from 'react';
import { ReactFlowProvider } from 'reactflow';
import JsonInput from './components/JsonInput';
import dynamic from 'next/dynamic';
import SearchBar from './components/SearchBar';
import ControlPanel from './components/ControlPanel';
import 'reactflow/dist/style.css';
import { useTheme } from './hooks/useTheme';

const TreeVisualizer = dynamic(() => import('./components/TreeVisualizer'), {
  ssr: false,
});

export default function Home() {
  const [jsonData, setJsonData] = useState<any>(null);
  const [jsonInput, setJsonInput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();

  const sampleJson = `{
  "user": {
    "id": 1,
    "name": "Gaurav Kamble",
    "isActive": true,
    "address": {
      "city": "Nagpur",
      "country": "India"
    },
    "items": [
      { "name": "item1", "value": 100 },
      { "name": "item2", "value": 200 }
    ]
  }
}`;

  const handleVisualize = useCallback(() => {
    try {
      if (!jsonInput.trim()) {
        setError('Please enter JSON data');
        return;
      }
      const parsed = JSON.parse(jsonInput);
      setJsonData(parsed);
      setError('');
      setHighlightedNode(null);
    } catch (err) {
      setError(`Invalid JSON: ${(err as Error).message}`);
      setJsonData(null);
    }
  }, [jsonInput]);

  const handleSearch = useCallback((term: string) => setSearchTerm(term), []);
  const handleClear = useCallback(() => {
    setJsonInput('');
    setJsonData(null);
    setError('');
    setSearchTerm('');
    setHighlightedNode(null);
  }, []);
  const loadSampleData = useCallback(() => {
    setJsonInput(sampleJson);
    setError('');
  }, [sampleJson]);
  const handleNodeHighlight = useCallback((nodeId: string | null) => setHighlightedNode(nodeId), []);

  return (
    <ReactFlowProvider>
      <div className={`min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-gradient-to-b from-slate-100 to-slate-200 text-slate-900'}`}>
        <header className={`shadow-lg transition-all duration-500 ${theme === 'dark' ? 'bg-slate-800' : 'bg-gradient-to-r from-emerald-600 to-teal-600'}`}>
          <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
            <h1 className="text-2xl font-bold flex items-center gap-2 text-emerald-100 ">
              JSON Tree Visualizer
            </h1>

            <div className="flex items-center gap-4">
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-emerald-100'}`}>
                Visualize & Explore JSON Structures
              </p>
              <button
                onClick={toggleTheme}
                className={`
                  relative inline-flex h-8 w-14 items-center rounded-full 
                  transition-all  ease-in-out
                  focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
                  ${theme === 'dark'
                    ? 'bg-slate-700 hover:bg-slate-600'
                    : 'bg-emerald-200 hover:bg-emerald-300'
                  }
                `}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                <span className="sr-only">Toggle theme</span>

                <span
                  className={`
                    inline-block h-6 w-6 transform rounded-full bg-white shadow-lg
                    transition-all duration-300 ease-in-out
                    flex items-center justify-center
                    ${theme === 'dark'
                      ? 'translate-x-7 bg-yellow-100'
                      : 'translate-x-1 bg-white'
                    }
                  `}
                >
                </span>
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <JsonInput
              value={jsonInput}
              onChange={setJsonInput}
              onVisualize={handleVisualize}
              onClear={handleClear}
              onLoadSample={loadSampleData}
              error={error}
            />
            <ControlPanel />
          </div>

          <div className="space-y-6">
            <SearchBar onSearch={handleSearch} />
            <div className="backdrop-blur-md bg-white/70 border border-emerald-200 rounded-xl shadow-xl overflow-hidden h-[500px] transition hover:shadow-2xl">
              {jsonData ? (
                <TreeVisualizer
                  data={jsonData}
                  searchTerm={searchTerm}
                  highlightedNode={highlightedNode}
                  onNodeHighlight={handleNodeHighlight}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <div className="text-6xl mb-3">🌐</div>
                  <p className="text-sm">Paste your JSON and click “Visualize”</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ReactFlowProvider>
  );
}
