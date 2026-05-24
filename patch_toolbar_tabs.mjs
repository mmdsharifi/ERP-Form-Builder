import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `<div className="flex items-center gap-2">
                            {isRoot && (
                              <div className="flex items-center gap-2">
                                <button className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-md transition-colors"><Maximize2 className="w-4 h-4" /></button>
                                <button className="px-3 py-1 text-xs font-bold text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1"><ArrowRight className="w-3.5 h-3.5" /> بازگشت</button>
                                <div className="flex border border-gray-300 rounded-md overflow-hidden">
                                  <button className="px-2 py-1 hover:bg-gray-50 border-l border-gray-300 text-gray-500"><ChevronDown className="w-3.5 h-3.5" /></button>
                                  <button className="px-2 py-1 hover:bg-gray-50 text-gray-500"><ChevronUp className="w-3.5 h-3.5" /></button>
                                </div>
                              </div>
                            )}
                            {!isRoot && <div className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Level {viewStack.length}</div>}
                          </div>`;

const replacement = `<div className="flex items-center gap-2">
                            {!isRoot && (
                              <div className="flex items-center gap-2">
                                <button className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-md transition-colors"><Maximize2 className="w-4 h-4" /></button>
                                <button onClick={(e) => { e.stopPropagation(); handleBack(); }} className="px-3 py-1 text-xs font-bold text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1"><ArrowRight className="w-3.5 h-3.5" /> بازگشت</button>
                                <div className="flex border border-gray-300 rounded-md overflow-hidden">
                                  <button disabled={viewStack.length >= 3} className={\`px-2 py-1 border-l border-gray-300 transition-colors \${viewStack.length >= 3 ? 'text-gray-300 bg-gray-50 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}\`}><ChevronDown className="w-3.5 h-3.5" /></button>
                                  <button disabled={viewStack.length >= 3} className={\`px-2 py-1 transition-colors \${viewStack.length >= 3 ? 'text-gray-300 bg-gray-50 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}\`}><ChevronUp className="w-3.5 h-3.5" /></button>
                                </div>
                              </div>
                            )}
                            {!isRoot && <div className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Level {viewStack.length}</div>}
                          </div>`;

content = content.replace(target, replacement);

const targetTabs = `                                      <button 
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
                                  </button>`;

const replacementTabs = `                                      <button 
                                        onClick={(e) => { 
                                          e.stopPropagation(); 
                                          if (tabs.length === 1) return;
                                          const newTabs = tabs.filter(t => t.id !== tab.id);
                                          setTabs(newTabs as any);
                                          if (activeId === tab.id) setActiveId(newTabs[0].id);
                                          if (selectedElement?._tabId === tab.id) setSelectedElement(null);
                                        }}
                                        className={\`absolute left-1 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-gray-400 hover:bg-gray-200 hover:text-red-500 transition-colors \${tabs.length === 1 || viewStack.length === 2 ? 'hidden' : (activeId === tab.id ? 'opacity-100' : 'opacity-0 group-hover/tab:opacity-100')}\`}
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                  {viewStack.length !== 2 && (
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
                                  )}`;
content = content.replace(targetTabs, replacementTabs);

fs.writeFileSync('src/App.tsx', content);
