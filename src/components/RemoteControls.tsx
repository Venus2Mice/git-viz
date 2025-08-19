import React from 'react';
import ControlGroup from './ControlGroup';
import { PushIcon } from './icons';

interface RemoteControlsProps {
  handlePush: () => void;
  isAhead: boolean;
}

const RemoteControls: React.FC<RemoteControlsProps> = ({ handlePush, isAhead }) => {
  return (
    <ControlGroup title="Remote Repository (origin)">
      <button
        onClick={handlePush}
        disabled={!isAhead}
        className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:bg-slate-700 disabled:text-slate-400 disabled:scale-100 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
      >
        <PushIcon /> Push
      </button>
    </ControlGroup>
  );
};

export default RemoteControls;