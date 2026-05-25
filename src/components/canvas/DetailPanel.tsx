import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, ArrowRight, X, Database, ChevronDown, Trash2 } from 'lucide-react';
import { GridTable } from '../GridTable';
import { FormPanel } from '../FormPanel';
import { initialGridData, pageVariants } from '../../hooks/useFormState';

interface DetailPanelProps {
  currentView: any;
  viewStack: any[];
  isRoot: boolean;
  level2Tabs: any[];
  level3Tabs: any[];
  activeL2TabId: string;
  activeTabId: string;
  editingTabId: string | null;
  selectedElement: any;
  setSelectedElement: (el: any) => void;
  setLevel2Tabs: React.Dispatch<React.SetStateAction<any[]>>;
  setLevel3Tabs: React.Dispatch<React.SetStateAction<any[]>>;
  setActiveL2TabId: (id: string) => void;
  setActiveTabId: (id: string) => void;
  setEditingTabId: (id: string | null) => void;
  updateActiveL2Tab: (updater: (tab: any) => any) => void;
  updateActiveTab: (updater: (tab: any) => any) => void;
  handleBack: () => void;
  handleDrillDown: (row: any) => void;
  handleDrop: (e: React.DragEvent, zone: string, groupId?: string | null, targetFieldId?: string | null) => void;
  handleDragOver: (e: React.DragEvent) => void;
  language: 'fa' | 'en';
  t: (key: string) => string;
  entities: Record<string, { name: string; fields: any[] }>;
  draggedType: 'field' | 'column' | null;
  setDraggedType: (type: 'field' | 'column' | null) => void;
}

