import { useState } from 'react';
import { Commit, Branch, Head, Tag } from '../../../types';
import { Y_SPACING, X_SPACING, SVG_PADDING } from '../../../constants';
import { explanations } from '../../constants/explanations';

const initialCommit: Commit = {
  id: 'c0',
  parents: [],
  message: 'Initial commit',
  x: SVG_PADDING + X_SPACING / 2,
  y: Y_SPACING * 4,
};

const initialBranches: Record<string, Branch> = {
  'main': { name: 'main', commitId: 'c0' }
};

const initialRemotes: Record<string, Record<string, Branch>> = {
  'origin': { 'main': { name: 'main', commitId: 'c0' } }
};

const initialHead: Head = { type: 'branch', name: 'main' };
const initialBranchLanes: Record<string, number> = { 'main': 4 };

export const useGitState = () => {
  const [commits, setCommits] = useState<Record<string, Commit>>({ [initialCommit.id]: initialCommit });
  const [branches, setBranches] = useState<Record<string, Branch>>(initialBranches);
  const [remotes, setRemotes] = useState<Record<string, Record<string, Branch>>>(initialRemotes);
  const [tags, setTags] = useState<Record<string, Tag>>({});
  const [head, setHead] = useState<Head>(initialHead);
  const [branchLanes, setBranchLanes] = useState<Record<string, number>>(initialBranchLanes);
  const [commitCounter, setCommitCounter] = useState(1);
  const [explanation, setExplanation] = useState(explanations.INITIAL);

  const resetState = () => {
    setCommits({ [initialCommit.id]: initialCommit });
    setBranches(initialBranches);
    setRemotes(initialRemotes);
    setTags({});
    setHead(initialHead);
    setBranchLanes(initialBranchLanes);
    setCommitCounter(1);
    setExplanation(explanations.INITIAL);
  };

  return {
    state: { commits, branches, remotes, tags, head, branchLanes, commitCounter, explanation },
    setters: { setCommits, setBranches, setRemotes, setTags, setHead, setBranchLanes, setCommitCounter, setExplanation },
    resetState,
  };
};