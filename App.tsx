import React, { useState, useCallback, useMemo } from 'react';
import GitVisualizer from './components/GitVisualizer';
import { CommitIcon, BranchIcon, MergeIcon, TagIcon, RevertIcon, RebaseIcon, ResetIcon } from './components/icons';
import ControlGroup from './components/ControlGroup';
import StyledSelect from './components/StyledSelect';
import { useGitVisualizer } from './hooks/useGitVisualizer';
import { explanations } from './constants/explanations';
import { Commit, Branch, Head, Tag } from '../types'; // Added import for types
import { X_SPACING, Y_SPACING } from '../constants'; // Added import for constants

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
    
    Object.values(branches).forEach((b: Branch) => queue.push(b.commitId)); // Explicitly typed 'b'
    Object.values(tags).forEach((t: Tag) => queue.push(t.commitId)); // Explicitly typed 't'
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
  const sortedCommits = useMemo(() => Object.values(commits).sort((a: Commit, b: Commit) => b.x - a.x), [commits]); // Explicitly typed 'a' and 'b'

  const headCommit = getHeadCommit();

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 to-slate-950 text-white flex flex-col p-4 sm:p-6 lg:p-8 font-sans">
      <header className="text-center mb-6 flex-shrink-0">
        <h1 className="text-3xl sm:text-4xl font-bold text-sky-400">Git Visualizer</h1>
        <p className="text-slate-400 mt-2">Minh họa trực quan các lệnh Git cơ bản</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[24rem_1fr] gap-6 flex-grow min-h-0">
        <aside className="bg-slate-800 rounded-lg p-6 flex flex-col shadow-2xl overflow-y-auto">
          
          <ControlGroup title="Thực hiện Thay đổi">
            <input 
              type="text" 
              value={newCommitMessage} 
              onChange={e => setNewCommitMessage(e.target.value)} 
              placeholder="Nội dung commit (tùy chọn)..."
              className="w-full bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button 
              onClick={handleCommit} 
              className="flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-md transition-transform transform hover:scale-105"
            >
              <CommitIcon /> Commit
            </button>
          </ControlGroup>
          
          <ControlGroup title="Tạo Con trỏ">
              <form onSubmit={handleBranch} className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300">Tạo nhánh mới</label>
                 <div className="flex gap-2">
                    <input type="text" value={newBranchName} onChange={(e) => setNewBranchName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="tên-nhánh-mới"
                      className="flex-grow bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-sky-500"/>
                    <button type="submit" className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-md transition-transform transform hover:scale-105"><BranchIcon /> Tạo</button>
                 </div>
              </form>
              <form onSubmit={handleTag} className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300">Tạo tag mới</label>
                 <div className="flex gap-2">
                    <input type="text" value={newTagName} onChange={(e) => setNewTagName(e.target.value.toLowerCase().replace(/[^a-z0-9-.]/g, ''))} placeholder="v1.0.0"
                      className="flex-grow bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-sky-500"/>
                    <button type="submit" className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-3 rounded-md transition-transform transform hover:scale-105"><TagIcon /> Tag</button>
                 </div>
              </form>
          </ControlGroup>

          <ControlGroup title="Checkout Nhánh">
            <div className="flex flex-wrap gap-2">
                {Object.keys(branches).map(b => (
                    <button key={b} onClick={() => handleCheckout(b)}
                        className={`font-mono px-3 py-1 text-sm rounded-full transition-all duration-200 ${head.type === 'branch' && head.name === b ? 'bg-sky-500 text-white ring-2 ring-offset-2 ring-offset-slate-800 ring-sky-400' : 'bg-slate-600 hover:bg-slate-500 text-slate-200'}`}>
                        {b}
                    </button>
                ))}
            </div>
          </ControlGroup>
          
          {head.type === 'branch' && otherBranches.length > 0 && (
            <ControlGroup title={`Hợp nhất vào '${head.name}'`}>
              <div className="flex gap-2">
                <StyledSelect value={mergeTarget} onChange={e => setMergeTarget(e.target.value)}>
                    <option value="">Chọn nhánh...</option>
                    {otherBranches.map(b => <option key={b} value={b}>{b}</option>)}
                </StyledSelect>
                <button onClick={handleMerge} disabled={!mergeTarget} className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-md transition-transform transform hover:scale-105 disabled:bg-slate-500 disabled:cursor-not-allowed disabled:transform-none">
                    <MergeIcon /> Hợp nhất
                </button>
              </div>
            </ControlGroup>
          )}

          {head.type === 'branch' && rebaseableBranches.length > 0 && (
            <ControlGroup title={`Rebase '${head.name}'`}>
              <div className="flex gap-2">
                <StyledSelect value={rebaseTarget} onChange={e => setRebaseTarget(e.target.value)}>
                    <option value="">Chọn nhánh cơ sở...</option>
                    {rebaseableBranches.map(b => <option key={b} value={b}>{b}</option>)}
                </StyledSelect>
                <button onClick={handleRebase} disabled={!rebaseTarget} className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-md transition-transform transform hover:scale-105 disabled:bg-slate-500 disabled:cursor-not-allowed disabled:transform-none">
                    <RebaseIcon /> Rebase
                </button>
              </div>
            </ControlGroup>
          )}

          {head.type === 'branch' && (
            <ControlGroup title="Chỉnh sửa Lịch sử">
              <button onClick={handleRevert} disabled={!headCommit || headCommit.parents.length === 0} className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 px-4 rounded-md transition-transform transform hover:scale-105 disabled:bg-slate-500 disabled:transform-none disabled:cursor-not-allowed">
                  <RevertIcon /> Revert Commit
              </button>
              <div className="flex gap-2">
                  <StyledSelect value={resetTarget} onChange={e => setResetTarget(e.target.value)}>
                      <option value="">Reset tới commit...</option>
                      {sortedCommits.map(c => <option key={c.id} value={c.id}>{c.id}: {c.message.substring(0,20)}{c.message.length > 20 && '...'}</option>)}
                  </StyledSelect>
                  <button onClick={handleReset} disabled={!resetTarget} className="flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-md transition-transform transform hover:scale-105 disabled:bg-slate-500 disabled:cursor-not-allowed disabled:transform-none">
                      <ResetIcon /> Reset
                  </button>
              </div>
            </ControlGroup>
          )}
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