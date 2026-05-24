import fs from 'fs';
let code = fs.readFileSync('src/components/FormPanel.tsx', 'utf-8');

code = code.replace(/          <\/div>\n          \)}\n          \)}\n        <\/div>/g, '          </div>\n          )}\n        </div>');

fs.writeFileSync('src/components/FormPanel.tsx', code);
