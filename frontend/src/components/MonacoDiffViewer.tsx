"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { 
  Check, 
  ExternalLink, 
  FileCode, 
  GitBranch, 
  GitPullRequest, 
  Split 
} from "lucide-react";
import { PatchInfo } from "../types/incident";

// Dynamic import of Monaco Editor to avoid SSR hydration issues
const DiffEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.DiffEditor),
  { ssr: false, loading: () => <div className="p-4 text-xs font-mono text-zinc-500">Loading Monaco Code Diff Engine...</div> }
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
    <div className="flex-1 flex flex-col rounded-xl border border-black/10 dark:border-white/10 bg-[#0D121F] shadow-xl overflow-hidden">
      {/* Diff Header */}
      <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 bg-[#070B14] px-3.5 py-2">
        <div className="flex items-center gap-2">
          <FileCode className="h-4 w-4 text-zinc-300" />
          <span className="text-xs font-mono font-semibold text-zinc-200">
            SYNTAX-HIGHLIGHTED AST PATCH DIFF
          </span>
          {patch && (
            <span className="rounded bg-white/10 border border-white/15 px-1.5 py-0.5 text-[10px] font-mono text-zinc-200">
              {patch.filePath}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setInlineMode(!inlineMode)}
            className="flex items-center gap-1 rounded bg-white/10 px-2 py-1 text-xs font-mono text-zinc-300 hover:bg-white/15 transition-colors border border-white/10"
            title="Toggle Inline / Side-by-Side Diff"
          >
            <Split className="h-3 w-3" />
            <span>{inlineMode ? "Unified" : "Split"}</span>
          </button>
          
          <button
            onClick={onCreatePR}
            disabled={isCreatingPR || prCreated}
            className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-mono font-medium transition-all ${
              prCreated 
                ? "bg-zinc-800 text-zinc-200 border border-zinc-700 cursor-default" 
                : "bg-white text-zinc-950 hover:bg-zinc-200 shadow-sm disabled:opacity-40"
            }`}
          >
            {prCreated ? (
              <>
                <Check className="h-3 w-3" />
                <span>PR Open</span>
              </>
            ) : (
              <>
                <GitPullRequest className="h-3 w-3" />
                <span>{isCreatingPR ? "Opening PR..." : "Open PR"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Diff Metrics Bar */}
      {patch && (
        <div className="flex items-center justify-between bg-[#0B0F19] px-4 py-1.5 border-b border-white/10 text-xs font-mono text-zinc-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <GitBranch className="h-3 w-3 text-zinc-400" />
              <span>{patch.branchName}</span>
            </span>
            <span className="text-zinc-300 font-semibold">{patch.diffSummary}</span>
          </div>
          <span className="text-[11px] text-zinc-400">
            Automated AST verified by Nemotron critic
          </span>
        </div>
      )}

      {/* Dynamic Monaco Editor Engine */}
      <div className="h-72 w-full bg-[#050811] relative">
        {patch ? (
          <DiffEditor
            height="100%"
            language={
              patch.filePath.endsWith(".tsx") || patch.filePath.endsWith(".ts") 
                ? "typescript" 
                : patch.filePath.endsWith(".jsx") || patch.filePath.endsWith(".js") 
                ? "javascript" 
                : "python"
            }
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
              padding: { top: 8, bottom: 8 },
              automaticLayout: true
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs font-mono text-zinc-500">
            Awaiting autonomous patch synthesis from agent swarm...
          </div>
        )}
      </div>
    </div>
  );
};
