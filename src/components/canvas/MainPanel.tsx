import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronDown, Database } from 'lucide-react';
import { FormPanel } from '../FormPanel';

interface MainPanelProps {
  selectedElement: any;
  setSelectedElement: (el: any) => void;
  mainPanelName: string;
  boundMainEntity: string;
  mainGroups: any[];
  handleDrop: (e: React.DragEvent, zone: string, groupId: string | null, targetFieldId: string | null) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleAddGroup: (zone: string) => void;
  handleDeleteGroup: (e: React.MouseEvent, groupId: string, zone: string) => void;
  handleDeleteElement: (e: React.MouseEvent, id: string, zone: string, groupId: string | null) => void;
  entities: Record<string, { name: string; fields: any[] }>;
  handleBindEntity: (zone: string, entityKey: string) => void;
  draggedType: 'field' | 'column' | null;
  setDraggedType: (type: 'field' | 'column' | null) => void;
  mainPanelColumns: number;
  onUpdateFieldProp?: (prop: string, value: any) => void;
  language: 'fa' | 'en';
  t: (key: string) => string;
  translateTitle: (title: string) => string;
}

export const MainPanel: React.FC<MainPanelProps> = ({
  selectedElement,
  setSelectedElement,
  mainPanelName,
  boundMainEntity,
  mainGroups,
  handleDrop,
  handleDragOver,
  handleAddGroup,
  handleDeleteGroup,
  handleDeleteElement,
  t,
  translateTitle,
  entities,
  handleBindEntity,
  draggedType,
  setDraggedType,
  mainPanelColumns,
  onUpdateFieldProp,
  language
}) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <motion.div 
      layout
      className={`bg-white dark:bg-slate-900 rounded-xl transition-all border-2 ${selectedElement?.id === 'main-panel' ? 'border-indigo-500 dark:border-indigo-400 shadow-[0_0_0_4px_rgba(99,102,241,0.15)] dark:shadow-[0_0_0_4px_rgba(99,102,241,0.25)] z-10 relative' : 'border-gray-100 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-500 hover:ring-2 hover:ring-indigo-100 dark:hover:ring-indigo-950/40 hover:shadow-md cursor-pointer shadow-sm'}`}
      onClick={() => setSelectedElement({ id: 'main-panel', type: 'container-main', label: mainPanelName, columns: mainPanelColumns, _context: 'main' })}
    >
      <div className="p-5 border-b border-gray-100 dark:border-slate-800/80 flex justify-between items-center bg-gray-50/30 dark:bg-slate-900/30 rounded-t-xl">
        <div className="flex items-center gap-2">
          {/* Main panel icon is chevron-gray */}
          <ChevronDown className="w-5 h-5 text-gray-500 dark:text-slate-400" />
          <h3 className="font-bold text-gray-800 dark:text-slate-100 text-sm">{translateTitle(mainPanelName)}</h3>
          {boundMainEntity && (
            <span className="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {t('entity')}: {t(boundMainEntity)}
            </span>
          )}
        </div>
      </div>
      <div className="p-6">
        {isLoading ? (
          <div className="relative min-h-[180px] p-6 border border-gray-100 dark:border-slate-800 rounded-xl overflow-hidden bg-gray-50/30 dark:bg-slate-900/30 flex flex-col justify-center gap-4 text-center">
            <div className="animate-scan" />
            <div className="flex items-center justify-center gap-3 text-indigo-600 dark:text-indigo-400 mb-2">
              <Database className="w-5 h-5 animate-bounce" />
              <span className="text-xs font-bold">{t('connectingFields')}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="animate-shimmer h-14 rounded-lg border border-gray-100 dark:border-slate-800" />
              <div className="animate-shimmer h-14 rounded-lg border border-gray-100 dark:border-slate-800" />
              <div className="animate-shimmer h-14 rounded-lg border border-gray-100 dark:border-slate-800" />
            </div>
          </div>
        ) : !boundMainEntity ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-xl bg-gray-50 dark:bg-slate-900/30 text-center" onClick={(e) => e.stopPropagation()}>
            <Database className="w-6 h-6 text-indigo-500 mb-4" />
            <h4 className="font-bold text-gray-700 dark:text-slate-200 mb-2">{t('connectPanelToEntity')}</h4>
            <div className="relative inline-block w-64">
              <select 
                value="" 
                onChange={(e) => {
                  const val = e.target.value;
                  setIsLoading(true);
                  setTimeout(() => {
                     handleBindEntity('main', val);
                     setIsLoading(false);
                  }, 800);
                }} 
                onClick={(e) => e.stopPropagation()} 
                className="w-full appearance-none bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-sm pr-4 pl-10 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 font-medium text-gray-700 dark:text-slate-300 cursor-pointer"
              >
                <option value="" disabled className="dark:bg-slate-900 dark:text-slate-400">{t('selectEntity')}</option>
                {Object.entries(entities).map(([key, ent]: [string, any]) => (
                  <option key={key} value={key} className="dark:bg-slate-900 dark:text-slate-100">
                    {t(key)}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        ) : (
          <FormPanel 
            groups={mainGroups} 
            targetZone="main"
            formColumns={mainPanelColumns}
            selectedElement={selectedElement}
            onSelect={(element) => setSelectedElement({ ...element, _context: 'main' })}
            onDeleteGroup={(e, gid) => handleDeleteGroup(e, gid, 'main')}
            onDeleteField={(e, id, gid) => handleDeleteElement(e, id, 'main', gid)}
            onAddGroup={() => handleAddGroup('main')}
            onDrop={(e, gid, fid) => handleDrop(e, 'main', gid, fid)}
            onDragOver={handleDragOver} 
            onDragStartField={(e, id, gid) => {
              e.dataTransfer.setData('draggedField', JSON.stringify({ fieldId: id, sourceGroupId: gid, sourceZone: 'main' }));
              setDraggedType('field');
            }}
            t={t}
            draggedType={draggedType}
            onUpdateFieldProp={onUpdateFieldProp}
            language={language}
          />
        )}
      </div>
    </motion.div>
  );
};
