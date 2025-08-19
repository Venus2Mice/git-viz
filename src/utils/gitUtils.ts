import { Commit, Branch, Head } from '../../types';

export const getHeadCommit = (
  head: Head,
  branches: Record<string, Branch>,
  commits: Record<string, Commit>
): Commit | null => {
  if (head.type === 'branch') {
    const headBranch = branches[head.name];
    return headBranch ? commits[headBranch.commitId] : null;
  }
  return commits[head.commitId] || null;
};

export const isAncestor = (
  ancestorId: string | undefined,
  descendantId: string,
  commits: Record<string, Commit>
): boolean => {
  if (!ancestorId) return true;
  let queue = [descendantId];
  const visited = new Set(queue);
  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (currentId === ancestorId) return true;
    const currentCommit = commits[currentId];
    if (currentCommit) {
      for (const parentId of currentCommit.parents) {
        if (!visited.has(parentId)) {
          visited.add(parentId);
          queue.push(parentId);
        }
      }
    }
  }
  return false;
};