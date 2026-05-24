import React from 'react';
import { FolderOpen, Trash2, GripVertical, Plus, ChevronUp, ChevronDown } from 'lucide-react';

interface Field {
  id: string;
  type: string;
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
}

interface Group {
  id: string;
  name: string;
  columns: number;
  fields: Field[];
}

interface FormPanelProps {
  groups: Group[];
  selectedElementId?: string;
  targetZone: 'main' | 'l2-form' | 'l3-form';
  onSelect: (element: any) => void;
  onDeleteGroup: (e: React.MouseEvent, groupId: string) => void;
  onDeleteField: (e: React.MouseEvent, fieldId: string, groupId: string) => void;
  onAddGroup: () => void;
  onDrop: (e: React.DragEvent, groupId: string, targetFieldId?: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragStartField: (e: React.DragEvent, fieldId: string, groupId: string) => void;
  }

import { useState } from 'react';

export const FormPanel: React.FC<FormPanelProps> = ({
  groups,
  selectedElementId,
  targetZone,
  onSelect,
  onDeleteGroup,
  onDeleteField,
  onAddGroup,
  onDrop,
  onDragOver,
  onDragStartField,
}) => {
  
  const getGridColsClass = (columnsCount: number) => {
    return ({
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    } as any)[columnsCount] || 'grid-cols-1 md:grid-cols-2';
  };

  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleCollapse = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setCollapsedGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div 
          key={group.id}
          onClick={(e) => { e.stopPropagation(); onSelect({ ...group, type: targetZone === 'main' ? 'container-group' : (targetZone === 'l2-form' ? 'container-l2-group' : 'container-l3-group') }); }}
          className={`relative p-4 rounded-xl border-2 transition-all group/container cursor-pointer ${selectedElementId === group.id ? 'border-indigo-400 bg-indigo-50/10' : 'border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30 hover:shadow-sm'}`}
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, group.id)}
        >
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <h4 className="font-bold text-sm text-gray-700 flex items-center gap-2">
              <button onClick={(e) => toggleCollapse(e, group.id)} className="p-1 hover:bg-gray-200 rounded text-gray-500 transition-colors">
                {collapsedGroups[group.id] ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
              {group.name}
            </h4>
            {group.id !== 'g_base' && group.id !== 'dg_base' && !group.id.startsWith('l3g_base') && (
              <button 
                onClick={(e) => onDeleteGroup(e, group.id)}
                className={`text-red-500 hover:bg-red-100 p-1.5 rounded-md transition-opacity ${selectedElementId === group.id ? 'opacity-100' : 'opacity-0 group-hover/container:opacity-100'}`}
                title="حذف گروه"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {!collapsedGroups[group.id] && (
          <div className={`grid ${getGridColsClass(group.columns)} gap-x-6 gap-y-4 min-h-[60px]`}>
            {group.fields.length === 0 ? (
              <div className="col-span-full text-center text-xs text-gray-400 py-6 border-2 border-dashed border-gray-100 rounded-lg">
                فیلدها را در این گروه رها کنید
              </div>
            ) : (
              group.fields.map((field) => (
                <div 
                  key={field.id}
                  draggable
                  onDragStart={(e) => onDragStartField(e, field.id, group.id)}
                  onDrop={(e) => onDrop(e, group.id, field.id)}
                  onDragOver={onDragOver}
                  className={`relative flex flex-col gap-1.5 p-3 rounded-lg transition-all cursor-grab active:cursor-grabbing border-2 group/field ${(field as any).visible === false ? 'opacity-50 grayscale' : ''} ${selectedElementId === field.id ? 'bg-indigo-50/80 border-indigo-400 shadow-sm' : 'border-transparent hover:border-indigo-300 hover:bg-indigo-50/30 hover:ring-1 hover:ring-indigo-300 bg-gray-50/50'}`}
                  onClick={(e) => { e.stopPropagation(); onSelect(field); }}
                >
                  <div className="absolute right-2 top-1.5 opacity-0 group-hover/field:opacity-100 text-gray-300 transition-opacity">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <button 
                    onClick={(e) => onDeleteField(e, field.id, group.id)}
                    className={`absolute left-2 top-2 p-1.5 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-opacity z-10 shadow-sm ${selectedElementId === field.id ? 'opacity-100' : 'opacity-0 group-hover/field:opacity-100'}`}
                    title="حذف این فیلد"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex items-center justify-between pr-5">
                    <label className="text-sm font-semibold text-gray-600 text-right">
                      {(field as any).label} {(field as any).required && <span className="text-red-500">*</span>}
                    </label>
                    <div className="flex gap-1">
                      {(field as any).editable === false && <span className="text-[9px] bg-red-100 text-red-600 px-1 rounded" title="غیر قابل ویرایش">قفل</span>}
                      {(field as any).visible === false && <span className="text-[9px] bg-gray-200 text-gray-600 px-1 rounded" title="مخفی">مخفی</span>}
                    </div>
                  </div>
                  {(field as any).type === 'comp-check' ? (
                     <div className={`flex items-center h-10 px-3 border border-gray-200 rounded-md ${(field as any).editable === false ? 'bg-gray-100' : 'bg-white'}`}>
                       <input type="checkbox" disabled className="w-4 h-4 rounded text-indigo-500 cursor-not-allowed" />
                       <span className="mr-2 text-sm text-gray-500">{(field as any).checkText || (field as any).label}</span>
                     </div>
                  ) : (field as any).type === 'comp-text' && (field as any).multiline ? (
                     <textarea disabled placeholder={(field as any).placeholder || ''} value={(field as any).defaultValue || ''} className={`w-full border border-gray-200 rounded-md h-20 px-3 py-2 text-sm text-gray-500 cursor-not-allowed text-right ${(field as any).editable === false ? 'bg-gray-100' : 'bg-white'}`} readOnly />
                  ) : (
                     <input type="text" disabled placeholder={(field as any).type === 'comp-select' ? 'انتخاب کنید...' : (field as any).placeholder || ''} value={(field as any).defaultValue || ''} className={`w-full border border-gray-200 rounded-md h-10 px-3 text-sm text-gray-500 cursor-not-allowed text-right ${(field as any).editable === false ? 'bg-gray-100' : 'bg-white'}`} readOnly />
                  )}
                </div>
              ))
            )}
          </div>
          )}
        </div>
      ))}
      
      <button 
        onClick={onAddGroup} 
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-bold text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" /> افزودن گروه جدید
      </button>
    </div>
  );
};
