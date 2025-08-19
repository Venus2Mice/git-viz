export const explanations = {
  INITIAL: "This is your git repository. Each commit is a snapshot of your project. Click the buttons to perform git commands.",
  COMMIT: "git commit: Creates a new snapshot. Each commit has a unique ID and points to its parent(s), forming a history.",
  BRANCH: "git branch <name>: Creates a new pointer (a branch) to a commit. Branches let you develop features in isolation.",
  CHECKOUT: "git checkout <name>: Switches the HEAD to another branch or a specific commit. HEAD determines where the next commit will be created.",
  CHECKOUT_COMMIT: "Detached HEAD: HEAD is pointing directly to a commit instead of a branch. New commits will not belong to any branch.",
  MERGE: "git merge <name>: Combines changes from another branch into the current (HEAD) branch. A new merge commit with two parents is created.",
  MERGE_FF: "Fast-Forward Merge: Because there were no divergent commits on the target branch, git just moves the branch pointer forward. No merge commit is needed.",
  TAG: "git tag <name>: Creates a permanent pointer to a specific commit, often used to mark release versions (v1.0).",
  REVERT: "git revert HEAD: Creates a new commit that undoes the changes made by a previous commit. History is added to, not altered.",
  REBASE: "git rebase <base>: Moves the entire current branch to begin on top of another branch. It rewrites commit history to create a linear workflow.",
  RESET: "git reset <commit>: Moves the current branch's (HEAD) pointer back to a specific commit. This rewrites history by removing commits from the branch's history chain, but does not delete them. They become 'orphaned' if no other branch points to them.",
  PUSH: "git push: Uploads your local branch commits to the remote repository. This updates the remote branch to match your local one, sharing your changes with others."
};