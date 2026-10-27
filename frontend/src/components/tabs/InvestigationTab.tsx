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
      <div className="rounded-xl border border-slate-800/80 bg-[#0c101a]/75 backdrop-blur-md p-5 shadow-xs">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Autonomous Agent Execution Pipeline
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {agents.map((agent, i) => {
            const isRunning = agent.status === "running";
            const isDone = agent.status === "completed";

            return (
              <div
                key={agent.id}
                className={`p-3 rounded-lg border transition-all ${
                  isRunning
                    ? "border-blue-500 bg-blue-950/40 text-blue-200"
                    : isDone
                    ? "border-slate-800 bg-slate-900/60"
                    : "border-slate-800/60 bg-[#07090e]/60 opacity-50"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-400">
                    Phase {i + 1}
                  </span>
                  {isRunning && <Loader2 className="h-3.5 w-3.5 text-blue-400 animate-spin" />}
                  {isDone && <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />}
                </div>
                <div className="text-xs font-semibold text-white">{agent.label}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{agent.role}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reasoning Report Container */}
      <div className="rounded-xl border border-slate-800/80 bg-[#0c101a]/75 backdrop-blur-md shadow-xs overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-3 bg-[#090c14]/80">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-semibold text-white">
              Nemotron-70B Forensic Analysis Log
            </span>
            {isInvestigating && (
              <span className="text-xs font-medium text-blue-300 bg-blue-950/60 border border-blue-800/60 px-2 py-0.5 rounded">
                Analyzing in real-time...
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-xs text-slate-400 font-mono">
              Speed: <span className="text-slate-200 font-semibold">{tokenMetrics.tokensPerSecond.toFixed(1)} tok/s</span>
              <span className="mx-2 text-slate-700">|</span>
              Tokens: <span className="text-slate-200 font-semibold">{tokenMetrics.totalTokens}</span>
            </div>
            <button
              onClick={handleCopy}
              disabled={!reasoningText}
              className="flex items-center gap-1 text-xs text-slate-300 hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition-colors disabled:opacity-40 cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied" : "Copy Log"}</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {reasoningText ? (
            <div className="space-y-4">
              {reasoningText.split("\n\n").map((section, idx) => {
                if (section.startsWith("###")) {
                  return (
                    <h3 key={idx} className="text-sm font-semibold text-white pt-2 border-t border-slate-800 first:border-0 first:pt-0">
                      {section.replace("###", "").trim()}
                    </h3>
                  );
                }
                if (section.includes("ROOT CAUSE VERIFIED")) {
                  return (
                    <div key={idx} className="p-4 rounded-md bg-green-950/40 border border-green-800/60 text-green-300 text-xs leading-relaxed font-mono">
                      {section}
                    </div>
                  );
                }
                if (section.includes("CRITIC EVALUATION")) {
                  return (
                    <div key={idx} className="p-3.5 rounded-md bg-slate-900/60 border border-slate-800 text-slate-300 text-xs leading-relaxed font-mono">
                      {section}
                    </div>
                  );
                }
                return (
                  <p key={idx} className="text-xs leading-relaxed text-slate-300 font-mono">
                    {section}
                  </p>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-950/60 border border-blue-800/60 text-blue-400 mb-3">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-white">Autonomous Investigation Engine Ready</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                Click &quot;Run Investigation&quot; in the header or button below to watch the 5-phase AI Swarm triage logs, query Tavily, and generate a verified code patch.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl mx-auto mt-6 text-left">
                <div className="p-3 rounded-lg border border-slate-800 bg-[#07090e] text-xs">
                  <div className="font-semibold text-white">1. Log Sifter</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Filters 50,000+ log lines down to fatal exception frames.</div>
                </div>
                <div className="p-3 rounded-lg border border-slate-800 bg-[#07090e] text-xs">
                  <div className="font-semibold text-white">2. Errata Grounding</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Live web search queries GitHub issues & changelogs.</div>
                </div>
                <div className="p-3 rounded-lg border border-slate-800 bg-[#07090e] text-xs">
                  <div className="font-semibold text-white">3. Pytest Sandbox</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Proves test failure before patch, and 100% pass after patch.</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
