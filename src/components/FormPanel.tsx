import React, { useState, useRef, useEffect } from 'react';
import { Trash2, GripVertical, Plus, ChevronUp, ChevronDown, Type, Hash, List, CheckSquare, Database, AlignLeft, FunctionSquare, Info } from 'lucide-react';
import { getGridColsClass, getColSpanClass } from '../utils/gridCols';

interface Field {
  id: string;
  type: string;
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  visible?: boolean;
  editable?: boolean;
  multiline?: boolean;
  defaultValue?: string;
  checkText?: string;
  /** How many columns of the parent grid this field spans (default 1). */
  colSpan?: number;
}

interface Group {
  id: string;
  name: string;
  columns: number;
  fields: Field[];
  locked?: boolean;
}

interface FormPanelProps {
  groups: Group[];
  selectedElementId?: string;
  targetZone: 'main' | 'l2-form' | 'l3-form';
  /**
   * Total number of columns for the form grid (1–6).
   * When provided this overrides each group's own `columns` value.
   */
  formColumns?: number;
  onSelect: (element: any) => void;
  onDeleteGroup: (e: React.MouseEvent, groupId: string) => void;
  onDeleteField: (e: React.MouseEvent, fieldId: string, groupId: string) => void;
  onAddGroup: () => void;
  onDrop: (e: React.DragEvent, groupId: string, targetFieldId?: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragStartField: (e: React.DragEvent, fieldId: string, groupId: string) => void;
  /** Called when user double-clicks a group name and saves a new name. */
  onRenameGroup?: (groupId: string, newName: string) => void;
  t: (key: string) => string;
  draggedType?: 'field' | 'column' | null;
}

// ─── Inline tooltip ──────────────────────────────────────────────────────────

const Tooltip: React.FC<{ text: string }> = ({ text }) => (
  <div className="relative group/tip inline-flex items-center">
    <Info className="w-3.5 h-3.5 text-indigo-400 cursor-help" />
    <div className="absolute bottom-full right-1/2 translate-x-1/2 mb-1.5 w-44 p-2 bg-gray-900 dark:bg-slate-950 text-white text-[10px] leading-relaxed rounded-lg shadow-xl opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all z-50 text-start pointer-events-none border border-white/10 dark:border-slate-800">
      {text}
      <div className="absolute top-[100%] right-1/2 translate-x-1/2 border-[5px] border-transparent border-t-gray-900 dark:border-t-slate-950" />
    </div>
  </div>
);

// ─── Inline group name editor ─────────────────────────────────────────────────

interface GroupHeaderProps {
  group: Group;
  isSelected: boolean;
  collapsed: boolean;
  onToggle: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onRename?: (newName: string) => void;
  t: (key: string) => string;
}

const GroupHeader: React.FC<GroupHeaderProps> = ({ group, isSelected, collapsed, onToggle, onDelete, onRename, t }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(group.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);
  useEffect(() => { setDraft(group.name); }, [group.name]);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== group.name) onRename?.(trimmed);
    else setDraft(group.name);
    setEditing(false);
  };

  return (
    <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-slate-800">
      <h4 className="font-bold text-sm text-gray-700 dark:text-slate-200 flex items-center gap-2 flex-1 min-w-0">
        <button
          onClick={onToggle}
          className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded text-gray-500 dark:text-slate-400 transition-colors flex-shrink-0"
        >
          {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>

        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(group.name); setEditing(false); } }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 min-w-0 border border-indigo-400 dark:border-indigo-500 rounded px-2 py-0.5 text-sm font-bold text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 bg-white dark:bg-slate-900 text-start"
          />
        ) : (
          <span
            className="truncate cursor-text"
            title={!group.locked ? t('doubleClickToRename') : undefined}
            onDoubleClick={(e) => {
              if (group.locked) return;
              e.stopPropagation();
              setEditing(true);
            }}
          >
            {group.name}
          </span>
        )}
      </h4>

      {!group.locked && group.id !== 'g_base' && !group.id.startsWith('l2g_base') && !group.id.startsWith('l3g_base') && !group.id.startsWith('g_base_') && (
        <button
          onClick={onDelete}
          className={`text-red-500 hover:bg-red-100 dark:hover:bg-red-950/30 p-1.5 rounded-md transition-opacity flex-shrink-0 ${
            isSelected ? 'opacity-100' : 'opacity-0 group-hover/container:opacity-100'
          }`}
          title={t('deleteGroup')}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// ─── FormPanel ───────────────────────────────────────────────────────────────

export const FormPanel: React.FC<FormPanelProps> = ({
  groups,
  selectedElementId,
  targetZone,
  formColumns,
  onSelect,
  onDeleteGroup,
  onDeleteField,
  onAddGroup,
  onDrop,
  onDragOver,
  onDragStartField,
  onRenameGroup,
  t,
  draggedType,
}) => {
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [dragOverGroupId, setDragOverGroupId] = useState<string | null>(null);
  const [dragOverFieldId, setDragOverFieldId] = useState<string | null>(null);

  const toggleCollapse = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setCollapsedGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div
          key={group.id}
          onClick={(e) => {
            e.stopPropagation();
            onSelect({
              ...group,
              type: targetZone === 'main'
                ? 'container-group'
                : targetZone === 'l2-form'
                ? 'container-l2-group'
                : 'container-l3-group',
            });
          }}
          className={`relative p-5 rounded-xl border transition-all group/container cursor-pointer bg-white/60 dark:bg-slate-900/60 ${
            dragOverGroupId === group.id
              ? 'border-2 border-dashed border-indigo-500 dark:border-indigo-400 bg-indigo-50/10 dark:bg-indigo-950/20 scale-[1.005] shadow-md ring-2 ring-indigo-500/15'
              : selectedElementId === group.id
              ? 'border-2 border-indigo-500 dark:border-indigo-400 bg-indigo-50/5 dark:bg-indigo-950/5 shadow-[0_0_0_4px_rgba(99,102,241,0.15)] dark:shadow-[0_0_0_4px_rgba(99,102,241,0.25)]'
              : draggedType === 'field'
              ? 'border-2 border-dashed border-indigo-300/40 dark:border-slate-800/80 bg-indigo-50/5 dark:bg-indigo-950/5 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-white dark:hover:bg-slate-900 hover:shadow-md'
              : 'border-gray-200 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-white dark:hover:bg-slate-900 hover:shadow-md border-dashed'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            if (dragOverGroupId !== group.id) {
              setDragOverGroupId(group.id);
            }
            onDragOver(e);
          }}
          onDragLeave={() => {
            setDragOverGroupId(null);
          }}
          onDrop={(e) => {
            setDragOverGroupId(null);
            onDrop(e, group.id);
          }}
        >
          {groups.length > 1 && (
            <GroupHeader
              group={group}
              isSelected={selectedElementId === group.id}
              collapsed={!!collapsedGroups[group.id]}
              onToggle={(e) => toggleCollapse(e, group.id)}
              onDelete={(e) => onDeleteGroup(e, group.id)}
              onRename={onRenameGroup ? (name) => onRenameGroup(group.id, name) : undefined}
              t={t}
            />
          )}

          {!collapsedGroups[group.id] && (
            <div className={`grid ${getGridColsClass(formColumns ?? group.columns)} gap-x-4 gap-y-4 min-h-[60px]`}>
              {group.fields.length === 0 ? (
                <div className={`col-span-full text-center text-xs py-8 border-2 border-dashed rounded-lg pointer-events-none transition-all flex flex-col items-center justify-center gap-2 ${
                  dragOverGroupId === group.id
                    ? 'border-indigo-500 text-indigo-600 bg-indigo-50/20 dark:border-indigo-400 dark:text-indigo-400 font-bold scale-[1.01]'
                    : 'border-gray-200 dark:border-slate-800 text-gray-400 dark:text-slate-500'
                }`}>
                  <Plus className={`w-5 h-5 transition-transform ${dragOverGroupId === group.id ? 'scale-125 animate-bounce text-indigo-600 dark:text-indigo-400' : 'text-gray-300 dark:text-slate-600'}`} />
                  <span>{t('dropFieldsHere')}</span>
                </div>
              ) : (
                group.fields.map((field) => (
                  <div
                    key={field.id}
                    draggable
                    onDragStart={(e) => onDragStartField(e, field.id, group.id)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (dragOverFieldId !== field.id) {
                        setDragOverFieldId(field.id);
                      }
                      onDragOver(e);
                    }}
                    onDragLeave={() => {
                      setDragOverFieldId(null);
                    }}
                    onDrop={(e) => {
                      setDragOverFieldId(null);
                      onDrop(e, group.id, field.id);
                    }}
                    className={`${getColSpanClass(field.colSpan ?? 1)} relative flex flex-col gap-1.5 p-3 rounded-lg transition-all duration-200 ease-out cursor-grab active:cursor-grabbing border-2 group/field ${
                      field.visible === false ? 'opacity-50 grayscale' : ''
                    } ${
                      dragOverFieldId === field.id
                        ? 'rtl:-translate-x-2.5 ltr:translate-x-2.5 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-500/15'
                        : selectedElementId === field.id
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/20 border-indigo-400 dark:border-indigo-600 shadow-sm'
                        : 'border-transparent hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-indigo-50/30 dark:hover:bg-slate-800/40 hover:ring-1 hover:ring-indigo-300 dark:hover:ring-indigo-500 bg-gray-50/50 dark:bg-slate-800/40'
                    }`}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onSelect({ 
                        ...field, 
                        _groupId: group.id,
                        _groupColumns: formColumns ?? group.columns ?? 5,
                        _context: targetZone 
                      }); 
                    }}
                  >
                    {/* Glowing seam insert indicator when field is dragover target */}
                    {dragOverFieldId === field.id && (
                      <div className="absolute top-0 bottom-0 -start-2 w-1.5 bg-indigo-600 dark:bg-indigo-400 rounded-full z-20 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse pointer-events-none" />
                    )}

                    {/* Drag handle */}
                    <div className="absolute start-2 top-1.5 opacity-0 group-hover/field:opacity-100 text-gray-300 dark:text-slate-500 transition-opacity">
                      <GripVertical className="w-4 h-4" />
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => onDeleteField(e, field.id, group.id)}
                      className={`absolute end-2 top-2 p-1.5 bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900/60 transition-opacity z-10 shadow-sm ${
                        selectedElementId === field.id ? 'opacity-100' : 'opacity-0 group-hover/field:opacity-100'
                      }`}
                      title={t('deleteField')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Label row */}
                    <div className="flex items-center justify-between ps-5">
                      <label className="text-sm font-semibold text-gray-600 dark:text-slate-300 text-start flex items-center gap-1.5">
                        {field.label}
                        {field.required && <span className="text-red-500">*</span>}
                        {field.placeholder && (
                          <span className="relative group/tooltip flex items-center inline-block">
                            <Info className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-help transition-colors" />
                            <span className="absolute bottom-full mb-1.5 right-1/2 translate-x-1/2 w-48 p-2 bg-gray-900 dark:bg-slate-950 text-white text-[10px] leading-relaxed rounded-md shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 text-start font-normal normal-case tracking-normal border border-white/10 dark:border-slate-800">
                              {field.placeholder}
                              <span className="absolute top-full right-1/2 translate-x-1/2 border-[5px] border-transparent border-t-gray-900 dark:border-t-slate-950" />
                            </span>
                          </span>
                        )}
                      </label>
                      <div className="flex gap-1 items-center">
                        {field.editable === false && (
                          <span className="text-[9px] bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 px-1 rounded font-bold" title={t('lock')}>{t('lock')}</span>
                        )}
                        {field.visible === false && (
                          <span className="text-[9px] bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-300 px-1 rounded font-bold" title={t('hidden')}>{t('hidden')}</span>
                        )}
                      </div>
                    </div>

                    {/* Field preview ── */}
                    {field.type === 'comp-check' ? (
                      <div className={`flex items-center h-10 px-3 border border-gray-200 dark:border-slate-700 rounded-md ${field.editable === false ? 'bg-gray-100 dark:bg-slate-800' : 'bg-white dark:bg-slate-900'}`}>
                        <input type="checkbox" disabled className="w-4 h-4 rounded text-indigo-500 cursor-not-allowed" />
                        <span className="ms-2 text-sm text-gray-500 dark:text-slate-400">{field.checkText || field.label}</span>
                      </div>
                    ) : field.type === 'comp-text' && field.multiline ? (
                      <textarea
                        disabled
                        value={field.defaultValue || ''}
                        className={`w-full border border-gray-200 dark:border-slate-700 rounded-md h-20 px-3 py-2 text-sm text-gray-500 dark:text-slate-400 cursor-not-allowed text-start ${field.editable === false ? 'bg-gray-100 dark:bg-slate-800' : 'bg-white dark:bg-slate-900'}`}
                        readOnly
                      />
                    ) : field.type === 'comp-relation' ? (
                      <div className="relative">
                        <div className={`w-full border border-gray-200 dark:border-slate-700 rounded-md h-10 ps-10 pe-8 text-sm text-gray-500 dark:text-slate-400 cursor-not-allowed flex items-center justify-start ${field.editable === false ? 'bg-gray-100 dark:bg-slate-800' : 'bg-white dark:bg-slate-900'}`}>
                          <Database className="w-4 h-4 text-indigo-500 absolute start-3 top-1/2 -translate-y-1/2" />
                          <span className="truncate text-gray-400 dark:text-slate-500">
                            {t('select') + '...'}
                          </span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    ) : field.type === 'comp-select' ? (
                      <div className="relative">
                        <input
                          type="text"
                          disabled
                          placeholder={t('select') + '...'}
                          className={`w-full border border-gray-200 dark:border-slate-700 rounded-md h-10 ps-3 pe-8 text-sm text-gray-500 dark:text-slate-400 cursor-not-allowed text-start ${field.editable === false ? 'bg-gray-100 dark:bg-slate-800' : 'bg-white dark:bg-slate-900'}`}
                          readOnly
                        />
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    ) : (
                      <input
                        type="text"
                        disabled
                        className={`w-full border border-gray-200 dark:border-slate-700 rounded-md h-10 px-3 text-sm text-gray-500 dark:text-slate-400 cursor-not-allowed ${field.editable === false ? 'bg-gray-100 dark:bg-slate-800' : 'bg-white dark:bg-slate-900'}`}
                      />
                    )}
                    {field.placeholder && (
                      <p className="sr-only font-medium leading-relaxed">
                        {field.placeholder}
                      </p>
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
        className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl text-sm font-bold text-gray-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-slate-800/30 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" /> {t('addNewGroup')}
      </button>
    </div>
  );
};
