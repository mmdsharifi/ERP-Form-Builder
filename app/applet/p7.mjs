import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const s1 = '{viewStack.length < 3 && !isRoot && (\n                               <div className="flex items-center gap-2">\n                                 <button className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-md transition-colors"><Maximize2 className="w-4 h-4" /></button>\n                                <button onClick={(e) => { e.stopPropagation(); handleBack(); }} className="px-3 py-1 text-xs font-bold text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1"><ArrowRight className="w-3.5 h-3.5" /> بازگشت</button>\n                                <div className="flex border border-gray-300 rounded-md overflow-hidden">\n                                  <button disabled={viewStack.length >= 3} className={`px-2 py-1 border-l border-gray-300 transition-colors ${viewStack.length >= 3 ? \'text-gray-300 bg-gray-50 cursor-not-allowed\' : \'text-gray-500 hover:bg-gray-50\'}`}><ChevronDown className="w-3.5 h-3.5" /></button>\n                                  <button disabled={viewStack.length >= 3} className={`px-2 py-1 transition-colors ${viewStack.length >= 3 ? \'text-gray-300 bg-gray-50 cursor-not-allowed\' : \'text-gray-500 hover:bg-gray-50\'}`}><ChevronUp className="w-3.5 h-3.5" /></button>\n                                </div>\n                              </div>\n                            )}';

const r1 = '{!isRoot && (\n                               <button className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-md transition-colors"><Maximize2 className="w-4 h-4" /></button>\n                            )}';

if (code.includes(s1)) {
    code = code.replace(s1, r1);
    fs.writeFileSync('src/App.tsx', code);
    console.log('patched left side');
} else {
    console.log('not found');
}
