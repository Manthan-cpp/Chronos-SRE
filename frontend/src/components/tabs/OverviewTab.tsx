"use client";

import React from "react";
import { IncidentScenario } from "../../types/incident";

interface OverviewTabProps {
  scenario: IncidentScenario;
  systemStatus: "idle" | "crashing" | "investigating" | "verified";
  repoUrl?: string;
  onRepoUrlChange?: (url: string) => void;
  isSimulating: boolean;
  isInvestigating: boolean;
  onSimulate: () => void;
  onInvestigate: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  scenario,
  isSimulating,
  isInvestigating,
  onSimulate,
  onInvestigate
}) => {
  return (
    <div className="space-y-6">
      {/* Incident Header Card */}
      <div className="rounded-xl border border-slate-800/80 bg-[#0c101a]/75 backdrop-blur-md p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {scenario.code}
              </span>
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">
              {scenario.title}
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              {scenario.description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onSimulate}
              disabled={isSimulating || isInvestigating}
              className="rounded-md border border-slate-700 bg-slate-900/80 hover:bg-slate-800 px-3.5 py-2 text-sm font-medium text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              Simulate Crash Logs
            </button>
            <button
              onClick={onInvestigate}
              disabled={isInvestigating}
              className="rounded-md bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              {isInvestigating ? "Investigating..." : "Start Investigation"}
            </button>
          </div>
        </div>
      </div>

      {/* Autonomous SRE Execution Pipeline - Clean Monochrome */}
      <div className="rounded-xl border border-slate-800/80 bg-[#0c101a]/75 backdrop-blur-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">
            Autonomous SRE Execution Pipeline
          </h2>
          <span className="text-xs text-slate-400 font-mono">4 Stages</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-lg border border-slate-800/80 bg-slate-900/50">
            <div className="text-[11px] font-mono text-slate-400 mb-1">STAGE 01</div>
            <div className="text-sm font-medium text-white">Telemetry Sifter</div>
            <p className="text-xs text-slate-400 mt-1">Extracts fatal exceptions and isolates failing callstacks from noisy logs.</p>
          </div>
          <div className="p-3.5 rounded-lg border border-slate-800/80 bg-slate-900/50">
            <div className="text-[11px] font-mono text-slate-400 mb-1">STAGE 02</div>
            <div className="text-sm font-medium text-white">External Errata Grounding</div>
            <p className="text-xs text-slate-400 mt-1">Tavily live search retrieves package changelogs and upstream GitHub issues.</p>
          </div>
          <div className="p-3.5 rounded-lg border border-slate-800/80 bg-slate-900/50">
            <div className="text-[11px] font-mono text-slate-400 mb-1">STAGE 03</div>
            <div className="text-sm font-medium text-white">AST Structural Analysis</div>
            <p className="text-xs text-slate-400 mt-1">Analyzes syntax trees to pinpoint deadlocks, leaked connections, and bad kwargs.</p>
          </div>
          <div className="p-3.5 rounded-lg border border-slate-800/80 bg-slate-900/50">
            <div className="text-[11px] font-mono text-slate-400 mb-1">STAGE 04</div>
            <div className="text-sm font-medium text-white">Sandbox & Pull Request</div>
            <p className="text-xs text-slate-400 mt-1">Executes pytest to verify pre/post patch status and opens an automated PR.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
