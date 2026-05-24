import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// ------ L2 Tabs Map ------ //
const l2MapTarget = `<div className="flex bg-gray-100/80 rounded-lg p-1 gap-1 -ml-2 -my-2">
                                {level2Tabs.map(tab => (
                                  <div key={tab.id} className="relative group/l2tab flex items-center">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); setActiveL2TabId(tab.id); setSelectedElement({ ...tab, id: \`l2-panel-\${tab.id}\`, type: 'container-l2-panel', label: tab.title, _tabId: tab.id, _context: 'l2' }); }}
                                      className={\`px-4 py-1.5 text-sm font-semibold rounded-md transition-all pr-8 \${activeL2TabId === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'} \${selectedElement?.id === \`l2-panel-\${tab.id}\` ? 'ring-inset ring-2 ring-indigo-500' : ''}\`}
                                    >
                                      {tab.title}
                                    </button>
                                    <button 
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        const newTabs = level2Tabs.filter(t => t.id !== tab.id);
                                        setLevel2Tabs(newTabs);
                                        if (activeL2TabId === tab.id) setActiveL2TabId(newTabs[0].id);
                                        if (selectedElement?._tabId === tab.id) setSelectedElement(null);
                                      }}
                                      className={\`absolute right-1.5 p-1 rounded-md text-gray-400 hover:bg-gray-100 hover:text-red-500 transition-colors \${activeL2TabId === tab.id ? 'opacity-100' : 'opacity-0 group-hover/l2tab:opacity-100'}\`}
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                                <button 
                                  onClick={(e) => {
                                     e.stopPropagation();
                                     const newId = \`l2_tab_\${Date.now()}\`;
                                     setLevel2Tabs([...level2Tabs, {
                                        id: newId,
                                        title: 'تب جدید',
                                        boundEntity: '',
                                        viewType: 'grid',
                                        gridColumns: [],
                                        groups: [{ id: \`dg_base_\${newId}\`, name: 'اطلاعات پایه', columns: 2, fields: [] }],
                                        gridSettings: { showAdd: true, showSearch: true, showCheckbox: true }
                                     }]);
                                     setActiveL2TabId(newId);
                                  }}
                                  className="px-2 py-1.5 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-md transition-all flex items-center justify-center ml-1"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                               </div>`;

const l2MapRepl = `<div className="flex border-b border-gray-200 w-full -mx-4 px-4 bg-slate-50/50 mt-2 mb-2">
                                {level2Tabs.map(tab => (
                                  <div key={tab.id} className="relative group/l2tab flex items-center">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); setActiveL2TabId(tab.id); setSelectedElement({ ...tab, id: \`l2-panel-\${tab.id}\`, type: 'container-l2-panel', label: tab.title, _tabId: tab.id, _context: 'l2' }); }}
                                      className={\`px-5 py-3 text-sm font-bold transition-all relative \${activeL2TabId === tab.id ? 'text-indigo-800' : 'text-gray-500 hover:text-gray-800'} \${selectedElement?.id === \`l2-panel-\${tab.id}\` ? 'bg-indigo-50/50' : ''}\`}
                                    >
                                      {tab.title}
                                      {activeL2TabId === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
                                    </button>
                                    <button 
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        const newTabs = level2Tabs.filter(t => t.id !== tab.id);
                                        setLevel2Tabs(newTabs);
                                        if (activeL2TabId === tab.id) setActiveL2TabId(newTabs[0].id);
                                        if (selectedElement?._tabId === tab.id) setSelectedElement(null);
                                      }}
                                      className={\`absolute left-1 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-gray-400 hover:bg-gray-200 hover:text-red-500 transition-colors \${activeL2TabId === tab.id ? 'opacity-100' : 'opacity-0 group-hover/l2tab:opacity-100'}\`}
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                                <button 
                                  onClick={(e) => {
                                     e.stopPropagation();
                                     const newId = \`l2_tab_\${Date.now()}\`;
                                     setLevel2Tabs([...level2Tabs, {
                                        id: newId,
                                        title: 'تب جدید',
                                        boundEntity: '',
                                        viewType: 'grid',
                                        gridColumns: [],
                                        groups: [{ id: \`dg_base_\${newId}\`, name: 'اطلاعات پایه', columns: 2, fields: [] }],
                                        gridSettings: { showAdd: true, showSearch: true, showCheckbox: true }
                                     }]);
                                     setActiveL2TabId(newId);
                                  }}
                                  className="px-3 py-2 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 rounded-md transition-all flex items-center justify-center my-1 ml-4"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                               </div>`;

