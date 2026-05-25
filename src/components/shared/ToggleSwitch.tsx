import React from 'react';
import { Info } from 'lucide-react';

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  info?: string;
  disabled?: boolean;
  language?: 'fa' | 'en';
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, checked, onChange, info, disabled, language = 'fa' }) => (
  <div className={`flex items-center justify-between py-1.5 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-gray-600 dark:text-slate-300 font-medium">{label}</span>
      {info && (
        <div className="relative group/tooltip flex items-center">
          <Info className="w-3 h-3 text-gray-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 cursor-help transition-colors select-none" />
          <div className="absolute bottom-full right-1/2 translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 dark:bg-slate-950 text-white text-[10px] leading-relaxed rounded-md shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-[9999] text-start font-normal normal-case tracking-normal border border-white/10 dark:border-slate-800 pointer-events-none">
            {info}
            <div className="absolute top-[99%] right-1/2 translate-x-1/2 border-[5px] border-transparent border-t-gray-900 dark:border-t-slate-950" />
          </div>
        </div>
      )}
    </div>
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      dir="ltr"
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-gray-200 dark:bg-slate-700'} ${disabled ? 'cursor-not-allowed' : ''}`}
    >
      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  </div>
);
