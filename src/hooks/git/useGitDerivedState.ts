import { useMemo } from 'react';
import { Commit, Branch, Head, Tag } from '@/types';
import { getHeadCommit, isAncestor } from '@/src/utils/gitUtils';

type GitState = {
  commits: Record<string, Commit>;
  branches: Record<string, Branch>;
  remotes: Record<string, Record<string, Branch>>;
  tags: Record<string, Tag>;
  head: Head;
};

export const useGitDerivedState = (state: GitState) => {
  const { commits, branches, remotes, tags, head } = state;

  const headCommit = useMemo(() => getHeadCommit(head, branches, commits), [head, branches, commits]);

  const reachableCommits = useMemo(() => {
    const reachable = new Set<string>();
    const queue: string[] = [];
    
    Object.values(branches).forEach((b: Branch) => queue.push(b.commitId));
    Object.values(tags).forEach((t: Tag) => queue.push(t.commitId));
    if (remotes.origin) {
      Object.values(remotes.origin).forEach((b: Branch) => queue.push(b.commitId));
    }
    if (head.type === 'detached') {
      queue.push(head.commitId);
    }
    
    while(queue.length > 0) {
      const commitId = queue.shift()!;
      if (!commitId || reachable.has(commitId)) continue;
      
      reachable.add(commitId);
      const commit = commits[commitId];
      if (commit) {
        commit.parents.forEach(p => queue.push(p));
      }
    }
    return reachable;
  }, [commits, branches, tags, head, remotes]);

  const otherBranches = useMemo(() => Object.keys(branches).filter(b => head.type === 'branch' && b !== head.name), [branches, head]);
  
  const rebaseableBranches = useMemo(() => otherBranches.filter(b => !isAncestor(headCommit?.id, branches[b]?.commitId, commits)), [otherBranches, branches, headCommit, commits]);
  
  const sortedCommits = useMemo(() => Object.values(commits).sort((a: Commit, b: Commit) => b.x - a.x), [commits]);

  const cherryPickableCommits = useMemo(() => {
    if (!headCommit) return [];
    const headAncestors = new Set<string>();
    const queue = [headCommit.id];
    while (queue.length > 0) {
      const id = queue.shift()!;
      if (headAncestors.has(id)) continue;
      headAncestors.add(id);
      commits[id]?.parents.forEach(p => queue.push(p));
    }
    return sortedCommits.filter(c => !headAncestors.has(c.id));
  }, [commits, headCommit, sortedCommits]);

  const isAhead = useMemo(() => {
    if (head.type !== 'branch') return false;
    const localCommitId = branches[head.name]?.commitId;
    const remoteCommitId = remotes.origin[head.name]?.commitId;
    return !!localCommitId && !!remoteCommitId && localCommitId !== remoteCommitId && isAncestor(remoteCommitId, localCommitId, commits);
  }, [head, branches, remotes, commits]);

  const isBehind = useMemo(() => {
    if (head.type !== 'branch') return false;
    const localCommitId = branches[head.name]?.commitId;
    const remoteCommitId = remotes.origin[head.name]?.commitId;
    return !!localCommitId && !!remoteCommitId && localCommitId !== remoteCommitId && isAncestor(localCommitId, remoteCommitId, commits);
  }, [head, branches, remotes, commits]);

  const hasRemote = useMemo(() => {
    if (head.type !== 'branch') return false;
    return !!remotes.origin[head.name];
  }, [head, remotes]);

  return {
    headCommit,
    reachableCommits,
    otherBranches,
    rebaseableBranches,
    sortedCommits,
    cherryPickableCommits,
    isAhead,
    isBehind,
    hasRemote,
  };
};