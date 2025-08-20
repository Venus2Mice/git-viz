import React from 'react';
import { CommitIcon } from './icons';
import ControlGroup from './ControlGroup';
import Tooltip from './Tooltip';

interface CommitControlsProps {
  newCommitMessage: string;
  setNewCommitMessage: (message: string) => void;
  handleCommit: () => void;
}

const CommitControls: React.FC<CommitControlsProps> = ({
  newCommitMessage,
  setNewCommitMessage,
  handleCommit,
}) => {
  return (
    <ControlGroup title="Commit Changes">
      <input
        type="text"
        value={newCommitMessage}
        onChange={e => setNewCommitMessage(e.target.value)}
        placeholder="Commit message (optional)..."
        className="w-full bg-slate-800 text-white placeholder-slate-400 border-2 border-slate-700 rounded-lg py-3 px-4 focus:outline-none focus:border-sky-500 text-base"
      />
      <Tooltip text="git commit: Create a new snapshot of changes on the current branch." className="w-full">
        <button
          onClick={handleCommit}
          className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-sky-500/50"
        >
          <CommitIcon /> Commit
        </button>
      </Tooltip>
    </ControlGroup>
  );
};

export default CommitControls;