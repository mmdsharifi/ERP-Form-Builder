import React, { useState } from 'react';
import { PropertyField } from '../shared/PropertyField';
import { ToggleSwitch } from '../shared/ToggleSwitch';
import { MultiSelectDropdown } from '../shared/MultiSelectDropdown';

interface TabPanelSettingsProps {
  selectedElement: any;
  updateElementProp: (prop: string, value: any) => void;
  setSelectedElement: (el: any) => void;
  selectedElementId?: string;
  language: 'fa' | 'en';
  t: (key: string) => string;
  entities: Record<string, { name: string; fields: any[] }>;
}

export const TabPanelSettings: React.FC<TabPanelSettingsProps> = ({
  selectedElement,
  updateElementProp,
  setSelectedElement,
  selectedElementId,
  language,
  t,
  entities,
}) => {
  const [editingFooterRow, setEditingFooterRow] = useState<any | null>(null);

  const updateFooterRowInTab = (updatedRow: any) => {
    const currentRows = selectedElement.footerRows || [];
    const nextRows = currentRows.map((r: any) => r.id === updatedRow.id ? updatedRow : r);
    updateElementProp('footerRows', nextRows);
  };
  return (
    <>
      <PropertyField 
        label="عنوان تب/پنل" 
        type="text" 
        value={selectedElement.label || selectedElement.title || ''} 
        onChange={(val) => { 
          updateElementProp('title', val); 
          updateElementProp('label', val); 
        }} 
        info="نامی که روی تب مورد نظر نمایش داده خواهد شد." 
      />
      <PropertyField 
        label="اتصال موجودیت" 
        info="اتصال این تب به یک جدول یا رفرنس در دیتابیس." 
        type="select" 
        value={selectedElement.boundEntity || ''} 
        options={['', ...Object.keys(entities)]} 
        optionsLabels={['-- قطع اتصال --', ...Object.keys(entities).map(k => entities[k].name)]} 
        onChange={(val) => {
          const fields = (entities as any)[val]?.fields || [];
          updateElementProp('boundEntity', val);
          updateElementProp('gridColumns', fields);
          updateElementProp('groups', [{ id: `l3g_base_${Date.now()}`, name: 'اطلاعات پایه', columns: 2, fields: fields }]);
        }} 
      />
      <div className="pt-3 border-t border-gray-100 dark:border-slate-800/60">
        {selectedElement._context !== 'l2' && (
          <div className="mb-3.5">
            <PropertyField
              label={language === 'fa' ? 'نوع نمایش' : 'View Type'}
              type="select"
              value={selectedElement.viewType || 'grid'}
              options={['grid', 'form']}
              optionsLabels={language === 'fa' ? ['جدول (Grid)', 'فرم (Form)'] : ['Grid (Table)', 'Form']}
              onChange={(val) => updateElementProp('viewType', val)}
            />
          </div>
        )}

        {(selectedElement.viewType === 'grid' || selectedElement._context === 'l2') && (
          <div className="space-y-3.5">
            <div className="space-y-0.5">
              <ToggleSwitch 
                label="افزودن" 
                checked={!!selectedElement.gridSettings?.showAdd} 
                onChange={(val) => updateElementProp('gridSettings', {...selectedElement.gridSettings, showAdd: val})} 
                info="نمایش دکمه ایجاد رکوردهای جدید در جدول." 
              />
              <ToggleSwitch 
                label="جستجو" 
                checked={!!selectedElement.gridSettings?.showSearch} 
                onChange={(val) => updateElementProp('gridSettings', {...selectedElement.gridSettings, showSearch: val})} 
                info="نمایش کادر جستجو برای فیلتر کردن رکوردهای جدول." 
              />
              <ToggleSwitch 
                label="انتخاب" 
                checked={!!selectedElement.gridSettings?.showCheckbox} 
                onChange={(val) => updateElementProp('gridSettings', {...selectedElement.gridSettings, showCheckbox: val})} 
                info="امکان انتخاب تکی یا دسته‌جمعی ردیف‌های جدول." 
              />
            </div>
            {/* Grid Footer Rows Management */}
            <div className="pt-3 border-t border-gray-100 dark:border-slate-800/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-800 dark:text-slate-200">
                  {language === 'fa' ? 'سطرهای فوتر' : 'Footer Rows'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const newRow = {
                      id: `footer_${Date.now()}`,
                      title: language === 'fa' ? 'جمع' : 'Sum',
                      operator: 'sum',
                      selectedColumns: []
                    };
                    const currentRows = selectedElement.footerRows || [];
                    updateElementProp('footerRows', [...currentRows, newRow]);
                    setEditingFooterRow(newRow);
                  }}
                  className="text-xs font-bold text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  {language === 'fa' ? 'جدید' : 'New'}
                </button>
              </div>

              {/* Subtle footer rows list */}
              <div className="space-y-1">
                {(selectedElement.footerRows || []).map((row: any) => {
                  const isEditingThisRow = editingFooterRow?.id === row.id;
                  return (
                    <div 
                      key={row.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingFooterRow(row);
                      }}
                      className={`flex items-center justify-between py-1.5 px-0.5 border-b border-gray-100 dark:border-slate-800/60 cursor-pointer transition-all ${
                        isEditingThisRow 
                          ? 'text-indigo-650 dark:text-indigo-400 font-semibold' 
                          : 'text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100'
                      }`}
                    >
                      <div className="flex gap-2 text-right items-center">
                        <span className="text-xs">{row.title}</span>
                        <span className="text-[10px] text-gray-400 dark:text-slate-500 font-mono">({row.operator})</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const nextRows = selectedElement.footerRows.filter((r: any) => r.id !== row.id);
                          updateElementProp('footerRows', nextRows);
                          if (editingFooterRow?.id === row.id) setEditingFooterRow(null);
                        }}
                        className="text-[10px] text-gray-400 hover:text-red-500 cursor-pointer px-1"
                      >
                        {language === 'fa' ? 'حذف' : 'Delete'}
                      </button>
                    </div>
                  );
                })}
                {(selectedElement.footerRows || []).length === 0 && (
                  <div className="text-center py-2 text-xs text-gray-400 dark:text-slate-500">
                    {language === 'fa' ? 'سطر فوتری تعریف نشده است' : 'No footer rows defined'}
                  </div>
                )}
              </div>
            </div>

            {/* Inline Footer Row Editor */}
            {editingFooterRow && (() => {
              const columns = selectedElement.gridColumns || [];
              const isNumericOp = ['sum', 'avg', 'min', 'max'].includes(editingFooterRow.operator);
              const filteredColumns = columns.filter((col: any) => {
                if (!isNumericOp) return true;
                return col.type === 'comp-number' || col.type === 'comp-formula' || col.type === 'comp-grid-col';
              });

              return (
                <div className="pt-3 border-t border-gray-100 dark:border-slate-800/60 space-y-3 mt-3 text-start">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800 dark:text-slate-200">
                      {language === 'fa' ? 'تنظیمات سطر فوتر' : 'Footer Row Settings'}
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setEditingFooterRow(null)}
                      className="text-[10px] text-gray-400 hover:text-gray-650 cursor-pointer font-semibold"
                    >
                      {language === 'fa' ? 'بستن' : 'Close'}
                    </button>
                  </div>

                  <PropertyField
                    label={language === 'fa' ? 'عنوان سطر' : 'Row Title'}
                    type="text"
                    value={editingFooterRow.title || ''}
                    onChange={(val) => {
                      const next = { ...editingFooterRow, title: val };
                      setEditingFooterRow(next);
                      updateFooterRowInTab(next);
                    }}
                  />

                  <PropertyField
                    label={language === 'fa' ? 'نوع محاسبات' : 'Calculation'}
                    type="select"
                    value={editingFooterRow.operator || 'sum'}
                    options={['sum', 'avg', 'min', 'max', 'count']}
                    optionsLabels={
                      language === 'fa'
                        ? ['جمع (Sum)', 'میانگین (Average)', 'کمینه (Min)', 'بیشینه (Max)', 'تعداد (Count)']
                        : ['Sum', 'Average', 'Min', 'Max', 'Count']
                    }
                    onChange={(val) => {
                      const next = { ...editingFooterRow, operator: val };
                      setEditingFooterRow(next);
                      updateFooterRowInTab(next);
                    }}
                  />

                  <MultiSelectDropdown
                    label={language === 'fa' ? 'ستون‌های هدف' : 'Target Columns'}
                    columns={filteredColumns}
                    selectedValues={editingFooterRow.selectedColumns || []}
                    onChange={(val) => {
                      const next = { ...editingFooterRow, selectedColumns: val };
                      setEditingFooterRow(next);
                      updateFooterRowInTab(next);
                    }}
                    language={language}
                    t={t}
                  />
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </>
  );
};
