import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, ChevronDown, Trash2, Database, GripVertical } from 'lucide-react';
import { GridTable } from '../GridTable';
import { initialGridData, pageVariants } from '../../hooks/useFormState';

interface DetailPanelProps {
  currentView: any;
  viewStack: any[];
  isRoot: boolean;
  level2Tabs: any[];
  activeL2TabId: string;
  selectedElement: any;
  setSelectedElement: (el: any) => void;
  setLevel2Tabs: React.Dispatch<React.SetStateAction<any[]>>;
  setActiveL2TabId: (id: string) => void;
  updateActiveL2Tab: (updater: (tab: any) => any) => void;
  handleDrop: (e: React.DragEvent, zone: string, groupId?: string | null, targetFieldId?: string | null) => void;
  handleDragOver: (e: React.DragEvent) => void;
  language: 'fa' | 'en';
  t: (key: string) => string;
  entities: Record<string, { name: string; fields: any[] }>;
  draggedType: 'field' | 'column' | null;
}

export const DetailPanel: React.FC<DetailPanelProps> = ({
  currentView,
  viewStack,
  isRoot,
  level2Tabs,
  activeL2TabId,
  selectedElement,
  setSelectedElement,
  setLevel2Tabs,
  setActiveL2TabId,
  handleDrop,
  handleDragOver,
  language,
  t,
  entities,
  draggedType,
}) => {
  const [isTabLoading, setIsTabLoading] = useState<Record<string, boolean>>({});
  const [draggedTabId, setDraggedTabId] = useState<string | null>(null);
  const [dragOverTabId, setDragOverTabId] = useState<string | null>(null);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);

  return (
    <div className="relative min-h-[400px]">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div 
          key="l2-panel-container"
          initial="initial" 
          animate="in" 
          exit="out" 
          variants={pageVariants} 
          className={`bg-white dark:bg-slate-900 rounded-xl overflow-hidden flex flex-col transition-all border-2 ${
            selectedElement?.id === `l2-panel-${activeL2TabId}`
              ? 'border-indigo-500 dark:border-indigo-400 shadow-[0_0_0_4px_rgba(99,102,241,0.15)] dark:shadow-[0_0_0_4px_rgba(99,102,241,0.25)] z-10 relative'
              : 'border-gray-100 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-500 hover:ring-2 hover:ring-indigo-100 dark:hover:ring-indigo-950/40 hover:shadow-md cursor-pointer shadow-sm'
          }`} 
          onClick={(e) => { 
            e.stopPropagation(); 
            const activeTab = level2Tabs.find(t => t.id === activeL2TabId) || level2Tabs[0];
            if (activeTab) {
              setSelectedElement({ ...activeTab, id: `l2-panel-${activeTab.id}`, type: 'container-l2-panel', label: activeTab.title, _tabId: activeTab.id, _context: 'l2' });
            }
          }}
        >
          <div className="flex flex-col bg-slate-50/30 dark:bg-slate-950/20 rounded-t-xl border-b border-gray-100 dark:border-slate-800/80">
            {/* --- ROW 1: SINGLE TAB TITLE (when only 1 tab exists) --- */}
            {level2Tabs.length === 1 && (
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div 
                        className={`font-bold text-sm px-2 py-1 rounded-md cursor-pointer transition-all ${selectedElement?.id === `l2-panel-${level2Tabs[0].id}` ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400' : 'text-gray-700 dark:text-slate-300 hover:text-indigo-700 hover:bg-indigo-50/50 hover:ring-2 hover:ring-indigo-300'}`}
                        onClick={(e) => { e.stopPropagation(); setSelectedElement({ ...level2Tabs[0], id: `l2-panel-${level2Tabs[0].id}`, type: 'container-l2-panel', label: level2Tabs[0].title, _tabId: level2Tabs[0].id, _context: 'l2' }); }}
                        onDoubleClick={(e) => { e.stopPropagation(); setEditingTabId(level2Tabs[0].id); }}
                      >
                        {editingTabId === level2Tabs[0].id ? (
                          <input 
                            autoFocus 
                            defaultValue={level2Tabs[0].title}
                            onBlur={(e) => {
                              setLevel2Tabs(tabs => tabs.map(t => t.id === level2Tabs[0].id ? { ...t, title: e.target.value } : t));
                              setEditingTabId(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                setLevel2Tabs(tabs => tabs.map(t => t.id === level2Tabs[0].id ? { ...t, title: (e.target as HTMLInputElement).value } : t));
                                setEditingTabId(null);
                              }
                            }}
                            className="bg-transparent border-b border-indigo-300 outline-none w-20 text-center"
                          />
                        ) : (
                          level2Tabs[0].title
                        )}
                      </div>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const newId = `l2_tab_${Date.now()}`;
                          const newTab = {
                             id: newId,
                             title: t('newTab'),
                             boundEntity: '',
                             viewType: 'grid',
                             gridColumns: [],
                             groups: [{ id: `base_${newId}`, name: t('baseInfo'), columns: 2, fields: [] }],
                             gridSettings: { showAdd: true, showSearch: true, showCheckbox: true }
                          };
                          setLevel2Tabs([...level2Tabs, newTab]);
                          setActiveL2TabId(newId);
                          setSelectedElement({ ...newTab, id: `l2-panel-${newTab.id}`, type: 'container-l2-panel', label: newTab.title, _tabId: newTab.id, _context: 'l2' });
                        }} 
                        className="text-gray-400 hover:text-indigo-600 transition-colors ml-2 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- ROW 2: TABS (MULTIPLE TABS SELECTOR) --- */}
            {level2Tabs.length > 1 && (
              <div 
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const sourceId = e.dataTransfer.getData('draggedTabId') || draggedTabId;
                  if (sourceId) {
                    setLevel2Tabs(prevTabs => {
                      const fromIndex = prevTabs.findIndex(t => t.id === sourceId);
                      if (fromIndex !== -1) {
                        const newTabs = [...prevTabs];
                        const [movedTab] = newTabs.splice(fromIndex, 1);
                        newTabs.push(movedTab); // Move to the end
                        return newTabs;
                      }
                      return prevTabs;
                    });
                  }
                  setDraggedTabId(null);
                  setDragOverTabId(null);
                }}
                className="flex w-full bg-slate-50/80 dark:bg-slate-950/10 px-4 pt-1"
              >
                {level2Tabs.map(tab => (
                  <div 
                    key={tab.id} 
                    draggable={editingTabId !== tab.id}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('draggedTabId', tab.id);
                      setDraggedTabId(tab.id);
                    }}
                    onDragEnd={() => {
                      setDraggedTabId(null);
                      setDragOverTabId(null);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (draggedTabId && draggedTabId !== tab.id && dragOverTabId !== tab.id) {
                        setDragOverTabId(tab.id);
                      }
                    }}
                    onDragLeave={(e) => {
                      e.stopPropagation();
                      if (dragOverTabId === tab.id) {
                        setDragOverTabId(null);
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const sourceId = e.dataTransfer.getData('draggedTabId') || draggedTabId;
                      if (sourceId && sourceId !== tab.id) {
                        setLevel2Tabs(prevTabs => {
                          const fromIndex = prevTabs.findIndex(t => t.id === sourceId);
                          const toIndex = prevTabs.findIndex(t => t.id === tab.id);
                          if (fromIndex !== -1 && toIndex !== -1) {
                            const newTabs = [...prevTabs];
                            const [movedTab] = newTabs.splice(fromIndex, 1);
                            newTabs.splice(toIndex, 0, movedTab);
                            return newTabs;
                          }
                          return prevTabs;
                        });
                      }
                      setDraggedTabId(null);
                      setDragOverTabId(null);
                    }}
                    className={`relative group/tab flex items-center transition-all duration-200 cursor-grab active:cursor-grabbing px-2.5 ${
                      draggedTabId === tab.id ? 'opacity-30 scale-95 border-dashed border-2 border-indigo-300 dark:border-slate-700' : ''
                    } ${
                      dragOverTabId === tab.id 
                        ? (language === 'fa' 
                            ? 'border-r-4 border-indigo-500 dark:border-indigo-400 pr-2' 
                            : 'border-l-4 border-indigo-500 dark:border-indigo-400 pl-2') 
                        : ''
                    }`}
                  >
                    {/* Drag Grip Icon on Hover */}
                    <div className="absolute start-3 top-1/2 -translate-y-1/2 opacity-0 group-hover/tab:opacity-100 text-gray-400 dark:text-slate-500 transition-opacity pointer-events-none">
                      <GripVertical className="w-3.5 h-3.5" />
                    </div>

                    <div
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setActiveL2TabId(tab.id); 
                        setSelectedElement({ ...tab, id: `l2-panel-${tab.id}`, type: 'container-l2-panel', label: tab.title, _tabId: tab.id, _context: 'l2' }); 
                      }}
                      onDoubleClick={(e) => { e.stopPropagation(); setEditingTabId(tab.id); }}
                      className={`px-6 py-2.5 text-[13px] font-bold transition-all relative select-none cursor-pointer ${
                        draggedTabId ? 'pointer-events-none' : ''
                      } ${activeL2TabId === tab.id ? 'text-indigo-800 dark:text-indigo-400' : 'text-gray-500 hover:text-indigo-600'} ${selectedElement?.id === `l2-panel-${tab.id}` ? 'bg-indigo-50/40 dark:bg-indigo-950/20 rounded-t-lg' : 'hover:bg-indigo-50/20 hover:ring-2 hover:ring-inset hover:ring-indigo-300 rounded-t-lg'}`}
                    >
                      {editingTabId === tab.id ? (
                        <input 
                          autoFocus 
                          defaultValue={tab.title}
                          onBlur={(e) => {
                            setLevel2Tabs(level2Tabs.map(t => t.id === tab.id ? { ...t, title: e.target.value } : t));
                            setEditingTabId(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              setLevel2Tabs(level2Tabs.map(t => t.id === tab.id ? { ...t, title: (e.target as HTMLInputElement).value } : t));
                              setEditingTabId(null);
                            }
                          }}
                          className="bg-transparent border-b border-indigo-300 outline-none w-24 text-center pointer-events-auto"
                        />
                      ) : (
                        tab.title
                      )}
                      {activeL2TabId === tab.id && (
                        <motion.div 
                          layoutId="activeL2TabUnderline" 
                          className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-indigo-600 dark:bg-indigo-400 z-10"
                          transition={{ duration: 0.22, ease: 'easeOut' }}
                        />
                      )}
                    </div>
                    <button 
                      type="button"
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        if (level2Tabs.length === 1) return;
                        const newTabs = level2Tabs.filter(t => t.id !== tab.id);
                        setLevel2Tabs(newTabs);
                        if (activeL2TabId === tab.id) {
                          setActiveL2TabId(newTabs[0].id);
                          setSelectedElement({ ...newTabs[0], id: `l2-panel-${newTabs[0].id}`, type: 'container-l2-panel', label: newTabs[0].title, _tabId: newTabs[0].id, _context: 'l2' });
                        } else if (selectedElement?._tabId === tab.id) {
                          setSelectedElement(null);
                        }
                      }}
                      className={`absolute end-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-gray-400 hover:bg-gray-200 hover:text-red-500 transition-colors opacity-0 group-hover/tab:opacity-100 cursor-pointer ${
                        draggedTabId ? 'pointer-events-none' : ''
                      }`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button 
                  type="button"
                  onClick={(e) => {
                     e.stopPropagation();
                     const newId = `l2_tab_${Date.now()}`;
                     const newTab = {
                        id: newId,
                        title: t('newTab'),
                        boundEntity: '',
                        viewType: 'grid',
                        gridColumns: [],
                        groups: [{ id: `base_${newId}`, name: t('baseInfo'), columns: 2, fields: [] }],
                        gridSettings: { showAdd: true, showSearch: true, showCheckbox: true }
                     };
                     setLevel2Tabs([...level2Tabs, newTab]);
                     setActiveL2TabId(newId);
                     setSelectedElement({ ...newTab, id: `l2-panel-${newTab.id}`, type: 'container-l2-panel', label: newTab.title, _tabId: newTab.id, _context: 'l2' });
                  }}
                  className="px-2 py-1.5 text-gray-400 hover:text-indigo-600 hover:bg-gray-100/80 rounded-md transition-all flex items-center justify-center my-[5px] ml-4 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="p-4 overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={activeL2TabId}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col min-h-[300px]"
              >
                {(() => {
                  const activeTab = level2Tabs.find(t => t.id === activeL2TabId) || level2Tabs[0];
                  return (
                    <div className="flex flex-col min-h-[300px]">
                      {isTabLoading[activeTab.id] ? (
                        <div className="relative min-h-[220px] p-6 border border-gray-100 dark:border-slate-800 rounded-xl overflow-hidden bg-gray-50/30 dark:bg-slate-900/30 flex flex-col justify-center gap-4 text-center">
                          <div className="animate-scan" />
                          <div className="flex items-center justify-center gap-3 text-indigo-600 dark:text-indigo-400 mb-2">
                            <Database className="w-5 h-5 animate-bounce" />
                            <span className="text-xs font-bold">{language === 'fa' ? 'در حال اتصال به موجودیت و همگام‌سازی ستون‌های گرید...' : 'Connecting to entity and syncing grid columns...'}</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="animate-shimmer h-12 rounded-lg border border-gray-100 dark:border-slate-800" />
                            <div className="animate-shimmer h-12 rounded-lg border border-gray-100 dark:border-slate-800" />
                            <div className="animate-shimmer h-12 rounded-lg border border-gray-100 dark:border-slate-800" />
                            <div className="animate-shimmer h-12 rounded-lg border border-gray-100 dark:border-slate-800" />
                          </div>
                        </div>
                      ) : !activeTab.boundEntity ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-xl bg-gray-50 dark:bg-slate-900/30 text-center">
                          <Database className="w-6 h-6 text-indigo-500 mb-4" />
                          <h4 className="font-bold text-gray-700 dark:text-slate-200 mb-2">{t('connectPanelToEntity')}</h4>
                          <div className="relative inline-block w-64">
                            <select 
                              value="" 
                              onChange={(e) => {
                                const val = e.target.value;
                                setIsTabLoading(prev => ({ ...prev, [activeL2TabId]: true }));
                                setTimeout(() => {
                                  setLevel2Tabs(tabs => tabs.map(tabItem => {
                                    if (tabItem.id === activeL2TabId) {
                                      const fields = (entities as any)[val]?.fields || [];
                                      return {
                                        ...tabItem,
                                        boundEntity: val,
                                        gridColumns: fields,
                                        groups: [{ id: `g_base_${tabItem.id}`, name: t('baseInfo'), columns: 2, fields: fields }]
                                      };
                                    }
                                    return tabItem;
                                  }));
                                  if (selectedElement?._tabId === activeTab.id) setSelectedElement(null);
                                  setIsTabLoading(prev => ({ ...prev, [activeL2TabId]: false }));
                                }, 800);
                              }} 
                              onClick={(e) => e.stopPropagation()} 
                              className="w-full appearance-none bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-sm pr-4 pl-10 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 font-medium text-gray-700 dark:text-slate-300 cursor-pointer"
                            >
                              <option value="" disabled className="dark:bg-slate-900 dark:text-slate-400">{t('selectEntity')}</option>
                              {Object.entries(entities).map(([key, ent]: [string, any]) => (
                                <option key={key} value={key} className="dark:bg-slate-900 dark:text-slate-100">
                                  {ent.name}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>
                      ) : (
                        <GridTable 
                          columns={activeTab.gridColumns}
                          data={initialGridData}
                          settings={activeTab.gridSettings}
                          selectedElement={selectedElement}
                          onSelect={(el) => setSelectedElement({ ...el, _tabId: activeTab.id, _context: 'l2' })}
                          onDeleteColumn={(e, id) => {
                             e.stopPropagation();
                             setLevel2Tabs(tabs => tabs.map(t => t.id === activeL2TabId ? { ...t, gridColumns: t.gridColumns.filter((c:any) => c.id !== id) } : t));
                          }}
                          onDrop={(e) => handleDrop(e, 'l2-grid-columns')}
                          onDragOver={handleDragOver}
                          footerRows={activeTab.footerRows || []}
                          onUpdateFooterRows={(rows) => setLevel2Tabs(tabs => tabs.map(t => t.id === activeL2TabId ? { ...t, footerRows: rows } : t))}
                          language={language}
                          t={t}
                          isDraggingColumn={draggedType === 'column'}
                        />
                      )}
                    </div>
                  );
                })()}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
