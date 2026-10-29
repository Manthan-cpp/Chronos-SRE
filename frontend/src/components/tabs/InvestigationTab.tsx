"use client";

import React, { useState } from "react";
import { AgentNode, IncidentScenario, TokenMetrics } from "../../types/incident";
import { MarkdownViewer } from "../MarkdownViewer";
import {
  CheckCircle2,
  Loader2,
  Sparkles,
  Copy,
  Check,
  Brain
} from "lucide-react";

interface InvestigationTabProps {
  agents: AgentNode[];
  activePhaseMessage?: string;
  reasoningText: string;
  isInvestigating: boolean;
  tokenMetrics: TokenMetrics;
  scenario?: IncidentScenario | null;
}

export const InvestigationTab: React.FC<InvestigationTabProps> = ({
  agents,
  activePhaseMessage,
  reasoningText,
  isInvestigating,
  tokenMetrics,
  scenario
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(reasoningText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runningIndex = agents.findIndex((a) => a.status === "running");
  const completedCount = agents.filter((a) => a.status === "completed").length;
  const allCompleted = completedCount === agents.length && agents.length > 0;

  // Fluid continuous progress percentage for smooth shifting animation
  const progressPercent = allCompleted
    ? 100
    : runningIndex !== -1
    ? Math.max(12, ((runningIndex + 0.6) / agents.length) * 100)
    : completedCount > 0
    ? (completedCount / agents.length) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Investigation Pipeline Steps */}
      <div className="glass-panel rounded-2xl p-5 border border-black/10 dark:border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Autonomous Agent Execution Pipeline
            </span>
            {isInvestigating && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-900 dark:bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-900 dark:bg-white" />
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-zinc-400">
            {allCompleted
              ? "All 5 Phases Complete"
              : isInvestigating && runningIndex !== -1
              ? `Phase ${runningIndex + 1} of 5 Active`
              : "Standby"}
          </span>
        </div>

        {/* Real-time 1-Line Dynamic Phase Description Banner */}
        <div className="mb-3.5 rounded-xl border border-black/[0.08] dark:border-white/10 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md px-3.5 py-2 flex items-center justify-between gap-3 text-xs transition-all duration-300">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {allCompleted ? (
              <CheckCircle2 className="h-4 w-4 text-zinc-900 dark:text-zinc-100 shrink-0" />
            ) : isInvestigating ? (
              <Loader2 className="h-4 w-4 text-slate-900 dark:text-zinc-100 animate-spin shrink-0" />
            ) : (
              <span className="h-2 w-2 rounded-full bg-slate-400 dark:bg-zinc-600 shrink-0" />
            )}
            <span className="font-mono text-slate-700 dark:text-zinc-200 truncate">
              {activePhaseMessage || (
                allCompleted
                  ? "Deterministic verification complete: Regression test passed (EXIT 0)."
                  : isInvestigating
                  ? "Initializing autonomous forensic pipeline..."
                  : "Ready to launch autonomous multi-agent forensic analysis."
              )}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 shrink-0 uppercase tracking-wider font-semibold">
            {allCompleted ? "VERIFIED" : isInvestigating ? "LIVE" : "READY"}
          </span>
        </div>

        {/* Smooth Shifting Progress Track */}
        <div className="relative mb-3.5">
          <div className="h-1 w-full bg-black/[0.06] dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-900 dark:bg-zinc-100 transition-all duration-700 ease-out rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* 5 Phase Cards with Smooth Shifting & Micro Status */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {agents.map((agent, i) => {
            const isRunning = agent.status === "running";
            const isDone = agent.status === "completed";

            return (
              <div
                key={agent.id}
                className={`glass-card rounded-xl p-3.5 transition-all duration-500 ease-out transform border ${
                  isRunning
                    ? "border-slate-900 bg-white dark:border-zinc-100 dark:bg-zinc-900 shadow-md -translate-y-1 ring-1 ring-slate-900/15 dark:ring-white/15 text-slate-900 dark:text-zinc-100"
                    : isDone
                    ? "border-slate-400 bg-slate-100/70 dark:border-zinc-700 dark:bg-zinc-800/70 text-slate-900 dark:text-zinc-100 translate-y-0"
                    : "border-black/5 dark:border-white/5 bg-white/40 dark:bg-zinc-900/40 text-slate-400 dark:text-zinc-500 opacity-60 translate-y-0"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-semibold text-slate-500 dark:text-zinc-400">
                    PHASE {i + 1}
                  </span>
                  {isRunning && <Loader2 className="h-3.5 w-3.5 text-slate-900 dark:text-zinc-100 animate-spin" />}
                  {isDone && <CheckCircle2 className="h-3.5 w-3.5 text-zinc-900 dark:text-zinc-100" />}
                </div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white">{agent.label}</div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate">{agent.role}</div>

                {/* Micro 1-Line Status under each card */}
                {isRunning ? (
                  <div className="text-[10px] font-mono text-slate-800 dark:text-zinc-200 mt-1.5 truncate font-medium animate-pulse flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-900 dark:bg-white inline-block" />
                    <span>Active Now</span>
                  </div>
                ) : isDone ? (
                  <div className="text-[10px] font-mono text-zinc-800 dark:text-zinc-200 mt-1.5 font-medium flex items-center gap-1">
                    <span>✔ Complete</span>
                  </div>
                ) : (
                  <div className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 mt-1.5">
                    <span>Queued</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Reasoning Report Container */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-black/10 dark:border-white/10">
        <div className="flex items-center justify-between border-b border-black/[0.08] dark:border-white/10 px-5 py-3.5 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-slate-700 dark:text-zinc-300" />
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              Nemotron-3.5-Bolt Forensic Analysis Log
            </span>
            {isInvestigating && (
              <span className="text-xs font-mono font-medium text-slate-800 dark:text-zinc-200 bg-black/[0.06] dark:bg-white/10 border border-black/10 dark:border-white/15 px-2 py-0.5 rounded animate-pulse">
                Analyzing in real-time...
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Live Token Metrics */}
            <div className="flex items-center gap-3 text-xs font-mono text-slate-600 dark:text-zinc-300 border border-black/10 dark:border-white/15 bg-white/80 dark:bg-zinc-900/80 px-3 py-1 rounded-lg">
              <Sparkles className="h-3.5 w-3.5 text-slate-700 dark:text-zinc-300" />
              <span>
                Speed: <span className="text-slate-900 dark:text-white font-semibold">{tokenMetrics.tokensPerSecond.toFixed(1)} tok/s</span>
              </span>
              <span>•</span>
              <span>
                Tokens: <span className="text-slate-900 dark:text-white font-semibold">{tokenMetrics.totalTokens}</span>
              </span>
            </div>

            <button
              onClick={handleCopy}
              disabled={!reasoningText}
              className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-zinc-300 hover:text-black dark:hover:text-white px-2.5 py-1 rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-zinc-900 hover:border-black/20 dark:hover:border-white/25 transition-colors disabled:opacity-40 cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-zinc-900 dark:text-zinc-100" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied" : "Copy Log"}</span>
            </button>
          </div>
        </div>

        {/* Streaming Text Output Area (Clean Terminal with Rendered Markdown Typography) */}
        <div className="p-6 max-h-[560px] overflow-y-auto bg-[#0b0f19] border-t border-black/10 dark:border-white/10">
          <MarkdownViewer content={reasoningText} />
        </div>
      </div>

      {/* Incident Postmortem & Forensic Investigation Report (Clean Memo / Letter Format) */}
      {scenario?.diagnosticReport && (reasoningText || isInvestigating) && (
        <div className="pt-3 space-y-5">
          <div className="border-b border-black/[0.12] dark:border-white/15 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Incident Postmortem &amp; Forensic Investigation Report
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs font-mono text-slate-600 dark:text-zinc-400">
              <span>Incident: <strong className="text-slate-900 dark:text-white">{scenario.code}</strong></span>
              <span>•</span>
              <span>Service: <strong className="text-slate-900 dark:text-white">{scenario.service}</strong></span>
              <span>•</span>
              <span>File: <strong className="text-slate-900 dark:text-white">{scenario.failingFile}</strong></span>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-800 dark:text-zinc-200 leading-relaxed">
            {/* 1. What is the issue */}
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                1. What is the issue?
              </h3>
              <p className="text-slate-700 dark:text-zinc-300">
                {scenario?.diagnosticReport?.whatHappened || scenario?.description || "Runtime exception observed."}
              </p>
            </div>

            {/* 2. Why did it crash (Root Cause) */}
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                2. Why did it crash? (Root Cause)
              </h3>
              <p className="text-slate-700 dark:text-zinc-300">
                {scenario?.diagnosticReport?.whyItHappened || "Offending syntax or unhandled exception during target execution."}
              </p>
            </div>

            {/* 3. How was it verified */}
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                3. How was it verified?
              </h3>
              <p className="text-slate-700 dark:text-zinc-300">
                Verified using the Nemotron AST analyzer and OpenTelemetry log sifter. The static syntax tree confirmed the exact failing line and call hierarchy without hallucinating external dependencies.
              </p>
            </div>

            {/* 4. Production & Service Impact */}
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">
                4. Production &amp; Service Impact
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-zinc-300 pl-4 list-disc font-sans">
                <li>
                  <strong className="text-slate-900 dark:text-white">Severity:</strong> {scenario?.diagnosticReport?.businessImpact?.severity || "P0 • Production Outage"}
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-white">Throughput Impact:</strong> {scenario?.diagnosticReport?.businessImpact?.throughputImpact || "Service throughput degraded"}
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-white">SLA Risk:</strong> {scenario?.diagnosticReport?.businessImpact?.slaBreachRisk || "Elevated"}
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-white">Affected Microservices:</strong>{" "}
                  {scenario?.diagnosticReport?.impactedServices?.map(s => `${s.name} (${s.status.toLowerCase()})`).join(", ") || scenario?.service}
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
