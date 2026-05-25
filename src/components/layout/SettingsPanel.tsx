import React from 'react';
import { Settings, Plus, Edit, Database } from 'lucide-react';
import { motion } from 'motion/react';
import { PropertyField } from '../shared/PropertyField';
import { TabPanelSettings } from '../settings/TabPanelSettings';
import { FieldSettings } from '../settings/FieldSettings';
import { GridFooterRowSettings } from '../settings/GridFooterRowSettings';
import { EntityCreatorSettings } from '../settings/EntityCreatorSettings';

interface SettingsPanelProps {
  selectedElement: any;
  updateElementProp: (prop: string, value: any) => void;
  boundMainEntity: string;
  level2Tabs: any[];
  mainGroups: any[];
  setMainPanelName: (name: string) => void;
  setSelectedElement: (el: any) => void;
  handleBindEntity: (zone: string, entityKey: string) => void;
  language: 'fa' | 'en';
  t: (key: string) => string;
  entities: Record<string, { name: string; fields: any[] }>;
  addEntity: (systemName: string, name: string, fields: any[]) => void;
  mainPanelColumns: number;
  autoBindCreatedEntity?: (backElement: any, entityKey: string, fields: any[]) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  selectedElement,
  updateElementProp,
  boundMainEntity,
  level2Tabs,
  mainGroups,
  setMainPanelName,
  setSelectedElement,
  handleBindEntity,
  language,
  t,
  entities,
  addEntity,
  mainPanelColumns,
  autoBindCreatedEntity
}) => {
  return (
    <aside className="w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-r border-white/40 dark:border-slate-800 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] flex flex-col z-10">
      <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center gap-2 bg-gray-50/50 dark:bg-slate-900/50 text-start">
        {selectedElement?.type === 'entity-creator' ? (
          <Database className="w-4 h-4 text-gray-500" />
        ) : (
          <Settings className="w-4 h-4 text-gray-500" />
        )}
        <h2 className="font-bold text-gray-700 dark:text-slate-300 text-sm">
          {selectedElement?.type === 'entity-creator'
            ? (selectedElement.id !== 'new_entity_creator'
              ? (language === 'fa' ? 'ویرایش موجودیت' : 'Edit Entity')
              : (language === 'fa' ? 'موجودیت جدید' : 'New Entity'))
            : t('settings')
          }
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {(() => {
          let currentEntityKey = '';
          if (selectedElement) {
            if (selectedElement._context === 'main') currentEntityKey = boundMainEntity;
            else if (selectedElement._context === 'l2') currentEntityKey = level2Tabs.find(t => t.id === selectedElement._tabId)?.boundEntity || '';
          }
          const currentEntityName = currentEntityKey ? (entities[currentEntityKey]?.name || currentEntityKey) : '';
          const currentEntityFieldsObj = currentEntityKey ? ((entities as any)[currentEntityKey]?.fields || []) : [];
          
          let usedFields = [] as string[];
          if (selectedElement) {
            let groupsInContext: any[] = [];
            if (selectedElement._context === 'main') groupsInContext = mainGroups;
            else if (selectedElement._context === 'l2') groupsInContext = level2Tabs.find(t => t.id === selectedElement._tabId)?.groups || [];
            
            usedFields = groupsInContext.flatMap(g => g.fields).map(f => f.boundSystemField).filter(Boolean);
          }
          const availableFields = currentEntityFieldsObj.filter((f: any) => !usedFields.includes(f.id) || f.id === selectedElement?.boundSystemField);
          const availableFieldsOptions = availableFields.map((f: any) => f.id);
          const availableFieldsLabels = availableFields.map((f: any) => `${f.label} (${f.name || f.id})`);

          let numericColumns: any[] = [];
          if (selectedElement && selectedElement.type === 'comp-formula') {
            const tabId = selectedElement._tabId;
            const tab = level2Tabs.find(t => t.id === tabId);
            const columns = tab?.gridColumns || [];
            numericColumns = columns
              .filter((col: any) => col.id !== selectedElement.id && (col.type === 'comp-number' || col.type === 'comp-formula' || col.type === 'comp-grid-col'))
              .map((col: any) => ({ id: col.id, label: col.name || col.label }));
          }

          return !selectedElement ? (
            <div className="text-center text-gray-400 text-sm mt-10">
              <Settings className="w-12 h-12 text-gray-200 dark:text-slate-800 mx-auto mb-3" />
              {t('selectElement')}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              {selectedElement.type === 'entity-creator' ? (
                <EntityCreatorSettings
                  selectedElement={selectedElement}
                  setSelectedElement={setSelectedElement}
                  entities={entities}
                  addEntity={addEntity}
                  language={language}
                  t={t}
                  autoBindCreatedEntity={autoBindCreatedEntity}
                />
              ) : selectedElement.type?.includes('group') ? (
                <>
                  <PropertyField label={t('groupName')} type="text" value={selectedElement.name} onChange={(val) => updateElementProp('name', val)} info={t('groupNameInfo')} />
                </>
              ) : selectedElement.type === 'container-main' ? (
                <div className="space-y-6">
                  {/* Group 1: Connected Entity */}
                  <div className="space-y-3 text-start">
                    <div className="flex items-center justify-between mb-3 pb-1 border-b border-gray-100 dark:border-slate-800/40">
                      <span className="text-xs font-bold text-gray-800 dark:text-slate-200">
                        {language === 'fa' ? 'موجودیت متصل' : 'Connected Entity'}
                      </span>
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
                        className="p-1 rounded-md text-gray-500 dark:text-slate-400 hover:text-indigo-650 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
                        title={language === 'fa' ? 'تعریف موجودیت جدید' : 'New Entity'}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-end gap-1.5 w-full">
                      <div className="flex-1 min-w-0">
                        <PropertyField 
                          label={language === 'fa' ? 'اتصال موجودیت' : 'Connected Entity'} 
                          type="select" 
                          value={boundMainEntity} 
                          options={['', ...Object.keys(entities)]} 
                          optionsLabels={[language === 'fa' ? '-- قطع اتصال --' : '-- Disconnect --', ...Object.keys(entities).map(k => entities[k].name)]} 
                          onChange={(val) => handleBindEntity('main', val)} 
                          info={t('bindEntityInfo')} 
                        />
                      </div>
                      {boundMainEntity && entities[boundMainEntity] && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedElement({
                              type: 'entity-creator',
                              id: boundMainEntity,
                              title: entities[boundMainEntity].name,
                              systemName: boundMainEntity,
                              fields: entities[boundMainEntity].fields.map((f: any) => ({
                                ...f,
                                status: f.status || 'published'
                              })),
                              _backElement: selectedElement
                            });
                          }}
                          className="flex-shrink-0 h-[30px] w-[30px] bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-gray-650 dark:text-slate-300 border border-gray-200 dark:border-slate-700 rounded hover:shadow-xs transition-all cursor-pointer flex items-center justify-center shadow-sm"
                          title={language === 'fa' ? 'ویرایش موجودیت' : 'Edit Entity'}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Group 2: Panel Settings */}
                  <div className="pt-4 border-t border-gray-200 dark:border-slate-800/60 space-y-3 text-start">
                    <div className="flex items-center justify-between mb-3 pb-1 border-b border-gray-100 dark:border-slate-800/40">
                      <span className="text-xs font-bold text-gray-800 dark:text-slate-200">
                        {language === 'fa' ? 'تنظیمات ظاهری پنل' : 'Panel Settings'}
                      </span>
                    </div>

                    <PropertyField 
                      label={language === 'fa' ? 'عنوان پنل' : t('panelTitle')} 
                      type="text" 
                      value={selectedElement.label} 
                      info={t('panelTitleInfo')} 
                      onChange={(val) => {
                        updateElementProp('label', val);
                      }} 
                    />

                    <PropertyField 
                      label={language === 'fa' ? 'تعداد ستون‌ها' : t('columnsCount')} 
                      type="select" 
                      value={selectedElement.columns?.toString() || '5'} 
                      options={['1', '2', '3', '4', '5', '6']} 
                      optionsLabels={[t('oneColumn'), t('twoColumns'), t('threeColumns'), t('fourColumns'), t('fiveColumns'), t('sixColumns')]} 
                      onChange={(val) => updateElementProp('columns', Number(val))} 
                      info={t('columnsCountInfo')} 
                    />
                  </div>
                </div>
              ) : selectedElement.type === 'grid-footer-row' ? (
                null
              ) : selectedElement.type === 'container-l2-panel' ? (
                <TabPanelSettings 
                  selectedElement={selectedElement} 
                  updateElementProp={updateElementProp}
                  setSelectedElement={setSelectedElement}
                  selectedElementId={selectedElement.id}
                  language={language}
                  t={t}
                  entities={entities}
                />
              ) : (
                <FieldSettings 
                  selectedElement={selectedElement}
                  updateElementProp={updateElementProp}
                  currentEntityName={currentEntityName}
                  availableFieldsOptions={availableFieldsOptions}
                  availableFieldsLabels={availableFieldsLabels}
                  currentEntityFieldsObj={currentEntityFieldsObj}
                  numericColumns={numericColumns}
                  t={t}
                  entities={entities}
                  language={language}
                />
              )}
            </motion.div>
          );
        })()}
      </div>
    </aside>
  );
};
