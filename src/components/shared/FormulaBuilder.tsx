import React from 'react';
export interface FormulaSegment {
  type: 'column' | 'number';
  value: string;
}

export interface FormulaConfig {
  segments: FormulaSegment[];
  ops: Array<'+' | '-' | '*' | '/'>;
}

export type AggType = 'none' | 'sum' | 'avg' | 'min' | 'max' | 'count';

interface FormulaBuilderProps {
  formula: FormulaConfig;
  /** Numeric (or any) columns available as operands */
  numericColumns: Array<{ id: string; label: string }>;
  onChange: (formula: FormulaConfig) => void;
  t: (key: string) => string;
}

const OPS = ['+', '-', '*', '/'] as const;

export const FormulaBuilder: React.FC<FormulaBuilderProps> = ({ formula, numericColumns, onChange, t }) => {
  const segments = formula.segments?.length ? formula.segments : [{ type: 'number' as const, value: '1' }];
  const ops = formula.ops ?? [];

  const updateSeg = (i: number, patch: Partial<FormulaSegment>) => {
    const next = segments.map((s, idx) => idx === i ? { ...s, ...patch } : s);
    onChange({ segments: next, ops });
  };

  const updateOp = (i: number, op: string) => {
    const next = [...ops];
    next[i] = op as '+' | '-' | '*' | '/';
    onChange({ segments, ops: next });
  };

  const addTerm = () => {
    onChange({
      segments: [...segments, { type: 'number', value: '1' }],
      ops: [...ops, '*'],
    });
  };

  const removeTerm = (i: number) => {
    if (segments.length <= 1) return;
    const nextSegs = segments.filter((_, idx) => idx !== i);
    const opIdx = i === 0 ? 0 : i - 1;
    const nextOps = ops.filter((_, idx) => idx !== opIdx).slice(0, nextSegs.length - 1);
    onChange({ segments: nextSegs, ops: nextOps });
  };

  return (
    <div className="space-y-2 text-start">
      <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">{t('formulaCalculation')}</p>
      {numericColumns.length === 0 && segments.some(s => s.type === 'column') && (
        <p className="text-[10px] text-amber-600 bg-amber-50/20 dark:bg-amber-950/20 border border-amber-100/30 dark:border-amber-900/30 p-2 rounded text-start font-medium leading-relaxed">
          {t('noOtherColumns')}
        </p>
      )}
      {segments.map((seg, i) => (
        <div key={i}>
          {i > 0 && (
            <div className="flex justify-center my-1.5">
              <select
                value={ops[i - 1] ?? '+'}
                onChange={(e) => updateOp(i - 1, e.target.value)}
                className="w-12 border border-gray-200 dark:border-slate-700 rounded px-1 py-0.5 text-xs text-center bg-white dark:bg-slate-800 font-bold text-gray-600 dark:text-slate-300 focus:outline-none"
              >
                {OPS.map(op => <option key={op} value={op}>{op}</option>)}
              </select>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <select
              value={seg.type}
              onChange={(e) => {
                const tVal = e.target.value as 'column' | 'number';
                updateSeg(i, { type: tVal, value: tVal === 'column' ? (numericColumns[0]?.id ?? '') : '1' });
              }}
              className="border border-gray-200 dark:border-slate-700 rounded px-2 py-1 text-xs bg-white dark:bg-slate-800 dark:text-slate-200 flex-shrink-0 focus:outline-none cursor-pointer"
            >
              <option value="column">{t('column')}</option>
              <option value="number">{t('number')}</option>
            </select>
            {seg.type === 'column' ? (
              <select
                value={seg.value}
                onChange={(e) => updateSeg(i, { value: e.target.value })}
                className="flex-1 min-w-0 border border-gray-200 dark:border-slate-700 rounded px-2 py-1 text-xs bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none text-start cursor-pointer"
              >
                <option value="">{t('selectField')}</option>
                {numericColumns.map(col => (
                  <option key={col.id} value={col.id}>{col.label}</option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                value={seg.value}
                onChange={(e) => updateSeg(i, { value: e.target.value })}
                className="flex-1 min-w-0 border border-gray-200 dark:border-slate-700 rounded px-2 py-1 text-xs bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none text-start"
                placeholder={t('constantNumber')}
              />
            )}
            {segments.length > 1 && (
              <button
                type="button"
                onClick={() => removeTerm(i)}
                className="text-[10px] text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 cursor-pointer px-1 py-0.5"
              >
                {t('delete') || 'حذف'}
              </button>
            )}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addTerm}
        className="text-[11px] text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 pt-1 font-semibold cursor-pointer block"
      >
        + {t('addTerm')}
      </button>
    </div>
  );
};
