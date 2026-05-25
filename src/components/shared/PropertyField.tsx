import React from 'react';
import { ChevronDown } from 'lucide-react';

interface PropertyFieldProps {
  label: string;
  type: 'text' | 'select' | 'number';
  value: string | number;
  onChange: (val: string) => void;
  onBlur?: () => void;
  options?: string[];
  optionsLabels?: string[];
  info?: string;
  disabled?: boolean;
  onPlusClick?: () => void;
  plusTooltip?: string;
}

export const PropertyField: React.FC<PropertyFieldProps> = ({
  label,
  type,
  value,
  onChange,
  onBlur,
  options,
  optionsLabels,
  info,
  disabled,
  onPlusClick,
  plusTooltip
}) => (
  <div className={`space-y-1.5 ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
    <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
      {label}
      {info && (
        <div className="relative group/tooltip flex items-center mt-[1px]">
          <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 hover:text-gray-650 cursor-help transition-colors select-none font-mono px-0.5">
            (?)
          </span>
          <div className="absolute top-full -translate-y-1 right-1/2 translate-x-1/2 mt-1 w-48 p-2 bg-gray-900 dark:bg-slate-950 text-white text-[10px] leading-relaxed rounded-md shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible group-hover/tooltip:-translate-y-0 transition-all z-50 text-start font-normal normal-case tracking-normal border border-white/10 dark:border-slate-800">
            {info}
            <div className="absolute bottom-[99%] right-1/2 translate-x-1/2 border-[5px] border-transparent border-b-gray-900 dark:border-b-slate-950" />
          </div>
        </div>
      )}
    </label>
    {type === 'text' || type === 'number' ? (
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        className="w-full bg-gray-50 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-700/80 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-slate-650 focus:border-gray-400 dark:focus:border-slate-550 transition-all text-start text-gray-800 dark:text-slate-100 disabled:bg-gray-100 dark:disabled:bg-slate-800/80 disabled:text-gray-500"
      />
    ) : (
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="w-full appearance-none bg-gray-50 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-700/80 rounded ps-2.5 pe-8 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-slate-650 focus:border-gray-400 dark:focus:border-slate-550 transition-all font-medium text-gray-700 dark:text-slate-200 text-start disabled:bg-gray-100 dark:disabled:bg-slate-800/80 disabled:text-gray-500 cursor-pointer"
          >
            {options?.map((opt, i) => (
              <option key={opt} value={opt} className="dark:bg-slate-900 dark:text-slate-100">{optionsLabels ? optionsLabels[i] : opt}</option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        {onPlusClick && (
          <button
            type="button"
            onClick={onPlusClick}
            title={plusTooltip}
            className="flex-shrink-0 h-[30px] w-[30px] bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-300 border border-gray-200 dark:border-slate-700 rounded hover:shadow-xs transition-all cursor-pointer flex items-center justify-center font-bold text-sm"
          >
            +
          </button>
        )}
      </div>
    )}
  </div>
);
