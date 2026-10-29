"use client";

import React from "react";
import { IncidentScenario } from "../types/incident";
import { Play, RotateCcw, Unlink, Sun, Moon } from "lucide-react";

const GithubIcon: React.FC<{ className?: string }> = ({ className = "h-4 w-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

interface NavbarProps {
  connectedRepo: string | null;
  repoInput: string;
  onRepoInputChange: (url: string) => void;
  onConnectRepo: (repo?: string) => void;
  onDisconnectRepo: () => void;
  scenarios: IncidentScenario[];
  activeScenario: IncidentScenario | null;
  onSelectScenario: (scenario: IncidentScenario | null) => void;
  isInvestigating: boolean;
  systemStatus: "idle" | "crashing" | "investigating" | "verified";
  onTriggerInvestigation: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  connectedRepo,
  repoInput,
  onRepoInputChange,
  onConnectRepo,
  onDisconnectRepo,
  scenarios,
  activeScenario,
  onSelectScenario,
  isInvestigating,
  systemStatus,
  onTriggerInvestigation,
  isDarkMode = false,
  onToggleDarkMode
}) => {
  return (
    <header className="glass-header sticky top-0 z-50 px-4 sm:px-6 py-2.5 w-full border-b border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 sm:gap-4">
        {/* Brand & Inputs */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="flex items-center gap-2.5 shrink-0">
            <img
              src={isDarkMode ? "/logo-dark.png" : "/logo.png"}
              alt="Chronos SRE Logo"
              className="h-9 w-9 object-contain shrink-0 select-none"
            />
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 dark:text-white font-sans transition-colors">
                Chronos
              </span>
              <span className="text-[10px] font-mono font-bold tracking-widest text-white bg-slate-900 dark:bg-white dark:text-zinc-950 px-1.5 py-0.5 rounded shadow-xs uppercase transition-colors">
                SRE
              </span>
            </div>
          </div>

          <div className="hidden sm:block h-4 w-px bg-black/10 dark:bg-white/15 shrink-0" />

          {/* GitHub Repository Capsule */}
          <div className="glass-nav-pill flex items-center gap-2 rounded-lg px-2.5 sm:px-3 py-1.5 shrink-0 border border-black/10 dark:border-white/15">
            <GithubIcon className="h-3.5 w-3.5 text-slate-600 dark:text-zinc-400 shrink-0" />
            <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 hidden sm:inline">Repo:</span>

            {!connectedRepo ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={repoInput}
                  onChange={(e) => onRepoInputChange(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onConnectRepo()}
                  placeholder="owner/repo"
                  disabled={isInvestigating}
                  className="w-32 sm:w-44 md:w-52 bg-transparent text-xs font-mono text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none"
                />
                <button
                  onClick={() => onConnectRepo()}
                  disabled={!repoInput.trim() || isInvestigating}
                  className="px-2 py-0.5 text-[11px] font-mono font-medium rounded bg-slate-900 text-white hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 disabled:opacity-40 transition-colors cursor-pointer shrink-0"
                >
                  Connect
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="text-xs font-mono font-semibold text-slate-900 dark:text-zinc-100 truncate max-w-[120px] sm:max-w-[180px] md:max-w-[220px]"
                  title={connectedRepo}
                >
                  {connectedRepo}
                </span>
                <button
                  onClick={onDisconnectRepo}
                  disabled={isInvestigating}
                  className="p-1 text-slate-400 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-zinc-200 transition-colors cursor-pointer shrink-0"
                  title="Disconnect Repository"
                >
                  <Unlink className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          <div className="hidden lg:block h-4 w-px bg-black/10 dark:bg-white/15 shrink-0" />

          {/* Incident Selector Capsule */}
          <div className="glass-nav-pill hidden md:flex items-center gap-2 rounded-lg px-3 py-1.5 min-w-0 max-w-[220px] lg:max-w-[300px] border border-black/10 dark:border-white/15">
            <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 shrink-0">Incident:</span>
            <select
              value={activeScenario?.id ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) {
                  onSelectScenario(null);
                } else {
                  const found = scenarios.find((s) => s.id === val);
                  if (found) onSelectScenario(found);
                }
              }}
              disabled={!connectedRepo || isInvestigating}
              className="bg-transparent text-xs font-mono font-medium text-slate-900 dark:text-zinc-100 outline-none cursor-pointer disabled:opacity-40 truncate w-full"
            >
              {!connectedRepo ? (
                <option value="" className="bg-[#dde1e6] dark:bg-[#12141d] text-slate-500 dark:text-zinc-400">
                  -- Connect Repo First --
                </option>
              ) : (
                <>
                  <option value="" className="bg-[#dde1e6] dark:bg-[#12141d] text-slate-500 dark:text-zinc-400">
                    -- Select Incident --
                  </option>
                  {scenarios.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#dde1e6] dark:bg-[#12141d] text-slate-900 dark:text-zinc-100">
                      {s.code} — {s.title.length > 36 ? s.title.slice(0, 34) + "..." : s.title}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Status Badge (Strict Monochrome) */}
          {!connectedRepo && (
            <span className="hidden sm:inline-block text-xs font-mono font-medium text-slate-500 bg-slate-200/70 border border-slate-300 dark:text-zinc-400 dark:bg-zinc-900/80 dark:border-zinc-700 px-2.5 py-1 rounded-md">
              No Repo Connected
            </span>
          )}
          {connectedRepo && systemStatus === "idle" && (
            <span className="hidden sm:inline-block text-xs font-mono font-medium text-slate-700 bg-white/70 border border-slate-300 dark:text-zinc-300 dark:bg-zinc-900/80 dark:border-zinc-700 px-2.5 py-1 rounded-md">
              {activeScenario ? "Ready" : "Standby"}
            </span>
          )}
          {systemStatus === "crashing" && (
            <span className="text-xs font-mono font-bold text-white bg-slate-900 border border-slate-700 dark:bg-zinc-100 dark:text-zinc-950 dark:border-zinc-300 px-2.5 py-1 rounded-md shadow-2xs">
              Crash Active
            </span>
          )}
          {systemStatus === "investigating" && (
            <span className="text-xs font-mono font-semibold text-slate-800 bg-slate-200 border border-slate-300 dark:text-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 px-2.5 py-1 rounded-md animate-pulse">
              Investigating...
            </span>
          )}
          {systemStatus === "verified" && (
            <span className="text-xs font-mono font-medium text-slate-900 bg-slate-200 border border-slate-400 dark:text-zinc-100 dark:bg-zinc-800 dark:border-zinc-600 px-2.5 py-1 rounded-md">
              Resolved & Verified
            </span>
          )}

          {/* Theme Toggle Button (Strictly Monochrome) */}
          <button
            onClick={onToggleDarkMode}
            className="glass-nav-pill p-2 text-slate-600 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white rounded-lg transition-all border border-black/10 dark:border-white/15 cursor-pointer shrink-0"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? (
              <Sun className="h-3.5 w-3.5 text-zinc-200" />
            ) : (
              <Moon className="h-3.5 w-3.5 text-slate-700" />
            )}
          </button>

          {/* Reset button */}
          <button
            onClick={onDisconnectRepo}
            disabled={isInvestigating || !connectedRepo}
            className="glass-nav-pill p-2 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-lg transition-all border border-black/10 dark:border-white/15 disabled:opacity-30 cursor-pointer shrink-0"
            title="Reset War-Room to Blank"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          {/* Primary Action Button (Strictly Monochrome) */}
          <button
            disabled={isInvestigating || !connectedRepo || !activeScenario}
            onClick={onTriggerInvestigation}
            className="flex items-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 disabled:bg-slate-400 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600 px-3 sm:px-4 py-2 text-xs font-mono font-medium text-white transition-colors cursor-pointer disabled:cursor-not-allowed shadow-sm shrink-0 border border-slate-800 dark:border-zinc-300"
          >
            <Play className="h-3 w-3 fill-current" />
            <span>
              {isInvestigating
                ? "Investigating..."
                : !connectedRepo
                ? "Connect Repo"
                : !activeScenario
                ? "Select Incident"
                : "Run Investigation"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
