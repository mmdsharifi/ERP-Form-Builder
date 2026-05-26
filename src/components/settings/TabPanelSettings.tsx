import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X, Trash2, GripVertical, Edit, Save } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
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
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; height: number; left: number; right: number } | null>(null);
  const [dragOverRowId, setDragOverRowId] = useState<string | null>(null);

  const handleReorderFooterRows = (draggedId: string, targetId: string) => {
    const currentRows = [...(selectedElement.footerRows || [])];
    const draggedIdx = currentRows.findIndex(r => r.id === draggedId);
    const targetIdx = currentRows.findIndex(r => r.id === targetId);
    if (draggedIdx === -1 || targetIdx === -1) return;

    const [draggedItem] = currentRows.splice(draggedIdx, 1);
    currentRows.splice(targetIdx, 0, draggedItem);
    updateElementProp('footerRows', currentRows);
  };

  const gridCols = selectedElement.gridColumns || [];

  const getSelectedColumnsText = (selectedIds: string[]) => {
    if (!selectedIds || selectedIds.length === 0) {
      return t('noTargetColumns');
    }
    const names = selectedIds
      .map(id => gridCols.find((c: any) => c.id === id))
      .filter(Boolean)
      .map((c: any) => t(c.id) || c.name || c.label);

    const separator = language === 'fa' ? '، ' : ', ';
    if (names.length <= 2) {
      return names.join(separator);
    }
    const extraCount = names.length - 2;
    return language === 'fa'
      ? `${names.slice(0, 2).join('، ')} و ${extraCount} مورد دیگر`
      : `${names.slice(0, 2).join(', ')} and ${extraCount} more`;
  };

  const renderGroupHeader = (title: string, action?: React.ReactNode) => (
    <div className="flex items-center justify-between mb-3 pb-1 border-b border-gray-100 dark:border-slate-800/40">
      <span className="text-xs font-bold text-gray-800 dark:text-slate-200">
        {title}
      </span>
      {action}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Group 1: Connected Entity */}
      <div className="space-y-3">
        {renderGroupHeader(
          t('connectedEntity'),
          <button
            type="button"
            onClick={() => setSelectedElement({
              type: 'entity-creator',
              id: 'new_entity_creator',
              title: '',
              systemName: '',
              fields: [],
              _backElement: selectedElement
            })}
            className="p-1 rounded-md text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
            title={t('addEntity')}
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
        
        <div className="flex items-end gap-1.5 w-full">
          <div className="flex-1 min-w-0">
            <PropertyField 
              label={t('bindEntity')} 
              info={t('bindEntityInfo')} 
              type="select" 
              value={selectedElement.boundEntity || ''} 
              options={['', ...Object.keys(entities)]} 
              optionsLabels={[t('disconnect'), ...Object.keys(entities).map(k => t(k) || entities[k].name)]} 
              onChange={(val) => {
                const fields = (entities as any)[val]?.fields || [];
                updateElementProp('boundEntity', val);
                updateElementProp('gridColumns', fields);
                updateElementProp('groups', [{ id: `l3g_base_${Date.now()}`, name: 'اطلاعات پایه', columns: 2, fields: fields }]);
              }} 
            />
          </div>
          {selectedElement.boundEntity && (
            <button
              type="button"
              onClick={() => {
                const currentEntityKey = selectedElement.boundEntity;
                if (currentEntityKey && entities[currentEntityKey]) {
                  setSelectedElement({
                    type: 'entity-creator',
                    id: currentEntityKey,
                    title: entities[currentEntityKey].name,
                    systemName: currentEntityKey,
                    fields: entities[currentEntityKey].fields.map((f: any) => ({
                      ...f,
                      status: f.status || 'published'
                    })),
                    _backElement: selectedElement
                  });
                }
              }}
              className="flex-shrink-0 h-[30px] w-[30px] bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-gray-650 dark:text-slate-300 border border-gray-200 dark:border-slate-700 rounded hover:shadow-xs transition-all cursor-pointer flex items-center justify-center shadow-sm"
              title={t('editEntity')}
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Group 2: Panel & Table Settings */}
      <div className="pt-4 border-t border-gray-200 dark:border-slate-800/60 space-y-3">
        {renderGroupHeader(
          t('panelSettings')
        )}

        <PropertyField 
          label={t('tabPanelTitle')} 
          type="text" 
          value={selectedElement.label || selectedElement.title || ''} 
          onChange={(val) => { 
            updateElementProp('title', val); 
            updateElementProp('label', val); 
          }} 
          info={t('tabPanelTitleInfo')} 
        />

        {selectedElement._context !== 'l2' && (
          <div className="mb-3">
            <PropertyField
              label={t('viewType')}
              type="select"
              value={selectedElement.viewType || 'grid'}
              options={['grid', 'form']}
              optionsLabels={[t('viewTypeGrid'), t('viewTypeForm')]}
              onChange={(val) => updateElementProp('viewType', val)}
            />
          </div>
        )}

        {(selectedElement.viewType === 'grid' || selectedElement._context === 'l2') && (
          <div className="space-y-0.5 pt-1">
            <ToggleSwitch 
              label={t('gridAllowAdd')} 
              checked={!!selectedElement.gridSettings?.showAdd} 
              onChange={(val) => updateElementProp('gridSettings', {...selectedElement.gridSettings, showAdd: val})} 
              info={t('allowAddInfo')} 
            />
            <ToggleSwitch 
              label={t('gridAllowSearch')} 
              checked={!!selectedElement.gridSettings?.showSearch} 
              onChange={(val) => updateElementProp('gridSettings', {...selectedElement.gridSettings, showSearch: val})} 
              info={t('allowSearchInfo')} 
            />
            <ToggleSwitch 
              label={t('gridAllowSelect')} 
              checked={!!selectedElement.gridSettings?.showCheckbox} 
              onChange={(val) => updateElementProp('gridSettings', {...selectedElement.gridSettings, showCheckbox: val})} 
              info={t('allowSelectInfo')} 
            />
          </div>
        )}
      </div>

      {/* Group 3: Summary Rows */}
      {(selectedElement.viewType === 'grid' || selectedElement._context === 'l2') && (
        <div className="pt-4 border-t border-gray-200 dark:border-slate-800/60 space-y-3">
          {renderGroupHeader(
            t('summaryRowSettings'),
            <button
              type="button"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setPopoverPosition({
                  top: rect.top,
                  height: rect.height,
                  left: rect.left,
                  right: rect.right
                });
                setEditingFooterRow({
                  id: `footer_${Date.now()}`,
                  title: t('sum'),
                  operator: 'sum',
                  selectedColumns: [],
                  isNew: true
                });
              }}
              className="p-1 rounded-md text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
              title={t('new')}
            >
              <Plus className="w-4 h-4" />
            </button>
          )}

          {/* Subtle footer rows list */}
          <div className="space-y-1">
            {(selectedElement.footerRows || []).map((row: any) => {
              const isEditingThisRow = editingFooterRow?.id === row.id;
              return (
                <div 
                  key={row.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', row.id);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (dragOverRowId !== row.id) {
                      setDragOverRowId(row.id);
                    }
                  }}
                  onDragLeave={() => {
                    setDragOverRowId(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverRowId(null);
                    const draggedId = e.dataTransfer.getData('text/plain');
                    if (draggedId && draggedId !== row.id) {
                      handleReorderFooterRows(draggedId, row.id);
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    setPopoverPosition({
                      top: rect.top,
                      height: rect.height,
                      left: rect.left,
                      right: rect.right
                    });
                    setEditingFooterRow({ ...row, isNew: false });
                  }}
                  className={`flex items-center justify-between py-2 px-2.5 rounded-lg cursor-pointer transition-all duration-150 group border border-transparent ${
                    dragOverRowId === row.id
                      ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/20 scale-[1.02]'
                      : isEditingThisRow 
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/35 text-indigo-600 dark:text-indigo-400 font-semibold border-indigo-200 dark:border-indigo-900/50' 
                      : 'text-gray-700 dark:text-slate-300 hover:bg-indigo-50/30 dark:hover:bg-slate-800/40 hover:text-gray-900 dark:hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {/* Drag Handle Icon */}
                    <div className="text-gray-300 dark:text-slate-600 group-hover:text-gray-400 dark:group-hover:text-slate-500 cursor-grab active:cursor-grabbing p-0.5">
                      <GripVertical className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex flex-col text-start">
                      <div className="flex gap-2 items-center">
                        <span className="text-xs font-semibold">{row.title}</span>
                        <span className="text-[10px] text-gray-400 dark:text-slate-500 font-mono">({row.operator})</span>
                      </div>
                      <span className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">
                        {getSelectedColumnsText(row.selectedColumns)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const nextRows = selectedElement.footerRows.filter((r: any) => r.id !== row.id);
                      updateElementProp('footerRows', nextRows);
                      if (editingFooterRow?.id === row.id) setEditingFooterRow(null);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 rounded p-1 cursor-pointer transition-opacity duration-150"
                    title={t('delete')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
            {(selectedElement.footerRows || []).length === 0 && (
              <div className="text-center py-2 text-xs text-gray-400 dark:text-slate-500">
                {t('noSummaryRows')}
              </div>
            )}
          </div>

          {/* Popover Footer Row Editor via Portal */}
          {editingFooterRow && popoverPosition && createPortal(
            <AnimatePresence>
              {(() => {
                const columns = selectedElement.gridColumns || [];
                const isNumericOp = ['sum', 'avg', 'min', 'max'].includes(editingFooterRow.operator);
                const filteredColumns = columns.filter((col: any) => {
                  if (!isNumericOp) return true;
                  return col.type === 'comp-number' || col.type === 'comp-formula' || col.type === 'comp-grid-col';
                });

                // Compute vertical centering with clicked element
                const popoverHeight = 330;
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
                        setEditingFooterRow(null);
                        setPopoverPosition(null);
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
                        <span className="text-xs font-bold text-gray-850 dark:text-slate-200">
                          {editingFooterRow.isNew
                            ? t('newSummaryRow')
                            : t('editSummaryRow')}
                        </span>
                        <button 
                          type="button" 
                          onClick={() => {
                            setEditingFooterRow(null);
                            setPopoverPosition(null);
                          }}
                          className="p-1 rounded-md text-gray-400 hover:text-gray-655 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <PropertyField
                          label={t('rowTitle')}
                          type="text"
                          value={editingFooterRow.title || ''}
                          onChange={(val) => {
                            setEditingFooterRow({ ...editingFooterRow, title: val });
                          }}
                        />

                        <PropertyField
                          label={t('calculation')}
                          type="select"
                          value={editingFooterRow.operator || 'sum'}
                          options={['sum', 'avg', 'min', 'max', 'count']}
                          optionsLabels={['sum', 'avg', 'min', 'max', 'count'].map(op => t(op))}
                          onChange={(val) => {
                            const nextTitle = t(val);
                            setEditingFooterRow({ ...editingFooterRow, operator: val, title: nextTitle });
                          }}
                        />

                        <MultiSelectDropdown
                          label={t('targetColumns')}
                          columns={filteredColumns}
                          selectedValues={editingFooterRow.selectedColumns || []}
                          onChange={(val) => {
                            setEditingFooterRow({ ...editingFooterRow, selectedColumns: val });
                          }}
                          language={language}
                          t={t}
                        />
                      </div>

                      {/* Popover Actions */}
                      <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-slate-800/60">
                        <button
                          type="button"
                          onClick={() => {
                            const currentRows = selectedElement.footerRows || [];
                            if (editingFooterRow.isNew) {
                              updateElementProp('footerRows', [...currentRows, { ...editingFooterRow, isNew: undefined }]);
                            } else {
                              updateElementProp('footerRows', currentRows.map((r: any) => r.id === editingFooterRow.id ? { ...editingFooterRow, isNew: undefined } : r));
                            }
                            setEditingFooterRow(null);
                            setPopoverPosition(null);
                          }}
                          className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{t('save')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingFooterRow(null);
                            setPopoverPosition(null);
                          }}
                          className="flex-1 py-1.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-750 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                        >
                          {t('cancel')}
                        </button>
                      </div>
                    </motion.div>
                  </div>
                );
              })()}
            </AnimatePresence>,
            document.body
          )}
        </div>
      )}
    </div>
  );
};
