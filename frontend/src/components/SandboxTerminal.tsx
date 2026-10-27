"use client";

import React from "react";
import { 
  CheckCircle2, 
  Clock, 
  FlaskConical, 
  ShieldCheck, 
  Terminal as TerminalIcon, 
  XCircle 
} from "lucide-react";
import { SandboxExecution } from "../types/incident";

interface SandboxTerminalProps {
  execution: SandboxExecution;
}

export const SandboxTerminal: React.FC<SandboxTerminalProps> = ({ execution }) => {
  return (
    <div className="rounded-xl border border-gray-800 bg-[#0D121F] shadow-xl overflow-hidden mb-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800/80 bg-[#070B14] px-3.5 py-2">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-mono font-semibold text-gray-200">
            EPHEMERAL SANDBOX TEST RUNNER
          </span>
        </div>

        <div className="flex items-center gap-2">
          {execution.step === "reproducing" && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300 animate-pulse">
              EXECUTING REPRO TEST...
            </span>
          )}
          {execution.step === "reproduced_fail" && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/80 border border-red-500/40 text-red-300 font-bold">
              CONFIRMED FAIL (BUG REPRODUCED)
            </span>
          )}
          {execution.step === "verified_pass" && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-400 text-emerald-300 font-bold flex items-center gap-1 shadow-md shadow-emerald-500/20">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              REGRESSION PASS [100%]
            </span>
          )}
        </div>
      </div>

      {/* Terminal Viewport */}
      <div className="p-3 bg-[#030712] font-mono text-[11px] leading-relaxed space-y-2 max-h-48 overflow-y-auto">
        {execution.reproCommand && (
          <div className="text-gray-400 flex items-center gap-1.5 pb-1 border-b border-gray-800/60">
            <span className="text-emerald-400 font-bold">$</span>
            <span className="text-gray-200">{execution.reproCommand}</span>
          </div>
        )}

        {/* Initial Failing Output */}
        {execution.initialOutput && (
          <div className="p-2 rounded bg-red-950/20 border border-red-500/30 text-red-300 space-y-1">
            <div className="flex items-center gap-1 text-[10px] font-bold text-red-400">
              <XCircle className="h-3 w-3" />
              <span>ASSERTION FAILED (Unmodified Code):</span>
            </div>
            <pre className="whitespace-pre-wrap font-mono text-[10px]">
              {execution.initialOutput}
            </pre>
          </div>
        )}

        {/* Patched Passing Output */}
        {execution.patchedOutput && (
          <div className="p-2 rounded bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 space-y-1">
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              <span>TEST SUITE VERIFIED POST-PATCH:</span>
            </div>
            <pre className="whitespace-pre-wrap font-mono text-[10px]">
              {execution.patchedOutput}
            </pre>
          </div>
        )}

        {execution.step === "idle" && (
          <div className="text-gray-500 text-center py-4 text-[11px]">
            Sandbox idle. Isolated container ready for pytest verification.
          </div>
        )}
      </div>

      {/* Verification Guarantee Footer */}
      <div className="border-t border-gray-800/80 bg-[#070B14] px-3 py-1.5 flex items-center justify-between text-[10px] font-mono text-gray-400">
        <span className="flex items-center gap-1 text-emerald-400">
          <ShieldCheck className="h-3 w-3" />
          Deterministic Sandbox Enforcement
        </span>
        <span className="text-gray-500">Zero-Mock Pytest Engine</span>
      </div>
    </div>
  );
};
