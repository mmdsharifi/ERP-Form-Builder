import React from 'react';

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
          <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 hover:text-gray-650 cursor-help transition-colors select-none font-mono px-0.5">
            (?)
          </span>
          <div className="absolute top-full -translate-y-1 right-1/2 translate-x-1/2 mt-1 w-48 p-2 bg-gray-900 dark:bg-slate-950 text-white text-[10px] leading-relaxed rounded-md shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible group-hover/tooltip:-translate-y-0 transition-all z-50 text-start font-normal normal-case tracking-normal border border-white/10 dark:border-slate-800">
            {info}
            <div className="absolute bottom-[99%] right-1/2 translate-x-1/2 border-[5px] border-transparent border-b-gray-900 dark:border-b-slate-950" />
          </div>
        </div>
      )}
    </div>
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-4.5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-gray-700 dark:bg-slate-500' : 'bg-gray-200 dark:bg-slate-700'} ${disabled ? 'cursor-not-allowed' : ''}`}
    >
      <span className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-4 rtl:-translate-x-4' : 'translate-x-0'}`} />
    </button>
  </div>
);
