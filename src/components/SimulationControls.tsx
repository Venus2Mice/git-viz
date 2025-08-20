import React from 'react';
import ControlGroup from './ControlGroup';
import { RotateCcwIcon } from './icons';
import Tooltip from './Tooltip';

interface SimulationControlsProps {
  handleResetSimulation: () => void;
}

const SimulationControls: React.FC<SimulationControlsProps> = ({ handleResetSimulation }) => {
  return (
    <ControlGroup title="Simulation">
      <Tooltip text="Resets the entire simulation to its initial state." className="w-full">
        <button
          onClick={handleResetSimulation}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-600/50"
        >
          <RotateCcwIcon /> Reset Simulation
        </button>
      </Tooltip>
    </ControlGroup>
  );
};

export default SimulationControls;