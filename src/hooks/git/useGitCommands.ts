import { useCallback, Dispatch, SetStateAction } from 'react';
import { Commit, Branch, Head, Tag } from '@/types';
import { Y_SPACING, X_SPACING } from '@/constants';
import { explanations } from '@/src/constants/explanations';
import { getHeadCommit, isAncestor } from '@/src/utils/gitUtils';

type GitState = {
  commits: Record<string, Commit>;
  branches: Record<string, Branch>;
  remotes: Record<string, Record<string, Branch>>;
  tags: Record<string, Tag>;
  head: Head;
  branchLanes: Record<string, number>;
  commitCounter: number;
};

type GitSetters = {
  setCommits: Dispatch<SetStateAction<Record<string, Commit>>>;
  setBranches: Dispatch<SetStateAction<Record<string, Branch>>>;
  setRemotes: Dispatch<SetStateAction<Record<string, Record<string, Branch>>>>;
  setTags: Dispatch<SetStateAction<Record<string, Tag>>>;
  setHead: Dispatch<SetStateAction<Head>>;
  setBranchLanes: Dispatch<SetStateAction<Record<string, number>>>;
  setCommitCounter: Dispatch<SetStateAction<number>>;
  setExplanation: Dispatch<SetStateAction<string>>;
  setCommandHistory: Dispatch<SetStateAction<string[]>>;
};

