'use client';

export default function ControlPanel() {
  return (
    <div className="rounded-xl backdrop-blur-md bg-white/70 dark:bg-slate-800/60 border border-emerald-200 dark:border-slate-700 shadow-lg p-5 transition">
      <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-3">
        🧭 Legend
      </h3>
      <div className="space-y-3 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded bg-indigo-500"></div>
          <span className="text-slate-700 dark:text-gray-300">Object</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded bg-emerald-500"></div>
          <span className="text-slate-700 dark:text-gray-300">Array</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded bg-amber-500"></div>
          <span className="text-slate-700 dark:text-gray-300">Primitive Value</span>
        </div>
      </div>
    </div>
  );
}
