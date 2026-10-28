"use client";

import React from "react";
import { IncidentScenario, RepoMetadata } from "../../types/incident";
import { ArrowRight, Terminal, GitBranch, Cpu, CheckCircle2, Search, Code, AlertTriangle, FileCode2, Loader2, Sparkles } from "lucide-react";

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
  repoMetadata?: RepoMetadata | null;
  fileTree?: string[];
  manualLogInput?: string;
  onManualLogInputChange?: (v: string) => void;
  onDiscoverIncidents?: (customLog?: string) => void;
  onLoadBenchmarks?: () => void;
  isConnectingRepo?: boolean;
  isDiscoveringIncidents?: boolean;
  discoveryMode?: "benchmark" | "github_auto" | "manual_stacktrace" | "candidate_audit";
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
  onSimulate,
  repoMetadata,
  fileTree = [],
  manualLogInput = "",
  onManualLogInputChange,
  onDiscoverIncidents,
  onLoadBenchmarks,
  isConnectingRepo = false,
  isDiscoveringIncidents = false,
  discoveryMode = "benchmark"
}) => {
  return (
    <div className="space-y-6">
      {/* 1. STATE 1: NO REPOSITORY CONNECTED */}
      {!connectedRepo ? (
        <div className="glass-panel rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-600 bg-black/[0.05] border border-black/10 px-2 py-0.5 rounded font-medium">
              Universal Repository Ingestion
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mb-2">
            Connect Target GitHub Repository
          </h1>
          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed mb-6">
            Chronos-SRE dynamically ingests any public GitHub repository (e.g. <code className="font-mono bg-black/[0.05] px-1 py-0.5 rounded">Manthan-cpp/GramRaksha-AI</code>). Enter your repository below to discover active bugs from open GitHub issues, failed CI actions, or ingest a real production traceback.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-xl mb-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={repoInput}
                onChange={(e) => onRepoInputChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onConnectRepo()}
                placeholder="owner/repo (e.g. Manthan-cpp/GramRaksha-AI)"
                disabled={isConnectingRepo}
                className="w-full rounded-lg border border-black/15 bg-white/60 px-3.5 py-2.5 text-xs font-mono text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-800"
              />
            </div>
            <button
              onClick={() => onConnectRepo()}
              disabled={!repoInput.trim() || isConnectingRepo}
              className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-mono font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer shrink-0 shadow-sm"
            >
              {isConnectingRepo && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{isConnectingRepo ? "Connecting & Scanning..." : "Connect Repository"}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] text-slate-500 font-mono">
            <span>Quick Preset:</span>
            <button
              onClick={() => onConnectRepo("Manthan-cpp/GramRaksha-AI")}
              className="hover:text-slate-900 hover:underline cursor-pointer font-medium text-slate-700"
            >
              Manthan-cpp/GramRaksha-AI
            </button>
          </div>
        </div>
      ) : (
        /* 2. STATE 2 & 3: REPO CONNECTED */
        <div className="space-y-6">
          {/* Repository Header & Telemetry Capsule */}
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-mono font-bold text-slate-900">
                    {repoMetadata?.full_name || connectedRepo}
                  </span>
                  {repoMetadata?.language && (
                    <span className="text-[10px] font-mono text-slate-700 bg-black/[0.05] border border-black/10 px-2 py-0.5 rounded font-medium">
                      {repoMetadata.language}
                    </span>
                  )}
                  {repoMetadata?.default_branch && (
                    <span className="text-[10px] font-mono text-slate-600 bg-black/[0.05] px-1.5 py-0.5 rounded flex items-center gap-1">
                      <GitBranch className="h-3 w-3" />
                      <span>{repoMetadata.default_branch}</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                  {repoMetadata?.description || `Connected repository (${fileTree.length} scanned files across tree). Ready for autonomous incident triage.`}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {onLoadBenchmarks && (
                  <button
                    onClick={onLoadBenchmarks}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-black/[0.05] hover:bg-black/10 border border-black/10 text-slate-800 transition-colors cursor-pointer"
                    title="Switch to curated SWE-bench style failure testbeds"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-slate-600" />
                    <span>Load Benchmark Suite</span>
                  </button>
                )}
              </div>
            </div>

            {/* DUAL-MODE INCIDENT INGESTION SECTION */}
            <div className="mt-5 pt-5 border-t border-black/[0.08]">
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <FileCode2 className="h-4 w-4 text-slate-700" />
                    <span>Production Stacktrace / Error Log Ingestion</span>
                  </label>
                  <span className="text-[11px] font-mono text-slate-500">
                    {manualLogInput.trim() ? "Mode B: User Stacktrace Active" : "Mode A: Auto-Discovery Active (Empty Input)"}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Paste a production traceback below to pinpoint the exact failing line and file. If left empty, Chronos-SRE automatically queries open GitHub issues and failed CI workflow runs.
                </p>

                <textarea
                  value={manualLogInput}
                  onChange={(e) => onManualLogInputChange?.(e.target.value)}
                  placeholder="Optional: Paste production stacktrace or error traceback here... (e.g. File &quot;src/api.py&quot;, line 42, in handle_request: ZeroDivisionError: division by zero)"
                  rows={2}
                  className="w-full rounded-lg border border-black/15 bg-white/70 px-3.5 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-800 resize-y"
                />

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500">
                      Discovery Mode:
                    </span>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-black/[0.05] border border-black/10 text-slate-800">
                      {discoveryMode === "manual_stacktrace" ? "Mode B: Custom Stacktrace" : discoveryMode === "github_auto" ? "Mode A: GitHub Issues & CI" : discoveryMode === "candidate_audit" ? "Proactive Code Audit" : "SRE Benchmark Suite"}
                    </span>
                  </div>

                  {onDiscoverIncidents && (
                    <button
                      onClick={() => onDiscoverIncidents(manualLogInput)}
                      disabled={isDiscoveringIncidents}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer disabled:opacity-40 shadow-sm"
                    >
                      {isDiscoveringIncidents ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Search className="h-3.5 w-3.5" />
                      )}
                      <span>
                        {manualLogInput.trim() ? "Ingest & Target Stacktrace" : "Auto-Discover Incidents"}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ACTIVE INCIDENT DETAILS CARD */}
          {scenario ? (
            <div className="glass-panel rounded-2xl p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-900 bg-black/[0.06] border border-black/10 px-2 py-0.5 rounded">
                      {scenario.code}
                    </span>
                    <span className="text-[10px] font-mono font-semibold text-slate-600 flex items-center gap-1 bg-black/[0.04] px-2 py-0.5 rounded">
                      <GitBranch className="h-3 w-3" />
                      <span>Target: {scenario.failingFile}</span>
                    </span>
                    {scenario.failingLine && scenario.failingLine > 1 && (
                      <span className="text-[10px] font-mono text-slate-500">
                        Line {scenario.failingLine}
                      </span>
                    )}
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
                    title="Simulate crash and isolate telemetry"
                  >
                    <Terminal className="h-3.5 w-3.5" />
                    <span>{isSimulating ? "Sifting Logs..." : "Simulate Crash Telemetry"}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-8 text-center">
              <AlertTriangle className="h-8 w-8 text-slate-500 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-900">No Incident Selected</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
                Select an incident from the discovered list below or from the top navbar to launch the autonomous forensic investigation.
              </p>
            </div>
          )}

          {/* DISCOVERED INCIDENTS GRID */}
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-slate-700" />
                <h2 className="text-sm font-semibold tracking-tight text-slate-900">
                  Discovered Incidents ({scenarios.length})
                </h2>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                Target: {connectedRepo}
              </span>
            </div>

            {discoveryMode === "candidate_audit" && (
              <div className="mb-4 p-3 rounded-lg bg-black/[0.04] border border-black/10 text-xs text-slate-700 leading-relaxed font-sans">
                <p>
                  <strong className="text-slate-900 font-semibold">Repository Status:</strong> Zero open GitHub issues and zero failed CI workflows were found in <strong className="text-slate-900">{connectedRepo}</strong>. Rather than showing an empty screen, Chronos-SRE extracted these 3 key source files from your repository tree so you can inspect their AST structure, run proactive code audits, or paste an active error log above.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {scenarios.map((s) => {
                const isSelected = scenario?.id === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => onSelectScenario(s)}
                    className={`glass-card glass-card-hover rounded-xl p-4 cursor-pointer border transition-all group ${
                      isSelected
                        ? "border-slate-900 bg-white shadow-sm ring-1 ring-slate-900/10"
                        : "border-black/10 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700">
                        {s.code}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 truncate max-w-[120px]">
                        {s.failingFile.split("/").pop()}
                      </span>
                    </div>

                    <h3 className="text-xs font-semibold text-slate-900 group-hover:text-black transition-colors mb-1.5 line-clamp-2">
                      {s.title}
                    </h3>

                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed mb-3">
                      {s.description}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 group-hover:translate-x-1 transition-transform">
                      <span>{isSelected ? "Active Incident" : "Target Incident"}</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                );
              })}
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
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">Extracts fatal exceptions and isolates failing callstacks from noisy logs or stacktraces.</p>
          </div>
          <div className="glass-card glass-card-hover rounded-xl p-4">
            <div className="text-[10px] font-mono font-semibold text-slate-500 mb-1">STAGE 02</div>
            <div className="text-xs font-semibold text-slate-900">External Errata Grounding</div>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">Tavily live search retrieves package changelogs and upstream GitHub issues.</p>
          </div>
          <div className="glass-card glass-card-hover rounded-xl p-4">
            <div className="text-[10px] font-mono font-semibold text-slate-500 mb-1">STAGE 03</div>
            <div className="text-xs font-semibold text-slate-900">AST Structural Analysis</div>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">Analyzes syntax trees from real GitHub source files to pinpoint concurrency and runtime flaws.</p>
          </div>
          <div className="glass-card glass-card-hover rounded-xl p-4">
            <div className="text-[10px] font-mono font-semibold text-slate-500 mb-1">STAGE 04</div>
            <div className="text-xs font-semibold text-slate-900">Sandbox & Pull Request</div>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">Deterministic syntax verification and automatic Pull Request opening on target repository.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
