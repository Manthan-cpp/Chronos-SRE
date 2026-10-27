"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { 
  Check, 
  ExternalLink, 
  FileCode, 
  GitBranch, 
  GitPullRequest, 
  Sparkles,
  Split 
} from "lucide-react";
import { PatchInfo } from "../types/incident";

// Dynamic import of Monaco Editor to avoid SSR hydration issues
const DiffEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.DiffEditor),
  { ssr: false, loading: () => <div className="p-4 text-xs font-mono text-gray-500">Loading Monaco Code Diff Engine...</div> }
);

interface MonacoDiffViewerProps {
  patch: PatchInfo | null;
  onCreatePR: () => void;
  isCreatingPR: boolean;
  prCreated: boolean;
}

export const MonacoDiffViewer: React.FC<MonacoDiffViewerProps> = ({
  patch,
  onCreatePR,
  isCreatingPR,
  prCreated
}) => {
  const [inlineMode, setInlineMode] = useState(false);

  return (
    <div className="flex-1 flex flex-col rounded-xl border border-gray-800 bg-[#0D121F] shadow-xl overflow-hidden">
      {/* Diff Header */}
      <div className="flex items-center justify-between border-b border-gray-800/80 bg-[#070B14] px-3.5 py-2">
        <div className="flex items-center gap-2">
          <FileCode className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-mono font-semibold text-gray-200">
            SYNTAX-HIGHLIGHTED AST PATCH DIFF
          </span>
          {patch && (
            <span className="rounded bg-blue-950/80 border border-blue-500/40 px-1.5 py-0.5 text-[10px] font-mono text-blue-300">
              {patch.filePath}
            </span>
          )}
        </div>

        {patch && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setInlineMode(!inlineMode)}
              className="flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded bg-[#111827] border border-gray-700 text-gray-300 hover:text-white transition-colors"
            >
              <Split className="h-3 w-3" />
              <span>{inlineMode ? "Split View" : "Inline View"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Editor Container */}
      <div className="flex-1 min-h-[220px] bg-[#030712] relative overflow-hidden">
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
              fontSize: 11,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              lineNumbers: "on",
              wordWrap: "on"
            }}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 p-6">
            <FileCode className="h-8 w-8 text-gray-600 mb-2" />
            <p className="font-mono text-xs">No Patch Synthesized Yet</p>
            <p className="text-[11px] text-gray-600 max-w-xs mt-1">
              Once Nemotron verifies the root cause and the sandbox passes, the unified code diff will appear here.
            </p>
          </div>
        )}
      </div>

      {/* Action Footer: Pull Request Dispatch */}
      <div className="border-t border-gray-800/80 bg-[#070B14] p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
          <GitBranch className="h-3.5 w-3.5 text-purple-400" />
          <span>Target: <strong className="text-gray-200">{patch ? patch.branchName : "chronos/fix-patch"}</strong></span>
        </div>

        <button
          onClick={onCreatePR}
          disabled={!patch || isCreatingPR || prCreated}
          className={`flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shadow-lg ${
            prCreated
              ? "bg-emerald-600 text-white cursor-default"
              : patch
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/20 active:scale-95"
              : "bg-gray-800 text-gray-500 cursor-not-allowed"
          }`}
        >
          {prCreated ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Pull Request Created (#42)</span>
            </>
          ) : isCreatingPR ? (
            <>
              <Sparkles className="h-3.5 w-3.5 animate-spin" />
              <span>Emitting to GitHub...</span>
            </>
          ) : (
            <>
              <GitPullRequest className="h-3.5 w-3.5" />
              <span>Submit Verified GitHub PR</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
