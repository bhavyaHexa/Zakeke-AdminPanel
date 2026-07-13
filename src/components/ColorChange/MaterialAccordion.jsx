import React from "react";

export const MaterialAccordion = ({ title, isOpen, onToggle, children }) => {
  return (
    <div className="flex flex-col">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50/50 hover:bg-gray-100/50 transition font-bold text-xs text-gray-750 uppercase tracking-wider focus:outline-none select-none"
      >
        <span>{title}</span>
        <span className="text-gray-400 text-sm font-light">
          {isOpen ? "▲" : "▼"}
        </span>
      </button>
      {isOpen && (
        <div className="p-4 bg-white space-y-4 border-t border-gray-150">
          {children}
        </div>
      )}
    </div>
  );
};
