"use client";

import React, { useRef, useEffect } from "react";
import { 
  AlertTriangle, 
  Clock, 
  GitCommit, 
  Network, 
  Terminal as TerminalIcon,
  User
} from "lucide-react";
import { IncidentScenario } from "../types/incident";

interface IncidentIngressProps {
  scenario: IncidentScenario;
  liveLogs: string[];
  isStreamingLogs: boolean;
}

export const IncidentIngress: React.FC<IncidentIngressProps> = ({
  scenario,
  liveLogs,
  isStreamingLogs
}) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [liveLogs]);

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* 1. Live Incident Log Stream Panel */}
      <div className="flex-1 flex flex-col rounded-xl border border-gray-800 bg-[#0D121F] shadow-xl overflow-hidden">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-gray-800/80 bg-[#070B14] px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/80 inline-block" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80 inline-block" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <span className="text-[11px] font-mono font-medium text-gray-300 flex items-center gap-1.5 ml-2">
              <TerminalIcon className="h-3 w-3 text-purple-400" />
              raw_telemetry.log
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isStreamingLogs && (
              <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE INGRESS
              </span>
            )}
            <span className="text-[10px] font-mono text-gray-500">
              {liveLogs.length} events
            </span>
          </div>
        </div>

        {/* Monospace Log Viewer */}
        <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] leading-relaxed bg-[#030712] space-y-1">
          {liveLogs.map((log, index) => {
            const isFatal = log.includes("[FATAL]") || log.includes("[CRITICAL]") || log.includes("Error") || log.includes("SIGABRT");
            const isWarn = log.includes("[WARN]");
            const isInfo = log.includes("[INFO]");

            return (
              <div 
                key={index} 
                className={`py-0.5 px-1 rounded transition-colors ${
                  isFatal 
                    ? "bg-red-950/40 text-red-300 border-l-2 border-red-500 font-semibold" 
                    : isWarn 
                    ? "text-amber-300" 
                    : "text-gray-400"
                }`}
              >
                {log}
              </div>
            );
          })}
          <div ref={terminalEndRef} />
        </div>
      </div>

      {/* 2. OpenTelemetry Distributed Trace Card */}
      <div className="rounded-xl border border-gray-800 bg-[#0D121F] p-3 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-gray-300">
            <Network className="h-3.5 w-3.5 text-blue-400" />
            <span>OPENTELEMETRY SPAN</span>
          </div>
          <span className="rounded bg-red-950/80 border border-red-500/40 px-1.5 py-0.5 font-mono text-[10px] font-bold text-red-400">
            HTTP {scenario.sampleTrace.httpStatus} ERROR
          </span>
        </div>

        <div className="space-y-1.5 text-[11px] font-mono text-gray-400">
          <div className="flex justify-between border-b border-gray-800/60 pb-1">
            <span className="text-gray-500">Trace ID:</span>
            <span className="text-purple-300 font-bold">{scenario.sampleTrace.traceId}</span>
          </div>
          <div className="flex justify-between border-b border-gray-800/60 pb-1">
            <span className="text-gray-500">Target Endpoint:</span>
            <span className="text-gray-200">{scenario.sampleTrace.endpoint}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Execution Latency:</span>
            <span className="text-red-400 font-bold">{scenario.sampleTrace.durationMs}ms (BLOCKED)</span>
          </div>
        </div>
      </div>

      {/* 3. Correlated Git AST Commit Card */}
      <div className="rounded-xl border border-gray-800 bg-[#0D121F] p-3 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-gray-300">
            <GitCommit className="h-3.5 w-3.5 text-purple-400" />
            <span>SUSPECT COMMIT DIFF</span>
          </div>
          <span className="rounded bg-purple-950/80 border border-purple-500/40 px-1.5 py-0.5 font-mono text-[10px] text-purple-300 font-bold">
            #{scenario.sampleCommit.hash}
          </span>
        </div>

        <p className="text-xs font-mono text-gray-200 line-clamp-2 mb-2 bg-[#050811] p-2 rounded border border-gray-800">
          "{scenario.sampleCommit.message}"
        </p>

        <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3 text-gray-400" />
            <span>{scenario.sampleCommit.author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-gray-400" />
            <span>{scenario.sampleCommit.timestamp}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
