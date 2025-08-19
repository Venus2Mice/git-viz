import React, { useMemo, useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Commit, Branch, Head, Tag } from '../../types';
import { COMMIT_RADIUS, X_SPACING, Y_SPACING, BRANCH_TAG_HEIGHT, SVG_PADDING } from '../../constants';
import { TagIcon, HeadIcon, BranchIcon } from './icons';

interface GitVisualizerProps {
  commits: Record<string, Commit>;
  branches: Record<string, Branch>;
  remotes: Record<string, Record<string, Branch>>;
  tags: Record<string, Tag>;
  head: Head;
  onCommitClick: (commitId: string) => void;
  reachableCommits: Set<string>;
}

interface PointerTagProps {
  name: string;
  x: number;
  y: number;
  isHead?: boolean;
  isTag?: boolean;
  isRemote?: boolean;
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
}

const PointerTag: React.FC<PointerTagProps> = ({ name, x, y, isHead, isTag, isRemote, onMouseEnter, onMouseLeave }) => {
    const color = isRemote ? 'bg-rose-600' : isTag ? 'bg-amber-500' : isHead ? 'bg-sky-500' : 'bg-emerald-500';
    const iconColor = isRemote ? 'text-rose-100' : isTag ? 'text-amber-100' : isHead ? 'text-sky-100' : 'text-emerald-100';
    const Icon = isHead ? HeadIcon : (isTag ? TagIcon : BranchIcon);

    return (
      <foreignObject 
        x={x - 50} 
        y={y} 
        width="100" 
        height={BRANCH_TAG_HEIGHT} 
        className="transition-all duration-500 ease-in-out"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
          <div className={`flex items-center justify-center w-full h-full rounded-lg ${color} px-2 shadow-md`}>
              <div className={`mr-1.5 ${iconColor}`}><Icon /></div>
              <span className="text-white font-mono text-sm font-extrabold select-none truncate">{name}</span>
          </div>
      </foreignObject>
    );
};


