import React from 'react';

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
    className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700/60 rounded-xl cursor-grab active:cursor-grabbing hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md transition-all group"
  >
    <div className="p-2 bg-gray-50 dark:bg-slate-900 rounded-lg group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
      {icon}
    </div>
    <span className="text-xs font-semibold text-gray-600 dark:text-slate-300 group-hover:text-gray-900 dark:group-hover:text-slate-100 transition-colors">{label}</span>
  </div>
);
