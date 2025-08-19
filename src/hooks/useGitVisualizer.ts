import { useGitState } from '@/src/hooks/git/useGitState';
import { useGitCommands } from '@/src/hooks/git/useGitCommands';
import { useGitDerivedState } from '@/src/hooks/git/useGitDerivedState';

export const useGitVisualizer = () => {
  const { state, setters, resetState } = useGitState();
  const derivedState = useGitDerivedState(state);
  const commands = useGitCommands(state, setters);

  return {
    ...state,
    ...derivedState,
    ...commands,
    handleResetSimulation: resetState,
  };
};