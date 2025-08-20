import React, { useState } from 'react';
import { Commit } from '../../types';
import ControlGroup from './ControlGroup';
import StyledSelect from './StyledSelect';
import { CherryPickIcon } from './icons';
import Tooltip from './Tooltip';

interface CherryPickControlsProps {
  cherryPickableCommits: Commit[];
  handleCherryPick: (commitId: string) => void;
}

const CherryPickControls: React.FC<CherryPickControlsProps> = ({
  cherryPickableCommits,
  handleCherryPick,
}) => {
  const [target, setTarget] = useState('');

  const onCherryPick = () => {
    if (target) {
      handleCherryPick(target);
      setTarget('');
    }
  };

  if (cherryPickableCommits.length === 0) {
    return null;
  }

  return (
    <ControlGroup title="Cherry-pick Commit">
      <div className="flex gap-2">
        <StyledSelect value={target} onChange={e => setTarget(e.target.value)}>
          <option value="">Select a commit...</option>
          {cherryPickableCommits.map(c => (
            <option key={c.id} value={c.id}>
              {c.id}: {c.message.substring(0, 20)}{c.message.length > 20 && '...'}
            </option>
          ))}
        </StyledSelect>
        <Tooltip text="git cherry-pick <commit>: Apply the changes from a selected commit onto the current branch.">
          <button
            onClick={onCherryPick}
            disabled={!target}
            className="flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-400 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:bg-slate-700 disabled:text-slate-400 disabled:scale-100 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-pink-500/50"
          >
            <CherryPickIcon /> Pick
          </button>
        </Tooltip>
      </div>
    </ControlGroup>
  );
};

export default CherryPickControls;