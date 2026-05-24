import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const t1 = `                                          const newTabs = tabs.filter(t => t.id !== tab.id);
                                          setTabs(newTabs as any);
                                          if (activeId === tab.id) setActiveId(newTabs[0].id);
                                          if (selectedElement?._tabId === tab.id) setSelectedElement(null);`;
const r1 = `                                          const newTabs = tabs.filter(t => t.id !== tab.id);
                                          setTabs(newTabs as any);
                                          if (activeId === tab.id) {
                                            setActiveId(newTabs[0].id);
                                            setSelectedElement({ ...newTabs[0], id: \`\${contextType}-panel-\${newTabs[0].id}\`, type: \`container-\${contextType}-panel\`, label: newTabs[0].title, _tabId: newTabs[0].id, _context: contextType });
                                          } else if (selectedElement?._tabId === tab.id) {
                                            setSelectedElement(null);
                                          }`;

const t2 = `                                         const newId = \`\${contextType}_tab_\${Date.now()}\`;
                                         setTabs([...tabs, {
                                            id: newId,
                                            title: 'تب جدید',
                                            boundEntity: '',
                                            viewType: contextType === 'l2' ? 'grid' : 'form',
                                            gridColumns: [],
                                            groups: [{ id: \`base_\${newId}\`, name: 'اطلاعات پایه', columns: 2, fields: [] }],
                                            gridSettings: { showAdd: true, showSearch: true, showCheckbox: true }
                                         }] as any);
                                         setActiveId(newId);`;
const r2 = `                                         const newId = \`\${contextType}_tab_\${Date.now()}\`;
                                         const newTab = {
                                            id: newId,
                                            title: 'تب جدید',
                                            boundEntity: '',
                                            viewType: contextType === 'l2' ? 'grid' : 'form',
                                            gridColumns: [],
                                            groups: [{ id: \`base_\${newId}\`, name: 'اطلاعات پایه', columns: 2, fields: [] }],
                                            gridSettings: { showAdd: true, showSearch: true, showCheckbox: true }
                                         };
                                         setTabs([...tabs, newTab] as any);
                                         setActiveId(newId);
                                         setSelectedElement({ ...newTab, id: \`\${contextType}-panel-\${newTab.id}\`, type: \`container-\${contextType}-panel\`, label: newTab.title, _tabId: newTab.id, _context: contextType });`;

const t3 = `                                      const newId = \`l2_tab_\${Date.now()}\`;
                                      setLevel2Tabs([...level2Tabs, {
                                         id: newId,
                                         title: 'تب جدید',
                                         boundEntity: '',
                                         viewType: 'grid',
                                         gridColumns: [],
                                         groups: [{ id: \`base_\${newId}\`, name: 'اطلاعات پایه', columns: 2, fields: [] }],
                                         gridSettings: { showAdd: true, showSearch: true, showCheckbox: true }
                                      }]);
                                      setActiveL2TabId(newId);`;
const r3 = `                                      const newId = \`l2_tab_\${Date.now()}\`;
                                      const newTab = {
                                         id: newId,
                                         title: 'تب جدید',
                                         boundEntity: '',
                                         viewType: 'grid',
                                         gridColumns: [],
                                         groups: [{ id: \`base_\${newId}\`, name: 'اطلاعات پایه', columns: 2, fields: [] }],
                                         gridSettings: { showAdd: true, showSearch: true, showCheckbox: true }
                                      };
                                      setLevel2Tabs([...level2Tabs, newTab]);
                                      setActiveL2TabId(newId);
                                      setSelectedElement({ ...newTab, id: \`l2-panel-\${newTab.id}\`, type: 'container-l2-panel', label: newTab.title, _tabId: newTab.id, _context: 'l2' });`;

code = code.replace(t1, r1).replace(t2, r2).replace(t3, r3);
fs.writeFileSync('src/App.tsx', code);
console.log('patched tabs 2');
