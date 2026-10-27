"use client";

import React, { useState } from "react";
import { AgentNode, TokenMetrics } from "../../types/incident";
import { CheckCircle2, Loader2, Sparkles, Copy, Check, Brain } from "lucide-react";

interface InvestigationTabProps {
  agents: AgentNode[];
  reasoningText: string;
  isInvestigating: boolean;
  tokenMetrics: TokenMetrics;
}

export const InvestigationTab: React.FC<InvestigationTabProps> = ({
  agents,
  reasoningText,
  isInvestigating,
  tokenMetrics
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(reasoningText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Investigation Pipeline Steps */}
      <div className="glass-panel rounded-2xl p-5">
        <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 mb-3">
          Autonomous Agent Execution Pipeline
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {agents.map((agent, i) => {
            const isRunning = agent.status === "running";
            const isDone = agent.status === "completed";

            return (
              <div
                key={agent.id}
                className={`glass-card rounded-xl p-3.5 transition-all ${
                  isRunning
                    ? "border-slate-800 bg-white shadow-sm ring-1 ring-slate-800/10 text-slate-900"
                    : isDone
                    ? "border-emerald-300 bg-emerald-50/50 text-slate-900"
                    : "border-black/5 bg-white/40 text-slate-400 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-semibold text-slate-500">
                    PHASE {i + 1}
                  </span>
                  {isRunning && <Loader2 className="h-3.5 w-3.5 text-slate-900 animate-spin" />}
                  {isDone && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                </div>
                <div className="text-xs font-semibold text-slate-900">{agent.label}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{agent.role}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reasoning Report Container */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-black/[0.08] px-5 py-3.5 bg-white/70 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-slate-700" />
            <span className="text-sm font-semibold text-slate-900">
              Nemotron-3.5-Bolt Forensic Analysis Log
            </span>
            {isInvestigating && (
              <span className="text-xs font-mono font-medium text-slate-800 bg-black/[0.06] border border-black/10 px-2 py-0.5 rounded animate-pulse">
                Analyzing in real-time...
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Live Token Metrics */}
            <div className="flex items-center gap-3 text-xs font-mono text-slate-600 border border-black/10 bg-white/80 px-3 py-1 rounded-lg">
              <Sparkles className="h-3.5 w-3.5 text-slate-700" />
              <span>
                Speed: <span className="text-slate-900 font-semibold">{tokenMetrics.tokensPerSecond.toFixed(1)} tok/s</span>
              </span>
              <span>•</span>
              <span>
                Tokens: <span className="text-slate-900 font-semibold">{tokenMetrics.totalTokens}</span>
              </span>
            </div>

            <button
              onClick={handleCopy}
              disabled={!reasoningText}
              className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-black px-2.5 py-1 rounded-lg border border-black/10 bg-white hover:border-black/20 transition-colors disabled:opacity-40 cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied" : "Copy Log"}</span>
            </button>
          </div>
        </div>

        {/* Streaming Text Output Area (Clean Dark Terminal) */}
        <div className="p-6 font-mono text-xs leading-relaxed max-h-[560px] overflow-y-auto whitespace-pre-wrap bg-[#0f172a] text-slate-200">
          {reasoningText ? (
            reasoningText
          ) : (
            <div className="py-16 text-center text-slate-400">
              No investigation initiated yet. Connect a repository, select an incident testbed, and click &quot;Run Investigation&quot; to launch the autonomous forensic swarm.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