const GitVisualizer: React.FC<GitVisualizerProps> = ({ commits, branches, remotes, head, tags, onCommitClick, reachableCommits }) => {
  const commitList = useMemo(() => Object.values(commits), [commits]);
  const [tooltip, setTooltip] = useState<{ content: React.ReactNode; x: number; y: number } | null>(null);
  const visualizerRef = useRef<HTMLDivElement>(null);
  const centeredOnceRef = useRef(false);

  const pointersByCommit = useMemo(() => {
    const mapping: Record<string, { branches: Branch[]; tags: Tag[]; remotes: Branch[] }> = {};
    Object.keys(commits).forEach(id => {
      mapping[id] = { branches: [], tags: [], remotes: [] };
    });
    Object.values(branches).forEach((branch: Branch) => {
        if(mapping[branch.commitId]) {
            mapping[branch.commitId].branches.push(branch);
        }
    });
    Object.values(tags).forEach((tag: Tag) => {
        if(mapping[tag.commitId]) {
            mapping[tag.commitId].tags.push(tag);
        }
    });
    if (remotes.origin) {
      Object.values(remotes.origin).forEach((branch: Branch) => {
          if(mapping[branch.commitId]) {
              mapping[branch.commitId].remotes.push(branch);
          }
      });
    }
    return mapping;
  }, [commits, branches, tags, remotes]);

  const { width, height, yOffset } = useMemo(() => {
    if (commitList.length === 0) {
      return { width: 300, height: 300, yOffset: SVG_PADDING };
    }

    let maxX = 0;
    let maxY = 0;
    let minContentY = Infinity;

    commitList.forEach(c => {
      maxX = Math.max(maxX, c.x);
      maxY = Math.max(maxY, c.y + COMMIT_RADIUS);
      minContentY = Math.min(minContentY, c.y - COMMIT_RADIUS);
    });

    commitList.forEach(commit => {
        const pointers = pointersByCommit[commit.id];
        let totalPointersOnCommit = (pointers?.tags.length || 0) + (pointers?.branches.length || 0) + (pointers?.remotes.length || 0);

        if (head.type === 'detached' && head.commitId === commit.id) {
            totalPointersOnCommit++;
        }
        
        if (totalPointersOnCommit > 0) {
            const topPointerEdgeY = commit.y - totalPointersOnCommit * (BRANCH_TAG_HEIGHT + 4) - Y_SPACING / 3;
            minContentY = Math.min(minContentY, topPointerEdgeY);
        }
    });

    if (minContentY === Infinity) {
        minContentY = 0;
    }
    
    const calculatedYOffset = (minContentY < SVG_PADDING) ? -minContentY + SVG_PADDING : SVG_PADDING;
    const calculatedHeight = maxY + calculatedYOffset + Y_SPACING;

    return {
        width: maxX + X_SPACING,
        height: calculatedHeight,
        yOffset: calculatedYOffset
    };
  }, [commitList, pointersByCommit, head]);

  useLayoutEffect(() => {
    const visualizer = visualizerRef.current;
    if (visualizer && !centeredOnceRef.current && commitList.length > 0) {
      const rootCommit = commitList.find(c => c.parents.length === 0);
      if (rootCommit) {
        const initialScrollTop = (rootCommit.y + yOffset) - (visualizer.clientHeight / 2);
        visualizer.scrollTop = Math.max(0, initialScrollTop);
        centeredOnceRef.current = true;
      }
    }
  }, [commitList, yOffset]);

  const panState = useRef({
    isPanning: false,
    lastX: 0,
    lastY: 0,
  });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0 || (e.target as Element).closest('.group')) {
      return;
    }
    e.preventDefault();
    
    panState.current = {
      isPanning: true,
      lastX: e.pageX,
      lastY: e.pageY,
    };
    
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
  };

  const handleGlobalMouseMove = (e: MouseEvent) => {
    if (!panState.current.isPanning) return;
    
    const visualizer = visualizerRef.current;
    if (visualizer) {
      const dx = e.pageX - panState.current.lastX;
      const dy = e.pageY - panState.current.lastY;

      visualizer.scrollLeft -= dx;
      visualizer.scrollTop -= dy;

      panState.current.lastX = e.pageX;
      panState.current.lastY = e.pageY;
    }
  };

  const handleGlobalMouseUp = () => {
    if (!panState.current.isPanning) return;

    panState.current.isPanning = false;

    document.body.style.removeProperty('cursor');
    document.body.style.removeProperty('user-select');
    
    document.removeEventListener('mousemove', handleGlobalMouseMove);
    document.removeEventListener('mouseup', handleGlobalMouseUp);
  };
  
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  const headCommitId = head.type === 'branch' ? branches[head.name]?.commitId : head.commitId;

  return (
    <div 
      ref={visualizerRef} 
      className="h-full w-full bg-slate-950/70 border-2 border-slate-800 rounded-xl p-4 overflow-auto relative shadow-inner cursor-grab"
      onMouseDown={handleMouseDown}
    >
       <svg width="100%" height="100%" className="absolute inset-0 z-0 pointer-events-none">
          <defs>
            <pattern id="dot-grid" width="35" height="35" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" className="fill-slate-700"></circle>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-grid)"></rect>
       </svg>
       <svg width={width} height={height} className="min-w-full relative z-10">
         <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="0"
            refY="3.5"
            orient="auto"
            >
            <polygon points="0 0, 10 3.5, 0 7" className="fill-slate-500" />
          </marker>
        </defs>
        
        <g transform={`translate(0, ${yOffset})`}>
          <g>
            {commitList.map((commit) =>
              commit.parents.map((parentId) => {
                const parentCommit = commits[parentId];
                if (!parentCommit) return null;
                
                const c1 = { x: parentCommit.x, y: parentCommit.y };
                const c2 = { x: commit.x, y: commit.y };

                let pathData;
                const isMergeFromBelow = c1.y > c2.y;
                const isMergeFromAbove = c1.y < c2.y;

                if (c1.y === c2.y) {
                  const startX = c1.x > c2.x ? c1.x - COMMIT_RADIUS : c1.x + COMMIT_RADIUS;
                  const endX = c1.x > c2.x ? c2.x + COMMIT_RADIUS : c2.x - COMMIT_RADIUS;
                  pathData = `M ${startX} ${c1.y} L ${endX} ${c2.y}`;
                } else {
                  const curveX = X_SPACING * 0.6;
                  const curveYOffset = Y_SPACING * 0.9;
                  if (isMergeFromBelow) {
                      pathData = `M ${c1.x} ${c1.y - COMMIT_RADIUS} C ${c1.x},${c1.y - curveYOffset} ${c2.x - curveX},${c2.y} ${c2.x},${c2.y}`;
                  } else if (isMergeFromAbove) {
                      pathData = `M ${c1.x} ${c1.y + COMMIT_RADIUS} C ${c1.x},${c1.y + curveYOffset} ${c2.x - curveX},${c2.y} ${c2.x},${c2.y}`;
                  } else { 
                      pathData = `M ${c1.x} ${c1.y} C ${c1.x + curveX},${c1.y} ${c2.x - curveX},${c2.y} ${c2.x},${c2.y}`;
                  }
                }

                return (
                  <path
                    key={`${parentId}-${commit.id}`}
                    d={pathData}
                    className="stroke-slate-500 transition-all duration-500 ease-in-out"
                    strokeWidth="2"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                  />
                );
              })
            )}
          </g>
          
          <g>
            {commitList.map((commit) => {
              const isHeadCommit = headCommitId === commit.id;
              const isReachable = reachableCommits.has(commit.id);
              return (
                <g key={commit.id} transform={`translate(${commit.x}, ${commit.y})`} 
                  className={`transition-all duration-500 ease-in-out cursor-pointer group ${!isReachable ? 'opacity-40' : ''}`}
                  onClick={() => onCommitClick(commit.id)}
                  onMouseEnter={(e) => {
                      const rect = (e.currentTarget as SVGGElement).getBoundingClientRect();
                      const containerRect = visualizerRef.current!.getBoundingClientRect();
                      setTooltip({
                          content: (
                            <>
                              <p className="font-bold text-slate-300 mb-1 font-mono">{commit.id}</p>
                              <p>{commit.message}</p>
                            </>
                          ),
                          x: rect.left - containerRect.left + rect.width / 2,
                          y: rect.top - containerRect.top
                      });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                >
                  <circle
                    r={COMMIT_RADIUS}
                    className={`stroke-2 transition-all duration-300 group-hover:stroke-sky-400 ${isHeadCommit ? 'fill-sky-500 stroke-sky-300' : 'fill-slate-700 stroke-slate-500'}`}
                  />
                  <text
                    textAnchor="middle"
                    dy=".3em"
                    className="fill-white font-mono text-xs font-bold select-none"
                  >
                    {commit.id}
                  </text>
                </g>
              );
            })}
          </g>
          
          <g>
            {Object.keys(pointersByCommit).map((commitId) => {
                const pointers = pointersByCommit[commitId];
                const { branches, tags, remotes } = pointers;
                const commit = commits[commitId];
                if (!commit) return null;

                let pointerOffset = 0;

                const showTooltip = (e: React.MouseEvent, content: string) => {
                    const rect = (e.currentTarget as Element).getBoundingClientRect();
                    const containerRect = visualizerRef.current!.getBoundingClientRect();
                    setTooltip({
                        content: <p className="font-mono">{content}</p>,
                        x: rect.left - containerRect.left + rect.width / 2,
                        y: rect.top - containerRect.top
                    });
                };

                return (
                    <React.Fragment key={commitId}>
                        {tags.map((tag) => (
                            <PointerTag
                                key={`tag-${tag.name}`}
                                name={tag.name}
                                x={commit.x}
                                y={commit.y - (pointerOffset++ + 1) * (BRANCH_TAG_HEIGHT + 4) - Y_SPACING / 3}
                                isTag
                                onMouseEnter={(e) => showTooltip(e, tag.name)}
                                onMouseLeave={() => setTooltip(null)}
                            />
                        ))}
                        {remotes.map((branch) => (
                            <PointerTag
                                key={`remote-${branch.name}`}
                                name={`origin/${branch.name}`}
                                x={commit.x}
                                y={commit.y - (pointerOffset++ + 1) * (BRANCH_TAG_HEIGHT + 4) - Y_SPACING / 3}
                                isRemote
                                onMouseEnter={(e) => showTooltip(e, `origin/${branch.name}`)}
                                onMouseLeave={() => setTooltip(null)}
                            />
                        ))}
                        {branches.map((branch) => {
                            const isHeadBranch = head.type === 'branch' && head.name === branch.name;
                            return (
                                <PointerTag
                                    key={`branch-${branch.name}`}
                                    name={branch.name}
                                    x={commit.x}
                                    y={commit.y - (pointerOffset++ + 1) * (BRANCH_TAG_HEIGHT + 4) - Y_SPACING / 3}
                                    isHead={isHeadBranch}
                                    onMouseEnter={(e) => showTooltip(e, branch.name)}
                                    onMouseLeave={() => setTooltip(null)}
                                />
                            );
                        })}
                    </React.Fragment>
                );
            })}
            {head.type === 'detached' && commits[head.commitId] && (() => {
                const commit = commits[head.commitId];
                const existingPointers = pointersByCommit[head.commitId];
                const pointerOffset = (existingPointers?.tags.length || 0) + (existingPointers?.branches.length || 0) + (existingPointers?.remotes.length || 0);
                
                const showTooltip = (e: React.MouseEvent, content: string) => {
                    const rect = (e.currentTarget as Element).getBoundingClientRect();
                    const containerRect = visualizerRef.current!.getBoundingClientRect();
                    setTooltip({
                        content: <p className="font-mono">{content}</p>,
                        x: rect.left - containerRect.left + rect.width / 2,
                        y: rect.top - containerRect.top
                    });
                };

                return (
                    <PointerTag 
                        key="HEAD" 
                        name="HEAD" 
                        x={commit.x} 
                        y={commit.y - (pointerOffset + 1) * (BRANCH_TAG_HEIGHT + 4) - Y_SPACING / 3}
                        isHead 
                        onMouseEnter={(e) => showTooltip(e, 'HEAD (detached)')}
                        onMouseLeave={() => setTooltip(null)}
                    />
                );
            })()}
          </g>
        </g>
      </svg>
      {tooltip && (
          <div 
              className="absolute z-20 bg-slate-900 text-white text-sm rounded-lg shadow-lg p-3 border-2 border-slate-700 pointer-events-none transition-opacity duration-200"
              style={{
                  left: tooltip.x,
                  top: tooltip.y,
                  transform: 'translate(-50%, -120%)',
                  maxWidth: '250px',
                  whiteSpace: 'pre-wrap',
              }}
          >
              {tooltip.content}
          </div>
      )}
    </div>
  );
};

export default GitVisualizer;