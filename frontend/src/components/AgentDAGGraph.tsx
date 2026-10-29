"use client";

import React from "react";
import { 
  ArrowRight, 
  BrainCircuit, 
  CheckCircle2, 
  Filter, 
  Globe, 
  Loader2, 
  Scale, 
  TestTube2 
} from "lucide-react";
import { AgentNode, AgentNodeId } from "../types/incident";

interface AgentDAGGraphProps {
  agents: AgentNode[];
  activeAgentId: AgentNodeId | null;
}

export const AgentDAGGraph: React.FC<AgentDAGGraphProps> = ({
  agents,
  activeAgentId
}) => {
  const getIcon = (id: AgentNodeId, status: string) => {
    if (status === "running") {
      return <Loader2 className="h-4 w-4 animate-spin text-zinc-100" />;
    }
    if (status === "completed") {
      return <CheckCircle2 className="h-4 w-4 text-zinc-100" />;
    }

    switch (id) {
      case "sifter":
        return <Filter className="h-4 w-4 text-zinc-300" />;
      case "tavily":
        return <Globe className="h-4 w-4 text-zinc-300" />;
      case "nemotron_hypothesis":
        return <BrainCircuit className="h-4 w-4 text-zinc-300" />;
      case "nemotron_critic":
        return <Scale className="h-4 w-4 text-zinc-300" />;
      case "sandbox":
        return <TestTube2 className="h-4 w-4 text-zinc-300" />;
      default:
        return <BrainCircuit className="h-4 w-4 text-zinc-400" />;
    }
  };

  return (
    <div className="rounded-xl border border-black/10 dark:border-white/10 bg-[#0D121F] p-3 shadow-lg">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-zinc-300 animate-pulse" />
          <span className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider">
            Autonomous Agent Forensic DAG
          </span>
        </div>
        <span className="text-[10px] font-mono text-zinc-400">
          NVIDIA Nemotron + Tavily + Sandbox
        </span>
      </div>

      {/* DAG Node Sequence */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 items-center">
        {agents.map((agent) => {
          const isActive = agent.status === "running";
          const isDone = agent.status === "completed";

          return (
            <React.Fragment key={agent.id}>
              <div
                className={`flex flex-col p-2 rounded-lg border transition-all ${
                  isActive
                    ? "border-zinc-300 bg-white/10 shadow-md ring-1 ring-white/20"
                    : isDone
                    ? "border-zinc-600 bg-white/5"
                    : "border-zinc-800 bg-[#070B14] opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  {getIcon(agent.id, agent.status)}
                  {agent.badge && (
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-white/10 text-zinc-200 font-bold border border-white/15">
                      {agent.badge}
                    </span>
                  )}
                </div>

                <div className="font-mono text-xs font-semibold text-zinc-100 truncate">
                  {agent.label}
                </div>
                <div className="text-[10px] text-zinc-400 truncate font-mono">
                  {agent.role}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
