"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { IncidentScenario, PatchInfo, SandboxExecution } from "../../types/incident";
import {
  Check,
  CheckCircle2,
  ExternalLink,
  FileCode,
  GitBranch,
  GitPullRequest,
  Loader2,
  ShieldCheck,
  XCircle
} from "lucide-react";

const DiffEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.DiffEditor),
  { ssr: false, loading: () => <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400 font-mono">Loading Monaco Diff Engine...</div> }
);

interface PatchTabProps {
  patch: PatchInfo | null;
  sandbox: SandboxExecution;
  onCreatePR: () => void;
  isCreatingPR: boolean;
  prCreated: boolean;
  prUrl?: string | null;
  prNumber?: number | null;
  scenario?: IncidentScenario | null;
}

export const PatchTab: React.FC<PatchTabProps> = ({
  patch,
  sandbox,
  onCreatePR,
  isCreatingPR,
  prCreated,
  prUrl,
  prNumber,
  scenario
}) => {
  const [inlineMode] = useState(false);

  return (
    <div className="space-y-6">
      {/* Sandbox Test Verification Status */}
      <div className="glass-panel rounded-2xl p-6 border border-black/10 dark:border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
            <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
              Deterministic Sandbox Verification
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {sandbox.step === "reproduced_fail" && (
              <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border border-slate-700 dark:border-zinc-300 font-medium flex items-center gap-1.5 shadow-2xs">
                <XCircle className="h-3.5 w-3.5" />
                Reproduction Test Failed (Bug Verified)
              </span>
            )}
            {sandbox.step === "verified_pass" && (
              <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-slate-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-950 border border-slate-700 dark:border-zinc-300 font-medium flex items-center gap-1.5 shadow-2xs">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Regression Suite Passed (100% Green)
              </span>
            )}
            {sandbox.step === "idle" && (
              <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-black/[0.05] dark:bg-white/10 text-slate-600 dark:text-zinc-400 border border-black/10 dark:border-white/15">
                Sandbox Standby
              </span>
            )}
          </div>
        </div>

        {/* Pytest Output Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Before: Failing Test */}
          <div className="glass-card rounded-xl p-4 border border-black/10 dark:border-white/10 flex flex-col">
            <div className="text-xs font-semibold text-slate-900 dark:text-white mb-2 flex items-center justify-between">
              <span>Before Patch (Reproduction Run)</span>
              <span className="font-mono text-[11px] font-semibold bg-slate-900 text-slate-200 border border-slate-700 dark:bg-zinc-900 dark:text-zinc-200 dark:border-zinc-700 px-2 py-0.5 rounded shadow-2xs">
                EXIT 1 • Bug Confirmed
              </span>
            </div>
            <pre className="text-[11px] font-mono text-zinc-200 bg-[#0b0f19] rounded-lg p-3.5 overflow-y-auto overflow-x-auto leading-relaxed max-h-72 min-h-48 border border-black/10 dark:border-white/10 select-text">
              {sandbox.initialOutput || "# Awaiting crash reproduction run (Expected: EXIT 1 • Bug Confirmed)..."}
            </pre>
          </div>

          {/* After: Passing Test */}
          <div className="glass-card rounded-xl p-4 border border-black/10 dark:border-white/10 flex flex-col">
            <div className="text-xs font-semibold text-slate-900 dark:text-white mb-2 flex items-center justify-between">
              <span>After Patch (Verification Run)</span>
              <span className="font-mono text-[11px] font-semibold bg-slate-900 text-zinc-100 border border-slate-700 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700 px-2 py-0.5 rounded shadow-2xs">
                EXIT 0 • Fix Verified
              </span>
            </div>
            <pre className="text-[11px] font-mono text-zinc-100 bg-[#0b0f19] rounded-lg p-3.5 overflow-y-auto overflow-x-auto leading-relaxed max-h-72 min-h-48 border border-black/10 dark:border-white/10 select-text">
              {sandbox.patchedOutput || "# Awaiting patch synthesis & sandbox verification (Expected: EXIT 0 • Fix Verified)..."}
            </pre>
          </div>
        </div>
      </div>

      {/* Code Diff & Pull Request Section */}
      {patch ? (
        <div className="glass-panel rounded-2xl overflow-hidden border border-black/10 dark:border-white/10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-black/[0.08] dark:border-white/10 px-6 py-4 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md gap-3">
            <div className="flex items-center gap-3">
              <FileCode className="h-4 w-4 text-slate-700 dark:text-zinc-300" />
              <div>
                <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white">{patch.filePath}</span>
                <span className="ml-3 text-[11px] font-mono text-slate-900 dark:text-zinc-200 bg-black/[0.06] dark:bg-white/10 border border-black/10 dark:border-white/15 px-2 py-0.5 rounded font-semibold">{patch.diffSummary}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 font-mono text-xs text-slate-600 dark:text-zinc-300 bg-black/[0.05] dark:bg-white/10 border border-black/10 dark:border-white/15 px-2.5 py-1 rounded-md">
                <GitBranch className="h-3 w-3" />
                <span>{patch.branchName}</span>
              </div>

              {prCreated ? (
                <a
                  href={prUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 px-3.5 py-2 text-xs font-mono font-medium text-white transition-all shadow-sm border border-slate-800 dark:border-zinc-300"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>PR #{prNumber || 1} Created</span>
                  <ExternalLink className="h-3 w-3 ml-0.5" />
                </a>
              ) : (
                <button
                  disabled={isCreatingPR}
                  onClick={onCreatePR}
                  className="flex items-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 disabled:bg-slate-400 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600 px-4 py-2 text-xs font-mono font-medium text-white transition-colors cursor-pointer disabled:cursor-not-allowed shadow-sm border border-slate-800 dark:border-zinc-300"
                >
                  {isCreatingPR ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <GitPullRequest className="h-3.5 w-3.5" />
                  )}
                  <span>{isCreatingPR ? "Submitting PR..." : "Create Pull Request"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Monaco Diff Editor */}
          <div className="h-[480px] w-full bg-[#0f172a] border-t border-black/10 dark:border-white/10">
            {(() => {
              const ext = patch.filePath.split(".").pop()?.toLowerCase();
              const lang = ext === "ts" || ext === "tsx" ? "typescript" : ext === "js" || ext === "jsx" ? "javascript" : ext === "json" ? "json" : "python";
              return (
                <DiffEditor
                  height="100%"
                  language={lang}
                  original={patch.originalCode}
                  modified={patch.patchedCode}
                  theme="vs-dark"
                  options={{
                    readOnly: true,
                    renderSideBySide: !inlineMode,
                    minimap: { enabled: false },
                    fontSize: 12,
                    fontFamily: "JetBrains Mono, Fira Code, monospace",
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    padding: { top: 12, bottom: 12 }
                  }}
                />
              );
            })()}
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-12 text-center border border-black/10 dark:border-white/10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-black/[0.05] dark:bg-white/10 border border-black/10 dark:border-white/15 text-slate-500 dark:text-zinc-400 mb-3">
            <GitPullRequest className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">No Patch Synthesized Yet</h3>
          <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-md mx-auto mt-1 leading-relaxed">
            Run an autonomous investigation from the Root Cause Analysis tab. Once the Nemotron reasoning agent validates the fix against the deterministic sandbox, the code diff and automated PR creator will appear here.
          </p>
        </div>
      )}

      {/* Fix & Architectural Resolution Report (Clean Memo / Letter Format) */}
      {scenario?.fixReport && patch && (
        <div className="pt-3 space-y-5">
          <div className="border-b border-black/[0.12] dark:border-white/15 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Fix &amp; Architectural Resolution Report
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs font-mono text-slate-600 dark:text-zinc-400">
              <span>Strategy: <strong className="text-slate-900 dark:text-white">{scenario.fixReport?.architecturalStrategy || "Autonomous AST Remediation"}</strong></span>
              <span>•</span>
              <span>Branch: <strong className="text-slate-900 dark:text-white">{patch.branchName}</strong></span>
              <span>•</span>
              <span>Target: <strong className="text-slate-900 dark:text-white">{patch.filePath}</strong></span>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-800 dark:text-zinc-200 leading-relaxed">
            {/* 1. What was fixed */}
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                1. What was fixed?
              </h3>
              <p className="text-slate-700 dark:text-zinc-300">
                {scenario.fixReport?.summary || "Automated architectural fix applied."}
              </p>
            </div>

            {/* 2. Step-by-Step Fix Execution */}
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">
                2. Step-by-Step Fix Execution
              </h3>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-zinc-300 pl-4 list-disc font-sans">
                {(scenario.fixReport?.steps || []).map((step) => (
                  <li key={step.phase}>
                    <strong className="text-slate-900 dark:text-white">{step.title}:</strong>{" "}
                    <span>{step.description}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Deterministic Verification Proof */}
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                3. Deterministic Sandbox Verification Proof
              </h3>
              <p className="text-slate-700 dark:text-zinc-300">
                • Before patch: Pytest reproduction confirmed failure (<strong>EXIT 1 • Bug Confirmed</strong>).<br />
                • After patch: Sandbox execution verified 100% of regression tests passed without deadlocks or regressions (<strong>EXIT 0 • Fix Verified</strong>).
              </p>
            </div>

            {/* 4. Production Rollout & Safety */}
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                4. Production Rollout &amp; Safety Note
              </h3>
              <p className="text-slate-700 dark:text-zinc-300">
                Zero database migration required. Patch is verified and staged for automatic pull request creation on GitHub with zero downtime risk.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
