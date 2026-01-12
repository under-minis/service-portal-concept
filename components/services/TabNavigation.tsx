"use client";

import { LucideIcon } from "lucide-react";

interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: "developer" | "ops";
}

export function TabNavigation({
  tabs,
  activeTab,
  onTabChange,
  variant = "developer",
}: TabNavigationProps) {
  const activeColor =
    variant === "developer"
      ? "text-cyan-400 border-cyan-400"
      : "text-green-400 border-green-400";

  return (
    <div className="flex gap-1 border-b border-slate-700/50 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap border-b-2 -mb-px ${
              isActive
                ? `${activeColor} border-b-2`
                : "text-slate-400 hover:text-slate-300 border-transparent"
            }`}
          >
            <Icon className="h-3.5 w-3.5 inline mr-1.5" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

