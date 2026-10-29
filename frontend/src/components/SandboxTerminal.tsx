"use client";

import React from "react";
import { 
  CheckCircle2, 
  FlaskConical, 
  ShieldCheck, 
  XCircle 
} from "lucide-react";
import { SandboxExecution } from "../types/incident";

interface SandboxTerminalProps {
  execution: SandboxExecution;
}

export const SandboxTerminal: React.FC<SandboxTerminalProps> = ({ execution }) => {
  return (
    <div className="rounded-xl border border-black/10 dark:border-white/10 bg-[#0D121F] shadow-xl overflow-hidden mb-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 bg-[#070B14] px-3.5 py-2">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-zinc-300" />
          <span className="text-xs font-mono font-semibold text-zinc-200">
            EPHEMERAL SANDBOX TEST RUNNER
          </span>
        </div>

        <div className="flex items-center gap-2">
          {execution.step === "reproducing" && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 border border-white/15 text-zinc-300 animate-pulse">
              EXECUTING REPRO TEST...
            </span>
          )}
          {execution.step === "reproduced_fail" && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 border border-white/20 text-zinc-200 font-bold">
              CONFIRMED FAIL (BUG REPRODUCED)
            </span>
          )}
          {execution.step === "verified_pass" && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/15 border border-white/30 text-white font-bold flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-white" />
              REGRESSION PASS [100%]
            </span>
          )}
        </div>
      </div>

      {/* Terminal Viewport */}
      <div className="p-3 bg-[#030712] font-mono text-[11px] leading-relaxed space-y-2 max-h-48 overflow-y-auto">
        {execution.reproCommand && (
          <div className="text-zinc-400 flex items-center gap-1.5 pb-1 border-b border-white/10">
            <span className="text-zinc-200 font-bold">$</span>
            <span className="text-zinc-200">{execution.reproCommand}</span>
          </div>
        )}

        {/* Initial Failing Output */}
        {execution.initialOutput && (
          <div className="p-2 rounded bg-white/5 border border-white/10 text-zinc-300 space-y-1">
            <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-200">
              <XCircle className="h-3 w-3" />
              <span>ASSERTION FAILED (Unmodified Code):</span>
            </div>
            <pre className="whitespace-pre-wrap font-mono text-[10px] text-zinc-300">
              {execution.initialOutput}
            </pre>
          </div>
        )}

        {/* Patched Passing Output */}
        {execution.patchedOutput && (
          <div className="p-2 rounded bg-white/10 border border-white/15 text-zinc-100 space-y-1">
            <div className="flex items-center gap-1 text-[10px] font-bold text-white">
              <CheckCircle2 className="h-3 w-3" />
              <span>TEST SUITE VERIFIED POST-PATCH:</span>
            </div>
            <pre className="whitespace-pre-wrap font-mono text-[10px] text-zinc-100">
              {execution.patchedOutput}
            </pre>
          </div>
        )}

        {execution.step === "idle" && (
          <div className="text-zinc-500 text-center py-4 text-[11px]">
            Sandbox idle. Isolated container ready for pytest verification.
          </div>
        )}
      </div>

      {/* Verification Guarantee Footer */}
      <div className="border-t border-black/10 dark:border-white/10 bg-[#070B14] px-3 py-1.5 flex items-center justify-between text-[10px] font-mono text-zinc-400">
        <span className="flex items-center gap-1 text-zinc-300">
          <ShieldCheck className="h-3 w-3" />
          Deterministic Sandbox Enforcement
        </span>
        <span className="text-zinc-500">Zero-Mock Pytest Engine</span>
      </div>
    </div>
  );
};
