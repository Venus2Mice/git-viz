import React, { useState, useCallback, useMemo } from 'react';
import GitVisualizer from './src/components/GitVisualizer';
import CommitControls from './src/components/CommitControls';
import BranchTagControls from './src/components/BranchTagControls';
import CheckoutControls from './src/components/CheckoutControls';
import MergeControls from './src/components/MergeControls';
import RebaseControls from './src/components/RebaseControls';
import HistoryControls from './src/components/HistoryControls';
import { useGitVisualizer } from './src/hooks/useGitVisualizer';
import { explanations } from './src/constants/explanations';
import { Commit, Branch, Head, Tag } from './types';
import { X_SPACING, Y_SPACING } from './constants';

function App() {
  const {
    commits,
    setCommits,
    branches,
    setBranches,
    tags,
    setTags,
    head,
    setHead,
    branchLanes,
    setBranchLanes,
    commitCounter,
    setCommitCounter,
    explanation,
    setExplanation,
    getHeadCommit,
  } = useGitVisualizer();

  const [newBranchName, setNewBranchName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [newCommitMessage, setNewCommitMessage] = useState('');
  const [mergeTarget, setMergeTarget] = useState('');
  const [rebaseTarget, setRebaseTarget] = useState('');
  const [resetTarget, setResetTarget] = useState('');

  const handleCommit = useCallback(() => {
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
      message: newCommitMessage || `Commit ${commitCounter}`,
      x: parentCommit.x + X_SPACING,
      y: newY,
    };

    setCommits(prev => ({ ...prev, [newId]: newCommit }));
    setNewCommitMessage('');

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
  }, [getHeadCommit, commitCounter, head, branchLanes, newCommitMessage, setCommits, setBranches, setHead, setCommitCounter, setExplanation]);

  const handleBranch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName || branches[newBranchName]) {
      alert("Tên nhánh không hợp lệ hoặc đã tồn tại.");
      return;
    }

    const headCommit = getHeadCommit();
    if (!headCommit) return;

    setBranches(prev => ({ ...prev, [newBranchName]: { name: newBranchName, commitId: headCommit.id } }));
    
    const usedLanes = new Set(Object.values(branchLanes));
    let newLane = 1;
    while(usedLanes.has(newLane)) {
      newLane++;
    }
    setBranchLanes(prev => ({...prev, [newBranchName]: newLane}));

    setNewBranchName('');
    setExplanation(explanations.BRANCH);
  }, [newBranchName, branches, getHeadCommit, branchLanes, setBranches, setBranchLanes, setExplanation]);

  const handleTag = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName || tags[newTagName]) {
      alert("Tên tag không hợp lệ hoặc đã tồn tại.");
      return;
    }
    const headCommit = getHeadCommit();
    if (!headCommit) return;

    setTags(prev => ({...prev, [newTagName]: { name: newTagName, commitId: headCommit.id }}));
    setNewTagName('');
    setExplanation(explanations.TAG);
  }, [newTagName, tags, getHeadCommit, setTags, setExplanation]);

  const handleCheckout = useCallback((name: string) => {
      setHead({ type: 'branch', name });
      setExplanation(explanations.CHECKOUT);
      setMergeTarget('');
      setRebaseTarget('');
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

  const handleMerge = useCallback(() => {
    if (head.type !== 'branch' || !mergeTarget || head.name === mergeTarget) return;

    const headCommit = commits[branches[head.name].commitId];
    const targetCommit = commits[branches[mergeTarget].commitId];
    
    if (headCommit.id === targetCommit.id) {
        alert("Các nhánh đã ở cùng một commit.");
        return;
    }

    if (isAncestor(headCommit.id, targetCommit.id)) {
      setBranches(prev => ({ ...prev, [head.name]: {...prev[head.name], commitId: targetCommit.id }}));
      setExplanation(explanations.MERGE_FF);
      setMergeTarget('');
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
    setMergeTarget('');
  }, [head, mergeTarget, branches, commits, commitCounter, isAncestor, branchLanes, setCommits, setBranches, setCommitCounter, setExplanation]);

  const handleRevert = useCallback(() => {
    const parentCommit = getHeadCommit();
    if (!parentCommit || parentCommit.parents.length === 0) {
        alert("Không thể revert commit đầu tiên.");
        return;
    }
    handleCommit(); // This will create a new commit
    setExplanation(explanations.REVERT);
  }, [getHeadCommit, handleCommit, setExplanation]);
  
  const handleRebase = useCallback(() => {
    if (head.type !== 'branch' || !rebaseTarget || head.name === rebaseTarget) return;

    const baseBranchName = rebaseTarget;
    const featureBranchName = head.name;
    
    const baseCommit = commits[branches[baseBranchName].commitId];
    const featureHeadCommit = commits[branches[featureBranchName].commitId];

    const baseAncestors = new Set();
    let q = [baseCommit.id];
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
        alert(`Nhánh '${featureBranchName}' đã được cập nhật với '${baseBranchName}'.`);
        setRebaseTarget('');
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
    setRebaseTarget('');
  }, [head, rebaseTarget, branches, commits, commitCounter, branchLanes, setCommits, setCommitCounter, setBranches, setBranchLanes, setExplanation]);

    const handleReset = useCallback(() => {
    if (head.type !== 'branch' || !resetTarget) {
      alert("Phải ở trên một nhánh và chọn commit đích để reset.");
      return;
    }
    
    const targetCommit = commits[resetTarget];
    if (!targetCommit) {
        alert("Commit đích không tồn tại.");
        return;
    }

    setBranches(prev => ({
        ...prev,
        [head.name]: {...prev[head.name], commitId: resetTarget}
    }));

    setExplanation(explanations.RESET);
    setResetTarget('');
  }, [head, resetTarget, commits, setBranches, setExplanation]);

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

  const otherBranches = useMemo(() => Object.keys(branches).filter(b => head.type === 'branch' && b !== head.name), [branches, head]);
  const rebaseableBranches = useMemo(() => otherBranches.filter(b => !isAncestor(getHeadCommit()?.id || '', branches[b]?.commitId)), [otherBranches, branches, getHeadCommit, isAncestor]);
  const sortedCommits = useMemo(() => Object.values(commits).sort((a: Commit, b: Commit) => b.x - a.x), [commits]);

  const headCommit = getHeadCommit();

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 to-slate-950 text-white flex flex-col p-4 sm:p-6 lg:p-8 font-sans">
      <header className="text-center mb-6 flex-shrink-0">
        <h1 className="text-3xl sm:text-4xl font-bold text-sky-400">Git Visualizer</h1>
        <p className="text-slate-400 mt-2">Minh họa trực quan các lệnh Git cơ bản</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[24rem_1fr] gap-6 flex-grow min-h-0">
        <aside className="bg-slate-800 rounded-lg p-6 flex flex-col shadow-2xl overflow-y-auto">
          
          <CommitControls
            newCommitMessage={newCommitMessage}
            setNewCommitMessage={setNewCommitMessage}
            handleCommit={handleCommit}
          />
          
          <BranchTagControls
            newBranchName={newBranchName}
            setNewBranchName={setNewBranchName}
            handleBranch={handleBranch}
            newTagName={newTagName}
            setNewTagName={setNewTagName}
            handleTag={handleTag}
          />

          <CheckoutControls
            branches={branches}
            head={head}
            handleCheckout={handleCheckout}
          />
          
          <MergeControls
            head={head}
            otherBranches={otherBranches}
            mergeTarget={mergeTarget}
            setMergeTarget={setMergeTarget}
            handleMerge={handleMerge}
          />

          <RebaseControls
            head={head}
            rebaseableBranches={rebaseableBranches}
            rebaseTarget={rebaseTarget}
            setRebaseTarget={setRebaseTarget}
            handleRebase={handleRebase}
          />

          <HistoryControls
            head={head}
            headCommit={headCommit}
            handleRevert={handleRevert}
            sortedCommits={sortedCommits}
            resetTarget={resetTarget}
            setResetTarget={setResetTarget}
            handleReset={handleReset}
          />
        </aside>

        <div className="flex flex-col gap-6 min-h-0">
            <main className="flex-grow min-h-0 min-w-0">
              <GitVisualizer commits={commits} branches={branches} head={head} tags={tags} onCommitClick={handleCheckoutCommit} reachableCommits={reachableCommits} />
            </main>
            <div className="bg-slate-800 p-4 rounded-lg flex-shrink-0 shadow-lg">
                <h3 className="text-lg font-semibold text-sky-300 mb-2">Giải thích Lệnh</h3>
                <p className="text-slate-300 text-sm leading-relaxed">{explanation}</p>
            </div>
        </div>
      </div>
    </div>
  );
}

export default App;