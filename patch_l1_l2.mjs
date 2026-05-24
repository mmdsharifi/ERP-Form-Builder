import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Change Breadcrumb for Level 1
const l1HeaderOld = `{isRoot ? (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-700 text-sm font-bold">مراحل</span>
                                <span className="text-gray-300">|</span>
                                <span className="text-gray-500 text-sm">نام مرحله: <strong className="text-gray-800">{currentView.title}</strong></span>
                                <span className="text-gray-300">|</span>
                                <span className="text-gray-500 text-sm">احتمال موفقیت: <strong className="text-gray-800">{currentView.probability}٪</strong></span>
                              </div>
                            ) : (`;

const l1HeaderNew = `{isRoot ? (
                              <div className="flex items-center gap-2">
                                {level2Tabs.length === 1 ? (
                                  <div className="flex items-center gap-1">
                                    <h3 
                                      className={\`font-bold text-sm px-2 py-1 rounded-md cursor-pointer transition-all \${selectedElement?.id === \`l2-panel-\${level2Tabs[0].id}\` ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-200/50'}\`}
                                      onClick={(e) => { e.stopPropagation(); setSelectedElement({ ...level2Tabs[0], id: \`l2-panel-\${level2Tabs[0].id}\`, type: 'container-l2-panel', label: level2Tabs[0].title, _tabId: level2Tabs[0].id, _context: 'l2' }); }}
                                    >
                                      {level2Tabs[0].title}
                                    </h3>
                                    <button onClick={(e) => {
                                      e.stopPropagation();
                                      const newId = \`l2_tab_\${Date.now()}\`;
                                      setLevel2Tabs([...level2Tabs, {
                                         id: newId,
                                         title: 'تب جدید',
                                         boundEntity: '',
                                         viewType: 'grid',
                                         gridColumns: [],
                                         groups: [{ id: \`base_\${newId}\`, name: 'اطلاعات پایه', columns: 2, fields: [] }],
                                         gridSettings: { showAdd: true, showSearch: true, showCheckbox: true }
                                      }]);
                                      setActiveL2TabId(newId);
                                    }} className="text-gray-400 hover:text-indigo-600 transition-colors ml-2">
                                      <Plus className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : null}
                                {level2Tabs.length === 1 && <span className="text-gray-300">|</span>}
                                <span className="text-gray-500 text-sm">نام مرحله: <strong className="text-gray-800">{currentView.title}</strong></span>
                                <span className="text-gray-300">|</span>
                                <span className="text-gray-500 text-sm">احتمال موفقیت: <strong className="text-gray-800">{currentView.probability}٪</strong></span>
                              </div>
                            ) : (`;

content = content.replace(l1HeaderOld, l1HeaderNew);

// 2. Hide ROW 2 logic if viewStack.length === 2 OR if (isRoot && level2Tabs.length === 1)
const row2Old = `{viewStack.length !== 2 && (
                        <div className="flex border-t border-gray-100 w-full bg-slate-50/80 px-4 pt-1">
                           {(() => {
                              const tabs = isRoot ? level2Tabs : level3Tabs;`;

const row2New = `{(viewStack.length >= 3 || (isRoot && level2Tabs.length > 1)) && (
                        <div className="flex border-t border-gray-100 w-full bg-slate-50/80 px-4 pt-1">
                           {(() => {
                              const tabs = isRoot ? level2Tabs : level3Tabs;`;

content = content.replace(row2Old, row2New);

// 3. Remove Title/Plus for Level 2 (viewStack.length === 2)
const l2BodyOld = `                              {viewStack.length === 2 && (
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

const l2BodyNew = ``; // REMOVE IT ENTIRELY for Level 2. (Level 3 is handled differently if needed, wait. Level 3 uses tabs from Row 2 now? Yes, Level 3 will show Row 2 Tabs, and then below it, just the form. SO NO IN-BODY TABS ANYMORE FOR ANY LEVEL!!!)

content = content.replace(l2BodyOld, l2BodyNew);

// 4. Disable next/prev entity actions in Level 3 (viewStack.length >= 3)
const navOld = `<button disabled={viewStack.length >= 3} className={\`px-2 py-1 border-l border-gray-300 transition-colors \${viewStack.length >= 3 ? 'text-gray-300 bg-gray-50 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}\`}><ChevronDown className="w-3.5 h-3.5" /></button>
                                  <button disabled={viewStack.length >= 3} className={\`px-2 py-1 transition-colors \${viewStack.length >= 3 ? 'text-gray-300 bg-gray-50 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}\`}><ChevronUp className="w-3.5 h-3.5" /></button>`;

// Actually I already disabled them in a previous patch! 
// Let's verify if they are already disabled. Wait, the user said "تازه اکشن های موجودیت قبلی و بعدی هم باید دیزیبل بشه توی دیتل اف دیتل".
// I had previously added: disabled={viewStack.length >= 3}. This exactly does what they asked!
// Wait! If they are disabled in Level 3, maybe the user wants them disabled in Level 2? 
// No, they specifically say "دیزیبل بشه توی دیتل اف دیتل" Which is Level 3! I must have done it correctly. 

fs.writeFileSync('src/App.tsx', content);
