import React, { useMemo, useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Commit, Branch, Head, Tag } from '../types';
import { COMMIT_RADIUS, X_SPACING, Y_SPACING, BRANCH_TAG_HEIGHT, SVG_PADDING } from '../constants';
import { TagIcon, HeadIcon, BranchIcon } from './icons';

interface GitVisualizerProps {
  commits: Record<string, Commit>;
  branches: Record<string, Branch>;
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
}

const PointerTag: React.FC<PointerTagProps> = ({ name, x, y, isHead, isTag }) => {
    const color = isTag ? 'bg-amber-600' : isHead ? 'bg-sky-500' : 'bg-emerald-600';
    const iconColor = isTag ? 'text-amber-200' : isHead ? 'text-sky-200' : 'text-emerald-200';
    const Icon = isHead ? HeadIcon : (isTag ? TagIcon : BranchIcon);

    return (
      <foreignObject x={x - 50} y={y} width="100" height={BRANCH_TAG_HEIGHT} className="transition-all duration-500 ease-in-out">
          <div className={`flex items-center justify-center w-full h-full rounded-md ${color} px-2 shadow`}>
              <div className={`mr-1.5 ${iconColor}`}><Icon /></div>
              <span className="text-white font-mono text-xs font-bold select-none truncate">{name}</span>
          </div>
      </foreignObject>
    );
};


