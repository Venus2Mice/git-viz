# Project Roadmap: Git Visualizer

This document outlines the development plan for the Git Visualizer application, breaking it down into distinct phases.

---

### Phase 1: Code Refactoring & Structuring (Current Phase)

**Objective:** Improve code quality, maintainability, and scalability by separating concerns and creating a more modular architecture. This is based on the `refactor_app.md` plan.

**Key Tasks:**

1.  **Component Extraction (In Progress):** Break down `App.tsx` into smaller, single-responsibility UI components.
    -   [x] `CommitControls.tsx`
    -   [ ] `BranchTagControls.tsx` (for creating branches and tags)
    -   [ ] `CheckoutControls.tsx` (for switching branches)
    -   [ ] `MergeControls.tsx`
    -   [ ] `RebaseControls.tsx`
    -   [ ] `HistoryControls.tsx` (for revert and reset)

2.  **State Logic Abstraction:** Move all Git-related state and logic into the custom hook `useGitVisualizer.ts`.
    -   [x] Initial hook setup with state variables.
    -   [ ] Move all handler functions (`handleCommit`, `handleBranch`, etc.) into the hook.
    -   [ ] Move all derived state calculations (`otherBranches`, `reachableCommits`, etc.) into the hook.

3.  **Simplify `App.tsx`:** The final step of this phase will be to make `App.tsx` a clean, top-level component that primarily handles layout and passes state/functions from the hook to the new UI components.

---

### Phase 2: Feature Enhancement & UI/UX Improvements

**Objective:** Add new features to enhance the learning experience and improve the user interface.

**Key Tasks:**

1.  **Remote Repository Simulation:**
    -   Add a visual representation of a "remote" repository (e.g., `origin/main`).
    -   Implement `git push`, `git pull`, and `git fetch` commands to interact with the remote.

2.  **Interactive Commands:**
    -   Implement `git cherry-pick` to copy a commit from one branch to another.
    -   Add support for `git stash` to temporarily save changes.

3.  **Improved User Experience:**
    -   Add a "Reset Simulation" button to return to the initial state.
    -   Implement a command history panel that logs the commands run by the user.
    -   Add tooltips to buttons and controls to explain their function.

---

### Phase 3: Polish & Finalization

**Objective:** Prepare the application for a stable, production-ready state.

**Key Tasks:**

1.  **Performance Optimization:**
    -   Analyze and optimize SVG rendering, especially for large commit histories.
    -   Ensure efficient state updates and re-renders using memoization where needed.

2.  **Accessibility (a11y):**
    -   Conduct an accessibility audit.
    -   Ensure all interactive elements are keyboard-navigable and have appropriate ARIA labels.

3.  **Cross-Browser Testing:**
    -   Test the application on major web browsers (Chrome, Firefox, Safari) to ensure consistent behavior.

4.  **Final Documentation:**
    -   Update the `README.md` with a comprehensive guide to all features.
    -   Add inline code comments for any complex logic to aid future development.