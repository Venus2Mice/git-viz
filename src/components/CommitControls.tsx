import React from 'react';
import { CommitIcon } from './icons';
import ControlGroup from './ControlGroup';

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
  );
};

export default CommitControls;