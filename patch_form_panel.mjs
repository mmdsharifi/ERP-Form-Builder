import fs from 'fs';

let code = fs.readFileSync('src/components/FormPanel.tsx', 'utf-8');

// 4. Wrap the grid body so it can be collapsed
const gridStartOld = '<div className={`grid ${getGridColsClass(group.columns)} gap-x-6 gap-y-4 min-h-[60px]`}>';
const gridStartNew = '{!collapsedGroups[group.id] && (\n          <div className={`grid ${getGridColsClass(group.columns)} gap-x-6 gap-y-4 min-h-[60px]`}>';

const gridEndOld = `))
            )}
          </div>`;
const gridEndNew = `))
            )}
          </div>\n          )}`;

if (code.includes(gridStartOld)) {
  code = code.replace(gridStartOld, gridStartNew);
  code = code.replace(gridEndOld, gridEndNew);
  fs.writeFileSync('src/components/FormPanel.tsx', code);
  console.log('Successfully wrapped grid.');
} else {
  console.log('Could not find gridStartOld!');
}
