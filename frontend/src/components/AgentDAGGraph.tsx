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
      return <Loader2 className="h-4 w-4 animate-spin text-purple-400" />;
    }
    if (status === "completed") {
      return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    }

    switch (id) {
      case "sifter":
        return <Filter className="h-4 w-4 text-blue-400" />;
      case "tavily":
        return <Globe className="h-4 w-4 text-cyan-400" />;
      case "nemotron_hypothesis":
        return <BrainCircuit className="h-4 w-4 text-purple-400" />;
      case "nemotron_critic":
        return <Scale className="h-4 w-4 text-amber-400" />;
      case "sandbox":
        return <TestTube2 className="h-4 w-4 text-emerald-400" />;
      default:
        return <BrainCircuit className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="rounded-xl border border-gray-800 bg-[#0D121F] p-3 shadow-lg">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-xs font-mono font-bold text-gray-200 uppercase tracking-wider">
            Autonomous Agent Forensic DAG
          </span>
        </div>
        <span className="text-[10px] font-mono text-gray-400">
          NVIDIA Nemotron-70B + Tavily + Sandbox
        </span>
      </div>

      {/* DAG Node Sequence */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 items-center">
        {agents.map((agent, index) => {
          const isActive = agent.status === "running";
          const isDone = agent.status === "completed";

          return (
            <React.Fragment key={agent.id}>
              <div
                className={`flex flex-col p-2 rounded-lg border transition-all ${
                  isActive
                    ? "border-purple-500 bg-purple-950/30 shadow-md shadow-purple-500/20 scale-102"
                    : isDone
                    ? "border-emerald-500/40 bg-emerald-950/20"
                    : "border-gray-800 bg-[#070B14] opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  {getIcon(agent.id, agent.status)}
                  {agent.badge && (
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-purple-900/60 text-purple-300 font-bold border border-purple-500/30">
                      {agent.badge}
                    </span>
                  )}
                </div>

                <div className="font-mono text-xs font-semibold text-gray-100 truncate">
                  {agent.label}
                </div>
                <div className="text-[10px] text-gray-400 truncate font-mono">
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
