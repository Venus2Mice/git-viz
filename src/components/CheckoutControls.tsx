import React from 'react';
import { Branch, Head } from '../../types';
import ControlGroup from './ControlGroup';

interface CheckoutControlsProps {
  branches: Record<string, Branch>;
  head: Head;
  handleCheckout: (name: string) => void;
}

const CheckoutControls: React.FC<CheckoutControlsProps> = ({ branches, head, handleCheckout }) => {
  return (
    <ControlGroup title="Checkout Nhánh">
      <div className="flex flex-wrap gap-2">
        {Object.keys(branches).map(b => (
          <button
            key={b}
            onClick={() => handleCheckout(b)}
            className={`font-mono px-3 py-1 text-sm rounded-full transition-all duration-200 ${
              head.type === 'branch' && head.name === b
                ? 'bg-sky-500 text-white ring-2 ring-offset-2 ring-offset-slate-800 ring-sky-400'
                : 'bg-slate-600 hover:bg-slate-500 text-slate-200'
            }`}
          >
            {b}
          </button>
        ))}
      </div>
    </ControlGroup>
  );
};

export default CheckoutControls;