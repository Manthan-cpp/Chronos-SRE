"use client";

import React, { useState } from "react";
import { IncidentScenario } from "../../types/incident";
import { Search, Terminal, Network, Copy, Check } from "lucide-react";

interface LogsTabProps {
  scenario: IncidentScenario;
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
      <div className="rounded-xl border border-slate-800/80 bg-[#0c101a]/75 backdrop-blur-md p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-slate-900 text-slate-300 border border-slate-800">
              <Network className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">OpenTelemetry Root Span</div>
              <div className="text-sm font-semibold text-white font-mono">
                {scenario.sampleTrace.endpoint}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400">Trace ID: </span>
              <span className="text-slate-200 font-medium">{scenario.sampleTrace.traceId}</span>
            </div>
            <div>
              <span className="text-slate-400">Duration: </span>
              <span className="text-red-400 font-medium">{scenario.sampleTrace.durationMs}ms</span>
            </div>
            <div>
              <span className="text-slate-400">Status: </span>
              <span className="text-red-400 bg-red-950/60 border border-red-800/60 px-1.5 py-0.5 rounded font-semibold">
                {scenario.sampleTrace.httpStatus} Error
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Log Console Container */}
      <div className="rounded-xl border border-slate-800/80 bg-[#0c101a]/75 backdrop-blur-md overflow-hidden shadow-xs">
        {/* Controls Toolbar */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-2.5 bg-[#090c14]/80">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-200">
              Application Log Stream ({filteredLogs.length} events)
            </span>
            {isStreamingLogs && (
              <span className="text-[11px] font-medium text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/60">
                Streaming live...
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-2 text-slate-500" />
              <input
                type="text"
                placeholder="Filter logs..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="rounded border border-slate-700 bg-slate-900/80 pl-8 pr-2.5 py-1 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-slate-500"
              />
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-slate-300 hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Log Entries */}
        <div className="p-4 bg-[#05070d] font-mono text-xs leading-relaxed max-h-[500px] overflow-y-auto space-y-1">
          {filteredLogs.map((log, i) => {
            const isError = log.includes("[FATAL]") || log.includes("[CRITICAL]") || log.includes("Error") || log.includes("SIGABRT");
            const isWarn = log.includes("[WARN]");

            return (
              <div
                key={i}
                className={`py-0.5 px-2 rounded ${
                  isError
                    ? "bg-red-950/60 text-red-300 font-medium"
                    : isWarn
                    ? "text-amber-300"
                    : "text-slate-300"
                }`}
              >
                {log}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
