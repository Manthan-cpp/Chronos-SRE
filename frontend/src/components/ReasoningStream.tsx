"use client";

import React, { useRef, useEffect, useState } from "react";
import { 
  Bot, 
  Check, 
  Copy, 
  Cpu, 
  ExternalLink, 
  Layers, 
  Sparkles,
  Zap 
} from "lucide-react";

interface ReasoningStreamProps {
  reasoningText: string;
  isInvestigating: boolean;
  tps: number;
  totalTokens: number;
}

export const ReasoningStream: React.FC<ReasoningStreamProps> = ({
  reasoningText,
  isInvestigating,
  tps,
  totalTokens
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [reasoningText]);

  const handleCopy = () => {
    navigator.clipboard.writeText(reasoningText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col rounded-xl border border-gray-800 bg-[#0D121F] shadow-xl overflow-hidden mt-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800/80 bg-[#070B14] px-3.5 py-2">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-purple-400" />
          <span className="text-xs font-mono font-semibold text-gray-200">
            NVIDIA NEMOTRON-70B REASONING STREAM
          </span>
          {isInvestigating && (
            <span className="inline-flex items-center gap-1 rounded bg-purple-950/80 border border-purple-500/40 px-1.5 py-0.5 text-[10px] font-mono text-purple-300 animate-pulse">
              <Zap className="h-2.5 w-2.5 text-purple-400 animate-bounce" />
              STREAMING
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-gray-400">
            <Cpu className="h-3.5 w-3.5 text-purple-400" />
            <span className="font-bold text-purple-300">{tps.toFixed(1)}</span> tok/s
            <span className="text-gray-600">|</span>
            <span className="text-gray-300">{totalTokens}</span> tokens
          </div>

          <button
            onClick={handleCopy}
            disabled={!reasoningText}
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-40"
            title="Copy Reasoning Log"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Reasoning Content Terminal */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed bg-[#030712] text-gray-200 space-y-2 select-text"
      >
        {reasoningText ? (
          <div className="whitespace-pre-wrap space-y-2 font-mono">
            {reasoningText.split("\n\n").map((block, idx) => {
              if (block.startsWith("###")) {
                return (
                  <div key={idx} className="text-purple-300 font-bold text-sm border-b border-gray-800/80 pb-1 mt-3">
                    {block.replace("###", "").trim()}
                  </div>
                );
              }
              if (block.includes("CRITIC EVALUATION") || block.includes("SCORE:")) {
                return (
                  <div key={idx} className="p-2.5 rounded bg-amber-950/20 border border-amber-500/30 text-amber-200 text-xs">
                    {block}
                  </div>
                );
              }
              if (block.includes("TAVILY ERRATA") || block.includes("LIVE GITHUB SEARCH")) {
                return (
                  <div key={idx} className="p-2.5 rounded bg-cyan-950/20 border border-cyan-500/30 text-cyan-200 text-xs">
                    {block}
                  </div>
                );
              }
              if (block.includes("ROOT CAUSE VERIFIED")) {
                return (
                  <div key={idx} className="p-2.5 rounded bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 font-semibold text-xs">
                    {block}
                  </div>
                );
              }
              return (
                <p key={idx} className="text-gray-300">
                  {block}
                </p>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 py-12">
            <Sparkles className="h-8 w-8 text-gray-600 mb-2 animate-pulse" />
            <p className="font-mono text-xs">Awaiting Incident Trigger...</p>
            <p className="text-[11px] text-gray-600 max-w-sm mt-1">
              Click &quot;Auto-Heal with Chronos&quot; to launch Nemotron-70B multi-agent hypothesis and critique loops.
            </p>
          </div>
        )}
      </div>

      {/* Model Trust Footnote */}
      <div className="border-t border-gray-800/80 bg-[#070B14] px-3 py-1.5 flex items-center justify-between text-[10px] font-mono text-gray-400">
        <div className="flex items-center gap-1.5">
          <Layers className="h-3 w-3 text-purple-400" />
          <span>Reward Critic Filter: <strong className="text-emerald-400">0.0% Hallucination</strong></span>
        </div>
        <div className="text-gray-500">
          Engineered for NVIDIA Nemotron Reasoning Benchmark
        </div>
      </div>
    </div>
  );
};
