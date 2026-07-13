import React from "react";
import { ExternalLink } from "lucide-react";

export const MaterialTabs = ({ tabs, activeTab, onTabSelect }) => {
  return (
    <div className="flex border-b border-gray-200 bg-gray-50/50 select-none flex-shrink-0">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabSelect(tab)}
          className={`flex-1 flex items-center justify-center py-3.5 text-[11px] font-bold uppercase tracking-wider transition-all border-b-2 focus:outline-none ${
            activeTab === tab
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/40"
          }`}
        >
          <span>{tab}</span>
          <ExternalLink className="w-3 h-3 ml-1 opacity-70 flex-shrink-0" />
        </button>
      ))}
    </div>
  );
};
