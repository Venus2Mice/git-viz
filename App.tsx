
import React, { useState, useCallback, useMemo } from 'react';
import { Commit, Branch, Head, Tag } from './types';
import GitVisualizer from './components/GitVisualizer';
import { CommitIcon, BranchIcon, MergeIcon, TagIcon, RevertIcon, RebaseIcon, ResetIcon } from './components/icons';
import { Y_SPACING, X_SPACING, SVG_PADDING } from './constants';

const initialCommit: Commit = {
  id: 'c0',
  parents: [],
  message: 'Initial commit',
  x: SVG_PADDING + X_SPACING / 2,
  y: Y_SPACING * 4,
};

const initialBranch: Branch = {
  name: 'main',
  commitId: 'c0',
};

const explanations = {
  INITIAL: "Đây là kho git của bạn. Mỗi commit là một snapshot của dự án. Nhấp vào các nút để thực hiện các lệnh git.",
  COMMIT: "git commit: Tạo một snapshot mới. Mỗi commit có một ID duy nhất và trỏ đến (các) commit cha, tạo nên một lịch sử.",
  BRANCH: "git branch <tên>: Tạo một con trỏ mới (nhánh) đến một commit. Nhánh cho phép bạn phát triển các tính năng một cách cô lập.",
  CHECKOUT: "git checkout <tên>: Chuyển HEAD sang một nhánh khác hoặc một commit cụ thể. HEAD chỉ định vị trí commit tiếp theo sẽ được tạo.",
  CHECKOUT_COMMIT: "Detached HEAD: HEAD đang trỏ trực tiếp đến một commit thay vì một nhánh. Các commit mới sẽ không thuộc bất kỳ nhánh nào.",
  MERGE: "git merge <tên>: Kết hợp các thay đổi từ một nhánh khác vào nhánh hiện tại (HEAD). Một commit hợp nhất mới với hai cha được tạo ra.",
  MERGE_FF: "Fast-Forward Merge: Vì không có commit nào khác trên nhánh đích, git chỉ cần di chuyển con trỏ của nhánh về phía trước. Không cần commit hợp nhất.",
  TAG: "git tag <tên>: Tạo một con trỏ cố định đến một commit cụ thể, thường được sử dụng để đánh dấu các phiên bản phát hành (v1.0).",
  REVERT: "git revert HEAD: Tạo một commit mới để hoàn tác các thay đổi được thực hiện bởi commit trước đó. Lịch sử được thêm vào, không bị thay đổi.",
  REBASE: "git rebase <base>: Di chuyển toàn bộ nhánh hiện tại để bắt đầu từ đỉnh của một nhánh khác. Nó viết lại lịch sử commit để tạo ra một luồng công việc tuyến tính.",
  RESET: "git reset <commit>: Di chuyển con trỏ của nhánh hiện tại (HEAD) về một commit cụ thể. Lệnh này viết lại lịch sử bằng cách loại bỏ các commit khỏi chuỗi lịch sử của nhánh, nhưng không xóa chúng. Chúng trở thành commit 'mồ côi' nếu không có nhánh nào khác trỏ đến chúng."
};

const ControlGroup = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="border-t border-slate-700 pt-5 mt-5 first:border-t-0 first:pt-0 first:mt-0">
        <h3 className="text-lg font-semibold text-slate-300 mb-3">{title}</h3>
        <div className="flex flex-col gap-4">{children}</div>
    </div>
);

const StyledSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <div className="relative w-full">
        <select 
            {...props}
            className="w-full appearance-none bg-slate-700 text-white border border-slate-600 rounded-md py-2 px-3 pr-8 focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
            {props.children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
    </div>
);


function App() {
  const [commits, setCommits] = useState<Record<string, Commit>>({ [initialCommit.id]: initialCommit });
  const [branches, setBranches] = useState<Record<string, Branch>>({ [initialBranch.name]: initialBranch });
  const [tags, setTags] = useState<Record<string, Tag>>({});
  const [head, setHead] = useState<Head>({ type: 'branch', name: 'main' });
  const [branchLanes, setBranchLanes] = useState<Record<string, number>>({ 'main': 4 });
  
  const [commitCounter, setCommitCounter] = useState(1);

  const [newBranchName, setNewBranchName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [newCommitMessage, setNewCommitMessage] = useState('');
  const [mergeTarget, setMergeTarget] = useState('');
  const [rebaseTarget, setRebaseTarget] = useState('');
  const [resetTarget, setResetTarget] = useState('');

  const [explanation, setExplanation] = useState(explanations.INITIAL);

  const getHeadCommit = useCallback(() => {
    if (head.type === 'branch') {
      const headBranch = branches[head.name];
      return headBranch ? commits[headBranch.commitId] : null;
    }
    return commits[head.commitId];
  }, [head, branches, commits]);

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
  }, [getHeadCommit, commitCounter, head, branchLanes, newCommitMessage]);

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
  }, [newBranchName, branches, getHeadCommit, branchLanes]);

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
  }, [newTagName, tags, getHeadCommit]);

  const handleCheckout = useCallback((name: string) => {
      setHead({ type: 'branch', name });
      setExplanation(explanations.CHECKOUT);
      setMergeTarget('');
      setRebaseTarget('');
  }, []);

  const handleCheckoutCommit = useCallback((commitId: string) => {
      setHead({ type: 'detached', commitId });
      setExplanation(explanations.CHECKOUT_COMMIT);
  }, []);

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
  }, [head, mergeTarget, branches, commits, commitCounter, isAncestor, branchLanes]);

  const handleRevert = useCallback(() => {
    const parentCommit = getHeadCommit();
    if (!parentCommit || parentCommit.parents.length === 0) {
        alert("Không thể revert commit đầu tiên.");
        return;
    }
    handleCommit();
    setExplanation(explanations.REVERT);
  }, [getHeadCommit, handleCommit]);
  
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
  }, [head, rebaseTarget, branches, commits, commitCounter, branchLanes]);

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
  }, [head, resetTarget, commits]);

  const reachableCommits = useMemo(() => {
    const reachable = new Set<string>();
    const queue: string[] = [];
    
    Object.values(branches).forEach(b => queue.push(b.commitId));
    Object.values(tags).forEach(t => queue.push(t.commitId));
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
  const sortedCommits = useMemo(() => Object.values(commits).sort((a,b) => b.x - a.x), [commits])

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