export const DetailPanel: React.FC<DetailPanelProps> = ({
  currentView,
  viewStack,
  isRoot,
  level2Tabs,
  level3Tabs,
  activeL2TabId,
  activeTabId,
  editingTabId,
  selectedElement,
  setSelectedElement,
  setLevel2Tabs,
  setLevel3Tabs,
  setActiveL2TabId,
  setActiveTabId,
  setEditingTabId,
  updateActiveL2Tab,
  updateActiveTab,
  handleBack,
  handleDrillDown,
  handleDrop,
  handleDragOver,
  language,
  t,
  entities,
  draggedType,
  setDraggedType
}) => {
  return (
    <div className="relative min-h-[400px]">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div 
          key={currentView.id} 
          initial="initial" 
          animate="in" 
          exit="out" 
          variants={pageVariants} 
          className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border-2 dark:border-slate-800/80 overflow-hidden flex flex-col transition-all cursor-[inherit] ${isRoot && level2Tabs.length === 1 ? (selectedElement?.id === `l2-panel-${level2Tabs[0].id}` ? 'border-indigo-500 dark:border-indigo-400 ring-4 ring-indigo-500/15 dark:ring-indigo-950/40' : 'border-gray-100 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-500 hover:ring-2 hover:ring-indigo-100 dark:hover:ring-indigo-950/40 cursor-pointer') : 'border-gray-100 dark:border-slate-800/80'}`} 
          onClick={(e) => { 
            e.stopPropagation(); 
            if (isRoot && level2Tabs.length === 1) {
              setSelectedElement({ ...level2Tabs[0], id: `l2-panel-${level2Tabs[0].id}`, type: 'container-l2-panel', label: level2Tabs[0].title, _tabId: level2Tabs[0].id, _context: 'l2' });
            } else {
              setSelectedElement(null); 
            }
          }}
        >
          <div className="flex flex-col bg-slate-50/30 dark:bg-slate-950/20 rounded-t-xl border-b border-gray-100 dark:border-slate-800/80">
            {/* --- ROW 1: BREADCRUMBS --- */}
            {!(isRoot && level2Tabs.length > 1) && (
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isRoot ? (
                    <div className="flex items-center gap-2">
                      {level2Tabs.length === 1 ? (
                        <div className="flex items-center gap-1">
                          <div 
                            className={`font-bold text-sm px-2 py-1 rounded-md cursor-pointer transition-all ${selectedElement?.id === `l2-panel-${level2Tabs[0].id}` ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:text-indigo-700 hover:bg-indigo-50/50 hover:ring-2 hover:ring-indigo-300'}`}
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
                      ) : null}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleBack(); }} 
                        className="py-1 px-1.5 hover:bg-gray-200 rounded-md text-gray-500 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ArrowRight className="w-4 h-4" />
                        <span className="text-xs font-bold text-gray-600 pt-0.5">{viewStack.length === 2 ? level2Tabs.find(t => t.id === activeL2TabId)?.title || viewStack[0].title : viewStack[viewStack.length - 2].title}</span>
                      </button>
                      <span className="text-gray-300 mx-1">|</span>
                      <div className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-[11px] font-bold">{t('level')} {viewStack.length}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* --- ROW 2: TABS (ALWAYS VISIBLE) --- */}
            {(!isRoot || (isRoot && level2Tabs.length > 1)) && (
              <div className={`flex w-full bg-slate-50/80 dark:bg-slate-950/10 px-4 ${isRoot && level2Tabs.length > 1 ? 'pt-0' : 'pt-1 border-t border-gray-100 dark:border-slate-800/80'}`}>
                {(() => {
                  const tabs = isRoot ? level2Tabs : level3Tabs;
                  const activeId = isRoot ? activeL2TabId : activeTabId;
                  const setTabs = isRoot ? setLevel2Tabs : setLevel3Tabs;
                  const setActiveId = isRoot ? setActiveL2TabId : setActiveTabId;
                  const contextType = isRoot ? 'l2' : 'l3';

                  return (
                    <>
                      {tabs.map(tab => (
                        <div key={tab.id} className="relative group/tab flex items-center">
                          <div
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setActiveId(tab.id); 
                              setSelectedElement({ ...tab, id: `${contextType}-panel-${tab.id}`, type: `container-${contextType}-panel`, label: tab.title, _tabId: tab.id, _context: contextType }); 
                            }}
                            onDoubleClick={(e) => { e.stopPropagation(); setEditingTabId(tab.id); }}
                            className={`px-6 py-2.5 text-[13px] font-bold transition-all relative select-none cursor-pointer ${activeId === tab.id ? 'text-indigo-800' : 'text-gray-500 hover:text-indigo-600'} ${selectedElement?.id === `${contextType}-panel-${tab.id}` ? 'bg-indigo-50/40 rounded-t-lg' : 'hover:bg-indigo-50/20 hover:ring-2 hover:ring-inset hover:ring-indigo-300 rounded-t-lg'}`}
                          >
                            {editingTabId === tab.id ? (
                              <input 
                                autoFocus 
                                defaultValue={tab.title}
                                onBlur={(e) => {
                                  setTabs(tabs.map(t => t.id === tab.id ? { ...t, title: e.target.value } : t) as any);
                                  setEditingTabId(null);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    setTabs(tabs.map(t => t.id === tab.id ? { ...t, title: (e.target as HTMLInputElement).value } : t) as any);
                                    setEditingTabId(null);
                                  }
                                }}
                                className="bg-transparent border-b border-indigo-300 outline-none w-24 text-center"
                              />
                            ) : (
                              tab.title
                            )}
                            {activeId === tab.id && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-600" />}
                          </div>
                          <button 
                            type="button"
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              if (tabs.length === 1) return;
                              const newTabs = tabs.filter(t => t.id !== tab.id);
                              setTabs(newTabs as any);
                              if (activeId === tab.id) {
                                setActiveId(newTabs[0].id);
                                setSelectedElement({ ...newTabs[0], id: `${contextType}-panel-${newTabs[0].id}`, type: `container-${contextType}-panel`, label: newTabs[0].title, _tabId: newTabs[0].id, _context: contextType });
                              } else if (selectedElement?._tabId === tab.id) {
                                setSelectedElement(null);
                              }
                            }}
                            className={`absolute left-1 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-gray-400 hover:bg-gray-200 hover:text-red-500 transition-colors opacity-0 group-hover/tab:opacity-100 cursor-pointer ${tabs.length === 1 ? 'hidden' : ''}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button 
                        type="button"
                        onClick={(e) => {
                           e.stopPropagation();
                           const newId = `${contextType}_tab_${Date.now()}`;
                           const newTab = {
                              id: newId,
                              title: t('newTab'),
                              boundEntity: '',
                              viewType: contextType === 'l2' ? 'grid' : 'form',
                              gridColumns: [],
                              groups: [{ id: `base_${newId}`, name: t('baseInfo'), columns: 2, fields: [] }],
                              gridSettings: { showAdd: true, showSearch: true, showCheckbox: true }
                           };
                           setTabs([...tabs, newTab] as any);
                           setActiveId(newId);
                           setSelectedElement({ ...newTab, id: `${contextType}-panel-${newTab.id}`, type: `container-${contextType}-panel`, label: newTab.title, _tabId: newTab.id, _context: contextType });
                        }}
                        className="px-2 py-1.5 text-gray-400 hover:text-indigo-600 hover:bg-gray-100/80 rounded-md transition-all flex items-center justify-center my-[5px] ml-4 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          <div className="p-4">
            {(() => {
              const activeTab = isRoot 
                ? (level2Tabs.find(t => t.id === activeL2TabId) || level2Tabs[0])
                : (level3Tabs.find(t => t.id === activeTabId) || level3Tabs[0]);
                
              const updateTab = isRoot ? updateActiveL2Tab : updateActiveTab;
              const contextType = isRoot ? 'l2' : 'l3';
              
              return (
                <div className="flex flex-col">
                  <div className="flex flex-col min-h-[300px]">
                    {!activeTab.boundEntity ? (
                      <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-xl bg-gray-50 dark:bg-slate-900/30 text-center">
                        <Database className="w-6 h-6 text-indigo-500 mb-4" />
                        <h4 className="font-bold text-gray-700 dark:text-slate-200 mb-2">{t('connectPanelToEntity')}</h4>
                        <div className="relative inline-block w-64">
                          <select 
                            value="" 
                            onChange={(e) => {
                              const val = e.target.value;
                              updateTab(tab => {
                                const fields = (entities as any)[val]?.fields || [];
                                return {
                                  ...tab,
                                  boundEntity: val,
                                  gridColumns: fields,
                                  groups: [{ id: `g_base_${tab.id}`, name: t('baseInfo'), columns: 2, fields: fields }]
                                };
                              });
                              if (selectedElement?._tabId === activeTab.id) setSelectedElement(null);
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
                      activeTab.viewType === 'grid' ? (
                        <GridTable 
                          columns={activeTab.gridColumns}
                          data={initialGridData}
                          settings={activeTab.gridSettings}
                          selectedElementId={selectedElement?.id}
                          onSelect={(el) => setSelectedElement({ ...el, _tabId: activeTab.id, _context: contextType })}
                          onDeleteColumn={(e, id) => {
                             e.stopPropagation();
                             updateTab(t => ({ ...t, gridColumns: t.gridColumns.filter((c:any) => c.id !== id) }));
                          }}
                          onDrillDown={(row) => handleDrillDown(row)}
                          onDrop={(e) => handleDrop(e, `${contextType}-grid-columns`)}
                          onDragOver={handleDragOver}
                          footerRows={activeTab.footerRows || []}
                          onUpdateFooterRows={(rows) => updateTab(t => ({ ...t, footerRows: rows }))}
                          language={language}
                          t={t}
                          isDraggingColumn={draggedType === 'column'}
                        />
                      ) : (
                        <FormPanel 
                          groups={activeTab.groups}
                          targetZone={`${contextType}-form` as any}
                          selectedElementId={selectedElement?.id}
                          onSelect={(field) => {
                            setSelectedElement({...field, _context: contextType, _tabId: activeTab.id});
                          }}
                          onDeleteGroup={(e, id) => {
                             e.stopPropagation();
                             updateTab(t => ({ ...t, groups: t.groups.filter((g:any) => g.id !== id) }));
                          }}
                          onDeleteField={(e, id, gid) => {
                             e.stopPropagation();
                             updateTab(t => ({ 
                                  ...t, 
                                  groups: t.groups.map((g:any) => g.id === gid ? { ...g, fields: g.fields.filter((f:any) => f.id !== id) } : g) 
                             }));
                          }}
                          onAddGroup={() => {
                             const newId = `g_${Date.now()}`;
                             updateTab(tab => ({ ...tab, groups: [...tab.groups, { id: newId, name: t('newGroup'), columns: 2, fields: [] }] }));
                          }}
                          onDrop={(e, gid, tfid) => handleDrop(e, `${contextType}-form`, gid, tfid)}
                          onDragOver={handleDragOver}
                          onDragStartField={(e, id, gid) => {
                            e.dataTransfer.setData('draggedField', JSON.stringify({ fieldId: id, sourceGroupId: gid, sourceZone: `${contextType}-form` }));
                            setDraggedType('field');
                          }}
                          t={t}
                          draggedType={draggedType}
                        />
                      )
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
