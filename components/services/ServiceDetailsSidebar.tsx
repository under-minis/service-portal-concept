"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Network,
  Terminal,
  FileCode,
  Code,
  Mail,
  Zap,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: { id: string; label: string }[];
}

interface ServiceDetailsSidebarProps {
  className?: string;
}

const navItems: NavItem[] = [
  {
    id: "overview",
    label: "Overview",
    icon: Zap,
  },
  {
    id: "connections",
    label: "Connections",
    icon: Network,
    subItems: [
      { id: "webhooks", label: "Webhook Connections" },
      { id: "emails", label: "Email Destinations" },
    ],
  },
  {
    id: "developer-tools",
    label: "Developer Tools",
    icon: Terminal,
    subItems: [
      { id: "api-endpoint", label: "API Endpoint" },
      { id: "api-keys", label: "API Keys" },
      { id: "request-body", label: "Request Body" },
      { id: "field-rules", label: "Field Rules" },
      { id: "payloads", label: "Payloads" },
    ],
  },
];

export function ServiceDetailsSidebar({
  className,
}: ServiceDetailsSidebarProps) {
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["connections", "developer-tools"])
  );

  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.flatMap((item) => {
        const section = document.getElementById(item.id);
        if (!section) return [];

        const subSections = item.subItems
          ? item.subItems.map((sub) => {
              const subSection = document.getElementById(sub.id);
              return subSection ? { id: sub.id, element: subSection } : null;
            }).filter(Boolean) as { id: string; element: HTMLElement }[]
          : [];

        return [
          { id: item.id, element: section },
          ...subSections,
        ];
      });

      const scrollPosition = window.scrollY + 150;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.element.offsetTop <= scrollPosition) {
          setActiveSection(section.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div
      className={cn(
        "sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto",
        className
      )}
    >
      <nav className="space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isExpanded = expandedSections.has(item.id);
          const hasSubItems = item.subItems && item.subItems.length > 0;

          return (
            <div key={item.id} className="space-y-1">
              <button
                onClick={() => {
                  if (hasSubItems) {
                    toggleSection(item.id);
                  } else {
                    scrollToSection(item.id);
                  }
                }}
                className={cn(
                  "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  activeSection === item.id || 
                  (hasSubItems && item.subItems?.some(sub => activeSection === sub.id))
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
                {hasSubItems && (
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isExpanded && "rotate-90"
                    )}
                  />
                )}
              </button>

              {hasSubItems && isExpanded && (
                <div className="ml-6 space-y-1 border-l border-slate-700/50 pl-3">
                  {item.subItems?.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => scrollToSection(subItem.id)}
                      className={cn(
                        "w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors",
                        activeSection === subItem.id
                          ? "text-cyan-400 bg-cyan-500/10"
                          : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/30"
                      )}
                    >
                      {subItem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}

