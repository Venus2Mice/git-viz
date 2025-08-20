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
    <ControlGroup title="Checkout Branch">
      <div className="flex flex-wrap gap-3">
        {Object.keys(branches).map(b => (
          <button
            key={b}
            onClick={() => handleCheckout(b)}
            className={`font-mono px-4 py-2 text-sm rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 ${
              head.type === 'branch' && head.name === b
                ? 'bg-sky-500 text-white ring-4 ring-sky-500/50'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
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