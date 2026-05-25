import React from 'react';
import { PropertyField } from '../shared/PropertyField';
import { ToggleSwitch } from '../shared/ToggleSwitch';
import { TextFieldSettings } from './TextFieldSettings';
import { FormulaBuilder } from '../shared/FormulaBuilder';

interface FieldSettingsProps {
  selectedElement: any;
  updateElementProp: (prop: string, value: any) => void;
  currentEntityName: string;
  availableFieldsOptions: string[];
  availableFieldsLabels: string[];
  currentEntityFieldsObj: any[];
  numericColumns: any[];
  t: (key: string) => string;
  entities?: Record<string, { name: string; fields: any[] }>;
  language: 'fa' | 'en';
}

export const FieldSettings: React.FC<FieldSettingsProps> = ({
  selectedElement,
  updateElementProp,
  currentEntityName,
  availableFieldsOptions,
  availableFieldsLabels,
  currentEntityFieldsObj,
  numericColumns,
  t,
  entities,
  language
}) => {
  return (
    <div className="space-y-4 text-start">
      {/* 1. Data Binding Group */}
      {selectedElement.type !== 'comp-formula' && (
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-gray-800 dark:text-slate-200">
            {language === 'fa' ? 'اتصال داده' : 'Data Binding'}
          </h4>
          <PropertyField 
            label="موجودیت متصل" 
            type="text" 
            value={currentEntityName || 'نامشخص'} 
            onChange={() => {}} 
            disabled={true}
          />
          <PropertyField 
            label="اتصال به فیلد موجودیت" 
            type="select" 
            value={selectedElement.boundSystemField || ''} 
            options={['', ...availableFieldsOptions]} 
            optionsLabels={['-- انتخاب فیلد --', ...availableFieldsLabels]} 
            onChange={(val) => {
              updateElementProp('boundSystemField', val);
              const fieldDef = currentEntityFieldsObj.find((f: any) => f.id === val);
              if (fieldDef) {
                 updateElementProp('label', fieldDef.label);
                 updateElementProp('name', fieldDef.name);
                 updateElementProp('type', fieldDef.type);
              }
            }} 
          />
        </div>
      )}

      {/* 2. Validation & Access Group */}
      <div className="pt-3.5 border-t border-gray-100 dark:border-slate-800/60 space-y-2">
        <h4 className="text-xs font-bold text-gray-800 dark:text-slate-200">
          {language === 'fa' ? 'اعتبارسنجی و دسترسی' : 'Access & Validation'}
        </h4>
        <div className="space-y-2">
          <ToggleSwitch 
            label="نمایش" 
            checked={selectedElement.visible !== false} 
            onChange={(val) => {
              if (!val && selectedElement.required) {
                alert('فیلدی که اجباری است نمیتواند غیر قابل نمایش باشد');
                return;
              }
              updateElementProp('visible', val);
            }} 
          />
          <ToggleSwitch 
            label="الزامی بودن" 
            checked={!!selectedElement.required} 
            onChange={(val) => {
              if (val && selectedElement.visible === false) {
                alert('اگر فیلدی نمایش آن غیر فعال بود نمیتوان اجباری باشد');
                return;
              }
              updateElementProp('required', val);
              if (val && selectedElement.editable === false) {
                updateElementProp('editable', true);
              }
            }} 
          />
          <ToggleSwitch 
            label="قابل ویرایش" 
            checked={selectedElement.editable !== false} 
            onChange={(val) => {
              if (!val && selectedElement.required) {
                alert('امکان غیرفعال کردن ویرایش در حالت اجباری وجود ندارد');
                return;
              }
              updateElementProp('editable', val);
            }} 
          />
        </div>
      </div>

      {/* 3. Appearance & Layout Group */}
      <div className="pt-3.5 border-t border-gray-100 dark:border-slate-800/60 space-y-2.5">
        <h4 className="text-xs font-bold text-gray-800 dark:text-slate-200">
          {language === 'fa' ? 'ظاهر و چیدمان' : 'Layout & Appearance'}
        </h4>
        <PropertyField 
          label="متن راهنما (Helper Text)" 
          type="text" 
          value={selectedElement.placeholder || ''} 
          onChange={(val) => updateElementProp('placeholder', val)} 
        />

        {selectedElement._groupId && (
          <PropertyField 
            label={language === 'fa' ? 'عرض فیلد (تعداد ستون)' : 'Field Width (Span)'} 
            type="select" 
            value={String(selectedElement.colSpan || 1)} 
            options={Array.from({ length: selectedElement._groupColumns || 5 }, (_, i) => String(i + 1))} 
            optionsLabels={Array.from({ length: selectedElement._groupColumns || 5 }, (_, i) => {
              const cols = i + 1;
              const total = selectedElement._groupColumns || 5;
              return language === 'fa' 
                ? `${cols} از ${total} ستون` 
                : `${cols} of ${total} columns`;
            })}
            onChange={(val) => updateElementProp('colSpan', Number(val))} 
          />
        )}
      </div>

      {/* 4. Specialized Group */}
      {['comp-text', 'comp-number', 'comp-select', 'comp-check', 'comp-relation', 'comp-formula'].includes(selectedElement.type) && (
        <div className="pt-3.5 border-t border-gray-100 dark:border-slate-800/60 space-y-2.5">
          <h4 className="text-xs font-bold text-gray-800 dark:text-slate-200">
            {language === 'fa' ? 'تنظیمات اختصاصی' : 'Specialized Settings'}
          </h4>

          {selectedElement.type === 'comp-text' && (
            <TextFieldSettings 
              selectedElement={selectedElement} 
              updateElementProp={updateElementProp} 
            />
          )}
          
          {selectedElement.type === 'comp-number' && (
            <div className="space-y-2.5">
              <PropertyField label="حداقل مقدار" type="text" value={selectedElement.min || ''} onChange={(val) => updateElementProp('min', val)} />
              <PropertyField label="حداکثر مقدار" type="text" value={selectedElement.max || ''} onChange={(val) => updateElementProp('max', val)} />
            </div>
          )}

          {selectedElement.type === 'comp-select' && (
            <div className="space-y-2.5">
              <PropertyField label="منبع داده" type="select" value={selectedElement.dataSource || 'static'} options={['static', 'dynamic']} optionsLabels={['مقادیر ثابت', 'داینامیک (API)']} onChange={(val) => updateElementProp('dataSource', val)} />
              {selectedElement.dataSource !== 'dynamic' && (
                 <PropertyField label="گزینه‌های لیست" type="text" value={selectedElement.optionsList || ''} onChange={(val) => updateElementProp('optionsList', val)} />
              )}
            </div>
          )}
          
          {selectedElement.type === 'comp-check' && (
            <div className="space-y-2.5">
              <PropertyField label="متن چک‌باکس" type="text" value={selectedElement.checkText || selectedElement.label} onChange={(val) => updateElementProp('checkText', val)} />
            </div>
          )}

          {selectedElement.type === 'comp-relation' && (
            <div className="space-y-2.5">
              <PropertyField 
                label="موجودیت مرتبط (Target Entity)" 
                type="select" 
                value={selectedElement.relatedEntity || ''} 
                options={['', ...Object.keys(entities || {})]} 
                optionsLabels={['-- انتخاب موجودیت --', ...Object.values(entities || {}).map((e: any) => e.name)]} 
                onChange={(val) => updateElementProp('relatedEntity', val)} 
              />
            </div>
          )}

          {selectedElement.type === 'comp-formula' && (
            <div className="space-y-2.5">
              <PropertyField 
                label="عنوان ستون" 
                type="text" 
                value={selectedElement.label || selectedElement.name || ''} 
                onChange={(val) => {
                  updateElementProp('name', val);
                  updateElementProp('label', val);
                }} 
              />
              <FormulaBuilder 
                formula={selectedElement.formula || { segments: [], ops: [] }}
                numericColumns={numericColumns || []}
                onChange={(val) => updateElementProp('formula', val)}
                t={t}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
