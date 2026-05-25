import React, { useState } from 'react';
import { Search, Plus, Trash2, ChevronLeft, ChevronRight, FunctionSquare, GripVertical } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AggType = 'none' | 'sum' | 'avg' | 'min' | 'max' | 'count';

export interface FormulaSegment {
  type: 'column' | 'number';
  value: string;
}

export interface FormulaConfig {
  segments: FormulaSegment[];
  ops: Array<'+' | '-' | '*' | '/'>;
}

interface Column {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  type?: string;
  footerAgg?: AggType;
  formula?: FormulaConfig;
}

export interface FooterRowConfig {
  id: string;
  title: string;
  operator: AggType;
  selectedColumns: string[];
}

interface GridTableProps {
  columns: Column[];
  data: any[];
  settings: {
    showAdd: boolean;
    showSearch: boolean;
    showCheckbox: boolean;
  };
  /** Label for the footer aggregation row (e.g. "جمع", "میانگین"). */
  footerLabel?: string;
  footerRows?: FooterRowConfig[];
  onUpdateFooterRows?: (rows: FooterRowConfig[]) => void;
  selectedElementId?: string;
  onSelect: (element: any) => void;
  onDeleteColumn: (e: React.MouseEvent, id: string) => void;
  onDrillDown: (row: any) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onReorderColumns?: (draggedColId: string, targetColId: string) => void;
  t: (key: string) => string;
  language: 'fa' | 'en';
  isDraggingColumn?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Evaluates a formula against a data row.
 */
const evalFormula = (formula: FormulaConfig, row: any, allColumns: Column[]): number => {
  const getVal = (seg: FormulaSegment): number => {
    if (seg.type === 'number') return parseFloat(seg.value) || 0;
    const idx = allColumns.findIndex(c => c.id === seg.value);
    if (idx === -1) return 0;
    return getCellNumber(row, idx);
  };

  const segs = formula.segments ?? [];
  if (segs.length === 0) return 0;

  let result = getVal(segs[0]);
  const ops = formula.ops ?? [];
  for (let i = 0; i < ops.length && i + 1 < segs.length; i++) {
    const rhs = getVal(segs[i + 1]);
    switch (ops[i]) {
      case '+': result += rhs; break;
      case '-': result -= rhs; break;
      case '*': result *= rhs; break;
      case '/': result = rhs !== 0 ? result / rhs : 0; break;
    }
  }
  return result;
};

/** Returns a numeric value from a mock data row based on column position. */
const getCellNumber = (row: any, colIdx: number): number => {
  const raw = colIdx === 0 ? row.name : colIdx === 1 ? row.probability : 0;
  return parseFloat(String(raw)) || 0;
};

/** Formats a number neatly (drops trailing .00). */
const fmt = (n: number): string => {
  if (!isFinite(n)) return '—';
  return n % 1 === 0 ? String(n) : n.toFixed(2);
};

/** Computes the aggregated footer value for one column (old single-row logic). */
const computeAgg = (col: Column, data: any[], allColumns: Column[]): string => {
  if (!col.footerAgg || col.footerAgg === 'none') return '';

  const values: number[] = data.map((row) => {
    const idx = allColumns.indexOf(col);
    if (col.type === 'comp-formula' && col.formula) {
      return evalFormula(col.formula, row, allColumns);
    }
    return getCellNumber(row, idx);
  });

  if (values.length === 0) return '—';
  switch (col.footerAgg) {
    case 'sum':   return fmt(values.reduce((a, b) => a + b, 0));
    case 'avg':   return fmt(values.reduce((a, b) => a + b, 0) / values.length);
    case 'min':   return fmt(Math.min(...values));
    case 'max':   return fmt(Math.max(...values));
    case 'count': return String(values.length);
    default:      return '';
  }
};

/** Computes aggregated footer value for a specific operator (new multi-row logic). */
const computeAggValue = (col: Column, data: any[], allColumns: Column[], operator: AggType): string => {
  if (!operator || operator === 'none') return '';

  const values: number[] = data.map((row) => {
    const idx = allColumns.indexOf(col);
    if (col.type === 'comp-formula' && col.formula) {
      return evalFormula(col.formula, row, allColumns);
    }
    return getCellNumber(row, idx);
  });

  if (values.length === 0) return '—';
  switch (operator) {
    case 'sum':   return fmt(values.reduce((a, b) => a + b, 0));
    case 'avg':   return fmt(values.reduce((a, b) => a + b, 0) / values.length);
    case 'min':   return fmt(Math.min(...values));
    case 'max':   return fmt(Math.max(...values));
    case 'count': return String(values.length);
    default:      return '';
  }
};

export const GridTable: React.FC<GridTableProps> = ({
  columns,
  data,
  settings,
  footerLabel,
  footerRows,
  onUpdateFooterRows,
  selectedElementId,
  onSelect,
  onDeleteColumn,
  onDrillDown,
  onDrop,
  onDragOver,
  onReorderColumns,
  t,
  language,
  isDraggingColumn,
}) => {
  const hasFooter = !!footerLabel || columns.some(c => c.footerAgg && c.footerAgg !== 'none');

  // Inline editing state for footer row titles
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editTitleDraft, setEditTitleDraft] = useState('');
  const [isDragOverTable, setIsDragOverTable] = useState(false);
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);

  const handleDragStartColumn = (e: React.DragEvent, id: string) => {
    e.stopPropagation();
    e.dataTransfer.setData('draggedColumnId', id);
  };

  const handleDragOverColumn = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropColumn = (e: React.DragEvent, targetId: string) => {
    const draggedId = e.dataTransfer.getData('draggedColumnId');
    if (draggedId) {
      e.preventDefault();
      e.stopPropagation();
      if (draggedId !== targetId) {
        onReorderColumns?.(draggedId, targetId);
      }
    }
  };

  const getAggLabel = (agg: AggType): string => {
    const map: Record<AggType, string> = {
      none: '—',
      sum: t('sum'),
      avg: t('avg'),
      min: t('minAgg'),
      max: t('maxAgg'),
      count: t('count'),
    };
    return map[agg] ?? agg;
  };

  const handleSaveTitle = (rowId: string) => {
    if (footerRows && onUpdateFooterRows) {
      const next = footerRows.map(r => r.id === rowId ? { ...r, title: editTitleDraft } : r);
      onUpdateFooterRows(next);
    }
    setEditingRowId(null);
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        {settings.showSearch ? (
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute start-2.5 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder={t('search')}
              className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded ps-8 pe-3 py-1.5 text-xs w-48 focus:outline-none focus:ring-1 focus:ring-indigo-400 text-start text-gray-800 dark:text-slate-100"
            />
          </div>
        ) : <div />}

        {settings.showAdd && (
          <button className="flex items-center gap-1 bg-indigo-600 dark:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm hover:bg-indigo-700 dark:hover:bg-indigo-600 hover:shadow transition-all">
            <Plus className="w-3.5 h-3.5" /> {t('add')}
          </button>
        )}
      </div>

      {/* Table */}
      <div 
        className={`overflow-x-auto rounded-xl border transition-all duration-200 ${
          isDragOverTable
            ? 'ring-2 ring-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/10 border-2 border-dashed border-indigo-500 dark:border-indigo-400 scale-[1.005]'
            : isDraggingColumn
            ? 'border-2 border-dashed border-indigo-300/40 dark:border-slate-800/80 bg-indigo-50/5 dark:bg-indigo-950/5 hover:border-indigo-300 dark:hover:border-indigo-500/50'
            : 'border-transparent'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOverTable(true);
          onDragOver(e);
        }}
        onDragLeave={() => {
          setIsDragOverTable(false);
        }}
        onDrop={(e) => {
          setIsDragOverTable(false);
          onDrop(e);
        }}
      >
        <table className="w-full text-sm text-start">
          {/* ── THEAD ── */}
          <thead>
            <tr className="text-gray-500 dark:text-slate-400 border-b border-gray-200 dark:border-slate-800">
              {settings.showCheckbox && (
                <th className="py-2 px-3 w-8">
                  <input type="checkbox" className="rounded text-indigo-500 dark:border-slate-700 dark:bg-slate-800" />
                </th>
              )}
              {columns.map(col => (
                <th
                  key={col.id}
                  draggable
                  onDragStart={(e) => handleDragStartColumn(e, col.id)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (dragOverColId !== col.id) {
                      setDragOverColId(col.id);
                    }
                  }}
                  onDragLeave={() => {
                    setDragOverColId(null);
                  }}
                  onDrop={(e) => {
                    setDragOverColId(null);
                    handleDropColumn(e, col.id);
                  }}
                  className={`py-2 ps-6 pe-3 font-semibold cursor-grab active:cursor-grabbing transition-all duration-200 ease-out relative group ${
                    dragOverColId === col.id
                      ? 'rtl:-translate-x-2.5 ltr:translate-x-2.5 bg-indigo-50 dark:bg-indigo-950/30 border-s-4 border-s-indigo-500 dark:border-s-indigo-400 ring-2 ring-indigo-500/15'
                      : selectedElementId === col.id
                      ? 'text-indigo-800 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/40 shadow-[inset_0_-3px_0_0_#6366f1]'
                      : 'hover:bg-indigo-50/50 dark:hover:bg-slate-800/40 hover:ring-2 hover:ring-inset hover:ring-indigo-300 dark:hover:ring-indigo-500/50 rounded-md'
                  }`}
                  onClick={(e) => { e.stopPropagation(); onSelect(col); }}
                >
                  {/* Glowing seam insert indicator when header is dragover target */}
                  {dragOverColId === col.id && (
                    <div className="absolute top-0 bottom-0 -start-1 w-1 bg-indigo-600 dark:bg-indigo-400 rounded-full z-20 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse pointer-events-none" />
                  )}
                  {/* Drag handle */}
                  <div className="absolute start-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-300 dark:text-slate-500 transition-opacity pointer-events-none">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1">
                      {col.type === 'comp-formula' && (
                        <FunctionSquare className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
                      )}
                      {col.name || col.label}
                      {col.required && <span className="text-red-500">*</span>}
                    </span>
                    <div className="flex items-center gap-1">
                      {/* Aggregation badge */}
                      {col.footerAgg && col.footerAgg !== 'none' && (
                        <span className="text-[9px] bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-400 px-1 rounded font-bold">
                          {getAggLabel(col.footerAgg)}
                        </span>
                      )}
                      {selectedElementId === col.id && (
                        <button
                          onClick={(e) => onDeleteColumn(e, col.id)}
                          className="p-1 bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                          title={t('deleteColumn')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </th>
              ))}
              <th className="py-2 px-3 w-10" />
            </tr>
          </thead>

          {/* ── TBODY ── */}
          <tbody>
            {columns.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-0 border-none"
                >
                  <div className={`my-4 py-12 text-center text-sm rounded-lg pointer-events-none transition-all border-2 border-dashed flex flex-col items-center justify-center gap-2 ${
                    isDragOverTable
                      ? 'border-indigo-500 text-indigo-600 bg-indigo-50/20 dark:border-indigo-400 dark:text-indigo-400 font-bold scale-[1.01]'
                      : 'border-gray-200 dark:border-slate-800 text-gray-400 dark:text-slate-500 bg-gray-50/50 dark:bg-slate-900/40'
                  }`}>
                    <Plus className={`w-5 h-5 transition-transform ${isDragOverTable ? 'scale-125 animate-bounce text-indigo-600 dark:text-indigo-400' : 'text-gray-300 dark:text-slate-600'}`} />
                    <span>{t('dragColumnsHere')}</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className="border-b border-gray-100 dark:border-slate-800/60 hover:bg-gray-50/80 dark:hover:bg-slate-800/10 transition group">
                  {settings.showCheckbox && (
                    <td className="py-2.5 px-3">
                      <input type="checkbox" className="rounded border-gray-300 dark:border-slate-700 dark:bg-slate-800 text-indigo-500" />
                    </td>
                  )}
                  {columns.map((col, idx) => {
                    let cellValue: string;
                    if (col.type === 'comp-formula' && col.formula) {
                      const result = evalFormula(col.formula, row, columns);
                      cellValue = fmt(result);
                    } else {
                      cellValue = idx === 0 ? row.name : idx === 1 ? `${row.probability}%` : '—';
                    }
                    return (
                      <td key={col.id} className="py-2.5 px-3 font-medium text-gray-700 dark:text-slate-300">
                        {cellValue}
                      </td>
                    );
                  })}
                  <td className="py-2.5 px-3 text-end">
                    <button
                      onClick={(e) => { e.stopPropagation(); if (onDrillDown) onDrillDown(row); }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-md transition shadow-sm"
                      title={t('viewDetails')}
                    >
                      <span>{t('details')}</span>
                      {language === 'fa' ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>

          {/* ── TFOOT — multiple aggregation rows ── */}
          {footerRows && columns.length > 0 ? (
            <tfoot className="divide-y divide-gray-100 dark:divide-slate-800/40">
              {/* Spacer row to separate footer from table rows */}
              {footerRows.length > 0 && (
                <tr className="h-4 bg-transparent border-none select-none pointer-events-none">
                  <td colSpan={(settings.showCheckbox ? 1 : 0) + columns.length + 1} className="h-4 p-0 bg-transparent border-none" />
                </tr>
              )}
              {footerRows.map((row, rIdx) => {
                const isSelected = selectedElementId === row.id;
                return (
                  <tr
                    key={row.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect({
                        id: row.id,
                        type: 'grid-footer-row',
                        title: row.title,
                        operator: row.operator,
                        selectedColumns: row.selectedColumns
                      });
                    }}
                    className={`cursor-pointer transition-all font-bold group ${
                      rIdx === 0 ? 'border-t-2 border-indigo-500/20 dark:border-indigo-500/40' : ''
                    } ${
                      isSelected
                        ? 'bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-300'
                        : 'bg-gray-50/50 dark:bg-slate-900/30 text-gray-700 dark:text-slate-200 hover:bg-gray-100/50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {settings.showCheckbox && <td className="py-2 px-3" />}
                    {columns.map((col, idx) => {
                      const isTarget = row.selectedColumns.includes(col.id);
                      const isNumeric = col.type === 'comp-number' || col.type === 'comp-formula';
                      const canCalculate = isTarget && (row.operator === 'count' || isNumeric);
                      const aggValue = canCalculate ? computeAggValue(col, data, columns, row.operator) : '';

                      return (
                        <td key={col.id} className="py-2 px-3 text-xs font-bold">
                          {idx === 0 ? (
                            editingRowId === row.id ? (
                              <input
                                autoFocus
                                value={editTitleDraft}
                                onChange={(e) => setEditTitleDraft(e.target.value)}
                                onBlur={() => handleSaveTitle(row.id)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveTitle(row.id);
                                  if (e.key === 'Escape') setEditingRowId(null);
                                }}
                                className="bg-transparent border-b border-indigo-400 dark:border-indigo-500 outline-none w-full font-bold dark:text-slate-100"
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <span
                                onDoubleClick={(e) => {
                                  e.stopPropagation();
                                  setEditingRowId(row.id);
                                  setEditTitleDraft(row.title);
                                }}
                                className="cursor-text hover:underline text-gray-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold"
                                title={t('doubleClickToRename')}
                              >
                                {row.title || getAggLabel(row.operator)}
                              </span>
                            )
                          ) : aggValue ? (
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">{aggValue}</span>
                          ) : (
                            <span className="text-gray-300 dark:text-slate-700 font-bold">—</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="py-2 px-3 text-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onUpdateFooterRows) {
                            const nextRows = footerRows.filter((r) => r.id !== row.id);
                            onUpdateFooterRows(nextRows);
                          }
                        }}
                        className={`p-1 text-gray-400 hover:text-red-500 rounded transition-all cursor-pointer group-hover:opacity-100 ${
                          isSelected ? 'opacity-100' : 'opacity-0'
                        }`}
                        title={t('deleteRow')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {/* Button to add a new footer row */}
              <tr className="bg-transparent border-none">
                <td colSpan={(settings.showCheckbox ? 1 : 0) + columns.length + 1} className="py-2 px-3 text-start border-none">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onUpdateFooterRows) {
                        const newRow = {
                          id: `footer_${Date.now()}`,
                          title: language === 'fa' ? 'جمع' : 'Sum',
                          operator: 'sum',
                          selectedColumns: []
                        };
                        onUpdateFooterRows([...footerRows, newRow]);
                        // Select it immediately so that settings panel opens for it
                        onSelect({
                          id: newRow.id,
                          type: 'grid-footer-row',
                          title: newRow.title,
                          operator: newRow.operator,
                          selectedColumns: newRow.selectedColumns
                        });
                      }
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors py-1 px-2 hover:bg-indigo-50 dark:hover:bg-slate-800/50 rounded cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {language === 'fa' ? 'افزودن سطر محاسباتی' : 'Add Computational Row'}
                  </button>
                </td>
              </tr>
            </tfoot>
          ) : (
            /* Fallback to old footer if footerRows is not provided */
            hasFooter && columns.length > 0 && (
              <tfoot className="">
                {/* Spacer row to separate footer from table rows */}
                <tr className="h-4 bg-transparent border-none select-none pointer-events-none">
                  <td colSpan={(settings.showCheckbox ? 1 : 0) + columns.length + 1} className="h-4 p-0 bg-transparent border-none" />
                </tr>
                <tr className="font-bold border-t-2 border-indigo-500/20 dark:border-indigo-500/40 bg-gray-50/50 dark:bg-slate-900/30">
                  {settings.showCheckbox && <td className="py-2 px-3" />}
                  {columns.map((col, idx) => {
                    const aggValue = computeAgg(col, data, columns);
                    return (
                      <td key={col.id} className="py-2 px-3 text-xs font-bold">
                        {idx === 0 ? (
                          <span className="text-gray-700 dark:text-slate-200 font-bold">
                            {footerLabel || getAggLabel(col.footerAgg ?? 'none') || ''}
                          </span>
                        ) : aggValue ? (
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold">{aggValue}</span>
                        ) : null}
                      </td>
                    );
                  })}
                  <td className="py-2 px-3" />
                </tr>
              </tfoot>
            )
          )}
        </table>
      </div>
    </>
  );
};
