import React from 'react';
import { PropertyField } from '../shared/PropertyField';
import { MultiSelectDropdown } from '../shared/MultiSelectDropdown';

interface GridFooterRowSettingsProps {
  selectedElement: any;
  updateElementProp: (prop: string, value: any) => void;
  setSelectedElement: (el: any) => void;
  level2Tabs: any[];
  language: 'fa' | 'en';
  t: (key: string) => string;
}

export const GridFooterRowSettings: React.FC<GridFooterRowSettingsProps> = ({
  selectedElement,
  updateElementProp,
  setSelectedElement,
  level2Tabs,
  language,
  t
}) => {
  const tabId = selectedElement._tabId;
  const context = 'l2';
  const tab = level2Tabs.find(t => t.id === tabId);
  const columns = tab?.gridColumns || [];

  const isNumericOp = ['sum', 'avg', 'min', 'max'].includes(selectedElement.operator);
  const filteredColumns = columns.filter(col => {
    if (!isNumericOp) return true;
    return col.type === 'comp-number' || col.type === 'comp-formula';
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
        <h3 className="font-bold text-gray-700 dark:text-slate-200 text-sm">
          {language === 'fa' ? 'تنظیمات سطر تجمیعی' : 'Summary Row Settings'}
        </h3>
        <button
          type="button"
          onClick={() => {
            const pTab = level2Tabs.find(t => t.id === tabId);
            if (pTab) {
              setSelectedElement({
                ...pTab,
                id: `${context}-panel-${tabId}`,
                type: `container-${context}-panel`,
                label: pTab.title,
                _tabId: tabId,
                _context: context
              });
            }
          }}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
        >
          {language === 'fa' ? '← بازگشت به تب' : '← Back to Tab'}
        </button>
      </div>

      <PropertyField
        label={language === 'fa' ? 'عنوان سطر' : 'Row Title'}
        type="text"
        value={selectedElement.title || ''}
        onChange={(val) => updateElementProp('title', val)}
      />

      <PropertyField
        label={language === 'fa' ? 'نوع محاسبات' : 'Calculation'}
        type="select"
        value={selectedElement.operator || 'sum'}
        options={['sum', 'avg', 'min', 'max', 'count']}
        optionsLabels={
          language === 'fa'
            ? ['جمع (Sum)', 'میانگین (Average)', 'کمینه (Min)', 'بیشینه (Max)', 'تعداد (Count)']
            : ['Sum', 'Average', 'Min', 'Max', 'Count']
        }
        onChange={(val) => updateElementProp('operator', val)}
      />

      <MultiSelectDropdown
        label={language === 'fa' ? 'ستون‌های هدف' : 'Target Columns'}
        columns={filteredColumns}
        selectedValues={selectedElement.selectedColumns || []}
        onChange={(val) => updateElementProp('selectedColumns', val)}
        language={language}
        t={t}
      />
    </div>
  );
};