const GitVisualizer: React.FC<GitVisualizerProps> = ({ commits, branches, head, tags, onCommitClick, reachableCommits }) => {
  const commitList = useMemo(() => Object.values(commits), [commits]);
  const [hoveredCommit, setHoveredCommit] = useState<{commit: Commit, x: number, y: number} | null>(null);
  const visualizerRef = useRef<HTMLDivElement>(null);
  const centeredOnceRef = useRef(false);

  const pointersByCommit = useMemo(() => {
    const mapping: Record<string, { branches: Branch[]; tags: Tag[] }> = {};
    Object.keys(commits).forEach(id => {
      mapping[id] = { branches: [], tags: [] };
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
    return mapping;
  }, [commits, branches, tags]);

  const { width, height, yOffset } = useMemo(() => {
    if (commitList.length === 0) {
      return { width: 300, height: 300, yOffset: SVG_PADDING };
    }

    let maxX = 0;
    let maxY = 0;
    let minContentY = Infinity;

    // Find boundaries from commits themselves
    commitList.forEach(c => {
      maxX = Math.max(maxX, c.x);
      maxY = Math.max(maxY, c.y + COMMIT_RADIUS); // bottom of commit circle
      minContentY = Math.min(minContentY, c.y - COMMIT_RADIUS); // Top of commit circle
    });

    // Find boundaries from pointers, which are rendered above commits
    commitList.forEach(commit => {
        const pointers = pointersByCommit[commit.id];
        let totalPointersOnCommit = (pointers?.tags.length || 0) + (pointers?.branches.length || 0);

        if (head.type === 'detached' && head.commitId === commit.id) {
            totalPointersOnCommit++;
        }
        
        if (totalPointersOnCommit > 0) {
            // This is the y-coordinate of the top edge of the highest pointer's foreignObject
            const topPointerEdgeY = commit.y - totalPointersOnCommit * (BRANCH_TAG_HEIGHT + 4) - Y_SPACING / 3;
            minContentY = Math.min(minContentY, topPointerEdgeY);
        }
    });

    if (minContentY === Infinity) {
        minContentY = 0; // Fallback
    }
    
    // The offset needed to push all content into positive space, plus padding.
    const calculatedYOffset = (minContentY < SVG_PADDING) ? -minContentY + SVG_PADDING : SVG_PADDING;
    
    // The final height is the highest point plus the offset, plus some bottom padding
    const calculatedHeight = maxY + calculatedYOffset + Y_SPACING;

    return {
        width: maxX + X_SPACING,
        height: calculatedHeight,
        yOffset: calculatedYOffset
    };
  }, [commitList, commits, pointersByCommit, head]);

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

  // Robust panning state and logic
  const panState = useRef({
    isPanning: false,
    lastX: 0,
    lastY: 0,
  });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only pan with left-click, and not when clicking on a commit group
    if (e.button !== 0 || (e.target as Element).closest('.group')) {
      return;
    }
    e.preventDefault(); // Prevent text selection, etc.
    
    panState.current = {
      isPanning: true,
      lastX: e.pageX,
      lastY: e.pageY,
    };
    
    // Apply styles globally for a better panning experience
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
  };

  const handleGlobalMouseMove = (e: MouseEvent) => {
    if (!panState.current.isPanning) return;
    
    const visualizer = visualizerRef.current;
    if (visualizer) {
      // Calculate how much the mouse has moved since the last event
      const dx = e.pageX - panState.current.lastX;
      const dy = e.pageY - panState.current.lastY;

      // Apply the inverted delta to the scroll position
      visualizer.scrollLeft -= dx;
      visualizer.scrollTop -= dy;

      // Update the last position for the next move event
      panState.current.lastX = e.pageX;
      panState.current.lastY = e.pageY;
    }
  };

  const handleGlobalMouseUp = () => {
    if (!panState.current.isPanning) return;

    panState.current.isPanning = false;

    // Remove global styles
    document.body.style.removeProperty('cursor');
    document.body.style.removeProperty('user-select');
    
    document.removeEventListener('mousemove', handleGlobalMouseMove);
    document.removeEventListener('mouseup', handleGlobalMouseUp);
  };
  
  // Cleanup listener on unmount
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
      className="h-full w-full bg-slate-900/70 border border-slate-700 rounded-lg p-4 overflow-y-auto overflow-x-auto relative shadow-inner cursor-grab"
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
                      setHoveredCommit({
                          commit,
                          x: rect.left - containerRect.left + rect.width / 2,
                          y: rect.top - containerRect.top
                      });
                  }}
                  onMouseLeave={() => setHoveredCommit(null)}
                >
                  <circle
                    r={COMMIT_RADIUS}
                    className={`stroke-2 transition-all duration-300 group-hover:stroke-sky-300 ${isHeadCommit ? 'fill-sky-400 stroke-sky-200' : 'fill-slate-600 stroke-slate-400'}`}
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
            {Object.entries(pointersByCommit).map(([commitId, pointers]) => {
                const { branches, tags } = pointers;
                const commit = commits[commitId];
                if (!commit) return null;

                let pointerOffset = 0;

                return (
                    <React.Fragment key={commitId}>
                        {tags.map((tag) => (
                            <PointerTag
                                key={`tag-${tag.name}`}
                                name={tag.name}
                                x={commit.x}
                                y={commit.y - (pointerOffset++ + 1) * (BRANCH_TAG_HEIGHT + 4) - Y_SPACING / 3}
                                isTag
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
                                />
                            );
                        })}
                    </React.Fragment>
                );
            })}
            {head.type === 'detached' && commits[head.commitId] && (() => {
                const commit = commits[head.commitId];
                const existingPointers = pointersByCommit[head.commitId];
                const pointerOffset = (existingPointers?.tags.length || 0) + (existingPointers?.branches.length || 0);
                return (
                    <PointerTag 
                        key="HEAD" 
                        name="HEAD" 
                        x={commit.x} 
                        y={commit.y - (pointerOffset + 1) * (BRANCH_TAG_HEIGHT + 4) - Y_SPACING / 3}
                        isHead 
                    />
                );
            })()}
          </g>
        </g>
      </svg>
      {hoveredCommit && (
          <div 
              className="absolute z-20 bg-slate-800 text-white text-sm rounded-md shadow-lg p-2 border border-slate-600 pointer-events-none transition-opacity duration-200"
              style={{
                  left: hoveredCommit.x,
                  top: hoveredCommit.y,
                  transform: 'translate(-50%, -120%)',
                  maxWidth: '250px',
                  whiteSpace: 'pre-wrap',
              }}
          >
              <p className="font-bold text-slate-300 mb-1">{hoveredCommit.commit.id}</p>
              <p>{hoveredCommit.commit.message}</p>
          </div>
      )}
    </div>
  );
};

export default GitVisualizer;