import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  selectedElement?: any;
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
  onUpdateFieldProp?: (prop: string, value: any) => void;
  language?: 'fa' | 'en';
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
  selectedElement,
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
  onUpdateFieldProp,
  language,
}) => {
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [dragOverGroupId, setDragOverGroupId] = useState<string | null>(null);
  const [dragOverFieldId, setDragOverFieldId] = useState<string | null>(null);

  const [resizingFieldId, setResizingFieldId] = useState<string | null>(null);
  const [resizingColSpan, setResizingColSpan] = useState<number | null>(null);

  const toggleCollapse = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setCollapsedGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleMouseDown = (e: React.MouseEvent, fieldId: string, currentColSpan: number, maxColumns: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    const handleEl = e.currentTarget as HTMLElement;
    const cardEl = handleEl.parentElement;
    if (!cardEl) return;
    
    const startX = e.clientX;
    const startWidth = cardEl.getBoundingClientRect().width;
    const colWidth = startWidth / currentColSpan;
    
    setResizingFieldId(fieldId);
    setResizingColSpan(currentColSpan);
    
    let lastColSpan = currentColSpan;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = startX - moveEvent.clientX;
      const colsDiff = Math.round(deltaX / colWidth);
      let newColSpan = currentColSpan + colsDiff;
      newColSpan = Math.max(1, Math.min(maxColumns, newColSpan));
      
      setResizingColSpan(newColSpan);
      if (newColSpan !== lastColSpan) {
        lastColSpan = newColSpan;
      }
    };
    
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      
      if (lastColSpan !== currentColSpan) {
        onUpdateFieldProp?.('colSpan', lastColSpan);
      }
      
      setResizingFieldId(null);
      setResizingColSpan(null);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };
 
  const handleTouchStart = (e: React.TouchEvent, fieldId: string, currentColSpan: number, maxColumns: number) => {
    e.stopPropagation();
    
    const handleEl = e.currentTarget as HTMLElement;
    const cardEl = handleEl.parentElement;
    if (!cardEl) return;
    
    const startX = e.touches[0].clientX;
    const startWidth = cardEl.getBoundingClientRect().width;
    const colWidth = startWidth / currentColSpan;
    
    setResizingFieldId(fieldId);
    setResizingColSpan(currentColSpan);
    
    let lastColSpan = currentColSpan;
    
    const handleTouchMove = (moveEvent: TouchEvent) => {
      const deltaX = startX - moveEvent.touches[0].clientX;
      const colsDiff = Math.round(deltaX / colWidth);
      let newColSpan = currentColSpan + colsDiff;
      newColSpan = Math.max(1, Math.min(maxColumns, newColSpan));
      
      setResizingColSpan(newColSpan);
      if (newColSpan !== lastColSpan) {
        lastColSpan = newColSpan;
      }
    };
    
    const handleTouchEnd = () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      
      if (lastColSpan !== currentColSpan) {
        onUpdateFieldProp?.('colSpan', lastColSpan);
      }
      
      setResizingFieldId(null);
      setResizingColSpan(null);
    };
    
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
  };

  const [particles, setParticles] = useState<{ id: number; x: number; y: number; dx: number; dy: number; color: string }[]>([]);

  const handleDropWithEffect = (e: React.DragEvent, groupId: string, targetFieldId?: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const dropX = e.clientX - rect.left;
    const dropY = e.clientY - rect.top;

    const newParticles = Array.from({ length: 14 }).map((_, idx) => {
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 50 + 30;
      return {
        id: Date.now() + idx,
        x: dropX,
        y: dropY,
        dx: Math.cos(angle) * velocity,
        dy: Math.sin(angle) * velocity,
        color: ['#6366f1', '#3b82f6', '#14b8a6', '#a855f7'][Math.floor(Math.random() * 4)]
      };
    });

    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
    }, 600);

    onDrop(e, groupId, targetFieldId);
  };

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <motion.div
          key={group.id}
          layout
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
              : (selectedElement?.id === group.id && selectedElement?.type === (targetZone === 'main' ? 'container-group' : 'container-l2-group'))
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
            handleDropWithEffect(e, group.id);
          }}
        >
          {/* Particles burst absolute layer */}
          {particles.map(p => (
            <span 
              key={p.id}
              className="particle"
              style={{
                left: p.x,
                top: p.y,
                backgroundColor: p.color,
                '--dx': `${p.dx}px`,
                '--dy': `${p.dy}px`
              } as React.CSSProperties}
            />
          ))}

          {groups.length > 1 && (
            <GroupHeader
              group={group}
              isSelected={selectedElement?.id === group.id && selectedElement?.type === (targetZone === 'main' ? 'container-group' : 'container-l2-group')}
              collapsed={!!collapsedGroups[group.id]}
              onToggle={(e) => toggleCollapse(e, group.id)}
              onDelete={(e) => onDeleteGroup(e, group.id)}
              onRename={onRenameGroup ? (name) => onRenameGroup(group.id, name) : undefined}
              t={t}
            />
          )}

          <AnimatePresence initial={false}>
            {!collapsedGroups[group.id] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                style={{ overflow: 'hidden' }}
              >
                <motion.div 
                  variants={{
                    visible: { transition: { staggerChildren: 0.05 } },
                    hidden: {}
                  }}
                  initial="hidden"
                  animate="visible"
                  className={`grid ${getGridColsClass(formColumns ?? group.columns)} gap-x-4 gap-y-4 min-h-[60px] relative p-0.5`}
                >
                  {/* Background columns guides during resize */}
                  {resizingFieldId && (
                    <div className="absolute inset-0 grid grid-cols-1 gap-x-4 pointer-events-none z-0">
                      <div className={`grid ${getGridColsClass(formColumns ?? group.columns)} gap-x-4 h-full w-full`}>
                        {Array.from({ length: formColumns ?? group.columns ?? 5 }).map((_, idx) => (
                          <div key={idx} className="border-x border-dashed border-indigo-200/40 dark:border-indigo-950/20 bg-indigo-50/5 dark:bg-indigo-950/5 h-full rounded-md" />
                        ))}
                      </div>
                    </div>
                  )}
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
                      <motion.div
                        key={field.id}
                        layout
                        variants={{
                          hidden: { opacity: 0, y: 15 },
                          visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } }
                        }}
                        draggable={resizingFieldId === null}
                        onDragStart={(e) => {
                          if (resizingFieldId !== null) {
                            e.preventDefault();
                            return;
                          }
                          onDragStartField(e, field.id, group.id);
                        }}
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
                          handleDropWithEffect(e, group.id, field.id);
                        }}
                        className={`${getColSpanClass(resizingFieldId === field.id ? (resizingColSpan ?? field.colSpan ?? 1) : (field.colSpan ?? 1))} relative z-10 flex flex-col gap-1.5 p-3 rounded-lg cursor-grab active:cursor-grabbing border-2 group/field select-none ${
                          field.visible === false ? 'opacity-50 grayscale' : ''
                        } ${
                          resizingFieldId === field.id ? '' : 'transition-all duration-200 ease-out'
                        } ${
                          dragOverFieldId === field.id
                            ? 'rtl:-translate-x-2.5 ltr:translate-x-2.5 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-500/15'
                            : (selectedElement?.id === field.id && selectedElement?._context === targetZone)
                            ? 'bg-indigo-50/80 dark:bg-indigo-950/20 border-indigo-400 dark:border-indigo-600 shadow-sm'
                            : 'border-transparent hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-indigo-50/30 dark:hover:bg-slate-800/40 hover:ring-1 hover:ring-indigo-300 dark:hover:ring-indigo-500 bg-gray-50/50 dark:bg-slate-800/40'
                        } ${resizingFieldId === field.id ? 'border-indigo-500 dark:border-indigo-400 shadow-md ring-2 ring-indigo-500/10' : ''}`}
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
                            (selectedElement?.id === field.id && selectedElement?._context === targetZone) ? 'opacity-100' : 'opacity-0 group-hover/field:opacity-100'
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

                        {/* Trailing edge (left edge in RTL) resize handle */}
                        {(selectedElement?.id === field.id && selectedElement?._context === targetZone) && (
                          <div
                            onMouseDown={(e) => handleMouseDown(e, field.id, field.colSpan || 1, formColumns ?? group.columns ?? 5)}
                            onTouchStart={(e) => handleTouchStart(e, field.id, field.colSpan || 1, formColumns ?? group.columns ?? 5)}
                            className="absolute left-[-6px] top-0 bottom-0 w-3 cursor-col-resize flex items-center justify-center z-30 group/handle select-none"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="w-1.5 h-10 bg-indigo-300 dark:bg-slate-700 rounded-full group-hover/handle:bg-indigo-500 group-hover/handle:h-14 group-active/handle:bg-indigo-600 group-active/handle:h-18 transition-all shadow-[0_0_8px_rgba(99,102,241,0.2)] dark:shadow-[0_0_8px_rgba(99,102,241,0.4)]" />

                            {/* Floating Tooltip Bubble */}
                            {resizingFieldId === field.id && resizingColSpan !== null && (
                              <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-950 text-white text-[11px] font-bold px-2 py-1 rounded-md shadow-lg border border-white/10 pointer-events-none select-none z-40 whitespace-nowrap flex items-center gap-1">
                                <span>{resizingColSpan}</span>
                                <span className="opacity-40">/</span>
                                <span>{formColumns ?? group.columns ?? 5}</span>
                                <span className="text-[10px] font-normal text-gray-300">{language === 'fa' ? 'ستون' : 'cols'}</span>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-slate-900 dark:border-t-slate-950" />
                              </div>
                            )}
                          </div>
                        )}

                        {field.placeholder && (
                          <p className="sr-only font-medium leading-relaxed">
                            {field.placeholder}
                          </p>
                        )}
                      </motion.div>
                    ))
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
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
