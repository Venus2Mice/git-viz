import React from 'react';
import { Head, Commit } from '../../types';
import ControlGroup from './ControlGroup';
import StyledSelect from './StyledSelect';
import { RevertIcon, ResetIcon } from './icons';

interface HistoryControlsProps {
  head: Head;
  headCommit: Commit | null;
  handleRevert: () => void;
  sortedCommits: Commit[];
  resetTarget: string;
  setResetTarget: (target: string) => void;
  handleReset: () => void;
}

const HistoryControls: React.FC<HistoryControlsProps> = ({
  head,
  headCommit,
  handleRevert,
  sortedCommits,
  resetTarget,
  setResetTarget,
  handleReset,
}) => {
  if (head.type !== 'branch') {
    return null;
  }

  return (
    <ControlGroup title="Edit History">
      <button
        onClick={handleRevert}
        disabled={!headCommit || headCommit.parents.length === 0}
        className="w-full flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-400 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:bg-slate-700 disabled:text-slate-400 disabled:scale-100 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-rose-500/50"
      >
        <RevertIcon /> Revert Commit
      </button>
      <div className="flex gap-2">
        <StyledSelect value={resetTarget} onChange={e => setResetTarget(e.target.value)}>
          <option value="">Reset to commit...</option>
          {sortedCommits.map(c => (
            <option key={c.id} value={c.id}>
              {c.id}: {c.message.substring(0, 20)}{c.message.length > 20 && '...'}
            </option>
          ))}
        </StyledSelect>
        <button
          onClick={handleReset}
          disabled={!resetTarget}
          className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:bg-slate-700 disabled:text-slate-400 disabled:scale-100 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-yellow-500/50"
        >
          <ResetIcon /> Reset
        </button>
      </div>
    </ControlGroup>
  );
};

export default HistoryControls;