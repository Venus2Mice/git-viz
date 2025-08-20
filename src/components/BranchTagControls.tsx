import React from 'react';
import { BranchIcon, TagIcon } from './icons';
import ControlGroup from './ControlGroup';
import Tooltip from './Tooltip';

interface BranchTagControlsProps {
  newBranchName: string;
  setNewBranchName: (name: string) => void;
  handleBranch: (e: React.FormEvent) => void;
  newTagName: string;
  setNewTagName: (name: string) => void;
  handleTag: (e: React.FormEvent) => void;
}

const BranchTagControls: React.FC<BranchTagControlsProps> = ({
  newBranchName,
  setNewBranchName,
  handleBranch,
  newTagName,
  setNewTagName,
  handleTag,
}) => {
  return (
    <ControlGroup title="Create Pointers">
      <form onSubmit={handleBranch} className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-400">Create new branch</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newBranchName}
            onChange={(e) => setNewBranchName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            placeholder="new-branch-name"
            className="flex-grow bg-slate-800 text-white placeholder-slate-400 border-2 border-slate-700 rounded-lg py-3 px-4 focus:outline-none focus:border-emerald-500 text-base"
          />
          <Tooltip text="git branch <name>: Create a new pointer to the current commit.">
            <button type="submit" className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-3 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-500/50">
              <BranchIcon /> Create
            </button>
          </Tooltip>
        </div>
      </form>
      <form onSubmit={handleTag} className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-400">Create new tag</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value.toLowerCase().replace(/[^a-z0-9-.]/g, ''))}
            placeholder="v1.0.0"
            className="flex-grow bg-slate-800 text-white placeholder-slate-400 border-2 border-slate-700 rounded-lg py-3 px-4 focus:outline-none focus:border-amber-500 text-base"
          />
          <Tooltip text="git tag <name>: Create a permanent pointer to the current commit, often for versioning.">
            <button type="submit" className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold py-3 px-3 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-amber-500/50">
              <TagIcon /> Tag
            </button>
          </Tooltip>
        </div>
      </form>
    </ControlGroup>
  );
};

export default BranchTagControls;