import React, { useRef, useEffect } from 'react';
import { TerminalIcon } from './icons';

interface CommandHistoryProps {
  history: string[];
}

const CommandHistory: React.FC<CommandHistoryProps> = ({ history }) => {
  const historyEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  return (
    <div className="bg-slate-900 border-2 border-slate-800 p-6 rounded-xl shadow-lg flex flex-col h-full">
      <h3 className="text-2xl font-bold text-emerald-400 mb-4 flex items-center gap-3">
        <TerminalIcon /> Command History
      </h3>
      <div className="bg-slate-950/70 rounded-lg p-4 flex-grow overflow-y-auto h-32">
        {history.length === 0 ? (
          <p className="text-slate-500 text-center pt-4">Your executed commands will appear here...</p>
        ) : (
          <ul className="space-y-2">
            {history.map((command, index) => (
              <li key={index} className="font-mono text-slate-300 text-sm flex items-start">
                <span className="text-slate-500 mr-3 select-none">$</span>
                <span className="flex-1 break-words">{command}</span>
              </li>
            ))}
            <div ref={historyEndRef} />
          </ul>
        )}
      </div>
    </div>
  );
};

export default CommandHistory;