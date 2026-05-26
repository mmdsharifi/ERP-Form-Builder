import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2, X, AlertCircle, Save, Database, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
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
  entities: Record<string, { name: string; fields: any[]; status?: string }>;
  addEntity: (systemName: string, name: string, fields: any[], status?: string) => void;
  language: 'fa' | 'en';
  t: (key: string) => string;
  autoBindCreatedEntity?: (backElement: any, entityKey: string, fields: any[]) => void;
}

export const EntityCreatorSettings: React.FC<EntityCreatorSettingsProps> = ({
  selectedElement,
  setSelectedElement,
  entities,
  addEntity,
  language,
  t,
  autoBindCreatedEntity
}) => {
  const isEditing = selectedElement.id !== 'new_entity_creator';
  const initialSystemName = selectedElement.systemName || '';
  const initialDisplayName = selectedElement.title || '';
  const initialFields = selectedElement.fields || [];

  // Entity-level status loaded from entities object if editing, otherwise defaults to draft
  const initialStatus = isEditing 
    ? (entities[initialSystemName]?.status || 'published') 
    : 'draft';

  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [systemName, setSystemName] = useState(initialSystemName);
  const [entityStatus, setEntityStatus] = useState<'draft' | 'published' | 'disabled'>(initialStatus as any);
  const [fields, setFields] = useState<FieldDef[]>([]);

  // Popover state for creating/editing a field
  const [editingField, setEditingField] = useState<(FieldDef & { isNew?: boolean }) | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; height: number; left: number; right: number } | null>(null);

  // Validation states
  const [systemNameError, setSystemNameError] = useState('');

  useEffect(() => {
    setDisplayName(selectedElement.title || '');
    setSystemName(selectedElement.systemName || '');
    
    const loadedFields = selectedElement.fields || [];
    setFields(loadedFields);
    setSystemNameError('');
    setEditingField(null);

    // Sync status when selected element changes
    const elementSystemName = selectedElement.systemName;
    const currentStatus = elementSystemName && entities[elementSystemName]
      ? (entities[elementSystemName].status || 'published')
      : 'draft';
    setEntityStatus(currentStatus as any);
  }, [selectedElement, entities]);

  const handleSystemNameChange = (val: string) => {
    // English alphanumeric & underscores only
    const cleanVal = val.replace(/[^a-zA-Z0-9_]/g, '');
    setSystemName(cleanVal);

    if (!isEditing && entities[cleanVal]) {
      setSystemNameError(t('alertSystemNameExists'));
    } else {
      setSystemNameError('');
    }
  };

  const handleAddNewDraftField = (e: React.MouseEvent) => {
    // If the entity is currently published, adding a field automatically switches the status to draft
    if (entityStatus === 'published') {
      setEntityStatus('draft');
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setPopoverPosition({
      top: rect.top,
      height: rect.height,
      left: rect.left,
      right: rect.right
    });
    setEditingField({
      id: `field_${Date.now()}`,
      label: '',
      name: '',
      type: 'comp-text',
      status: 'draft',
      isNew: true
    } as any);
  };

  const handleRemoveField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
    if (editingField?.id === id) setEditingField(null);
  };

  const handleSaveEntity = () => {
    if (!displayName.trim() || !systemName.trim() || systemNameError) return;
    if (fields.length === 0) {
      alert(t('alertDefineAtLeastOneField'));
      return;
    }

    // Save entity with current entity status
    addEntity(systemName, displayName, fields, entityStatus);

    const backEl = selectedElement._backElement;

    // Auto-bind if creating a new entity and a backElement is present
    if (!isEditing && backEl && autoBindCreatedEntity) {
      autoBindCreatedEntity(backEl, systemName, fields);
    }

    // Go back to the calling panel with updated bind references
    if (backEl) {
      let nextBackEl = { ...backEl };
      if (nextBackEl.type === 'container-main') {
        nextBackEl.boundEntity = systemName;
      } else if (nextBackEl.type === 'container-l2-panel') {
        nextBackEl.boundEntity = systemName;
        nextBackEl.gridColumns = fields;
        nextBackEl.groups = [{ 
          id: `l3g_base_${Date.now()}`, 
          name: 'اطلاعات پایه', 
          columns: 2, 
          fields 
        }];
      }
      setSelectedElement(nextBackEl);
    } else {
      setSelectedElement(null);
    }
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

  // Perform form validation
  const hasFieldErrors = fields.some(f => {
    if (!f.label.trim()) return true;
    if (!f.id.trim() || f.id.startsWith('field_')) return true;
    const isDuplicate = fields.some(other => other.id === f.id && other !== f);
    if (isDuplicate) return true;
    if (f.type === 'comp-relation' && !f.relatedEntity) return true;
    return false;
  });

  const isFormValid = displayName.trim() && systemName.trim() && !systemNameError && fields.length > 0 && !hasFieldErrors;
  const isPublished = entityStatus === 'published';

  return (
    <div className="relative space-y-5 text-start">
      {/* Header with status dropdown on the left & actions on the right */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-slate-800/80">
        {/* Status Dropdown in Header Left corner */}
        <div className="w-[110px] relative">
          <select
            disabled={isPublished}
            value={entityStatus}
            onChange={(e) => setEntityStatus(e.target.value as any)}
            className="w-full appearance-none bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded ps-2.5 pe-7 py-1 text-[11px] font-bold text-gray-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500 dark:focus:border-slate-500 transition-all cursor-pointer shadow-xs"
          >
            <option value="draft" className="dark:bg-slate-900">{t('draft')}</option>
            <option value="published" className="dark:bg-slate-900">{t('published')}</option>
            <option value="disabled" className="dark:bg-slate-900">{t('disabled')}</option>
          </select>
          <div className="absolute inset-y-0 start-auto end-2 flex items-center pointer-events-none text-gray-400">
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Actions side-by-side */}
        <div className="flex items-center gap-1.5">
          {!isPublished && (
            <button
              type="button"
              disabled={!isFormValid}
              onClick={handleSaveEntity}
              className={`h-[28px] px-2.5 flex items-center justify-center gap-1 rounded-md border text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                isFormValid
                  ? 'border-indigo-200 bg-indigo-50/70 text-indigo-650 hover:bg-indigo-100 hover:text-indigo-750 dark:border-indigo-900/40 dark:bg-indigo-950/20 dark:text-indigo-400 dark:hover:bg-indigo-900/30'
                  : 'border-gray-200 bg-gray-50 text-gray-400 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-600 cursor-not-allowed shadow-none opacity-50'
              }`}
              title={t('save')}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{t('save')}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setSelectedElement(selectedElement._backElement || null)}
            className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={t('cancel')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main entity inputs */}
      <div className="space-y-3.5">
        <PropertyField
          label={t('entityDisplayName')}
          type="text"
          disabled={isPublished}
          value={displayName}
          onChange={(val) => setDisplayName(val)}
          placeholder={language === 'fa' ? 'مانند: اطلاعات تماس' : 'e.g., Contact Info'}
        />

        <div className="relative">
          <PropertyField
            label={t('entitySystemName')}
            type="text"
            value={systemName}
            onChange={handleSystemNameChange}
            disabled={isEditing || isPublished}
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

      {/* Fields List Section */}
      <div className="pt-4 border-t border-gray-200 dark:border-slate-800/60 relative">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold text-gray-800 dark:text-slate-200">
            {t('entityFields')}
          </span>
          <button
            type="button"
            onClick={handleAddNewDraftField}
            className="p-1 rounded-md text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
            title={t('addNewField')}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Flat list of fields styled like cards */}
        <div className="space-y-2.5">
          {fields.map((f) => (
            <div 
              key={f.id}
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                setPopoverPosition({
                  top: rect.top,
                  height: rect.height,
                  left: rect.left,
                  right: rect.right
                });
                setEditingField({ ...f, isNew: false });
              }}
              className={`flex items-center justify-between py-2.5 px-3 rounded-xl border transition-all duration-150 group shadow-xs ${
                editingField?.id === f.id
                  ? 'bg-indigo-50/80 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 font-semibold border-indigo-200 dark:border-indigo-900/50 shadow-sm' 
                  : 'bg-white dark:bg-slate-900/60 border-gray-200 dark:border-slate-800/70 hover:bg-gray-50/50 dark:hover:bg-slate-800/40 hover:border-indigo-100 dark:hover:border-slate-700 text-gray-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex flex-col text-start min-w-0">
                  {/* Farsi Label */}
                  <span className="text-xs font-semibold truncate text-gray-800 dark:text-slate-200">
                    {t(f.id) || f.label || t('unnamedField')}
                  </span>
                  {/* English ID • Type format in small text */}
                  <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-gray-400 dark:text-slate-500 font-medium">
                    <span className="font-mono text-[9px] bg-gray-50 dark:bg-slate-850 px-1 py-0.5 rounded border border-gray-200 dark:border-slate-800">{f.id}</span>
                    <span className="text-gray-300 dark:text-slate-700">|</span>
                    <span>{getFieldTypeLabel(f.type)}</span>
                    {f.type === 'comp-relation' && f.relatedEntity && (
                      <>
                        <span className="text-gray-300 dark:text-slate-700">|</span>
                        <span className="text-indigo-500 dark:text-indigo-400 font-semibold truncate">
                          ➔ {t(f.relatedEntity) || (entities[f.relatedEntity]?.name || f.relatedEntity)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* Remove Action (Draft mode only, hidden in published status) */}
                {!isPublished && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveField(f.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 rounded p-1 text-gray-400 hover:text-red-500 cursor-pointer transition-opacity duration-150"
                    title={t('delete')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {fields.length === 0 && (
            <div className="py-8 px-4 text-center text-gray-450 dark:text-slate-400 text-xs border border-dashed border-gray-200 dark:border-slate-800 rounded-xl bg-gray-50/50 dark:bg-slate-900/10 flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Database className="w-5 h-5" />
              </div>
              <div className="max-w-[200px] leading-relaxed">
                {t('noFieldsDefined')}
              </div>
            </div>
          )}
        </div>

        {/* Popover Field Editor via Portal */}
        {editingField && popoverPosition && createPortal(
          <AnimatePresence>
            {(() => {
              const hasDuplicateId = fields.some(other => other.id === editingField.id && other.id !== (selectedElement.fields?.find((x: any) => x.id === editingField.id)?.id || editingField.id));
              const isFieldValid = editingField.label.trim() && editingField.id.trim() && !editingField.id.startsWith('field_') && !hasDuplicateId && (editingField.type !== 'comp-relation' || editingField.relatedEntity);

              // Compute vertical centering with clicked element
              const popoverHeight = 360;
              const viewportHeight = window.innerHeight;
              const middleY = popoverPosition.top + popoverPosition.height / 2;

              let top = middleY - 60;
              if (top < 10) top = 10;
              if (top + popoverHeight > viewportHeight - 10) {
                top = viewportHeight - popoverHeight - 10;
              }

              const arrowTop = middleY - top;

              return (
                <div 
                  dir={language === 'fa' ? 'rtl' : 'ltr'} 
                  className="font-vazir text-start fixed inset-0 z-[9999] pointer-events-none"
                >
                  {/* Backdrop overlay */}
                  <div 
                    className="absolute inset-0 bg-transparent pointer-events-auto cursor-default"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingField(null);
                    }}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, x: language === 'fa' ? -10 : 10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95, x: language === 'fa' ? -10 : 10 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    style={{ 
                      top: `${top}px`, 
                      left: language === 'fa'
                        ? `${popoverPosition.right + 12}px`
                        : `${popoverPosition.left - 280 - 12}px`,
                      width: '280px'
                    }}
                    className="absolute z-[10000] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-xl p-4 space-y-3.5 text-start pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Conditional Arrow orientation and placement */}
                    {language === 'fa' ? (
                      <div 
                        style={{ top: `${arrowTop}px` }} 
                        className="absolute left-[-6px] w-3 h-3 bg-white dark:bg-slate-900 border-t border-l border-gray-200 dark:border-slate-800 rotate-45 -translate-y-1/2" 
                      />
                    ) : (
                      <div 
                        style={{ top: `${arrowTop}px` }} 
                        className="absolute right-[-6px] w-3 h-3 bg-white dark:bg-slate-900 border-r border-b border-gray-200 dark:border-slate-800 rotate-45 -translate-y-1/2" 
                      />
                    )}

                    <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800/60">
                      <span className="text-xs font-bold text-gray-805 dark:text-slate-200">
                        {editingField.isNew
                          ? t('addNewField')
                          : t('editField')}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => setEditingField(null)}
                        className="p-1 rounded-md text-gray-400 hover:text-gray-650 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <PropertyField
                        label={t('fieldLabel')}
                        type="text"
                        disabled={isPublished}
                        value={editingField.label || ''}
                        onChange={(val) => {
                          let nextId = editingField.id;
                          if (editingField.id.startsWith('field_')) {
                            const guessed = val.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
                            if (guessed) nextId = guessed;
                          }
                          setEditingField({ ...editingField, label: val, name: val, id: nextId });
                        }}
                      />

                      <div className="relative">
                        <PropertyField
                          label={t('fieldId')}
                          type="text"
                          disabled={isPublished}
                          value={editingField.id.startsWith('field_') ? '' : editingField.id}
                          onChange={(val) => {
                            const cleanVal = val.replace(/[^a-zA-Z0-9_]/g, '');
                            setEditingField({ ...editingField, id: cleanVal });
                          }}
                        />
                        {!isPublished && hasDuplicateId && (
                          <div className="text-[9px] text-red-500 font-semibold mt-0.5">
                            {t('duplicateId')}
                          </div>
                        )}
                      </div>

                      <PropertyField
                        label={t('fieldType')}
                        type="select"
                        disabled={isPublished}
                        value={editingField.type || 'comp-text'}
                        options={['comp-text', 'comp-number', 'comp-select', 'comp-check', 'comp-relation', 'comp-date']}
                        optionsLabels={['comp-text', 'comp-number', 'comp-select', 'comp-check', 'comp-relation', 'comp-date'].map(type => getFieldTypeLabel(type))}
                        onChange={(val) => {
                          setEditingField({ ...editingField, type: val, relatedEntity: undefined });
                        }}
                      />

                      {editingField.type === 'comp-relation' && (
                        <PropertyField
                          label={t('targetEntity')}
                          type="select"
                          disabled={isPublished}
                          value={editingField.relatedEntity || ''}
                          options={['', ...Object.keys(entities).filter(k => k !== systemName)]}
                          optionsLabels={[t('selectOptionDropdown'), ...Object.keys(entities).filter(k => k !== systemName).map(k => t(k) || entities[k].name)]}
                          onChange={(val) => {
                            setEditingField({ ...editingField, relatedEntity: val });
                          }}
                        />
                      )}
                    </div>

                    {/* Popover Actions */}
                    {!isPublished && (
                      <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-slate-800/60">
                        <button
                          type="button"
                          disabled={!isFieldValid}
                          onClick={() => {
                            if (editingField.isNew) {
                              setFields([...fields, { ...editingField, isNew: undefined }]);
                            } else {
                              setFields(fields.map(f => f.id === editingField.id ? { ...editingField, isNew: undefined } : f));
                            }
                            setEditingField(null);
                          }}
                          className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-gray-100 disabled:text-gray-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-600 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{t('save')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingField(null)}
                          className="flex-1 py-1.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-750 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                        >
                          {t('cancel')}
                        </button>
                      </div>
                    )}
                  </motion.div>
                </div>
              );
            })()}
          </AnimatePresence>,
          document.body
        )}
      </div>
    </div>
  );
};
