# AI Development Rules

This document outlines the technical stack and development rules for this project. As an AI editor, you must adhere to these guidelines to ensure code consistency, maintainability, and quality.

## Tech Stack

This project is built with a modern, lightweight tech stack:

-   **Framework**: React (v19) using functional components and hooks.
-   **Language**: TypeScript for static typing and improved developer experience.
-   **Build Tool**: Vite for fast development and optimized builds.
-   **Styling**: Tailwind CSS for all styling. Utility classes are applied directly in the JSX.
-   **UI Components**: We use `shadcn/ui` for pre-built, accessible, and customizable components.
-   **Icons**: `lucide-react` is the designated library for all icons.
-   **State Management**: Local component state is managed with React Hooks (`useState`, `useCallback`, etc.). There is no global state management library installed by default.
-   **Routing**: The application is currently a single page. If routing is required, `react-router-dom` will be used.

## Development Guidelines

### 1. Styling
-   **ALWAYS** use Tailwind CSS utility classes for styling.
-   **DO NOT** write custom CSS files or use CSS-in-JS libraries (e.g., styled-components, Emotion).
-   Ensure all components are responsive by using Tailwind's responsive design prefixes (e.g., `md:`, `lg:`).

### 2. Components
-   **PRIORITIZE** using components from the `shadcn/ui` library (e.g., `Button`, `Input`, `Card`).
-   When a `shadcn/ui` component is not suitable, create a new, single-purpose component in the `src/components/` directory.
-   Keep components small and focused. If a component grows too large (over 100 lines), refactor it into smaller, composable components.
-   **NEVER** add new components to existing files. Always create a new file for each new component.

### 3. Icons
-   **ONLY** use icons from the `lucide-react` library.
-   **DO NOT** create custom SVG components for icons.

### 4. State Management
-   For state that is local to a single component, use `useState` or `useReducer`.
-   If state needs to be shared between a few components, lift the state up to the nearest common ancestor.
-   **DO NOT** introduce a global state management library (like Zustand, Jotai, or Redux) without explicit user permission.

### 5. File Structure
-   All source code must reside within the `src/` directory.
-   Reusable components go into `src/components/`.
-   Page-level components go into `src/pages/`.
-   Type definitions should be placed in `src/types.ts` or co-located with their components if specific.
-   Utility functions should be placed in a `src/utils/` directory.

### 6. Code Quality
-   Write clean, readable, and self-documenting code.
-   Use TypeScript to its full potential, avoiding the `any` type whenever possible.
-   Ensure all imports are resolved. If a third-party package is needed, add it using `<dyad-add-dependency>`.