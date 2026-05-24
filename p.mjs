import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Wrap ROW 2: TABS with viewStack.length !== 2 condition
const tabsTarget = `<div className="flex border-t border-gray-100 w-full bg-slate-50/80 px-4 pt-1">
                           {(() => {`;
const tabsRepl = `{viewStack.length !== 2 && (
                        <div className="flex border-t border-gray-100 w-full bg-slate-50/80 px-4 pt-1">
                           {(() => {`;

content = content.replace(tabsTarget, tabsRepl);

const tabsEndTarget = `                           })()}
                        </div>
                      </div>

                      <div className="p-4">`;
const tabsEndRepl = `                           })()}
                        </div>
                        )}
                      </div>

                      <div className="p-4">`;

content = content.replace(tabsEndTarget, tabsEndRepl);

// Add simple header + Plus for Level 2 detail
const bodyTarget = `                          return (
                            <div className="flex flex-col">
                              <div className="flex flex-col min-h-[300px]">

                                 {!activeTab.boundEntity ? (`;
const bodyRepl = `                          return (
                            <div className="flex flex-col">
                              {viewStack.length === 2 && (
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
                              )}
                              
                              <div className="flex flex-col min-h-[300px]">

                                 {!activeTab.boundEntity ? (`;

content = content.replace(bodyTarget, bodyRepl);
fs.writeFileSync('src/App.tsx', content);
