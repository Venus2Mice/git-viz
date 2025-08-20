import React, { useState, useCallback } from 'react';
import GitVisualizer from './src/components/GitVisualizer';
import CommitControls from './src/components/CommitControls';
import BranchTagControls from './src/components/BranchTagControls';
import CheckoutControls from './src/components/CheckoutControls';
import MergeControls from './src/components/MergeControls';
import RebaseControls from './src/components/RebaseControls';
import HistoryControls from './src/components/HistoryControls';
import RemoteControls from './src/components/RemoteControls';
import SimulationControls from './src/components/SimulationControls';
import CherryPickControls from './src/components/CherryPickControls';
import CommandHistory from './src/components/CommandHistory';
import { useGitVisualizer } from './src/hooks/useGitVisualizer';

function App() {
  const git = useGitVisualizer();

  // UI-specific state
  const [newBranchName, setNewBranchName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [newCommitMessage, setNewCommitMessage] = useState('');
  const [mergeTarget, setMergeTarget] = useState('');
  const [rebaseTarget, setRebaseTarget] = useState('');
  const [resetTarget, setResetTarget] = useState('');

  // UI handlers that call the hook's logic
  const handleCommit = useCallback(() => {
    git.handleCommit(newCommitMessage);
    setNewCommitMessage('');
  }, [git, newCommitMessage]);

  const handleBranch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (git.handleBranch(newBranchName)) {
      setNewBranchName('');
    }
  }, [git, newBranchName]);

  const handleTag = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (git.handleTag(newTagName)) {
      setNewTagName('');
    }
  }, [git, newTagName]);

  const handleMerge = useCallback(() => {
    git.handleMerge(mergeTarget);
    setMergeTarget('');
  }, [git, mergeTarget]);

  const handleRebase = useCallback(() => {
    git.handleRebase(rebaseTarget);
    setRebaseTarget('');
  }, [git, rebaseTarget]);

  const handleReset = useCallback(() => {
    git.handleReset(resetTarget);
    setResetTarget('');
  }, [git, resetTarget]);

  const handleCheckout = useCallback((name: string) => {
    git.handleCheckout(name);
    setMergeTarget('');
    setRebaseTarget('');
  }, [git]);

  return (
    <div className="h-screen bg-slate-950 text-white flex flex-col p-4 sm:p-6 lg:p-8 font-sans overflow-hidden">
      <header className="text-center mb-6 flex-shrink-0">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-100 tracking-tighter">Git Visualizer</h1>
        <p className="text-slate-400 mt-2 text-lg">An interactive tool to understand Git commands.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[26rem_1fr] gap-8 flex-grow min-h-0">
        <aside className="bg-slate-900 border-2 border-slate-800 rounded-xl p-6 flex flex-col shadow-lg overflow-y-auto">
          
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
            branches={git.branches}
            head={git.head}
            handleCheckout={handleCheckout}
          />
          
          <MergeControls
            head={git.head}
            otherBranches={git.otherBranches}
            mergeTarget={mergeTarget}
            setMergeTarget={setMergeTarget}
            handleMerge={handleMerge}
          />

          <RebaseControls
            head={git.head}
            rebaseableBranches={git.rebaseableBranches}
            rebaseTarget={rebaseTarget}
            setRebaseTarget={setRebaseTarget}
            handleRebase={handleRebase}
          />

          <HistoryControls
            head={git.head}
            headCommit={git.headCommit}
            handleRevert={git.handleRevert}
            sortedCommits={git.sortedCommits}
            resetTarget={resetTarget}
            setResetTarget={setResetTarget}
            handleReset={handleReset}
          />

          <CherryPickControls
            cherryPickableCommits={git.cherryPickableCommits}
            handleCherryPick={git.handleCherryPick}
          />

          <RemoteControls
            handlePush={git.handlePush}
            handlePull={git.handlePull}
            handleSimulateRemotePush={git.handleSimulateRemotePush}
            isAhead={git.isAhead}
            isBehind={git.isBehind}
            hasRemote={git.hasRemote}
          />

          <SimulationControls
            handleResetSimulation={git.handleResetSimulation}
          />
        </aside>

        <div className="flex flex-col gap-8 min-h-0">
            <main className="flex-grow min-h-0 min-w-0">
              <GitVisualizer 
                commits={git.commits} 
                branches={git.branches} 
                remotes={git.remotes}
                head={git.head} 
                tags={git.tags} 
                onCommitClick={git.handleCheckoutCommit} 
                reachableCommits={git.reachableCommits} 
              />
            </main>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 flex-shrink-0">
              <CommandHistory history={git.commandHistory} />
              <div className="bg-slate-900 border-2 border-slate-800 p-6 rounded-xl shadow-lg">
                  <h3 className="text-2xl font-bold text-sky-400 mb-3">Command Explanation</h3>
                  <p className="text-slate-300 text-base leading-relaxed">{git.explanation}</p>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default App;