export const useGitCommands = (state: GitState, setters: GitSetters) => {
  const { commits, branches, remotes, tags, head, branchLanes, commitCounter } = state;
  const { setCommits, setBranches, setRemotes, setTags, setHead, setBranchLanes, setCommitCounter, setExplanation, setCommandHistory } = setters;

  const logCommand = (command: string) => {
    setCommandHistory(prev => [...prev, command]);
  };

  const handleCommit = useCallback((message: string) => {
    const parentCommit = getHeadCommit(head, branches, commits);
    if (!parentCommit) return;

    const commitMessage = message || `Commit ${commitCounter}`;
    logCommand(`git commit -m "${commitMessage}"`);

    const newId = `c${commitCounter}`;
    
    let newY: number;
    if (head.type === 'branch') {
        newY = (branchLanes[head.name] || 1) * Y_SPACING;
    } else { 
        newY = parentCommit.y; 
    }

    const newCommit: Commit = {
      id: newId,
      parents: [parentCommit.id],
      message: commitMessage,
      x: parentCommit.x + X_SPACING,
      y: newY,
    };

    setCommits(prev => ({ ...prev, [newId]: newCommit }));

    if (head.type === 'branch') {
      setBranches(prev => ({
        ...prev,
        [head.name]: { ...prev[head.name], commitId: newId },
      }));
    } else {
       setHead({ type: 'detached', commitId: newId });
    }
    
    setCommitCounter(prev => prev + 1);
    setExplanation(explanations.COMMIT);
  }, [head, branches, commits, commitCounter, branchLanes, setCommits, setBranches, setHead, setCommitCounter, setExplanation, setCommandHistory]);

  const handleBranch = useCallback((branchName: string) => {
    let finalBranchName = branchName;
    if (!finalBranchName) {
      do {
        finalBranchName = `branch-${Math.random().toString(36).substring(2, 7)}`;
      } while (branches[finalBranchName]);
    }

    if (branches[finalBranchName]) {
      alert("Branch name already exists.");
      return false;
    }

    const headCommit = getHeadCommit(head, branches, commits);
    if (!headCommit) return false;

    logCommand(`git branch ${finalBranchName}`);
    setBranches(prev => ({ ...prev, [finalBranchName]: { name: finalBranchName, commitId: headCommit.id } }));
    
    const usedLanes = new Set(Object.values(branchLanes));
    let newLane = 1;
    while(usedLanes.has(newLane)) {
      newLane++;
    }
    setBranchLanes(prev => ({...prev, [finalBranchName]: newLane}));

    setExplanation(explanations.BRANCH);
    return true;
  }, [branches, head, commits, branchLanes, setBranches, setBranchLanes, setExplanation, setCommandHistory]);

  const handleTag = useCallback((tagName: string) => {
    let finalTagName = tagName;
    if (!finalTagName) {
      do {
        finalTagName = `v${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`;
      } while (tags[finalTagName]);
    }

    if (tags[finalTagName]) {
      alert("Tag name already exists.");
      return false;
    }
    const headCommit = getHeadCommit(head, branches, commits);
    if (!headCommit) return false;

    logCommand(`git tag ${finalTagName}`);
    setTags(prev => ({...prev, [finalTagName]: { name: finalTagName, commitId: headCommit.id }}));
    setExplanation(explanations.TAG);
    return true;
  }, [tags, head, branches, commits, setTags, setExplanation, setCommandHistory]);

  const handleCheckout = useCallback((name: string) => {
      logCommand(`git checkout ${name}`);
      setHead({ type: 'branch', name });
      setExplanation(explanations.CHECKOUT);
  }, [setHead, setExplanation, setCommandHistory]);

  const handleCheckoutCommit = useCallback((commitId: string) => {
      logCommand(`git checkout ${commitId}`);
      setHead({ type: 'detached', commitId });
      setExplanation(explanations.CHECKOUT_COMMIT);
  }, [setHead, setExplanation, setCommandHistory]);

  const handleMerge = useCallback((mergeTarget: string) => {
    if (head.type !== 'branch' || !mergeTarget || head.name === mergeTarget) return;

    logCommand(`git merge ${mergeTarget}`);
    const headCommit = commits[branches[head.name].commitId];
    const targetCommit = commits[branches[mergeTarget].commitId];
    
    if (headCommit.id === targetCommit.id) {
        alert("Branches are already at the same commit.");
        return;
    }

    if (isAncestor(headCommit.id, targetCommit.id, commits)) {
      setBranches(prev => ({ ...prev, [head.name]: {...prev[head.name], commitId: targetCommit.id }}));
      setExplanation(explanations.MERGE_FF);
      return;
    }
    
    const newId = `c${commitCounter}`;
    const headLaneY = (branchLanes[head.name] || 1) * Y_SPACING;
    const newCommit: Commit = {
        id: newId,
        parents: [headCommit.id, targetCommit.id].sort(),
        message: `Merge branch '${mergeTarget}' into ${head.name}`,
        x: Math.max(headCommit.x, targetCommit.x) + X_SPACING,
        y: headLaneY,
    };
    
    setCommits(prev => ({...prev, [newId]: newCommit}));
    setBranches(prev => ({
        ...prev,
        [head.name]: {...prev[head.name], commitId: newId}
    }));
    setCommitCounter(prev => prev + 1);
    setExplanation(explanations.MERGE);
  }, [head, branches, commits, commitCounter, branchLanes, setCommits, setBranches, setCommitCounter, setExplanation, setCommandHistory]);

  const handleRevert = useCallback(() => {
    const parentCommit = getHeadCommit(head, branches, commits);
    if (!parentCommit || parentCommit.parents.length === 0) {
        alert("Cannot revert the initial commit.");
        return;
    }
    logCommand(`git revert HEAD`);
    handleCommit(`Revert "${parentCommit.message}"`);
    setExplanation(explanations.REVERT);
  }, [head, branches, commits, handleCommit, setExplanation, setCommandHistory]);
  
  const handleRebase = useCallback((rebaseTarget: string) => {
    if (head.type !== 'branch' || !rebaseTarget || head.name === rebaseTarget) return;

    logCommand(`git rebase ${rebaseTarget}`);
    const baseBranchName = rebaseTarget;
    const featureBranchName = head.name;
    
    const baseCommit = commits[branches[baseBranchName].commitId];
    const featureHeadCommit = commits[branches[featureBranchName].commitId];

    const baseAncestors = new Set();
    let q: string[] = [baseCommit.id];
    while(q.length > 0) {
        const id = q.shift()!;
        if (commits[id] && !baseAncestors.has(id)) {
            baseAncestors.add(id);
            q.push(...commits[id].parents);
        }
    }

    const commitsToReplay: Commit[] = [];
    q = [featureHeadCommit.id];
    const visited = new Set([baseCommit.id]);
    while(q.length > 0) {
        const id = q.shift()!;
        if (!commits[id] || visited.has(id) || baseAncestors.has(id)) continue;
        visited.add(id);
        commitsToReplay.unshift(commits[id]);
        q.push(...commits[id].parents);
    }
    
    if (commitsToReplay.length === 0) {
        alert(`Branch '${featureBranchName}' is already up-to-date with '${baseBranchName}'.`);
        return;
    }

    let newParentCommit = baseCommit;
    let newCommits = {...commits};
    let currentCommitCounter = commitCounter;

    for (const oldCommit of commitsToReplay) {
        const newId = `c${currentCommitCounter++}'`;
        const newCommit: Commit = {
            id: newId,
            parents: [newParentCommit.id],
            message: oldCommit.message,
            x: newParentCommit.x + X_SPACING,
            y: (branchLanes[baseBranchName] || 1) * Y_SPACING
        };
        newCommits[newId] = newCommit;
        newParentCommit = newCommit;
    }

    setCommits(newCommits);
    setCommitCounter(currentCommitCounter);
    setBranches(prev => ({...prev, [featureBranchName]: {...prev[featureBranchName], commitId: newParentCommit.id }}));
    setBranchLanes(prev => ({...prev, [featureBranchName]: branchLanes[baseBranchName]}));
    setExplanation(explanations.REBASE);
  }, [head, branches, commits, commitCounter, branchLanes, setCommits, setCommitCounter, setBranches, setBranchLanes, setExplanation, setCommandHistory]);

  const handleReset = useCallback((resetTarget: string) => {
    if (head.type !== 'branch' || !resetTarget) {
      alert("Must be on a branch and select a target commit to reset.");
      return;
    }
    
    const targetCommit = commits[resetTarget];
    if (!targetCommit) {
        alert("Target commit does not exist.");
        return;
    }

    logCommand(`git reset ${resetTarget}`);
    setBranches(prev => ({
        ...prev,
        [head.name]: {...prev[head.name], commitId: resetTarget}
    }));

    setExplanation(explanations.RESET);
  }, [head, commits, setBranches, setExplanation, setCommandHistory]);

  const handlePush = useCallback(() => {
    if (head.type !== 'branch') {
      alert("You must be on a branch to push.");
      return;
    }
    logCommand(`git push origin ${head.name}`);
    const localBranch = branches[head.name];
    setRemotes(prev => ({
      ...prev,
      origin: {
        ...prev.origin,
        [localBranch.name]: { ...localBranch }
      }
    }));
    setExplanation(explanations.PUSH);
  }, [head, branches, setRemotes, setExplanation, setCommandHistory]);

  const handleSimulateRemotePush = useCallback(() => {
    if (head.type !== 'branch') return;
    const remoteBranch = remotes.origin[head.name];
    if (!remoteBranch) {
      alert(`Remote branch 'origin/${head.name}' does not exist. Push the branch first.`);
      return;
    }

    logCommand(`(simulation) new remote commit on origin/${head.name}`);
    const parentCommit = commits[remoteBranch.commitId];
    if (!parentCommit) return;

    const newId = `c${commitCounter}`;
    const newCommit: Commit = {
      id: newId,
      parents: [parentCommit.id],
      message: `Remote work on ${head.name}`,
      x: parentCommit.x + X_SPACING,
      y: parentCommit.y,
    };

    setCommits(prev => ({ ...prev, [newId]: newCommit }));
    setRemotes(prev => ({
      ...prev,
      origin: {
        ...prev.origin,
        [head.name]: { ...remoteBranch, commitId: newId }
      }
    }));
    setCommitCounter(prev => prev + 1);
    setExplanation(explanations.FETCH);
  }, [head, remotes, commits, commitCounter, setCommits, setRemotes, setCommitCounter, setExplanation, setCommandHistory]);

  const handlePull = useCallback(() => {
    if (head.type !== 'branch') return;
    logCommand(`git pull origin ${head.name}`);
    const localBranch = branches[head.name];
    const remoteBranch = remotes.origin[head.name];
    if (!localBranch || !remoteBranch) return;

    const localCommit = commits[localBranch.commitId];
    const remoteCommit = commits[remoteBranch.commitId];

    if (isAncestor(localCommit.id, remoteCommit.id, commits)) { // Fast-forward
      setBranches(prev => ({ ...prev, [head.name]: { ...prev[head.name], commitId: remoteCommit.id } }));
      setExplanation(explanations.PULL);
    } else { // Merge commit
      const newId = `c${commitCounter}`;
      const newCommit: Commit = {
        id: newId,
        parents: [localCommit.id, remoteCommit.id].sort(),
        message: `Merge remote-tracking branch 'origin/${head.name}'`,
        x: Math.max(localCommit.x, remoteCommit.x) + X_SPACING,
        y: localCommit.y,
      };
      setCommits(prev => ({ ...prev, [newId]: newCommit }));
      setBranches(prev => ({ ...prev, [head.name]: { ...prev[head.name], commitId: newId } }));
      setCommitCounter(prev => prev + 1);
      setExplanation(explanations.PULL);
    }
  }, [head, branches, remotes, commits, commitCounter, setBranches, setCommits, setCommitCounter, setExplanation, setCommandHistory]);

  const handleCherryPick = useCallback((commitId: string) => {
    const headCommit = getHeadCommit(head, branches, commits);
    const commitToPick = commits[commitId];
    if (!headCommit || !commitToPick) return;

    logCommand(`git cherry-pick ${commitId}`);
    const newId = `c${commitCounter}'`;
    const newCommit = {
      id: newId,
      parents: [headCommit.id],
      message: commitToPick.message,
      x: headCommit.x + X_SPACING,
      y: headCommit.y,
    };

    setCommits(prev => ({ ...prev, [newId]: newCommit }));

    if (head.type === 'branch') {
      setBranches(prev => ({
        ...prev,
        [head.name]: { ...prev[head.name], commitId: newId },
      }));
    } else {
      setHead({ type: 'detached', commitId: newId });
    }

    setCommitCounter(prev => prev + 1);
    setExplanation(explanations.CHERRY_PICK);
  }, [head, branches, commits, commitCounter, setCommits, setBranches, setHead, setCommitCounter, setExplanation, setCommandHistory]);

  return {
    handleCommit,
    handleBranch,
    handleTag,
    handleCheckout,
    handleCheckoutCommit,
    handleMerge,
    handleRevert,
    handleRebase,
    handleReset,
    handlePush,
    handlePull,
    handleSimulateRemotePush,
    handleCherryPick,
  };
};