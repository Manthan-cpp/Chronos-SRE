"use client";

import React from "react";
import { IncidentScenario } from "../types/incident";
import { Play, RotateCcw } from "lucide-react";

const GithubIcon: React.FC<{ className?: string }> = ({ className = "h-4 w-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

interface NavbarProps {
  scenarios: IncidentScenario[];
  activeScenario: IncidentScenario;
  onSelectScenario: (scenario: IncidentScenario) => void;
  repoUrl: string;
  onRepoUrlChange: (url: string) => void;
  isInvestigating: boolean;
  systemStatus: "idle" | "crashing" | "investigating" | "verified";
  onTriggerInvestigation: () => void;
  onReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  scenarios,
  activeScenario,
  onSelectScenario,
  repoUrl,
  onRepoUrlChange,
  isInvestigating,
  systemStatus,
  onTriggerInvestigation,
  onReset
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-[#07090e]/75 backdrop-blur-md px-6 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Brand & Inputs */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg tracking-tight text-white">
              Chronos
            </span>
            <span className="text-xs font-medium text-slate-400">SRE</span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Incident Selector */}
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="text-xs font-medium text-slate-400">Incident:</span>
            <select
              value={activeScenario.id}
              onChange={(e) => {
                const found = scenarios.find((s) => s.id === e.target.value);
                if (found) onSelectScenario(found);
              }}
              disabled={isInvestigating}
              className="rounded-md border border-slate-800 bg-[#0d111d] px-2.5 py-1 text-sm font-medium text-slate-200 outline-none hover:bg-slate-900 transition-colors cursor-pointer disabled:opacity-50"
            >
              {scenarios.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#0d111d] text-slate-200">
                  {s.code} — {s.title}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden lg:block h-4 w-px bg-slate-800" />

          {/* GitHub Repository Input */}
          <div className="hidden lg:flex items-center gap-2 text-sm text-slate-400">
            <GithubIcon className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="text-xs font-medium text-slate-400">Repo:</span>
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => onRepoUrlChange(e.target.value)}
              placeholder="owner/repo (e.g. facebook/react)"
              disabled={isInvestigating}
              className="w-64 rounded-md border border-slate-800 bg-[#0d111d] px-2.5 py-1 text-xs text-slate-200 placeholder:text-slate-600 outline-none hover:border-slate-700 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Status Badge */}
          {systemStatus === "crashing" && (
            <span className="text-xs font-medium text-red-400 bg-red-950/60 border border-red-800/60 px-2.5 py-1 rounded">
              Crash Active
            </span>
          )}
          {systemStatus === "investigating" && (
            <span className="text-xs font-medium text-blue-400 bg-blue-950/60 border border-blue-800/60 px-2.5 py-1 rounded">
              Investigating...
            </span>
          )}
          {systemStatus === "verified" && (
            <span className="text-xs font-medium text-green-400 bg-green-950/60 border border-green-800/60 px-2.5 py-1 rounded">
              Resolved & Verified
            </span>
          )}

          {/* Reset button */}
          <button
            onClick={onReset}
            disabled={isInvestigating}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors disabled:opacity-40 cursor-pointer"
            title="Reset"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onTriggerInvestigation}
            disabled={isInvestigating}
            className="flex items-center gap-1.5 rounded-md bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 text-sm font-medium text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>{isInvestigating ? "Running..." : "Run Investigation"}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
