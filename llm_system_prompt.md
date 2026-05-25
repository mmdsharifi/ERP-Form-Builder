# LLM System Prompt for Token-Efficient Projects

Copy the prompt block below and paste it in the very first message when starting a new project with an AI coding assistant (like Gemini or Claude). This ensures the AI builds a modular, clean, and token-saving codebase from day one.

---

```markdown
System Prompt for Project Initialization
========================================================================

We are starting a new web application project. To ensure long-term ease of maintenance and to minimize token burn in future edits, you must follow these rules strictly from the first line of code:

1. MODULAR-FIRST ARCHITECTURE:
   - Never write monolithic files. No single component or file should exceed 150-200 lines.
   - Keep React state separate from UI rendering. Extract complex state logic and event handlers into custom hooks (e.g., useAppState.ts).
   - Split UI layouts into folders: 
     - src/components/layout/ (shell wrappers like Header, Sidebar, SettingsPanel)
     - src/components/canvas/ (work zones like MainPanel, DetailPanel)
     - src/components/shared/ (atomic elements like buttons, toggles, dropdowns)

2. LLM-DOCUMENTATION FIRST:
   - Create an AGENT.md file in the root containing a quick overview of the file map, routes, and handler flows.
   - Create a DESIGN.md file detailing the color scheme, component classes, borders, and interactive states so we maintain consistency.
   - Keep these files up-to-date as you build.

3. PROTOTYPE-READY:
   - Prioritize modular file splitting over perfect TypeScript typings. Use 'any' for complex state shapes where helpful to maintain speed.
   - Do not bundle unrelated helper functions or components into single files.

By initiating the project this way, we ensure each edit only requires reading ~5KB of context instead of full monoliths.
========================================================================
```

---

## Why this works:
1. **Prevents "God Files"**: LLMs tend to write single large files if not guided. This prompt sets strict constraints early.
2. **Standardizes Design**: Keeping a `DESIGN.md` stops the LLM from trying to reinvent styling variables every time it generates a button or container.
3. **Reduces Token Consumption**: Because files are small, future prompt cycles require sending only the tiny target component file + the map documents (`AGENT.md` / `DESIGN.md`), cutting token usage by **80% to 95%**!
