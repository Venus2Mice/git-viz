import React from 'react';

interface ControlGroupProps {
  title: string;
  children: React.ReactNode;
}

const ControlGroup: React.FC<ControlGroupProps> = ({ title, children }) => (
    <div className="border-t-2 border-slate-800 pt-6 mt-6 first:border-t-0 first:pt-0 first:mt-0">
        <h3 className="text-xl font-bold text-slate-200 mb-4">{title}</h3>
        <div className="flex flex-col gap-4">{children}</div>
    </div>
);

export default ControlGroup;