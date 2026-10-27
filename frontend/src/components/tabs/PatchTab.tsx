"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { PatchInfo, SandboxExecution } from "../../types/incident";
import { Check, CheckCircle2, FileCode, GitBranch, GitPullRequest, Loader2, ShieldCheck, XCircle } from "lucide-react";

const DiffEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.DiffEditor),
  { ssr: false, loading: () => <div className="p-8 text-center text-xs text-slate-500">Loading Code Diff Engine...</div> }
);

interface PatchTabProps {
  patch: PatchInfo | null;
  sandbox: SandboxExecution;
  onCreatePR: () => void;
  isCreatingPR: boolean;
  prCreated: boolean;
}

export const PatchTab: React.FC<PatchTabProps> = ({
  patch,
  sandbox,
  onCreatePR,
  isCreatingPR,
  prCreated
}) => {
  const [inlineMode, setInlineMode] = useState(false);

  return (
    <div className="space-y-6">
      {/* Sandbox Test Verification Status */}
      <div className="rounded-xl border border-slate-800/80 bg-[#0c101a]/75 backdrop-blur-md p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-400" />
            <h2 className="text-sm font-semibold text-white">
              Deterministic Sandbox Verification
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {sandbox.step === "reproduced_fail" && (
              <span className="text-xs px-2.5 py-1 rounded bg-red-950/70 text-red-400 border border-red-800/60 font-medium flex items-center gap-1">
                <XCircle className="h-3.5 w-3.5 text-red-400" />
                Reproduction Test Failed (Bug Verified)
              </span>
            )}
            {sandbox.step === "verified_pass" && (
              <span className="text-xs px-2.5 py-1 rounded bg-green-950/70 text-green-400 border border-green-800/60 font-medium flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                Regression Suite Passed (100% Green)
              </span>
            )}
            {sandbox.step === "idle" && (
              <span className="text-xs px-2.5 py-1 rounded bg-slate-900 text-slate-400 border border-slate-800">
                Sandbox Standby
              </span>
            )}
          </div>
        </div>

        {/* Pytest Output Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Before: Failing Test */}
          <div className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-3">
            <div className="text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span>Before Patch (Reproduction Run)</span>
              <span className="text-red-400 font-mono text-[11px]">EXIT 1</span>
            </div>
            <pre className="text-[11px] font-mono text-slate-200 bg-[#05070d] border border-slate-800 rounded p-2.5 overflow-x-auto leading-relaxed">
              {sandbox.initialOutput || "# Awaiting crash reproduction run..."}
            </pre>
          </div>

          {/* After: Passing Test */}
          <div className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-3">
            <div className="text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span>After Patch (Regression Verification)</span>
              <span className="text-green-400 font-mono text-[11px]">EXIT 0</span>
            </div>
            <pre className="text-[11px] font-mono text-slate-200 bg-[#05070d] border border-slate-800 rounded p-2.5 overflow-x-auto leading-relaxed">
              {sandbox.patchedOutput || "# Awaiting patch test verification..."}
            </pre>
          </div>
        </div>
      </div>

      {/* Code Diff Editor Container */}
      <div className="rounded-xl border border-slate-800/80 bg-[#0c101a]/75 backdrop-blur-md shadow-xs overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-3 bg-[#090c14]/80">
          <div className="flex items-center gap-2">
            <FileCode className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-semibold text-white">
              Code Patch Diff
            </span>
            {patch && (
              <span className="text-xs font-mono text-slate-300 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                {patch.filePath}
              </span>
            )}
          </div>

          {patch && (
            <button
              onClick={() => setInlineMode(!inlineMode)}
              className="text-xs font-medium text-slate-300 hover:text-white px-2.5 py-1 rounded border border-slate-700 bg-slate-900/80 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {inlineMode ? "Split View" : "Inline View"}
            </button>
          )}
        </div>

        <div className="h-[360px] bg-[#05070d]">
          {patch ? (
            <DiffEditor
              original={patch.originalCode}
              modified={patch.patchedCode}
              language="python"
              theme="vs-dark"
              height="100%"
              options={{
                readOnly: true,
                renderSideBySide: !inlineMode,
                minimap: { enabled: false },
                fontSize: 12,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                lineNumbers: "on",
                automaticLayout: true,
                scrollBeyondLastLine: false
              }}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
              <FileCode className="h-8 w-8 text-slate-700 mb-2" />
              <div className="text-sm font-medium text-slate-300">No patch generated yet</div>
              <p className="text-xs text-slate-500 mt-1">
                The synthesized unified diff will appear here after the AI swarm verifies the root cause.
              </p>
            </div>
          )}
        </div>

        {/* PR Action Footer */}
        <div className="border-t border-slate-800/80 px-5 py-3.5 bg-[#090c14]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <GitBranch className="h-4 w-4 text-slate-500" />
            <span>Target Branch: <strong className="text-slate-200">{patch ? patch.branchName : "chronos/fix-patch"}</strong></span>
          </div>

          <button
            onClick={onCreatePR}
            disabled={!patch || isCreatingPR || prCreated}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              prCreated
                ? "bg-green-600 text-white cursor-default"
                : patch
                ? "bg-blue-600 hover:bg-blue-500 text-white"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            {prCreated ? (
              <>
                <Check className="h-4 w-4" />
                <span>Pull Request Created (#42)</span>
              </>
            ) : isCreatingPR ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Submitting to GitHub...</span>
              </>
            ) : (
              <>
                <GitPullRequest className="h-4 w-4" />
                <span>Submit Verified GitHub PR</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
