import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const t2 = '<h3 className="font-bold text-sm text-gray-700">{currentView.title}</h3>';
const r2 = '<div className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-[11px] font-bold">سطح {viewStack.length}</div>';

code = code.replace(t2, r2);

const regex = /{!}isRoot &&\s*<div className="text-\[10px\] bg-indigo-50 text-indigo-600[^<]+<\/div>}/g;
code = code.replace(regex, '');
// Wait, the regex had \i which is invalid in the previous one because of `{!\i`! Ah `${!\isRoot}`! `isRoot` doesn't need a backslash.
const regex2 = /{.*bg-indigo-50.*text-indigo-600.*Level {viewStack.length}.*}/g;
code = code.replace(regex2, '');

const t4 = '{!isRoot && (\n                               <div className="flex items-center gap-2">\n                                 <button className="p-1.5';
const r4 = '{viewStack.length < 3 && !isRoot && (\n                               <div className="flex items-center gap-2">\n                                 <button className="p-1.5';
code = code.replace(t4, r4);

fs.writeFileSync('src/App.tsx', code);
console.log('Done');
