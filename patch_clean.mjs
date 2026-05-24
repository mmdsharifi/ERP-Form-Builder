import fs from 'fs';

let formCode = fs.readFileSync('src/components/FormPanel.tsx', 'utf-8');
const gridFunc = `
  const getGridColsClass = (columnsCount: number) => {
    return ({
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    } as any)[columnsCount] || 'grid-cols-1 md:grid-cols-2';
  };
`;

if (!formCode.includes('const getGridColsClass =')) {
  formCode = formCode.replace('const [collapsedGroups', gridFunc + '\n  const [collapsedGroups');
  formCode = formCode.replace('getGridColsClass: (cols: number) => string;\n', '');
  formCode = formCode.replace('  getGridColsClass\n', '');
  fs.writeFileSync('src/components/FormPanel.tsx', formCode);
}

let appCode = fs.readFileSync('src/App.tsx', 'utf-8');
if (appCode.includes('getGridColsClass={getGridColsClass}')) {
  appCode = appCode.replace(/getGridColsClass=\{getGridColsClass\}/g, '');
  fs.writeFileSync('src/App.tsx', appCode);
}
