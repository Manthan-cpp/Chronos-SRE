"use client";

import React from "react";
import { 
  Activity, 
  Cpu, 
  Flame, 
  Play, 
  RotateCcw, 
  ShieldCheck, 
  Sparkles,
  Zap
} from "lucide-react";
import { IncidentScenario, TokenMetrics } from "../types/incident";

interface TopCommandBarProps {
  scenarios: IncidentScenario[];
  activeScenario: IncidentScenario;
  onSelectScenario: (scenario: IncidentScenario) => void;
  isSimulating: boolean;
  isInvestigating: boolean;
  tokenMetrics: TokenMetrics;
  onTriggerSimulation: () => void;
  onTriggerInvestigation: () => void;
  onReset: () => void;
  systemStatus: "idle" | "crashing" | "investigating" | "verified";
}

export const TopCommandBar: React.FC<TopCommandBarProps> = ({
  scenarios,
  activeScenario,
  onSelectScenario,
  isSimulating,
  isInvestigating,
  tokenMetrics,
  onTriggerSimulation,
  onTriggerInvestigation,
  onReset,
  systemStatus
}) => {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-[#090D16]/95 backdrop-blur-md px-4 py-2.5 shadow-2xl">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Brand & System Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 shadow-lg shadow-purple-500/20">
              <Zap className="h-4 w-4 text-white" />
              <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 opacity-40 blur-sm animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold tracking-tight text-white">
                  CHRONOS<span className="text-purple-400">-SRE</span>
                </span>
                <span className="rounded bg-purple-950/80 border border-purple-500/30 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-purple-300">
                  NVIDIA × NEBIUS
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-mono hidden sm:block">
                Autonomous Incident Time-Travel & Deterministic Healing
              </p>
            </div>
          </div>

          <div className="h-5 w-px bg-gray-800 hidden sm:block" />

          {/* Operational Status Badge */}
          <div className="flex items-center gap-2">
            {systemStatus === "idle" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 text-xs font-mono text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                SYSTEM STANDBY
              </span>
            )}
            {systemStatus === "crashing" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-950/80 border border-red-500/40 px-2.5 py-1 text-xs font-mono text-red-400 animate-pulse">
                <Flame className="h-3 w-3 text-red-400" />
                ACTIVE CRASH REPRODUCED
              </span>
            )}
            {systemStatus === "investigating" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-950/80 border border-purple-500/40 px-2.5 py-1 text-xs font-mono text-purple-300 animate-pulse">
                <Activity className="h-3 w-3 text-purple-400 animate-spin" />
                SWARM FORENSICS RUNNING
              </span>
            )}
            {systemStatus === "verified" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/90 border border-emerald-400 px-2.5 py-1 text-xs font-mono font-bold text-emerald-300 shadow-lg shadow-emerald-500/20">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                100% REGRESSION PROOF VERIFIED
              </span>
            )}
          </div>
        </div>

        {/* Incident Selector Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#111827] border border-gray-700/80 rounded-lg px-2.5 py-1">
            <span className="text-[11px] font-mono text-gray-400">Incident:</span>
            <select
              value={activeScenario.id}
              onChange={(e) => {
                const found = scenarios.find(s => s.id === e.target.value);
                if (found) onSelectScenario(found);
              }}
              disabled={isInvestigating}
              className="bg-transparent text-xs font-mono font-semibold text-gray-200 outline-none cursor-pointer disabled:opacity-50"
            >
              {scenarios.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#111827] text-gray-200">
                  {s.code} — {s.title}
                </option>
              ))}
            </select>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
              activeScenario.severity === "CRITICAL" 
                ? "bg-red-950/80 text-red-400 border border-red-500/30" 
                : "bg-amber-950/80 text-amber-400 border border-amber-500/30"
            }`}>
              {activeScenario.severity}
            </span>
          </div>

          {/* Nebius Token Factory Live Meter */}
          <div className="hidden xl:flex items-center gap-2.5 bg-[#030712] border border-purple-500/20 rounded-lg px-3 py-1 shadow-inner">
            <Cpu className="h-4 w-4 text-purple-400" />
            <div className="text-left font-mono">
              <div className="text-[10px] text-gray-400 flex items-center gap-1.5">
                NEBIUS TOKEN FACTORY
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-purple-400 animate-ping" />
              </div>
              <div className="text-xs font-bold text-purple-300">
                {tokenMetrics.tokensPerSecond.toFixed(1)} <span className="text-[10px] font-normal text-gray-400">tok/s</span>
                <span className="text-gray-600 mx-1.5">|</span>
                <span className="text-gray-300">{tokenMetrics.totalTokens}</span> <span className="text-[10px] font-normal text-gray-400">tokens</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            <button
              onClick={onTriggerSimulation}
              disabled={isSimulating || isInvestigating}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-950/40 hover:bg-red-900/50 px-3 py-1.5 text-xs font-mono font-medium text-red-300 transition-all hover:border-red-400 active:scale-95 disabled:opacity-40"
              title="Simulates real production traffic load to trigger bug execution"
            >
              <Flame className="h-3.5 w-3.5 text-red-400" />
              <span>Simulate Crash</span>
            </button>

            <button
              onClick={onTriggerInvestigation}
              disabled={isInvestigating}
              className="relative group flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 px-3.5 py-1.5 text-xs font-mono font-semibold text-white shadow-lg shadow-purple-500/25 transition-all active:scale-95 disabled:opacity-40"
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-200 animate-spin" />
              <span>{isInvestigating ? "SRE Swarm Active..." : "Auto-Heal with Chronos"}</span>
            </button>

            <button
              onClick={onReset}
              disabled={isInvestigating}
              className="p-1.5 rounded-lg border border-gray-700 bg-gray-900 text-gray-400 hover:text-white hover:border-gray-500 transition-colors disabled:opacity-40"
              title="Reset War-Room State"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
