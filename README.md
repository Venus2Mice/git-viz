<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Git Visualizer

Git Visualizer is an interactive, web-based tool designed to help developers and students understand how Git commands work. By providing a real-time graphical representation of the commit graph, branches, and HEAD, it demystifies complex operations like merging, rebasing, and cherry-picking.

View your app in AI Studio: https://ai.studio/apps/drive/1FeWXe6kAjw1uSDJTWhl3IeQt3vi2ORjl

## ✨ Features

-   **Interactive Graph**: See commits, branches, tags, and HEAD update in real-time as you execute commands.
-   **Comprehensive Command Support**: Simulate a wide range of Git commands, including `commit`, `branch`, `checkout`, `merge`, `rebase`, `revert`, `reset`, `cherry-pick`, and more.
-   **Remote Repository Simulation**: Practice `push` and `pull` workflows with a simulated remote repository.
-   **Command History & Explanations**: Track the commands you've run and get clear, concise explanations for what each one does.

## 🚀 Tech Stack

This project is built with a modern, lightweight tech stack focused on performance and developer experience:

-   **Framework**: [React 19](https://react.dev/) with functional components and hooks.
-   **Language**: [TypeScript](https://www.typescriptlang.org/) for robust static typing.
-   **Build Tool**: [Vite](https://vitejs.dev/) for lightning-fast development and optimized builds.
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) for a utility-first styling workflow.

## 📂 Project Structure

The codebase is organized to be modular and maintainable:

```
.
├── public/
├── src/
│   ├── components/      # Reusable React UI components
│   ├── constants/       # App-wide constants (e.g., styling, explanations)
│   ├── hooks/           # Custom React hooks for state and logic
│   │   └── git/         # Git-specific logic hooks
│   ├── utils/           # Helper functions
│   └── App.tsx          # Main application component (layout)
├── types.ts             # Core TypeScript type definitions
├── index.html           # Entry HTML file
└── vite.config.ts       # Vite configuration
```

## Local Development

**Prerequisites:** [Node.js](https://nodejs.org/) installed.

1.  **Install Dependencies:**
    `npm install`

2.  **Run the Development Server:**
    `npm run dev`
    
    The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## 📚 Additional Documentation

-   **[ROADMAP.md](./ROADMAP.md)**: Outlines the future development plans and upcoming features.
-   **[design_rules.md](./design_rules.md)**: Describes the design philosophy and visual style guidelines.
-   **[AI_RULES.md](./AI_RULES.md)**: Contains the technical development rules and constraints for AI-assisted coding.