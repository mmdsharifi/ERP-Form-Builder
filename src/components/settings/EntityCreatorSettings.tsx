import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, AlertCircle } from 'lucide-react';
import { PropertyField } from '../shared/PropertyField';

interface FieldDef {
  id: string;
  name: string;
  label: string;
  type: string;
  required?: boolean;
  relatedEntity?: string;
}

interface EntityCreatorSettingsProps {
  selectedElement: any;
  setSelectedElement: (el: any) => void;
  entities: Record<string, { name: string; fields: any[] }>;
  addEntity: (systemName: string, name: string, fields: any[]) => void;
  language: 'fa' | 'en';
  t: (key: string) => string;
}

export const EntityCreatorSettings: React.FC<EntityCreatorSettingsProps> = ({
  selectedElement,
  setSelectedElement,
  entities,
  addEntity,
  language,
  t
}) => {
  const isEditing = selectedElement.id !== 'new_entity_creator';
  const initialSystemName = selectedElement.systemName || '';
  const initialDisplayName = selectedElement.title || '';
  const initialFields = selectedElement.fields || [];

  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [systemName, setSystemName] = useState(initialSystemName);
  const [fields, setFields] = useState<FieldDef[]>(initialFields);

  // Field creation state (inline popover)
  const [addingField, setAddingField] = useState(false);
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldId, setFieldId] = useState('');
  const [fieldType, setFieldType] = useState('comp-text');
  const [relatedEntity, setRelatedEntity] = useState('');

  // Validation states
  const [systemNameError, setSystemNameError] = useState('');
  const [fieldSystemNameError, setFieldSystemNameError] = useState('');

  useEffect(() => {
    setDisplayName(selectedElement.title || '');
    setSystemName(selectedElement.systemName || '');
    setFields(selectedElement.fields || []);
    setAddingField(false);
    setSystemNameError('');
    setFieldSystemNameError('');
  }, [selectedElement]);

  const handleSystemNameChange = (val: string) => {
    // English alphanumeric & underscores only
    const cleanVal = val.replace(/[^a-zA-Z0-9_]/g, '');
    setSystemName(cleanVal);

    if (!isEditing && entities[cleanVal]) {
      setSystemNameError(language === 'fa' ? 'این نام سیستمی قبلاً استفاده شده است' : 'System name already exists');
    } else {
      setSystemNameError('');
    }
  };

  const handleFieldIdChange = (val: string) => {
    const cleanVal = val.replace(/[^a-zA-Z0-9_]/g, '');
    setFieldId(cleanVal);

    if (fields.some(f => f.id === cleanVal)) {
      setFieldSystemNameError(language === 'fa' ? 'شناسه فیلد تکراری است' : 'Field ID already exists');
    } else {
      setFieldSystemNameError('');
    }
  };

  const handleAddField = () => {
    if (!fieldLabel.trim()) return;
    if (!fieldId.trim()) return;
    if (fields.some(f => f.id === fieldId)) return;
    if (fieldType === 'comp-relation' && !relatedEntity) return;

    const newField: FieldDef = {
      id: fieldId,
      name: fieldLabel,
      label: fieldLabel,
      type: fieldType,
      required: false,
      ...(fieldType === 'comp-relation' && { relatedEntity })
    };

    setFields([...fields, newField]);
    setAddingField(false);
    // Reset field form
    setFieldLabel('');
    setFieldId('');
    setFieldType('comp-text');
    setRelatedEntity('');
    setFieldSystemNameError('');
  };

  const handleRemoveField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleSaveEntity = () => {
    if (!displayName.trim() || !systemName.trim() || systemNameError) return;
    if (fields.length === 0) {
      alert(language === 'fa' ? 'لطفاً حداقل یک فیلد تعریف کنید' : 'Please define at least one field');
      return;
    }

    addEntity(systemName, displayName, fields);

    // Reset settings panel view
    setSelectedElement(null);
  };

  const getFieldTypeLabel = (type: string): string => {
    const map: Record<string, string> = {
      'comp-text': language === 'fa' ? 'متنی' : 'Text',
      'comp-number': language === 'fa' ? 'عددی' : 'Number',
      'comp-select': language === 'fa' ? 'کشویی' : 'Dropdown',
      'comp-check': language === 'fa' ? 'چک‌باکس' : 'Checkbox',
      'comp-relation': language === 'fa' ? 'رابطه‌ای' : 'Relation',
      'comp-date': language === 'fa' ? 'تاریخ' : 'Date'
    };
    return map[type] || type;
  };

  const isFormValid = displayName.trim() && systemName.trim() && !systemNameError && fields.length > 0;

  return (
    <div className="relative space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
        <h3 className="font-bold text-gray-700 dark:text-slate-200 text-sm">
          {isEditing 
            ? (language === 'fa' ? 'ویرایش موجودیت' : 'Edit Entity') 
            : (language === 'fa' ? 'تعریف موجودیت جدید' : 'Define New Entity')}
        </h3>
        <button
          type="button"
          onClick={() => setSelectedElement(null)}
          className="text-xs font-semibold text-gray-500 hover:text-indigo-650 dark:hover:text-indigo-400 cursor-pointer"
        >
          {language === 'fa' ? 'انصراف' : 'Cancel'}
        </button>
      </div>

      {/* Inputs */}
      <div className="space-y-3">
        <PropertyField
          label={language === 'fa' ? 'نام نمایشی موجودیت' : 'Display Name'}
          type="text"
          value={displayName}
          onChange={(val) => setDisplayName(val)}
          placeholder={language === 'fa' ? 'مانند: اطلاعات تماس' : 'e.g., Contact Info'}
        />

        <div className="relative">
          <PropertyField
            label={language === 'fa' ? 'نام سیستمی موجودیت (انگلیسی)' : 'System Name (English)'}
            type="text"
            value={systemName}
            onChange={handleSystemNameChange}
            disabled={isEditing}
            placeholder={language === 'fa' ? 'مانند: contact_info' : 'e.g., contact_info'}
          />
          {systemNameError && (
            <div className="flex items-center gap-1 mt-1 text-[10px] text-red-500 font-semibold">
              <AlertCircle className="w-3 h-3" />
              <span>{systemNameError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid Table of Fields */}
      <div className="pt-4 border-t border-gray-100 dark:border-slate-800 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-gray-800 dark:text-slate-200">
            {language === 'fa' ? 'فیلدهای موجودیت' : 'Entity Fields'}
          </span>
          <button
            type="button"
            onClick={() => setAddingField(true)}
            className="text-xs font-bold text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-250 cursor-pointer"
          >
            {language === 'fa' ? 'فیلد جدید' : 'New Field'}
          </button>
        </div>

        {/* Fields Grid List */}
        <div className="border border-gray-100 dark:border-slate-850/80 rounded overflow-hidden max-h-60 overflow-y-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-gray-50 dark:bg-slate-900/60 text-gray-500 dark:text-slate-400 font-semibold border-b border-gray-100 dark:border-slate-800">
              <tr>
                <th className="py-2 px-2.5 text-right font-semibold">{language === 'fa' ? 'نام نمایشی' : 'Display'}</th>
                <th className="py-2 px-2.5 text-right font-semibold">{language === 'fa' ? 'نوع' : 'Type'}</th>
                <th className="py-2 px-2.5 text-center font-semibold w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800/40">
              {fields.map((f) => (
                <tr key={f.id} className="text-gray-700 dark:text-slate-300 hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="py-2 px-2.5 font-medium">
                    <div className="flex flex-col text-right">
                      <span>{f.label}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{f.id}</span>
                    </div>
                  </td>
                  <td className="py-2 px-2.5 font-medium">
                    <div className="flex flex-col text-right">
                      <span>{getFieldTypeLabel(f.type)}</span>
                      {f.type === 'comp-relation' && f.relatedEntity && (
                        <span className="text-[9px] text-indigo-500 dark:text-indigo-400 font-semibold">
                          ➔ {(entities[f.relatedEntity]?.name || f.relatedEntity)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveField(f.id)}
                      className="text-[10px] text-gray-400 hover:text-red-500 transition-colors cursor-pointer px-1 py-0.5"
                    >
                      {language === 'fa' ? 'حذف' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
              {fields.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-gray-400 dark:text-slate-500">
                    {language === 'fa' ? 'هنوز فیلدی تعریف نشده است' : 'No fields defined yet'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save Button */}
      <button
        type="button"
        disabled={!isFormValid}
        onClick={handleSaveEntity}
        className={`w-full py-2 rounded text-xs font-semibold shadow-sm transition-all cursor-pointer ${
          isFormValid
            ? 'bg-gray-800 hover:bg-gray-900 text-white dark:bg-slate-700 dark:hover:bg-slate-650'
            : 'bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed'
        }`}
      >
        {language === 'fa' ? 'ثبت موجودیت' : 'Save Entity'}
      </button>

      {/* Inline Field Creator Popover */}
      {addingField && (
        <div 
          className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 z-20 p-5 flex flex-col justify-between"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
              <h4 className="font-bold text-gray-850 dark:text-slate-200 text-xs">
                {language === 'fa' ? 'افزودن فیلد جدید' : 'Add New Field'}
              </h4>
            </div>

            <div className="space-y-3">
              <PropertyField
                label={language === 'fa' ? 'نام نمایشی فیلد' : 'Field Label'}
                type="text"
                value={fieldLabel}
                onChange={(val) => {
                  setFieldLabel(val);
                  // Auto-generate system ID if empty/not touched
                  if (!fieldId) {
                    const guessed = val.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
                    setFieldId(guessed);
                  }
                }}
                placeholder={language === 'fa' ? 'مانند: سن کاربر' : 'e.g., User Age'}
              />

              <div className="relative">
                <PropertyField
                  label={language === 'fa' ? 'نام سیستمی فیلد (انگلیسی)' : 'Field ID (English)'}
                  type="text"
                  value={fieldId}
                  onChange={handleFieldIdChange}
                  placeholder={language === 'fa' ? 'مانند: user_age' : 'e.g., user_age'}
                />
                {fieldSystemNameError && (
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-red-500 font-semibold">
                    <span>{fieldSystemNameError}</span>
                  </div>
                )}
              </div>

              <PropertyField
                label={language === 'fa' ? 'نوع فیلد' : 'Field Type'}
                type="select"
                value={fieldType}
                options={['comp-text', 'comp-number', 'comp-select', 'comp-check', 'comp-relation', 'comp-date']}
                optionsLabels={
                  language === 'fa'
                    ? ['متنی (Text)', 'عددی (Number)', 'کشویی (Dropdown)', 'چک‌باکس (Checkbox)', 'رابطه‌ای (Relation)', 'تاریخ (Date)']
                    : ['Text', 'Number', 'Dropdown', 'Checkbox', 'Relation', 'Date']
                }
                onChange={(val) => {
                  setFieldType(val);
                  if (val !== 'comp-relation') setRelatedEntity('');
                }}
              />

              {fieldType === 'comp-relation' && (
                <PropertyField
                  label={language === 'fa' ? 'موجودیت مرتبط' : 'Related Entity'}
                  type="select"
                  value={relatedEntity}
                  options={['', ...Object.keys(entities)]}
                  optionsLabels={['-- انتخاب کنید --', ...Object.keys(entities).map(k => entities[k].name)]}
                  onChange={(val) => setRelatedEntity(val)}
                />
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleAddField}
              disabled={!fieldLabel.trim() || !fieldId.trim() || !!fieldSystemNameError || (fieldType === 'comp-relation' && !relatedEntity)}
              className="flex-1 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded text-xs font-semibold shadow-sm transition-all disabled:bg-gray-100 disabled:text-gray-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-500 cursor-pointer"
            >
              {language === 'fa' ? 'تایید' : 'Add'}
            </button>
            <button
              type="button"
              onClick={() => setAddingField(false)}
              className="flex-1 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 rounded text-xs font-semibold transition-all cursor-pointer"
            >
              {language === 'fa' ? 'انصراف' : 'Cancel'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
