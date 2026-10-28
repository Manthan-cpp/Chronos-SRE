"use client";

import React from "react";
import { IncidentScenario } from "../../types/incident";
import { ArrowRight, Terminal, GitBranch, Cpu, CheckCircle2 } from "lucide-react";

interface OverviewTabProps {
  connectedRepo: string | null;
  repoInput: string;
  onRepoInputChange: (v: string) => void;
  onConnectRepo: (repo?: string) => void;
  scenario: IncidentScenario | null;
  scenarios: IncidentScenario[];
  onSelectScenario: (s: IncidentScenario) => void;
  systemStatus: "idle" | "crashing" | "investigating" | "verified";
  isSimulating: boolean;
  isInvestigating: boolean;
  onSimulate: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  connectedRepo,
  repoInput,
  onRepoInputChange,
  onConnectRepo,
  scenario,
  scenarios = [],
  onSelectScenario,
  isSimulating,
  isInvestigating,
  onSimulate
}) => {
  return (
    <div className="space-y-6">
      {/* 1. STATE 1: NO REPOSITORY CONNECTED (100% BLANK / ENTRY STATE) */}
      {!connectedRepo ? (
        <div className="glass-panel rounded-2xl p-8">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 mb-2">
            No Target Repository Connected
          </h1>
          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed mb-6">
            Chronos-SRE intercepts production exceptions, runs deterministic pytest repro sandboxes, and synthesizes AST-verified pull requests. To begin, connect a target GitHub repository to discover active testbeds and failure telemetry.
          </p>

          {/* Repo Input Box + Quick Connect Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-xl mb-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={repoInput}
                onChange={(e) => onRepoInputChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onConnectRepo()}
                placeholder="owner/repo (e.g. Manthan-cpp/Chronos-SRE)"
                className="w-full rounded-lg border border-black/15 bg-white/60 px-3.5 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-800"
              />
            </div>
            <button
              onClick={() => onConnectRepo()}
              disabled={!repoInput.trim()}
              className="px-4 py-2 text-xs font-mono font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer shrink-0"
            >
              Connect Repository
            </button>
          </div>
        </div>
      ) : !scenario ? (
        /* 2. STATE 2: REPO CONNECTED, SELECT INCIDENT TESTBED */
        <div className="glass-panel rounded-2xl p-7">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-mono font-semibold text-slate-900">
                Connected: {connectedRepo}
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              {scenarios.length} Testbed Incidents Discovered
            </span>
          </div>

          <h2 className="text-base font-semibold tracking-tight text-slate-900 mb-1.5">
            Select an Incident Testbed from {connectedRepo}
          </h2>
          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed mb-6">
            The following reproducible Python failure testbeds exist inside this repository. Select an incident to load its telemetry and run deterministic pytest verification.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {scenarios.map((s) => (
              <div
                key={s.id}
                onClick={() => onSelectScenario(s)}
                className="glass-card glass-card-hover rounded-xl p-4.5 cursor-pointer border border-black/10 hover:border-slate-800 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500">
                    {s.code}
                  </span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-black/[0.05] text-slate-700 border border-black/10">
                    {s.category}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-black transition-colors mb-1.5">
                  {s.title}
                </h3>
                <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed mb-3">
                  {s.description}
                </p>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 group-hover:translate-x-1 transition-transform">
                  <span>Load Testbed</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* 3. STATE 3: INCIDENT ACTIVE IN WAR-ROOM */
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-900 bg-black/[0.06] px-2 py-0.5 rounded">
                  {scenario.code}
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-black/[0.05] text-slate-700 border border-black/10">
                  {scenario.category}
                </span>
                <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                  <GitBranch className="h-3 w-3" />
                  <span>Target: scenarios/{scenario.id}</span>
                </span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 mb-2">
                {scenario.title}
              </h1>
              <p className="text-xs text-slate-700 max-w-2xl leading-relaxed mb-3">
                {scenario.diagnosticReport?.whatHappened || scenario.description}
              </p>

              {scenario.diagnosticReport && (
                <div className="mt-3 pt-3 border-t border-black/[0.08] space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-slate-900 shrink-0">• Severity &amp; Issue:</span>
                    <span>{scenario.diagnosticReport.businessImpact.severity}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-slate-900 shrink-0">• Production Impact:</span>
                    <span>{scenario.diagnosticReport.businessImpact.throughputImpact}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-slate-900 shrink-0">• SLA Risk:</span>
                    <span>{scenario.diagnosticReport.businessImpact.slaBreachRisk}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={onSimulate}
                disabled={isSimulating || isInvestigating}
                className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-all cursor-pointer disabled:opacity-40 shadow-sm"
                title="Runs real pytest subprocess on backend"
              >
                <Terminal className="h-3.5 w-3.5" />
                <span>{isSimulating ? "Executing Pytest..." : "Simulate Crash via Pytest"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Autonomous SRE Execution Pipeline - Clean Monochrome Glass */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold tracking-tight text-slate-900 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-slate-700" />
            <span>Autonomous SRE Execution Pipeline</span>
          </h2>
          <span className="text-[11px] text-slate-500 font-mono">4 Deterministic Stages</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card glass-card-hover rounded-xl p-4">
            <div className="text-[10px] font-mono font-semibold text-slate-500 mb-1">STAGE 01</div>
            <div className="text-xs font-semibold text-slate-900">Telemetry Sifter</div>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">Extracts fatal exceptions and isolates failing callstacks from noisy logs.</p>
          </div>
          <div className="glass-card glass-card-hover rounded-xl p-4">
            <div className="text-[10px] font-mono font-semibold text-slate-500 mb-1">STAGE 02</div>
            <div className="text-xs font-semibold text-slate-900">External Errata Grounding</div>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">Tavily live search retrieves package changelogs and upstream GitHub issues.</p>
          </div>
          <div className="glass-card glass-card-hover rounded-xl p-4">
            <div className="text-[10px] font-mono font-semibold text-slate-500 mb-1">STAGE 03</div>
            <div className="text-xs font-semibold text-slate-900">AST Structural Analysis</div>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">Analyzes syntax trees to pinpoint deadlocks, leaked connections, and bad kwargs.</p>
          </div>
          <div className="glass-card glass-card-hover rounded-xl p-4">
            <div className="text-[10px] font-mono font-semibold text-slate-500 mb-1">STAGE 04</div>
            <div className="text-xs font-semibold text-slate-900">Sandbox & Pull Request</div>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">Executes pytest to verify pre/post patch status and opens an automated PR.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
