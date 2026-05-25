# ERP Form Builder — Modular, Premium RTL-First Drag-&-Drop Designer

A state-of-the-art drag-and-drop form builder tailored for complex enterprise ERP environments. Designed with native RTL (Right-to-Left) Persian layout support, premium micro-animations (Framer Motion/react), and a clean glassmorphism aesthetic.

## 🌟 Key Features

- 📐 **Hierarchical Form Designer**: Build nested tab groups, grids, and primary fields.
- 🗄️ **Database Schema Auto-Binding**: Create new database entities with multi-type fields (Text, Number, Dropdown, Checkbox, Date, Relations) and connect them to form grids or panels.
- 🎛️ **Premium Popover Editors**: Right-floating, Portal-rendered summary rows and field editor dialogs that align vertically with the clicked item and render pointing arrows.
- 🔄 **State-driven Navigation**: Seamlessly navigate between panels with automatic selection of newly created database schemas.
- 🌓 **Theme-aware Aesthetics**: Fully tailored light and dark modes with circular theme-switching view transitions.

## 🚀 Run Locally

**Prerequisites:** Node.js (version 18+)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🛠️ LLM Optimization System

This project contains three dedicated documents that serve as the project's "mental map" for AI coding assistants. Reading/referencing these files instead of full source code saves **over 90% in token burn** per session:

- 🗺️ **[AGENT.md](AGENT.md)**: Describes directory layout, coding conventions, state flow, and step-by-step modification recipes.
- 🎨 **[DESIGN.md](DESIGN.md)**: Contains visual styling guidelines and Tailwind CSS v4 class reference blocks.
- 📊 **[STRUCTURE.md](STRUCTURE.md)**: Explains the React state shape and visualizes the ERP data schemas.

---

## 📁 Key File Map

- `src/App.tsx`: Layout shell coordinating panels.
- `src/hooks/useFormState.ts`: Centralized state management hook.
- `src/components/canvas/`: Main form canvas (`MainPanel.tsx`) and tab drill-down view (`DetailPanel.tsx`).
- `src/components/layout/`: Toolbar (`Header.tsx`), Component toolbox (`Sidebar.tsx`), and Editor properties (`SettingsPanel.tsx`).
- `src/components/settings/`: Dedicated configuration panels for components (`TabPanelSettings.tsx`, `EntityCreatorSettings.tsx`, `FieldSettings.tsx`).
- `src/components/shared/`: Reusable, atomic controls (Toggles, Dropdowns, Formula editors).
