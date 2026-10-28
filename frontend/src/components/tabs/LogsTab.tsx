"use client";

import React, { useState } from "react";
import { IncidentScenario } from "../../types/incident";
import { Search, Terminal, Network, Copy, Check } from "lucide-react";

interface LogsTabProps {
  scenario: IncidentScenario | null;
  liveLogs: string[];
  isStreamingLogs: boolean;
}

export const LogsTab: React.FC<LogsTabProps> = ({
  scenario,
  liveLogs,
  isStreamingLogs
}) => {
  const [filter, setFilter] = useState("");
  const [copied, setCopied] = useState(false);

  if (!scenario) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-black/[0.05] border border-black/10 text-slate-500 mb-3">
          <Terminal className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">No Telemetry Stream Ingested</h3>
        <p className="text-xs text-slate-600 max-w-md mx-auto mt-1 leading-relaxed">
          Chronos-SRE has not ingested any incident crash logs yet. Connect a target repository and select a testbed to run live pytest execution.
        </p>
      </div>
    );
  }

  const filteredLogs = liveLogs.filter((l) =>
    l.toLowerCase().includes(filter.toLowerCase())
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(liveLogs.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Trace Info Bar */}
      <div className="glass-panel rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-black/[0.05] text-slate-700 border border-black/10">
              <Network className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase text-slate-500">OpenTelemetry Root Span</div>
              <div className="text-sm font-semibold text-slate-900 font-mono mt-0.5">
                {scenario?.sampleTrace?.endpoint || scenario?.failingFile || "Ingress / Root Target"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-500">Trace ID: </span>
              <span className="text-slate-800 font-medium">{scenario?.sampleTrace?.traceId || `dyn-${scenario?.code || scenario?.id || "telemetry"}`}</span>
            </div>
            <div>
              <span className="text-slate-500">Duration: </span>
              <span className="text-slate-800 font-medium">{scenario?.sampleTrace?.durationMs ?? 120}ms</span>
            </div>
            <div>
              <span className="text-slate-500">Status: </span>
              <span className="text-red-700 bg-red-100 border border-red-200 px-1.5 py-0.5 rounded font-semibold">
                {scenario?.sampleTrace?.httpStatus || "ERR"} Error
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Log Console Container */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        {/* Controls Toolbar */}
        <div className="flex items-center justify-between border-b border-black/[0.08] px-5 py-3 bg-white/70 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-slate-600" />
            <span className="text-xs font-semibold text-slate-800">
              Pytest Output & Log Stream ({filteredLogs.length} events)
            </span>
            {isStreamingLogs && (
              <span className="text-[10px] font-mono font-medium text-slate-900 bg-black/[0.06] border border-black/10 px-2 py-0.5 rounded animate-pulse">
                Streaming from backend...
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter logs..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-48 rounded-lg border border-black/10 bg-white/90 pl-8 pr-3 py-1 text-xs font-mono text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-800"
              />
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-2.5 py-1 text-xs text-slate-700 hover:text-black hover:border-black/20 transition-colors cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Monospaced Log Stream Terminal */}
        <div className="p-5 font-mono text-xs leading-relaxed max-h-[520px] overflow-y-auto space-y-1 bg-[#0f172a] text-slate-200">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              No log events captured yet. Click &quot;Simulate Crash via Pytest&quot; on the Overview tab to stream live output.
            </div>
          ) : (
            filteredLogs.map((log, idx) => {
              const isError = log.includes("[ERROR]") || log.includes("[FATAL]") || log.includes("[CRITICAL]") || log.includes("FAILED");
              const isWarn = log.includes("[WARN]");
              const isInfo = log.includes("[INFO]");

              return (
                <div
                  key={idx}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    isError
                      ? "text-red-300 bg-red-950/30"
                      : isWarn
                      ? "text-amber-300 bg-amber-950/20"
                      : isInfo
                      ? "text-blue-300"
                      : "text-slate-300"
                  }`}
                >
                  {log}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
