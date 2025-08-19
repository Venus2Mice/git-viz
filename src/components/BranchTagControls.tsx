import React from 'react';
import { BranchIcon, TagIcon } from './icons';
import ControlGroup from './ControlGroup';

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
    <ControlGroup title="Tạo Con trỏ">
      <form onSubmit={handleBranch} className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-300">Tạo nhánh mới</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newBranchName}
            onChange={(e) => setNewBranchName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            placeholder="tên-nhánh-mới"
            className="flex-grow bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <button type="submit" className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-md transition-transform transform hover:scale-105">
            <BranchIcon /> Tạo
          </button>
        </div>
      </form>
      <form onSubmit={handleTag} className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-300">Tạo tag mới</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value.toLowerCase().replace(/[^a-z0-9-.]/g, ''))}
            placeholder="v1.0.0"
            className="flex-grow bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <button type="submit" className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-3 rounded-md transition-transform transform hover:scale-105">
            <TagIcon /> Tag
          </button>
        </div>
      </form>
    </ControlGroup>
  );
};

export default BranchTagControls;