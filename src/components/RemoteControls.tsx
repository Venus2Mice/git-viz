import React from 'react';
import ControlGroup from './ControlGroup';
import { PushIcon, PullIcon, CloudPushIcon } from './icons';
import Tooltip from './Tooltip';

interface RemoteControlsProps {
  handlePush: () => void;
  handlePull: () => void;
  handleSimulateRemotePush: () => void;
  isAhead: boolean;
  isBehind: boolean;
  hasRemote: boolean;
}

const RemoteControls: React.FC<RemoteControlsProps> = ({
  handlePush,
  handlePull,
  handleSimulateRemotePush,
  isAhead,
  isBehind,
  hasRemote,
}) => {
  return (
    <ControlGroup title="Remote Repository (origin)">
      <div className="grid grid-cols-2 gap-3">
        <Tooltip text="git push: Upload local branch commits to the remote repository." className="w-full">
          <button
            onClick={handlePush}
            disabled={!isAhead}
            className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:bg-slate-700 disabled:text-slate-400 disabled:scale-100 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
          >
            <PushIcon /> Push
          </button>
        </Tooltip>
        <Tooltip text="git pull: Fetch changes from the remote and merge them into the current branch." className="w-full">
          <button
            onClick={handlePull}
            disabled={!isBehind}
            className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:bg-slate-700 disabled:text-slate-400 disabled:scale-100 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-cyan-500/50"
          >
            <PullIcon /> Pull
          </button>
        </Tooltip>
      </div>
      <Tooltip text="Creates a new commit on the remote branch to simulate another person's work." className="w-full">
        <button
          onClick={handleSimulateRemotePush}
          disabled={!hasRemote}
          className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:bg-slate-800 disabled:text-slate-500 disabled:scale-100 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-slate-600/50"
        >
          <CloudPushIcon /> Simulate Remote Push
        </button>
      </Tooltip>
    </ControlGroup>
  );
};

export default RemoteControls;