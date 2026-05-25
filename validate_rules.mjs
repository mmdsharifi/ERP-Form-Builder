import fs from 'fs';
import path from 'path';

let failed = false;

function checkInvalidColors() {
  console.log('🔍 Checking for invalid Tailwind color shades...');
  const files = [
    'src/components/GridTable.tsx',
    'src/components/shared/MultiSelectDropdown.tsx',
    'src/components/settings/TabPanelSettings.tsx',
    'src/components/shared/ToggleSwitch.tsx'
  ];

  const invalidShades = ['slate-850', 'slate-350', 'slate-655', 'slate-450'];

  for (const file of files) {
    const filePath = path.resolve(file);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${file}`);
      failed = true;
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    for (const shade of invalidShades) {
      if (content.includes(shade)) {
        console.error(`❌ Violation in ${file}: contains invalid Tailwind color shade '${shade}'`);
        failed = true;
      }
    }
  }
}

function checkTabPanelSettings() {
  console.log('🔍 Checking TabPanelSettings.tsx viewType restriction and footer editing popover...');
  const filePath = path.resolve('src/components/settings/TabPanelSettings.tsx');
  if (!fs.existsSync(filePath)) {
    console.error('❌ TabPanelSettings.tsx not found!');
    failed = true;
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes("_context !== 'l2'")) {
    console.error("❌ TabPanelSettings.tsx does not check selectedElement._context !== 'l2' to hide viewType selection!");
    failed = true;
  }
  if (!content.includes('editingFooterRow') || !content.includes('setEditingFooterRow')) {
    console.error("❌ TabPanelSettings.tsx does not use local state 'editingFooterRow' for popover editing!");
    failed = true;
  }
}

function checkTextFieldSettings() {
  console.log('🔍 Checking TextFieldSettings.tsx for placeholder setting removal...');
  const filePath = path.resolve('src/components/settings/TextFieldSettings.tsx');
  if (!fs.existsSync(filePath)) {
    console.error('❌ TextFieldSettings.tsx not found!');
    failed = true;
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('متن نگهدارنده (Placeholder)')) {
    console.error("❌ TextFieldSettings.tsx still has 'متن نگهدارنده (Placeholder)' settings block!");
    failed = true;
  }
}

function checkFormPanelHelperText() {
  console.log('🔍 Checking FormPanel.tsx for helper text, base group locks, and single-group header hiding...');
  const filePath = path.resolve('src/components/FormPanel.tsx');
  if (!fs.existsSync(filePath)) {
    console.error('❌ FormPanel.tsx not found!');
    failed = true;
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  // Check if tooltip is removed and helper text paragraph is added
  if (content.includes('<Tooltip text={field.placeholder} />')) {
    console.error('❌ FormPanel.tsx still contains the tooltip icon for placeholders!');
    failed = true;
  }
  if (!content.includes('field.placeholder') || !content.includes('font-medium leading-relaxed')) {
    console.error('❌ FormPanel.tsx does not render helper text underneath input widgets!');
    failed = true;
  }
  if (!content.includes('groups.length > 1')) {
    console.error('❌ FormPanel.tsx does not check groups.length > 1 to hide header when there is only one group!');
    failed = true;
  }
  if (!content.includes("group.id !== 'g_base'")) {
    console.error("❌ FormPanel.tsx does not restrict deletion of the 'g_base' base group!");
    failed = true;
  }
}

function checkUseFormState() {
  console.log('🔍 Checking useFormState.ts state management and formula drop updates...');
  const filePath = path.resolve('src/hooks/useFormState.ts');
  if (!fs.existsSync(filePath)) {
    console.error('❌ useFormState.ts not found!');
    failed = true;
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes("selectedElement.type === 'container-main'") || !content.includes('setViewStack(stack =>')) {
    console.error('❌ useFormState.ts updateElementProp does not sync Main Panel title changes with viewStack!');
    failed = true;
  }
  if (!content.includes("groupId === 'g_base' || groupId.startsWith('l2g_base')")) {
    console.error('❌ useFormState.ts handleDeleteGroup does not block base groups deletion!');
    failed = true;
  }
  if (!content.includes("componentType === 'comp-formula'")) {
    console.error('❌ useFormState.ts handleDrop does not bypass DB binding check for formula columns!');
    failed = true;
  }
}

function checkDarkThemeWrappers() {
  console.log('🔍 Checking dark theme wrappers in settings...');
  const file = 'src/components/settings/TextFieldSettings.tsx';
  const filePath = path.resolve(file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${file}`);
    failed = true;
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('className="bg-gray-50 border border-gray-100')) {
    console.error('❌ TextFieldSettings.tsx contains plain bg-gray-50 containers without dark mode variants!');
    failed = true;
  }
}

function checkSidebarFormulaColumn() {
  console.log('🔍 Checking Sidebar.tsx for draggable formula columns...');
  const filePath = path.resolve('src/components/layout/Sidebar.tsx');
  if (!fs.existsSync(filePath)) {
    console.error('❌ Sidebar.tsx not found!');
    failed = true;
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes("type=\"comp-formula\"")) {
    console.error("❌ Sidebar.tsx does not contain draggable item for 'comp-formula'!");
    failed = true;
  }
}

// Run checks
checkInvalidColors();
checkTabPanelSettings();
checkTextFieldSettings();
checkFormPanelHelperText();
checkUseFormState();
checkDarkThemeWrappers();
checkSidebarFormulaColumn();

if (failed) {
  console.error('\n🛑 Validation FAILED! Regressions/violations were found.');
  process.exit(1);
} else {
  console.log('\n✅ Validation PASSED! All requirements are met and correctly implemented.');
  process.exit(0);
}
