import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `<div className="px-4 py-3 flex items-center justify-between bg-gray-50/50 rounded-t-xl border-b border-gray-100 min-h-[48px]">`;
const startIdx = content.indexOf(target);

if (startIdx !== -1) {
    const endTarget = `<div className="flex flex-col min-h-[300px] mt-2">`;
    const endIdx = content.indexOf(endTarget, startIdx);
    
    if (endIdx !== -1) {
        const replacement = `<div className="flex flex-col bg-slate-50/30 rounded-t-xl border-b border-gray-100 min-h-[48px]">
                        {/* --- ROW 1: BREADCRUMBS --- */}
                        <div className="px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {isRoot ? (
                              <h3 className="font-bold text-sm text-gray-700">{gridPanelName}</h3>
                            ) : (
                              <div className="flex items-center gap-2">
                                 <button onClick={(e) => { e.stopPropagation(); handleBack(); }} className="py-1 px-1.5 hover:bg-gray-200 rounded-md text-gray-500 flex items-center gap-1.5 transition-colors">
                                   <ArrowRight className="w-4 h-4" />
                                   <span className="text-xs font-bold text-gray-600 pt-0.5">{viewStack.length === 2 ? level2Tabs.find(t => t.id === activeL2TabId)?.title || gridPanelName : viewStack[viewStack.length - 2].title}</span>
                                 </button>
                                 <span className="text-gray-300 mx-1">|</span>
                                 <h3 className="font-bold text-sm text-gray-700">{currentView.title}</h3>
                              </div>
                            )}
                          </div>
                          {!isRoot && <div className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Level {viewStack.length}</div>}
                        </div>

                        {/* --- ROW 2: TABS (ALWAYS VISIBLE) --- */}
                        <div className="flex border-t border-gray-100 w-full bg-slate-50/80 px-4 pt-1">
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
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); setActiveId(tab.id); setSelectedElement({ ...tab, id: \`\${contextType}-panel-\${tab.id}\`, type: \`container-\${contextType}-panel\`, label: tab.title, _tabId: tab.id, _context: contextType }); }}
                                        className={\`px-6 py-2.5 text-[13px] font-bold transition-all relative select-none \${activeId === tab.id ? 'text-indigo-800' : 'text-gray-500 hover:text-gray-800'} \${selectedElement?.id === \`\${contextType}-panel-\${tab.id}\` ? 'bg-indigo-50/40 rounded-t-lg' : ''}\`}
                                      >
                                        {tab.title}
                                        {activeId === tab.id && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-600" />}
                                      </button>
                                      <button 
                                        onClick={(e) => { 
                                          e.stopPropagation(); 
                                          if (tabs.length === 1) return;
                                          const newTabs = tabs.filter(t => t.id !== tab.id);
                                          setTabs(newTabs as any);
                                          if (activeId === tab.id) setActiveId(newTabs[0].id);
                                          if (selectedElement?._tabId === tab.id) setSelectedElement(null);
                                        }}
                                        className={\`absolute left-1 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-gray-400 hover:bg-gray-200 hover:text-red-500 transition-colors \${tabs.length === 1 ? 'hidden' : (activeId === tab.id ? 'opacity-100' : 'opacity-0 group-hover/tab:opacity-100')}\`}
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                  <button 
                                    onClick={(e) => {
                                       e.stopPropagation();
                                       const newId = \`\${contextType}_tab_\${Date.now()}\`;
                                       setTabs([...tabs, {
                                          id: newId,
                                          title: 'تب جدید',
                                          boundEntity: '',
                                          viewType: contextType === 'l2' ? 'grid' : 'form',
                                          gridColumns: [],
                                          groups: [{ id: \`base_\${newId}\`, name: 'اطلاعات پایه', columns: 2, fields: [] }],
                                          gridSettings: { showAdd: true, showSearch: true, showCheckbox: true }
                                       }] as any);
                                       setActiveId(newId);
                                    }}
                                    className="px-2 py-1.5 text-gray-400 hover:text-indigo-600 hover:bg-gray-100/80 rounded-md transition-all flex items-center justify-center my-[5px] ml-4"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                 </>
                              );
                           })()}
                        </div>
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
`;

        const newContent = content.substring(0, startIdx) + replacement + content.substring(endIdx + endTarget.length);
        fs.writeFileSync('src/App.tsx', newContent);
        console.log('Replaced header section successfully');
    } else {
        console.log('End target not found');
    }
} else {
    console.log('Start target not found');
}
