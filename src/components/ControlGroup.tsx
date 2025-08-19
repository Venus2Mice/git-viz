import React from 'react';

interface ControlGroupProps {
  title: string;
  children: React.ReactNode;
}

const ControlGroup: React.FC<ControlGroupProps> = ({ title, children }) => (
    <div className="border-t border-slate-700 pt-5 mt-5 first:border-t-0 first:pt-0 first:mt-0">
        <h3 className="text-lg font-semibold text-slate-300 mb-3">{title}</h3>
        <div className="flex flex-col gap-4">{children}</div>
    </div>
);

export default ControlGroup;