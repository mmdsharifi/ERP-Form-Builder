import React from 'react';
import { Search, Plus, Trash2, ChevronLeft } from 'lucide-react';

interface Column {
  id: string;
  name: string;
  label: string;
  required?: boolean;
}

interface GridTableProps {
  columns: Column[];
  data: any[];
  settings: {
    showAdd: boolean;
    showSearch: boolean;
    showCheckbox: boolean;
  };
  selectedElementId?: string;
  onSelect: (element: any) => void;
  onDeleteColumn: (e: React.MouseEvent, id: string) => void;
  onDrillDown: (row: any) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
}

export const GridTable: React.FC<GridTableProps> = ({
  columns,
  data,
  settings,
  selectedElementId,
  onSelect,
  onDeleteColumn,
  onDrillDown,
  onDrop,
  onDragOver
}) => {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        {settings.showSearch ? (
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute right-2.5 top-2 text-gray-400" />
            <input type="text" placeholder="جستجو" className="bg-gray-50 border border-gray-200 rounded pl-3 pr-8 py-1.5 text-xs w-48 focus:outline-none focus:ring-1 focus:ring-indigo-400 text-right" />
          </div>
        ) : <div />}
        
        {settings.showAdd && (
          <button className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm hover:bg-indigo-700 hover:shadow transition-all">
            <Plus className="w-3.5 h-3.5" /> جدید
          </button>
        )}
      </div>

      <table className="w-full text-sm text-right" onDragOver={onDragOver} onDrop={onDrop}>
        <thead>
          <tr className="text-gray-500 border-b border-gray-200">
            {settings.showCheckbox && (
              <th className="py-2 px-3 w-8"><input type="checkbox" className="rounded text-indigo-500" /></th>
            )}
            {columns.map(col => (
              <th 
                key={col.id} 
                className={`py-2 px-3 font-semibold cursor-pointer transition-colors relative group ${selectedElementId === col.id ? 'text-indigo-800 bg-indigo-100 shadow-[inset_0_-3px_0_0_#6366f1]' : 'hover:bg-indigo-50/50 hover:ring-2 hover:ring-inset hover:ring-indigo-300 rounded-md'}`}
                onClick={(e) => { e.stopPropagation(); onSelect(col); }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span>{col.name || col.label} {col.required && <span className="text-red-500">*</span>}</span>
                  {selectedElementId === col.id && (
                    <button 
                      onClick={(e) => onDeleteColumn(e, col.id)}
                      className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                      title="حذف ستون"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </th>
            ))}
            <th className="py-2 px-3 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {columns.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-12 text-center text-sm text-gray-400 bg-gray-50/50 border-2 border-dashed border-gray-100 rounded-lg pointer-events-none">
                ستون‌های جدید را از منوی راست کشیده و اینجا رها کنید.
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition group">
                {settings.showCheckbox && (
                  <td className="py-2.5 px-3"><input type="checkbox" className="rounded border-gray-300 text-indigo-500" /></td>
                )}
                {columns.map((col, idx) => (
                  <td key={col.id} className="py-2.5 px-3 font-medium text-gray-700">
                    {idx === 0 ? row.name : (idx === 1 ? `${row.probability}%` : '-')}
                  </td>
                ))}
                <td className="py-2.5 px-3 text-left">
                  <button 
                    onClick={(e) => { e.stopPropagation(); if (onDrillDown) onDrillDown(row); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 border border-indigo-100 rounded-md transition shadow-sm"
                    title="مشاهده جزئیات"
                  >
                    <span>جزئیات</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </>
  );
};
