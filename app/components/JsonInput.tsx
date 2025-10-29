'use client';

interface JsonInputProps {
  value: string;
  onChange: (value: string) => void;
  onVisualize: () => void;
  onClear: () => void;
  onLoadSample: () => void;
  error: string;
}

export default function JsonInput({
  value,
  onChange,
  onVisualize,
  onClear,
  onLoadSample,
  error,
}: JsonInputProps) {
  return (
    <div className="rounded-xl backdrop-blur-md bg-white/70 dark:bg-slate-800/60 border border-emerald-200 dark:border-slate-700 shadow-lg p-6 transition hover:shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-emerald-700 flex items-center gap-2">
          🧾 JSON Input
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={onLoadSample}
            className="px-3 py-1.5 text-sm font-medium text-emerald-700 border border-emerald-300 rounded-md hover:bg-emerald-50 transition"
          >
            Load Sample
          </button>
          <button
            onClick={onClear}
            className="px-3 py-1.5 text-sm font-medium text-red-700 border border-red-300 rounded-md hover:bg-red-50 transition"
          >
            Clear
          </button>
        </div>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste your JSON data here..."
        className="w-full h-64 font-mono text-sm border border-slate-300 dark:border-slate-600 rounded-lg p-4 focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-white/70 dark:bg-slate-900/40 text-slate-900 dark:text-gray-200"
        spellCheck="false"
      />

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        onClick={onVisualize}
        disabled={!value.trim()}
        className="w-full mt-4 py-3 text-sm font-semibold rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-90 focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
      >
        Visualize JSON Tree
      </button>
    </div>
  );
}
