import React from 'react';
import { Head } from '../../types';
import ControlGroup from './ControlGroup';
import StyledSelect from './StyledSelect';
import { MergeIcon } from './icons';
import Tooltip from './Tooltip';

interface MergeControlsProps {
  head: Head;
  otherBranches: string[];
  mergeTarget: string;
  setMergeTarget: (target: string) => void;
  handleMerge: () => void;
}

const MergeControls: React.FC<MergeControlsProps> = ({
  head,
  otherBranches,
  mergeTarget,
  setMergeTarget,
  handleMerge,
}) => {
  if (head.type !== 'branch' || otherBranches.length === 0) {
    return null;
  }

  return (
    <ControlGroup title={`Merge into '${head.name}'`}>
      <div className="flex gap-2">
        <StyledSelect value={mergeTarget} onChange={e => setMergeTarget(e.target.value)}>
          <option value="">Select branch...</option>
          {otherBranches.map(b => <option key={b} value={b}>{b}</option>)}
        </StyledSelect>
        <Tooltip text="git merge <branch>: Combine the history of the selected branch into the current branch.">
          <button
            onClick={handleMerge}
            disabled={!mergeTarget}
            className="flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-400 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:bg-slate-700 disabled:text-slate-400 disabled:scale-100 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-purple-500/50"
          >
            <MergeIcon /> Merge
          </button>
        </Tooltip>
      </div>
    </ControlGroup>
  );
};

export default MergeControls;