// ------ L3 Tabs Map ------ //
const l3MapTarget = `<div className="flex bg-gray-100/80 rounded-lg p-1 gap-1 w-fit mb-4 -ml-2 -mt-2">
                                  {level3Tabs.map(tab => (
                                    <div key={tab.id} className="relative group/l3tab flex items-center">
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); setActiveTabId(tab.id); setSelectedElement({ ...tab, id: \`l3-panel-\${tab.id}\`, type: 'container-l3-panel', label: tab.title, _tabId: tab.id, _context: 'l3' }); }}
                                        className={\`px-4 py-1.5 text-sm font-semibold rounded-md transition-all pr-8 \${activeTabId === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'} \${selectedElement?.id === \`l3-panel-\${tab.id}\` ? 'ring-inset ring-2 ring-indigo-500' : ''}\`}
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
                                        className={\`absolute right-1.5 p-1 rounded-md text-gray-400 hover:bg-gray-100 hover:text-red-500 transition-colors \${activeTabId === tab.id ? 'opacity-100' : 'opacity-0 group-hover/l3tab:opacity-100'}\`}
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                  <button 
                                    onClick={(e) => {
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
                                    }}
                                    className="px-2 py-1.5 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-md transition-all flex items-center justify-center ml-1"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>`;

const l3MapRepl = `<div className="flex border-b border-gray-200 w-full mb-4 bg-slate-50/50">
                                  {level3Tabs.map(tab => (
                                    <div key={tab.id} className="relative group/l3tab flex items-center">
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); setActiveTabId(tab.id); setSelectedElement({ ...tab, id: \`l3-panel-\${tab.id}\`, type: 'container-l3-panel', label: tab.title, _tabId: tab.id, _context: 'l3' }); }}
                                        className={\`px-5 py-3 text-sm font-bold transition-all relative \${activeTabId === tab.id ? 'text-indigo-800' : 'text-gray-500 hover:text-gray-800'} \${selectedElement?.id === \`l3-panel-\${tab.id}\` ? 'bg-indigo-50/50' : ''}\`}
                                      >
                                        {tab.title}
                                        {activeTabId === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
                                      </button>
                                      <button 
                                        onClick={(e) => { 
                                          e.stopPropagation(); 
                                          const newTabs = level3Tabs.filter(t => t.id !== tab.id);
                                          setLevel3Tabs(newTabs);
                                          if (activeTabId === tab.id) setActiveTabId(newTabs[0].id);
                                          if (selectedElement?._tabId === tab.id) setSelectedElement(null);
                                        }}
                                        className={\`absolute left-1 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-gray-400 hover:bg-gray-200 hover:text-red-500 transition-colors \${activeTabId === tab.id ? 'opacity-100' : 'opacity-0 group-hover/l3tab:opacity-100'}\`}
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                  <button 
                                    onClick={(e) => {
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
                                    }}
                                    className="px-3 py-2 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 rounded-md transition-all flex items-center justify-center my-1 ml-4"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>`;

content = content.replace(l2MapTarget, l2MapRepl);
content = content.replace(l3MapTarget, l3MapRepl);

fs.writeFileSync('src/App.tsx', content);
console.log('Tabs styled successfully!');
