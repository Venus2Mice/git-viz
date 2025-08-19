import React from 'react';

const StyledSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
    <div className="relative w-full">
        <select 
            {...props}
            className="w-full appearance-none bg-slate-700 text-white border border-slate-600 rounded-md py-2 px-3 pr-8 focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
            {props.children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
    </div>
);

export default StyledSelect;