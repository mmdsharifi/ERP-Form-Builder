<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# ERP Form Builder — Modular, LLM-Optimized Design

This project contains everything you need to run and develop the ERP Form Builder locally. It has been refactored into a highly modular component structure specifically optimized to minimize LLM token burn.

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
- `src/components/shared/`: Reusable, atomic controls (Toggles, Dropdowns, Formula editors).
