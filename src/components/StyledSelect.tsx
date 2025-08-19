import React from 'react';

const StyledSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
    <div className="relative w-full">
        <select 
            {...props}
            className="w-full appearance-none bg-slate-800 text-white border-2 border-slate-700 rounded-lg py-3 px-4 pr-8 focus:outline-none focus:border-sky-500 text-base"
        >
            {props.children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
            <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
    </div>
);

export default StyledSelect;