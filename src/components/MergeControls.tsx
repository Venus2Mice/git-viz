import React from 'react';
import { Head } from '../../types';
import ControlGroup from './ControlGroup';
import StyledSelect from './StyledSelect';
import { MergeIcon } from './icons';

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
    <ControlGroup title={`Hợp nhất vào '${head.name}'`}>
      <div className="flex gap-2">
        <StyledSelect value={mergeTarget} onChange={e => setMergeTarget(e.target.value)}>
          <option value="">Chọn nhánh...</option>
          {otherBranches.map(b => <option key={b} value={b}>{b}</option>)}
        </StyledSelect>
        <button
          onClick={handleMerge}
          disabled={!mergeTarget}
          className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-md transition-transform transform hover:scale-105 disabled:bg-slate-500 disabled:cursor-not-allowed disabled:transform-none"
        >
          <MergeIcon /> Hợp nhất
        </button>
      </div>
    </ControlGroup>
  );
};

export default MergeControls;