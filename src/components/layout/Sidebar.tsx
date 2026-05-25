import React from 'react';
import { Type, Hash, List, CheckSquare, Database, Calculator, Plus, Calendar } from 'lucide-react';
import { DraggableItem } from '../shared/DraggableItem';

interface SidebarProps {
  onDragStart: (e: React.DragEvent, itemType: string) => void;
  t: (key: string) => string;
  entities: Record<string, { name: string; fields: any[] }>;
  setSelectedElement: (el: any) => void;
  language: 'fa' | 'en';
}

export const Sidebar: React.FC<SidebarProps> = ({ onDragStart, t, entities, setSelectedElement, language }) => {
  return (
    <aside className="w-64 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-l border-white/40 dark:border-slate-800/80 shadow-lg flex flex-col z-10 transition-colors duration-200">
      <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-950/20 text-start">
        <h2 className="font-bold text-gray-700 dark:text-slate-200 text-sm">{t('fieldsAndComponents')}</h2>
      </div>
      
      {/* Scrollable container for toolbox items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Field Types */}
        <div className="space-y-2">
          <DraggableItem type="comp-text" icon={<Type className="w-4 h-4" />} label={t('textField')} onDragStart={onDragStart} />
          <DraggableItem type="comp-number" icon={<Hash className="w-4 h-4" />} label={t('numberField')} onDragStart={onDragStart} />
          <DraggableItem type="comp-select" icon={<List className="w-4 h-4" />} label={t('selectField')} onDragStart={onDragStart} />
          <DraggableItem type="comp-check" icon={<CheckSquare className="w-4 h-4" />} label={t('checkboxField')} onDragStart={onDragStart} />
          <DraggableItem type="comp-relation" icon={<Database className="w-4 h-4" />} label={t('relationField')} onDragStart={onDragStart} />
          <DraggableItem type="comp-date" icon={<Calendar className="w-4 h-4" />} label={t('dateField')} onDragStart={onDragStart} />
        </div>

        {/* Grid Columns */}
        <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
          <h3 className="text-[10px] font-bold text-gray-400 dark:text-slate-500 mb-2 px-1 uppercase tracking-wider text-start">{t('detailsGridColumn')}</h3>
          <div className="space-y-2">
            <DraggableItem type="comp-grid-col" icon={<Database className="w-4 h-4" />} label={t('gridColumnField')} onDragStart={onDragStart} />
            <DraggableItem type="comp-formula" icon={<Calculator className="w-4 h-4" />} label={t('formulaColumnField')} onDragStart={onDragStart} />
          </div>
        </div>

        {/* Entities Management */}
        <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-2 px-1">
            <h3 className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider text-start">
              {t('entitiesTitle')}
            </h3>
            <button
              onClick={() => setSelectedElement({
                id: 'new_entity_creator',
                type: 'entity-creator',
                title: '',
                systemName: '',
                fields: []
              })}
              className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-0.5 cursor-pointer"
              title={t('addEntity')}
            >
              <Plus className="w-3 h-3" />
              {language === 'fa' ? 'جدید' : 'New'}
            </button>
          </div>
          
          <div className="space-y-1">
            {Object.entries(entities).map(([key, entity]: [string, any]) => (
              <button
                key={key}
                onClick={() => setSelectedElement({
                  id: `entity_editor_${key}`,
                  type: 'entity-creator',
                  title: entity.name,
                  systemName: key,
                  fields: entity.fields || []
                })}
                className="w-full text-right flex items-center justify-between text-xs px-2.5 py-1.5 rounded-md hover:bg-indigo-50 dark:hover:bg-slate-800/50 text-gray-600 dark:text-slate-300 transition-colors group cursor-pointer"
              >
                <span className="font-medium truncate">{entity.name}</span>
                <span className="text-[9px] font-mono text-gray-400 group-hover:text-indigo-500 truncate max-w-[80px]">{key}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
