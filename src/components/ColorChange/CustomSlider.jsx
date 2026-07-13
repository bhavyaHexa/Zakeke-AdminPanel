import React from "react";

export const CustomSlider = ({ label, min, max, step = 1, value, onChange }) => {
  return (
    <div>
      <div className="flex justify-between items-center text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mb-1 select-none">
        <span>{label}</span>
        <span className="font-mono text-gray-600">{value}</span>
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="flex-1 h-1 bg-gray-250 rounded-lg appearance-none cursor-pointer"
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-10 px-1 py-0.5 text-center text-xs border border-gray-300 rounded font-mono text-gray-750 focus:outline-none"
        />
      </div>
    </div>
  );
};
