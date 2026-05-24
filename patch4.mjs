import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Add inline editing state
const stateTarget = `const [activeTabId, setActiveTabId] = useState('tab_1');`;
const stateRepl = `const [activeTabId, setActiveTabId] = useState('tab_1');
  const [editingTabId, setEditingTabId] = useState<string | null>(null);`;
content = content.replace(stateTarget, stateRepl);

// Update ROW 2 tabs
const tabsTarget = `<button 
                                        onClick={(e) => { e.stopPropagation(); setActiveId(tab.id); setSelectedElement({ ...tab, id: \`\${contextType}-panel-\${tab.id}\`, type: \`container-\${contextType}-panel\`, label: tab.title, _tabId: tab.id, _context: contextType }); }}
                                        className={\`px-6 py-2.5 text-[13px] font-bold transition-all relative select-none \${activeId === tab.id ? 'text-indigo-800' : 'text-gray-500 hover:text-gray-800'} \${selectedElement?.id === \`\${contextType}-panel-\${tab.id}\` ? 'bg-indigo-50/40 rounded-t-lg' : ''}\`}
                                      >
                                        {tab.title}`;
const tabsRepl = `<div
                                        onClick={(e) => { e.stopPropagation(); setActiveId(tab.id); setSelectedElement({ ...tab, id: \`\${contextType}-panel-\${tab.id}\`, type: \`container-\${contextType}-panel\`, label: tab.title, _tabId: tab.id, _context: contextType }); }}
                                        onDoubleClick={(e) => { e.stopPropagation(); setEditingTabId(tab.id); }}
                                        className={\`px-6 py-2.5 text-[13px] font-bold transition-all relative select-none cursor-pointer \${activeId === tab.id ? 'text-indigo-800' : 'text-gray-500 hover:text-gray-800'} \${selectedElement?.id === \`\${contextType}-panel-\${tab.id}\` ? 'bg-indigo-50/40 rounded-t-lg' : ''}\`}
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
                                        )}`;
content = content.replace(tabsTarget, tabsRepl);

// Wait, the original was a button, I changed it to div so input isn't inside a button.
const closingTarget = `                                        {activeId === tab.id && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-600" />}
                                      </button>
                                      <button`;
const closingRepl = `                                        {activeId === tab.id && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-600" />}
                                      </div>
                                      <button`;
content = content.replace(closingTarget, closingRepl);


// Update Single Item (Level 2 single context header)
const singleTarget = `<h3 
                                      className={\`font-bold text-sm px-2 py-1 rounded-md cursor-pointer transition-all \${selectedElement?.id === \`l2-panel-\${level2Tabs[0].id}\` ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-200/50'}\`}
                                      onClick={(e) => { e.stopPropagation(); setSelectedElement({ ...level2Tabs[0], id: \`l2-panel-\${level2Tabs[0].id}\`, type: 'container-l2-panel', label: level2Tabs[0].title, _tabId: level2Tabs[0].id, _context: 'l2' }); }}
                                    >
                                      {level2Tabs[0].title}
                                    </h3>`;
const singleRepl = `<div 
                                      className={\`font-bold text-sm px-2 py-1 rounded-md cursor-pointer transition-all \${selectedElement?.id === \`l2-panel-\${level2Tabs[0].id}\` ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-200/50'}\`}
                                      onClick={(e) => { e.stopPropagation(); setSelectedElement({ ...level2Tabs[0], id: \`l2-panel-\${level2Tabs[0].id}\`, type: 'container-l2-panel', label: level2Tabs[0].title, _tabId: level2Tabs[0].id, _context: 'l2' }); }}
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
                                    </div>`;
content = content.replace(singleTarget, singleRepl);


fs.writeFileSync('src/App.tsx', content);

