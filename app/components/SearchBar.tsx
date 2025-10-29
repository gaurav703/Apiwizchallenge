'use client';

import { useState, FormEvent } from 'react';

interface SearchBarProps {
  onSearch: (term: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [searchValue, setSearchValue] = useState<string>('');

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) {
      alert('Please enter a search term.');
      return;
    }
    onSearch(searchValue);
  };

  return (
    <div className="rounded-xl backdrop-blur-md bg-white/70 dark:bg-slate-800/60 border border-emerald-200 dark:border-slate-700 shadow-lg p-4">
      <form onSubmit={handleSearch} className="flex space-x-2">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search by path (e.g., $.user.address.city)"
         className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-emerald-400 bg-white/80 dark:bg-slate-900/40 text-slate-900 dark:text-gray-100"
        />
        <button
          type="submit"
          className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-md hover:opacity-90 transition"
        >
          Search
        </button>
      </form>
    </div>
  );
}
