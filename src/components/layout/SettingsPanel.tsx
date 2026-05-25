import React from 'react';
import { Settings } from 'lucide-react';
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
  level3Tabs: any[];
  mainGroups: any[];
  setMainPanelName: (name: string) => void;
  setSelectedElement: (el: any) => void;
  handleBindEntity: (zone: string, entityKey: string) => void;
  language: 'fa' | 'en';
  t: (key: string) => string;
  entities: Record<string, { name: string; fields: any[] }>;
  addEntity: (systemName: string, name: string, fields: any[]) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  selectedElement,
  updateElementProp,
  boundMainEntity,
  level2Tabs,
  level3Tabs,
  mainGroups,
  setMainPanelName,
  setSelectedElement,
  handleBindEntity,
  language,
  t,
  entities,
  addEntity
}) => {
  return (
    <aside className="w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-r border-white/40 dark:border-slate-800 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] flex flex-col z-10">
      <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center gap-2 bg-gray-50/50 dark:bg-slate-900/50 text-start">
        <Settings className="w-4 h-4 text-gray-500" />
        <h2 className="font-bold text-gray-700 dark:text-slate-300 text-sm">{t('settings')}</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {(() => {
          let currentEntityKey = '';
          if (selectedElement) {
            if (selectedElement._context === 'main') currentEntityKey = boundMainEntity;
            else if (selectedElement._context === 'l2') currentEntityKey = level2Tabs.find(t => t.id === selectedElement._tabId)?.boundEntity || '';
            else if (selectedElement._context === 'l3') currentEntityKey = level3Tabs.find(t => t.id === selectedElement._tabId)?.boundEntity || '';
          }
          const currentEntityName = currentEntityKey ? (entities[currentEntityKey]?.name || currentEntityKey) : '';
          const currentEntityFieldsObj = currentEntityKey ? ((entities as any)[currentEntityKey]?.fields || []) : [];
          
          let usedFields = [] as string[];
          if (selectedElement) {
            let groupsInContext: any[] = [];
            if (selectedElement._context === 'main') groupsInContext = mainGroups;
            else if (selectedElement._context === 'l2') groupsInContext = level2Tabs.find(t => t.id === selectedElement._tabId)?.groups || [];
            else if (selectedElement._context === 'l3') groupsInContext = level3Tabs.find(t => t.id === selectedElement._tabId)?.groups || [];
            
            usedFields = groupsInContext.flatMap(g => g.fields).map(f => f.boundSystemField).filter(Boolean);
          }
          const availableFields = currentEntityFieldsObj.filter((f: any) => !usedFields.includes(f.id) || f.id === selectedElement?.boundSystemField);
          const availableFieldsOptions = availableFields.map((f: any) => f.id);
          const availableFieldsLabels = availableFields.map((f: any) => `${f.label} (${f.name || f.id})`);

          let numericColumns: any[] = [];
          if (selectedElement && selectedElement.type === 'comp-formula') {
            const tabId = selectedElement._tabId;
            const context = selectedElement._context;
            const tab = context === 'l2'
              ? level2Tabs.find(t => t.id === tabId)
              : level3Tabs.find(t => t.id === tabId);
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
                />
              ) : selectedElement.type?.includes('group') ? (
                <>
                  <PropertyField label={t('groupName')} type="text" value={selectedElement.name} onChange={(val) => updateElementProp('name', val)} info={t('groupNameInfo')} />
                  <PropertyField label={t('columnsCount')} type="select" value={selectedElement.columns?.toString()} options={['1', '2', '3', '4']} optionsLabels={[t('oneColumn'), t('twoColumns'), t('threeColumns'), t('fourColumns')]} onChange={(val) => updateElementProp('columns', Number(val))} info={t('columnsCountInfo')} />
                </>
              ) : selectedElement.type === 'container-main' ? (
                <>
                  <PropertyField label={t('panelTitle')} type="text" value={selectedElement.label} info={t('panelTitleInfo')} onChange={(val) => {
                    updateElementProp('label', val);
                  }} />
                  <PropertyField label={t('bindEntity')} type="select" value={boundMainEntity} options={['', ...Object.keys(entities)]} optionsLabels={[t('disconnect'), ...Object.keys(entities).map(k => entities[k].name)]} onChange={(val) => handleBindEntity('main', val)} info={t('bindEntityInfo')} />
                </>
              ) : selectedElement.type === 'grid-footer-row' ? (
                <GridFooterRowSettings 
                  selectedElement={selectedElement}
                  updateElementProp={updateElementProp}
                  setSelectedElement={setSelectedElement}
                  level2Tabs={level2Tabs}
                  level3Tabs={level3Tabs}
                  language={language}
                  t={t}
                />
              ) : selectedElement.type === 'container-l2-panel' || selectedElement.type === 'container-l3-panel' ? (
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
