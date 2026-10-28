"use client";

import React from "react";
import { IncidentScenario } from "../types/incident";
import { Play, RotateCcw, Link2, Unlink } from "lucide-react";

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
  onTriggerInvestigation
}) => {
  return (
    <header className="glass-header sticky top-0 z-50 px-6 py-2.5">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Brand & Inputs */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Chronos SRE Logo"
              className="h-10 w-10 object-contain shrink-0 select-none"
            />
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-tight text-slate-900 font-sans">
                Chronos
              </span>
              <span className="text-[11px] font-mono font-bold tracking-widest text-white bg-slate-900 px-2 py-0.5 rounded shadow-xs uppercase">
                SRE
              </span>
            </div>
          </div>

          <div className="h-4 w-px bg-black/10" />

          {/* GitHub Repository Capsule */}
          <div className="glass-nav-pill flex items-center gap-2 rounded-lg px-3 py-1.5">
            <GithubIcon className="h-3.5 w-3.5 text-slate-600 shrink-0" />
            <span className="text-[11px] font-mono text-slate-500">Repo:</span>

            {!connectedRepo ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={repoInput}
                  onChange={(e) => onRepoInputChange(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onConnectRepo()}
                  placeholder="owner/repo (e.g. Manthan-cpp/Chronos-SRE)"
                  disabled={isInvestigating}
                  className="w-56 bg-transparent text-xs font-mono text-slate-900 placeholder:text-slate-400 outline-none"
                />
                <button
                  onClick={() => onConnectRepo()}
                  disabled={!repoInput.trim() || isInvestigating}
                  className="px-2 py-0.5 text-[11px] font-mono font-medium rounded bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  Connect
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold text-slate-900">
                  {connectedRepo}
                </span>
                <button
                  onClick={onDisconnectRepo}
                  disabled={isInvestigating}
                  className="p-1 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                  title="Disconnect Repository"
                >
                  <Unlink className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          <div className="hidden lg:block h-4 w-px bg-black/10" />

          {/* Incident Selector Capsule */}
          <div className="glass-nav-pill flex items-center gap-2 rounded-lg px-3 py-1.5">
            <span className="text-[11px] font-mono text-slate-500">Incident:</span>
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
              className="bg-transparent text-xs font-mono font-medium text-slate-900 outline-none cursor-pointer disabled:opacity-40"
            >
              {!connectedRepo ? (
                <option value="" className="bg-[#dde1e6] text-slate-500">
                  -- Connect Repository First --
                </option>
              ) : (
                <>
                  <option value="" className="bg-[#dde1e6] text-slate-500">
                    -- Select Incident from Repo --
                  </option>
                  {scenarios.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#dde1e6] text-slate-900">
                      {s.code} — {s.title}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Status Badge */}
          {!connectedRepo && (
            <span className="text-xs font-mono font-medium text-slate-500 bg-slate-200/70 border border-slate-300 px-2.5 py-1 rounded-md">
              No Repo Connected
            </span>
          )}
          {connectedRepo && systemStatus === "idle" && (
            <span className="text-xs font-mono font-medium text-slate-700 bg-white/70 border border-slate-300 px-2.5 py-1 rounded-md">
              {activeScenario ? "Ready" : "Standby"}
            </span>
          )}
          {systemStatus === "crashing" && (
            <span className="text-xs font-mono font-bold text-white bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-md shadow-2xs">
              Crash Active
            </span>
          )}
          {systemStatus === "investigating" && (
            <span className="text-xs font-mono font-semibold text-slate-800 bg-slate-200 border border-slate-300 px-2.5 py-1 rounded-md animate-pulse">
              Investigating...
            </span>
          )}
          {systemStatus === "verified" && (
            <span className="text-xs font-mono font-medium text-emerald-700 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-md">
              Resolved & Verified
            </span>
          )}

          {/* Reset button */}
          <button
            onClick={onDisconnectRepo}
            disabled={isInvestigating || !connectedRepo}
            className="glass-nav-pill p-2 text-slate-500 hover:text-slate-900 rounded-lg transition-all disabled:opacity-30 cursor-pointer"
            title="Reset War-Room to Blank"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          {/* Primary Action Button (Clean Minimalist Solid Slate) */}
          <button
            disabled={isInvestigating || !connectedRepo || !activeScenario}
            onClick={onTriggerInvestigation}
            className="flex items-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 px-4 py-2 text-xs font-mono font-medium text-white transition-colors cursor-pointer disabled:cursor-not-allowed shadow-sm"
          >
            <Play className="h-3 w-3 fill-current" />
            <span>
              {isInvestigating
                ? "Running Investigation..."
                : !connectedRepo
                ? "Connect Repo First"
                : !activeScenario
                ? "Select Incident First"
                : "Run Investigation"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
