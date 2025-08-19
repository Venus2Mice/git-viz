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
    <ControlGroup title="Chỉnh sửa Lịch sử">
      <button
        onClick={handleRevert}
        disabled={!headCommit || headCommit.parents.length === 0}
        className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 px-4 rounded-md transition-transform transform hover:scale-105 disabled:bg-slate-500 disabled:transform-none disabled:cursor-not-allowed"
      >
        <RevertIcon /> Revert Commit
      </button>
      <div className="flex gap-2">
        <StyledSelect value={resetTarget} onChange={e => setResetTarget(e.target.value)}>
          <option value="">Reset tới commit...</option>
          {sortedCommits.map(c => (
            <option key={c.id} value={c.id}>
              {c.id}: {c.message.substring(0, 20)}{c.message.length > 20 && '...'}
            </option>
          ))}
        </StyledSelect>
        <button
          onClick={handleReset}
          disabled={!resetTarget}
          className="flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-md transition-transform transform hover:scale-105 disabled:bg-slate-500 disabled:cursor-not-allowed disabled:transform-none"
        >
          <ResetIcon /> Reset
        </button>
      </div>
    </ControlGroup>
  );
};

export default HistoryControls;