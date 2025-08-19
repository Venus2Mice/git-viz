# Refactor Plan: App.tsx

## Introduction
The `App.tsx` file currently manages a significant amount of application state and contains a large portion of the UI logic. This plan outlines a refactoring strategy to improve the maintainability, readability, and scalability of the application by separating concerns.

## Goals
1.  **Improve Readability:** Make `App.tsx` easier to understand by reducing its size and complexity.
2.  **Enhance Maintainability:** Isolate specific functionalities into smaller, more focused components and hooks.
3.  **Promote Reusability:** Extract common UI patterns and logic into reusable modules.
4.  **Separate Concerns:** Clearly distinguish between state management, business logic, and UI rendering.

## Proposed Changes

### 1. Extract UI Components
Move presentational components and common UI patterns out of `App.tsx` into their own dedicated files in `src/components/`.

*   **`ControlGroup.tsx`**: Extract the `ControlGroup` component.
*   **`StyledSelect.tsx`**: Extract the `StyledSelect` component.
*   **New Control Components**: Create new components for each distinct control section to encapsulate their UI and related input states.
    *   `CommitControls.tsx`: For the "Thực hiện Thay đổi" (Perform Changes) section.
    *   `BranchTagControls.tsx`: For the "Tạo Con trỏ" (Create Pointer) section, potentially splitting into `BranchControls.tsx` and `TagControls.tsx` if they become complex.
    *   `CheckoutControls.tsx`: For the "Checkout Nhánh" (Checkout Branch) section.
    *   `MergeControls.tsx`: For the "Hợp nhất vào..." (Merge into...) section.
    *   `RebaseControls.tsx`: For the "Rebase..." section.
    *   `HistoryControls.tsx`: For the "Chỉnh sửa Lịch sử" (Edit History) section, including Revert and Reset.

### 2. Create a Custom Hook for Git Logic (`useGitVisualizer.ts`)
Encapsulate all Git-related state and logic into a custom React hook. This hook will manage:

*   `commits`, `branches`, `tags`, `head`, `branchLanes`, `commitCounter` states.
*   All Git command handlers: `handleCommit`, `handleBranch`, `handleTag`, `handleCheckout`, `handleCheckoutCommit`, `handleMerge`, `handleRevert`, `handleRebase`, `handleReset`.
*   Helper functions: `getHeadCommit`, `isAncestor`, `reachableCommits`, `otherBranches`, `rebaseableBranches`, `sortedCommits`.
*   The `explanation` state and its updates.

This hook will expose the necessary state and functions for `App.tsx` and other UI components to consume.

### 3. Move Explanations
The `explanations` object is a large constant. It should be moved to a dedicated file, e.g., `src/constants/explanations.ts`.

### 4. Simplify `App.tsx`
After extracting components and creating the custom hook, `App.tsx` will become much simpler. Its primary responsibility will be to:

*   Import and use the `useGitVisualizer` hook.
*   Render the main layout (`header`, `aside`, `main`, `explanation div`).
*   Render the new, smaller control components, passing down the necessary props (state and functions) from the `useGitVisualizer` hook.
*   Render the `GitVisualizer` component.

## Benefits of this Refactor
*   **Clearer Separation:** UI logic is separated from core Git state and operations.
*   **Easier Testing:** The `useGitVisualizer` hook can be tested independently of the UI.
*   **Improved Onboarding:** New developers can understand the application's flow more quickly by looking at smaller, focused files.
*   **Reduced Cognitive Load:** `App.tsx` will be significantly smaller and easier to reason about.
*   **Better Scalability:** Adding new Git commands or UI features will be more straightforward, as changes will be localized to specific components or the custom hook.