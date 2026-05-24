import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Change onClick on motion.div
const motionDivTarget = `onClick={(e) => { e.stopPropagation(); setSelectedElement(null); }}>`;
const motionDivRepl = `onClick={(e) => { 
                      e.stopPropagation(); 
                      if (isRoot && level2Tabs.length === 1) {
                        setSelectedElement({ ...level2Tabs[0], id: \`l2-panel-\${level2Tabs[0].id}\`, type: 'container-l2-panel', label: level2Tabs[0].title, _tabId: level2Tabs[0].id, _context: 'l2' });
                      } else {
                        setSelectedElement(null); 
                      }
                    }}>`;
content = content.replace(motionDivTarget, motionDivRepl);

// 2. Hide ROW 1 if isRoot && level2Tabs.length > 1
const row1Target = `{/* --- ROW 1: BREADCRUMBS --- */}
                        <div className="px-4 py-3 flex items-center justify-between">`;
const row1Repl = `{/* --- ROW 1: BREADCRUMBS --- */}
                        {!(isRoot && level2Tabs.length > 1) && (
                        <div className="px-4 py-3 flex items-center justify-between">`;
content = content.replace(row1Target, row1Repl);

const row1EndTarget = `                            {!isRoot && <div className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Level {viewStack.length}</div>}
                          </div>
                        </div>

                        {/* --- ROW 2: TABS (ALWAYS VISIBLE) --- */}`;
const row1EndRepl = `                            {!isRoot && <div className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Level {viewStack.length}</div>}
                          </div>
                        </div>
                        )}

                        {/* --- ROW 2: TABS (ALWAYS VISIBLE) --- */}`;

content = content.replace(row1EndTarget, row1EndRepl);

fs.writeFileSync('src/App.tsx', content);
