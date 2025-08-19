import { useState, useCallback, useMemo } from 'react';
import { Commit, Branch, Head, Tag } from '../../types';
import { Y_SPACING, X_SPACING, SVG_PADDING } from '../../constants';
import { explanations } from '../constants/explanations';

const initialCommit: Commit = {
  id: 'c0',
  parents: [],
  message: 'Initial commit',
  x: SVG_PADDING + X_SPACING / 2,
  y: Y_SPACING * 4,
};

const initialBranches: Record<string, Branch> = {
  'main': {
    name: 'main',
    commitId: 'c0',
  }
};

const initialHead: Head = { type: 'branch', name: 'main' };

const initialBranchLanes: Record<string, number> = { 'main': 4 };

export const useGitVisualizer = () => {
  const [commits, setCommits] = useState<Record<string, Commit>>({ [initialCommit.id]: initialCommit });
  const [branches, setBranches] = useState<Record<string, Branch>>(initialBranches);
  const [tags, setTags] = useState<Record<string, Tag>>({});
  const [head, setHead] = useState<Head>(initialHead);
  const [branchLanes, setBranchLanes] = useState<Record<string, number>>(initialBranchLanes);
  const [commitCounter, setCommitCounter] = useState(1);
  const [explanation, setExplanation] = useState(explanations.INITIAL);

  const getHeadCommit = useCallback(() => {
    if (head.type === 'branch') {
      const headBranch = branches[head.name];
      return headBranch ? commits[headBranch.commitId] : null;
    }
    return commits[head.commitId];
  }, [head, branches, commits]);

  const handleCommit = useCallback((message: string) => {
    const parentCommit = getHeadCommit();
    if (!parentCommit) return;

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
      message: message || `Commit ${commitCounter}`,
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
  }, [getHeadCommit, commitCounter, head, branchLanes, setCommits, setBranches, setHead, setCommitCounter, setExplanation]);

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

    const headCommit = getHeadCommit();
    if (!headCommit) return false;

    setBranches(prev => ({ ...prev, [finalBranchName]: { name: finalBranchName, commitId: headCommit.id } }));
    
    const usedLanes = new Set(Object.values(branchLanes));
    let newLane = 1;
    while(usedLanes.has(newLane)) {
      newLane++;
    }
    setBranchLanes(prev => ({...prev, [finalBranchName]: newLane}));

    setExplanation(explanations.BRANCH);
    return true;
  }, [branches, getHeadCommit, branchLanes, setBranches, setBranchLanes, setExplanation]);

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
    const headCommit = getHeadCommit();
    if (!headCommit) return false;

    setTags(prev => ({...prev, [finalTagName]: { name: finalTagName, commitId: headCommit.id }}));
    setExplanation(explanations.TAG);
    return true;
  }, [tags, getHeadCommit, setTags, setExplanation]);

  const handleCheckout = useCallback((name: string) => {
      setHead({ type: 'branch', name });
      setExplanation(explanations.CHECKOUT);
  }, [setHead, setExplanation]);

  const handleCheckoutCommit = useCallback((commitId: string) => {
      setHead({ type: 'detached', commitId });
      setExplanation(explanations.CHECKOUT_COMMIT);
  }, [setHead, setExplanation]);

  const isAncestor = useCallback((ancestorId: string, descendantId: string): boolean => {
    let queue = [descendantId];
    const visited = new Set(queue);
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (currentId === ancestorId) return true;
      const currentCommit = commits[currentId];
      if (currentCommit) {
        for (const parentId of currentCommit.parents) {
          if (!visited.has(parentId)) {
            visited.add(parentId);
            queue.push(parentId);
          }
        }
      }
    }
    return false;
  }, [commits]);

  const handleMerge = useCallback((mergeTarget: string) => {
    if (head.type !== 'branch' || !mergeTarget || head.name === mergeTarget) return;

    const headCommit = commits[branches[head.name].commitId];
    const targetCommit = commits[branches[mergeTarget].commitId];
    
    if (headCommit.id === targetCommit.id) {
        alert("Branches are already at the same commit.");
        return;
    }

    if (isAncestor(headCommit.id, targetCommit.id)) {
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
  }, [head, branches, commits, commitCounter, isAncestor, branchLanes, setCommits, setBranches, setCommitCounter, setExplanation]);

  const handleRevert = useCallback(() => {
    const parentCommit = getHeadCommit();
    if (!parentCommit || parentCommit.parents.length === 0) {
        alert("Cannot revert the initial commit.");
        return;
    }
    handleCommit(`Revert "${parentCommit.message}"`);
    setExplanation(explanations.REVERT);
  }, [getHeadCommit, handleCommit, setExplanation]);
  
  const handleRebase = useCallback((rebaseTarget: string) => {
    if (head.type !== 'branch' || !rebaseTarget || head.name === rebaseTarget) return;

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
  }, [head, branches, commits, commitCounter, branchLanes, setCommits, setCommitCounter, setBranches, setBranchLanes, setExplanation]);

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

    setBranches(prev => ({
        ...prev,
        [head.name]: {...prev[head.name], commitId: resetTarget}
    }));

    setExplanation(explanations.RESET);
  }, [head, commits, setBranches, setExplanation]);

  const handleResetSimulation = useCallback(() => {
    setCommits({ [initialCommit.id]: initialCommit });
    setBranches(initialBranches);
    setTags({});
    setHead(initialHead);
    setBranchLanes(initialBranchLanes);
    setCommitCounter(1);
    setExplanation(explanations.INITIAL);
  }, []);

  const reachableCommits = useMemo(() => {
    const reachable = new Set<string>();
    const queue: string[] = [];
    
    Object.values(branches).forEach((b: Branch) => queue.push(b.commitId));
    Object.values(tags).forEach((t: Tag) => queue.push(t.commitId));
    if (head.type === 'detached') {
      queue.push(head.commitId);
    }
    
    while(queue.length > 0) {
      const commitId = queue.shift()!;
      if (!commitId || reachable.has(commitId)) continue;
      
      reachable.add(commitId);
      const commit = commits[commitId];
      if (commit) {
        commit.parents.forEach(p => queue.push(p));
      }
    }
    return reachable;
  }, [commits, branches, tags, head]);

  const headCommit = getHeadCommit();
  const otherBranches = useMemo(() => Object.keys(branches).filter(b => head.type === 'branch' && b !== head.name), [branches, head]);
  const rebaseableBranches = useMemo(() => otherBranches.filter(b => !isAncestor(headCommit?.id || '', branches[b]?.commitId)), [otherBranches, branches, headCommit, isAncestor]);
  const sortedCommits = useMemo(() => Object.values(commits).sort((a: Commit, b: Commit) => b.x - a.x), [commits]);

  return {
    // State
    commits,
    branches,
    tags,
    head,
    explanation,
    // Derived State
    headCommit,
    reachableCommits,
    otherBranches,
    rebaseableBranches,
    sortedCommits,
    // Handlers
    handleCommit,
    handleBranch,
    handleTag,
    handleCheckout,
    handleCheckoutCommit,
    handleMerge,
    handleRevert,
    handleRebase,
    handleReset,
    handleResetSimulation,
  };
};