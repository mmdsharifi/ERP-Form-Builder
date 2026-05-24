import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `                              {viewStack.length === 2 && (
                                <div className="flex items-center gap-2 mb-4">
                                  <h3 
                                    className={\`font-bold text-sm px-2 py-1 -ml-2 rounded-md cursor-pointer transition-all \${selectedElement?.id === \`l3-panel-\${level3Tabs[0].id}\` ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-200/50'}\`}
                                    onClick={(e) => { e.stopPropagation(); setSelectedElement({ ...level3Tabs[0], id: \`l3-panel-\${level3Tabs[0].id}\`, type: 'container-l3-panel', label: level3Tabs[0].title, _tabId: level3Tabs[0].id, _context: 'l3' }); }}
                                  >
                                    {level3Tabs[0].title}
                                  </h3>
                                  <button onClick={(e) => {
                                    e.stopPropagation();
                                    const newId = \`tab_\${Date.now()}\`;
                                    setLevel3Tabs([...level3Tabs, {
                                       id: newId,
                                       title: 'تب جدید',
                                       boundEntity: '',
                                       viewType: 'form',
                                       gridColumns: [],
                                       groups: [{ id: \`l3g_base_\${newId}\`, name: 'اطلاعات پایه', columns: 2, fields: [] }],
                                       gridSettings: { showAdd: true, showSearch: true, showCheckbox: true }
                                    }]);
                                    setActiveTabId(newId);
                                  }} className="text-gray-400 hover:text-indigo-600 transition-colors">
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              )}`;

const replacement = `                              {viewStack.length === 2 && (
                                level3Tabs.length > 1 ? (
                                  <div className="flex bg-gray-100/80 rounded-lg p-1 gap-1 w-fit mb-4 -ml-2 -mt-2">
                                    {level3Tabs.map(tab => (
                                      <div key={tab.id} className="relative group/l3tab flex flex-row items-center">
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); setActiveTabId(tab.id); }}
                                          className={\`px-4 py-1.5 text-sm font-semibold rounded-md transition-all pr-8 \${activeTabId === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}\`}
                                        >
                                          {tab.title}
                                        </button>
                                        <button 
                                          onClick={(e) => { 
                                            e.stopPropagation(); 
                                            const newTabs = level3Tabs.filter(t => t.id !== tab.id);
                                            setLevel3Tabs(newTabs);
                                            if (activeTabId === tab.id) setActiveTabId(newTabs[0].id);
                                            if (selectedElement?._tabId === tab.id) setSelectedElement(null);
                                          }}
                                          className="absolute right-1.5 p-0.5 rounded text-gray-400 hover:bg-gray-200 hover:text-red-500 opacity-0 group-hover/l3tab:opacity-100 transition-all"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ))}
                                    <button onClick={(e) => {
                                      e.stopPropagation();
                                      const newId = \`tab_\${Date.now()}\`;
                                      setLevel3Tabs([...level3Tabs, {
                                         id: newId,
                                         title: 'تب جدید',
                                         boundEntity: '',
                                         viewType: 'form',
                                         gridColumns: [],
                                         groups: [{ id: \`l3g_base_\${newId}\`, name: 'اطلاعات پایه', columns: 2, fields: [] }],
                                         gridSettings: { showAdd: true, showSearch: true, showCheckbox: true }
                                      }]);
                                      setActiveTabId(newId);
                                    }} className="px-2 py-1.5 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-md transition-all flex items-center justify-center mr-1">
                                      <Plus className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 mb-4">
                                    <h3 
                                      className={\`font-bold text-sm px-2 py-1 -ml-2 rounded-md cursor-pointer transition-all \${selectedElement?.id === \`l3-panel-\${level3Tabs[0].id}\` ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-200/50'}\`}
                                      onClick={(e) => { e.stopPropagation(); setSelectedElement({ ...level3Tabs[0], id: \`l3-panel-\${level3Tabs[0].id}\`, type: 'container-l3-panel', label: level3Tabs[0].title, _tabId: level3Tabs[0].id, _context: 'l3' }); }}
                                    >
                                      {level3Tabs[0].title}
                                    </h3>
                                    <button onClick={(e) => {
                                      e.stopPropagation();
                                      const newId = \`tab_\${Date.now()}\`;
                                      setLevel3Tabs([...level3Tabs, {
                                         id: newId,
                                         title: 'تب جدید',
                                         boundEntity: '',
                                         viewType: 'form',
                                         gridColumns: [],
                                         groups: [{ id: \`l3g_base_\${newId}\`, name: 'اطلاعات پایه', columns: 2, fields: [] }],
                                         gridSettings: { showAdd: true, showSearch: true, showCheckbox: true }
                                      }]);
                                      setActiveTabId(newId);
                                    }} className="text-gray-400 hover:text-indigo-600 transition-colors">
                                      <Plus className="w-4 h-4" />
                                    </button>
                                  </div>
                                )
                              )}`;

content = content.replace(target, replacement);

fs.writeFileSync('src/App.tsx', content);

