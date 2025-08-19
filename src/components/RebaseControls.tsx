import React from 'react';
import { Head } from '../../types';
import ControlGroup from './ControlGroup';
import StyledSelect from './StyledSelect';
import { RebaseIcon } from './icons';

interface RebaseControlsProps {
  head: Head;
  rebaseableBranches: string[];
  rebaseTarget: string;
  setRebaseTarget: (target: string) => void;
  handleRebase: () => void;
}

const RebaseControls: React.FC<RebaseControlsProps> = ({
  head,
  rebaseableBranches,
  rebaseTarget,
  setRebaseTarget,
  handleRebase,
}) => {
  if (head.type !== 'branch' || rebaseableBranches.length === 0) {
    return null;
  }

  return (
    <ControlGroup title={`Rebase '${head.name}'`}>
      <div className="flex gap-2">
        <StyledSelect value={rebaseTarget} onChange={e => setRebaseTarget(e.target.value)}>
          <option value="">Chọn nhánh cơ sở...</option>
          {rebaseableBranches.map(b => <option key={b} value={b}>{b}</option>)}
        </StyledSelect>
        <button
          onClick={handleRebase}
          disabled={!rebaseTarget}
          className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-md transition-transform transform hover:scale-105 disabled:bg-slate-500 disabled:cursor-not-allowed disabled:transform-none"
        >
          <RebaseIcon /> Rebase
        </button>
      </div>
    </ControlGroup>
  );
};

export default RebaseControls;