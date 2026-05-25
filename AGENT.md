# AGENT.md — LLM Guide for ERP Form Builder

Welcome, AI Assistant! This document acts as your map and guidelines for working on the ERP Form Builder codebase. Reading this file instead of scanning the entire project will save you and the user thousands of tokens and avoid trial-and-error changes.

---

## 1. Project Overview
This application is a **drag-and-drop ERP Form Builder** designed to build structured, multi-level forms. The structural hierarchy is as follows:
- **Level 1 (Main Panel)**: Renders the primary details of the document (e.g., base inputs, header metadata). Renders groups (`mainGroups`) and fields.
- **Level 2 (Tabs/Panels)**: Renders Tab containers below the main form (e.g., Items/L2 Tabs). Can be displayed as either a Grid Table or a Form Panel.
- **Level 3 (Detail Tabs/Panels)**: Clicking a row in an L2 Grid drills down into L3 Detail Tabs (e.g., child forms, item info).

---

## 2. Directory Structure Map

```
.
├── AGENT.md                  # This file (LLM guidance)
├── DESIGN.md                 # Design system & CSS classes reference
├── STRUCTURE.md              # State shape, Mermaid charts, data models
├── package.json              # Dependencies (Tailwind v4, motion/react, lucide-react)
├── vite.config.ts            # Vite configuration
└── src/
    ├── main.tsx              # Application entry point
    ├── index.css             # Main stylesheet (Tailwind imports & font config)
    ├── App.tsx               # Root component (orchestrates layout & feeds state)
    ├── hooks/
    │   └── useFormState.ts   # Core React State and handlers (centralized state)
    ├── components/
    │   ├── FormPanel.tsx     # Canvas container that renders grouped fields
    │   ├── GridTable.tsx     # Canvas component for Level 2/3 lists and tables
    │   ├── Toast.tsx         # Notification toast system
    │   ├── canvas/
    │   │   ├── MainPanel.tsx # Level 1 Form Canvas Wrapper
    │   │   └── DetailPanel.tsx # Level 2 & Level 3 Canvas & Tabs Controller
    │   ├── layout/
    │   │   ├── Header.tsx    # Header navbar (Form title, Save button, state info)
    │   │   ├── Sidebar.tsx   # Left-side toolbox containing draggable field types
    │   │   └── SettingsPanel.tsx # Right-side field & tab attribute editor
    │   ├── settings/
    │   │   ├── FieldSettings.tsx # Common settings for form fields
    │   │   ├── TextFieldSettings.tsx # Settings specific to text fields
    │   │   └── TabPanelSettings.tsx  # Settings for L2/L3 tab components
    │   └── shared/
    │       ├── DraggableItem.tsx # Draggable sidebar component representation
    │       ├── PropertyField.tsx # Shared input/select form control for settings
    │       ├── ToggleSwitch.tsx  # Sleek toggle switch component
    │       ├── FormulaBuilder.tsx # Interactive equation/expression editor
    │       └── MultiSelectDropdown.tsx # Multi-option selection dropdown list
    └── utils/
        └── gridCols.ts       # Grid columns structure helper
```

---

## 3. Technology Stack & Coding Conventions

- **Visual layout direction**: RTL-only (`dir="rtl"`). Spacing must respect RTL: use `space-x-reverse`, `ps-*`, `pe-*`, `start-*`, `end-*` instead of absolute left/right margins/paddings.
- **Languages**: Codebase comments and logs are in **English**. User Interface text, form titles, placeholders, and error messages are in **Persian** (Farsi).
- **Styling**: Tailwind CSS v4. Standard styling tokens are documented in `DESIGN.md`. Do not introduce ad-hoc CSS unless matching established classes.
- **Animations**: Use `motion/react` (e.g., `<motion.div>`) instead of `framer-motion`. Ensure `AnimatePresence` wraps conditional panels where smooth transitions are needed.
- **Icons**: Use `lucide-react` icons exclusively.
- **Typography**: Uses the `Vazirmatn` font family for smooth Persian reading.

---

## 4. State Management Patterns

The state of the entire form designer resides in `src/hooks/useFormState.ts`.
- Components do **not** maintain local design state; they receive properties and event handler callbacks from the hook.
- **Key State Variables**:
  - `mainGroups`: Level 1 groups containing dropped fields.
  - `level2Tabs`: L2 tab configurations (including columns, bindings, view type, and nested groups).
  - `level3Tabs`: L3 tab configurations (nested child details).
  - `viewStack`: Navigation stack for drill-down views. If `viewStack.length === 1`, we are at Level 1 (main form). If `length > 1`, we are drilled down into L2/L3.
  - `selectedElement`: The currently selected field or tab. Selecting an element displays its properties in the `SettingsPanel`.
- **Entity Dictionary**: Fields can only be bound if an entity is connected. The standard schema definitions (e.g., `sales_process`, `sales_stages`) are mock-defined at the top of the state hook.

---

## 5. Common Tasks Recipes

### 1. Adding a new Draggable Field Type
1. Go to `src/components/layout/Sidebar.tsx` and add your field type to the draggable items list.
2. In `src/hooks/useFormState.ts`, locate the `handleDrop` handler and verify that the dropped component type maps correctly.
3. In `src/components/FormPanel.tsx`, add the renderer logic to render the input widget for your new field type.
4. In `src/components/layout/SettingsPanel.tsx`, add editing properties for your field type.

### 2. Modifying Field Properties / Adding a New Setting
1. Add the new attribute to the mock field object structure in `src/hooks/useFormState.ts`.
2. Go to the relevant settings file under `src/components/settings/` (e.g., `FieldSettings.tsx` or `TextFieldSettings.tsx`) and add the `PropertyField` or `ToggleSwitch` control.
3. Hook the change event callback to trigger state updates in `useFormState` (via `setSelectedElement` and tab state updater functions).

### 3. Altering Layout & Visuals
1. Check `DESIGN.md` for pre-approved utility class patterns.
2. If modifying canvas components, ensure they support the standard active state focus outline (`border-indigo-500` / `ring-2` focus highlights).
3. If changing animations, keep them lightweight with duration around `0.2` seconds.

---

## 6. Permanent Project Requirements & Design Constraints

To prevent regressions, the following rules must be maintained across all modifications:
1. **Main Information Panel**: The Main Information Panel's title/label must be fully editable. Changing it must update both `mainPanelName` and the root navigation breadcrumb (`viewStack[0].title`) dynamically.
2. **Items Panel (Level 2)**: All Level 2 Panels/Tabs (e.g., "اقلام") must be represented only as a Grid Table. The view type toggle buttons ("نوع نمایش") must be hidden, and their `viewType` locked to `'grid'`.
3. **Helper Texts vs Placeholders**: Fields must not use the `placeholder` attribute inside the input element. Instead, place helper texts directly under the input widget inside `FormPanel.tsx`. Rename "متن نگهدارنده" to "متن راهنما (Helper Text)" in settings.
4. **Grouping Styling**: Form groups must be styled as solid, clean containers with high-contrast borders and shadows matching `DESIGN.md`, rather than simple transparent dashed zones.
5. **Dark/Light Theme Compatibility**: Always use dark mode variants (`dark:...`) for custom background and border styles (e.g., in Settings components, `bg-gray-50` must have `dark:bg-slate-800/40` and `border-gray-100` must have `dark:border-slate-800`). Never use invalid Tailwind color shades like `slate-850`, `slate-350`, `slate-655`, or `slate-450`.

