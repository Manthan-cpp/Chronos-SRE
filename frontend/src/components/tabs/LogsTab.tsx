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
      <div className="glass-panel rounded-2xl p-12 text-center border border-black/10 dark:border-white/10">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-black/[0.05] dark:bg-white/10 border border-black/10 dark:border-white/15 text-slate-500 dark:text-zinc-400 mb-3">
          <Terminal className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">No Telemetry Stream Ingested</h3>
        <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-md mx-auto mt-1 leading-relaxed">
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
      <div className="glass-panel rounded-2xl p-5 border border-black/10 dark:border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-black/[0.05] dark:bg-white/10 text-slate-700 dark:text-zinc-300 border border-black/10 dark:border-white/15">
              <Network className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase text-slate-500 dark:text-zinc-400">OpenTelemetry Root Span</div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white font-mono mt-0.5">
                {scenario?.sampleTrace?.endpoint || scenario?.failingFile || "Ingress / Root Target"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-500 dark:text-zinc-400">Trace ID: </span>
              <span className="text-slate-800 dark:text-zinc-200 font-medium">{scenario?.sampleTrace?.traceId || `dyn-${scenario?.code || scenario?.id || "telemetry"}`}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-zinc-400">Duration: </span>
              <span className="text-slate-800 dark:text-zinc-200 font-medium">{scenario?.sampleTrace?.durationMs ?? 120}ms</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-zinc-400">Status: </span>
              <span className="text-slate-900 dark:text-zinc-100 bg-slate-200 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 px-1.5 py-0.5 rounded font-semibold">
                {scenario?.sampleTrace?.httpStatus || "ERR"} Error
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Log Console Container */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-black/10 dark:border-white/10">
        {/* Controls Toolbar */}
        <div className="flex items-center justify-between border-b border-black/[0.08] dark:border-white/10 px-5 py-3 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-slate-600 dark:text-zinc-400" />
            <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
              Pytest Output &amp; Log Stream ({filteredLogs.length} events)
            </span>
            {isStreamingLogs && (
              <span className="text-[10px] font-mono font-medium text-slate-900 dark:text-zinc-100 bg-black/[0.06] dark:bg-white/10 border border-black/10 dark:border-white/15 px-2 py-0.5 rounded animate-pulse">
                Streaming from backend...
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-2 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                placeholder="Filter logs or trace..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-8 pr-3 py-1 text-xs font-mono rounded-lg border border-black/10 dark:border-white/15 bg-white/80 dark:bg-zinc-900/80 text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none focus:border-slate-800 dark:focus:border-zinc-300 w-48 sm:w-64"
              />
            </div>

            <button
              onClick={handleCopy}
              disabled={liveLogs.length === 0}
              className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-zinc-300 hover:text-black dark:hover:text-white px-2.5 py-1 rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-zinc-900 hover:border-black/20 dark:hover:border-white/25 transition-colors disabled:opacity-40 cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Live Logs Terminal Viewer */}
        <div className="p-4 font-mono text-xs max-h-[580px] overflow-y-auto leading-relaxed bg-[#0b0f19] border-t border-black/10 dark:border-white/10">
          {filteredLogs.length === 0 ? (
            <div className="text-slate-500 dark:text-zinc-500 py-12 text-center">
              {liveLogs.length === 0
                ? "No log telemetry ingested yet. Click 'Simulate Crash Telemetry' from the Overview tab."
                : "No logs matched the active filter."}
            </div>
          ) : (
            filteredLogs.map((log, i) => {
              const isError = log.includes("ERROR") || log.includes("FAILED") || log.includes("Exception") || log.includes("Error:") || log.includes("Crash");
              const isWarn = log.includes("WARN");
              const isSuccess = log.includes("PASSED") || log.includes("SUCCESS") || log.includes("OK") || log.includes("verified");

              return (
                <div
                  key={i}
                  className={`py-0.5 px-2 rounded-sm transition-colors font-mono select-text ${
                    isError
                      ? "text-zinc-100 bg-white/10 border-l-2 border-zinc-400 pl-2 font-medium"
                      : isWarn
                      ? "text-zinc-300 bg-white/5"
                      : isSuccess
                      ? "text-zinc-200"
                      : "text-zinc-400 hover:bg-white/5"
                  }`}
                >
                  <span className="text-zinc-600 select-none mr-3 text-[10px]">
                    {(i + 1).toString().padStart(3, "0")}
                  </span>
                  <span>{log}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
