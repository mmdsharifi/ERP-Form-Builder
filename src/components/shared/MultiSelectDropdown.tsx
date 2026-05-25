import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface MultiSelectDropdownProps {
  label: string;
  columns: Array<{ id: string; name: string; label: string }>;
  selectedValues: string[];
  onChange: (values: string[]) => void;
  language: 'fa' | 'en';
  t: (key: string) => string;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  columns,
  selectedValues,
  onChange,
  language,
  t
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const filteredColumns = columns.filter(col =>
    (col.name || col.label || '').toLowerCase().includes(search.toLowerCase())
  );

  const toggleValue = (val: string) => {
    const next = selectedValues.includes(val)
      ? selectedValues.filter(v => v !== val)
      : [...selectedValues, val];
    onChange(next);
  };

  const displayText = selectedValues.length === 0
    ? (language === 'fa' ? 'هیچ ستونی انتخاب نشده' : 'No columns selected')
    : selectedValues.length === 1
    ? (columns.find(c => c.id === selectedValues[0])?.name || columns.find(c => c.id === selectedValues[0])?.label || '')
    : language === 'fa'
    ? `${selectedValues.length} ستون انتخاب شده`
    : `${selectedValues.length} columns selected`;

  return (
    <div className="space-y-1.5 relative" ref={dropdownRef}>
      <label className="block text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-slate-200 hover:border-gray-300 dark:hover:border-slate-600 transition-all font-semibold text-start shadow-sm cursor-pointer"
      >
        <span className="truncate">{displayText}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-30 mt-1 w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-xl p-2.5 space-y-2">
          {columns.length > 5 && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute start-2.5 top-2 text-gray-400" />
              <input
                type="text"
                placeholder={language === 'fa' ? 'جستجوی ستون...' : 'Search column...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg ps-8 pe-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-800 dark:text-slate-100 text-start"
              />
            </div>
          )}
          <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
            {filteredColumns.length === 0 ? (
              <p className="text-[11px] text-gray-400 text-center py-2">
                {language === 'fa' ? 'ستونی یافت نشد' : 'No columns found'}
              </p>
            ) : (
              filteredColumns.map(col => {
                const isChecked = selectedValues.includes(col.id);
                return (
                  <label
                    key={col.id}
                    className="flex items-center gap-2 p-1.5 hover:bg-gray-50 dark:hover:bg-slate-800/60 rounded-lg cursor-pointer select-none text-xs font-semibold text-gray-700 dark:text-slate-300"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleValue(col.id)}
                      className="rounded border-gray-300 dark:border-slate-700 text-indigo-500 focus:ring-indigo-500"
                    />
                    <span className="truncate">{col.name || col.label}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
