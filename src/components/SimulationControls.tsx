import React from 'react';
import ControlGroup from './ControlGroup';
import { RotateCcwIcon } from './icons';

interface SimulationControlsProps {
  handleResetSimulation: () => void;
}

const SimulationControls: React.FC<SimulationControlsProps> = ({ handleResetSimulation }) => {
  return (
    <ControlGroup title="Simulation">
      <button
        onClick={handleResetSimulation}
        className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-600/50"
      >
        <RotateCcwIcon /> Reset Simulation
      </button>
    </ControlGroup>
  );
};

export default SimulationControls;