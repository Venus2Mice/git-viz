import { useState, useCallback, useMemo } from 'react';
import { Commit, Branch, Head, Tag } from '../../types'; // Corrected import path
import { Y_SPACING, X_SPACING, SVG_PADDING } from '../../constants'; // Corrected import path
import { explanations } from '../constants/explanations';

const initialCommit: Commit = {
  id: 'c0',
  parents: [],
  message: 'Initial commit',
  x: SVG_PADDING + X_SPACING / 2,
  y: Y_SPACING * 4,
};

const initialBranch: Branch = {
  name: 'main',
  commitId: 'c0',
};

export const useGitVisualizer = () => {
  const [commits, setCommits] = useState<Record<string, Commit>>({ [initialCommit.id]: initialCommit });
  const [branches, setBranches] = useState<Record<string, Branch>>({ [initialBranch.name]: initialBranch });
  const [tags, setTags] = useState<Record<string, Tag>>({});
  const [head, setHead] = useState<Head>({ type: 'branch', name: 'main' });
  const [branchLanes, setBranchLanes] = useState<Record<string, number>>({ 'main': 4 });
  
  const [commitCounter, setCommitCounter] = useState(1);

  const [explanation, setExplanation] = useState(explanations.INITIAL);

  const getHeadCommit = useCallback(() => {
    if (head.type === 'branch') {
      const headBranch = branches[head.name];
      return headBranch ? commits[headBranch.commitId] : null;
    }
    return commits[head.commitId];
  }, [head, branches, commits]);

  // Expose necessary state and functions
  return {
    commits,
    setCommits,
    branches,
    setBranches,
    tags,
    setTags,
    head,
    setHead,
    branchLanes,
    setBranchLanes,
    commitCounter,
    setCommitCounter,
    explanation,
    setExplanation,
    getHeadCommit,
    // Other handlers will be added here in subsequent steps
  };
};