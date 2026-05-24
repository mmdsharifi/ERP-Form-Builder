import React from 'react';
import { motion } from 'motion/react';

interface DraggableItemProps {
  type: string;
  icon: React.ReactNode;
  label: string;
  onDragStart: (e: React.DragEvent, type: string) => void;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({ type, icon, label, onDragStart }) => (
  <div 
    draggable 
    onDragStart={(e) => onDragStart(e, type)}
    className="flex items-center space-x-reverse space-x-3 p-3 bg-white border border-gray-100 rounded-xl cursor-grab active:cursor-grabbing hover:border-indigo-300 hover:shadow-md transition-all group"
  >
    <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
      {icon}
    </div>
    <span className="text-xs font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">{label}</span>
  </div>
);

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
}

import { Info } from 'lucide-react';

export const PropertyField: React.FC<PropertyFieldProps> = ({ label, type, value, onChange, onBlur, options, optionsLabels, info, disabled }) => (
  <div className={`space-y-1.5 ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
    <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
      {label}
      {info && (
        <div className="relative group/tooltip flex items-center mt-[1px]">
          <Info className="w-3.5 h-3.5 text-gray-400 hover:text-indigo-500 cursor-help transition-colors" />
          <div className="absolute top-full -translate-y-1 right-1/2 translate-x-1/2 mt-1 w-48 p-2 bg-gray-900 text-white text-[10px] leading-relaxed rounded-md shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible group-hover/tooltip:-translate-y-0 transition-all z-50 text-right font-normal normal-case tracking-normal border border-white/10">
            {info}
            <div className="absolute bottom-[99%] right-1/2 translate-x-1/2 border-[5px] border-transparent border-b-gray-900" />
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
        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-right disabled:bg-gray-100 disabled:text-gray-500"
      />
    ) : (
      <select 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-gray-700 text-right disabled:bg-gray-100 disabled:text-gray-500"
      >
        {options?.map((opt, i) => (
          <option key={opt} value={opt}>{optionsLabels ? optionsLabels[i] : opt}</option>
        ))}
      </select>
    )}
  </div>
);

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  info?: string;
  disabled?: boolean;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, checked, onChange, info, disabled }) => (
  <div className={`flex items-center justify-between py-2 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-gray-600 font-medium">{label}</span>
      {info && (
        <div className="relative group/tooltip flex items-center">
          <Info className="w-3 h-3 text-gray-400 hover:text-indigo-500 cursor-help transition-colors" />
          <div className="absolute top-full -translate-y-1 right-1/2 translate-x-1/2 mt-1 w-48 p-2 bg-gray-900 text-white text-[10px] leading-relaxed rounded-md shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible group-hover/tooltip:-translate-y-0 transition-all z-50 text-right font-normal normal-case tracking-normal border border-white/10">
            {info}
            <div className="absolute bottom-[99%] right-1/2 translate-x-1/2 border-[5px] border-transparent border-b-gray-900" />
          </div>
        </div>
      )}
    </div>
    <button 
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-indigo-600' : 'bg-gray-200'} ${disabled ? 'cursor-not-allowed' : ''}`}
    >
      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? '-translate-x-5' : 'translate-x-0'}`} />
    </button>
  </div>
);
