"use client";

import React from "react";

interface MarkdownViewerProps {
  content: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content }) => {
  if (!content) {
    return (
      <div className="py-16 text-center text-zinc-500 font-mono text-sm">
        No investigation initiated yet. Connect a repository, select an incident testbed, and click &quot;Run Investigation&quot; to launch the autonomous forensic swarm.
      </div>
    );
  }

  // Parse lines cleanly into structured blocks
  const lines = content.split("\n");
  const renderedElements: React.ReactNode[] = [];

  const parseInline = (text: string): React.ReactNode => {
    // Regex for inline code `code` and bold **bold**
    const parts: React.ReactNode[] = [];
    let remaining = text;

    // Pattern to match either `code` or **bold**
    const regex = /(\*\*.*?\*\*|`.*?`)/g;
    const tokens = remaining.split(regex);

    return tokens.map((token, i) => {
      if (token.startsWith("**") && token.endsWith("**")) {
        const inner = token.slice(2, -2);
        return (
          <strong key={i} className="font-bold text-white">
            {inner}
          </strong>
        );
      }
      if (token.startsWith("`") && token.endsWith("`")) {
        const inner = token.slice(1, -1);
        return (
          <code
            key={i}
            className="font-mono text-xs px-1.5 py-0.5 rounded bg-white/10 text-zinc-200 border border-white/10"
          >
            {inner}
          </code>
        );
      }
      return <span key={i}>{token}</span>;
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      renderedElements.push(<div key={`empty-${i}`} className="h-3" />);
      continue;
    }

    if (line.startsWith("### ")) {
      const headingText = line.replace("### ", "").trim();
      renderedElements.push(
        <div
          key={`h3-${i}`}
          className="text-base font-bold text-white tracking-tight pb-1.5 mb-2 mt-4 first:mt-0 border-b border-white/10 flex items-center gap-2"
        >
          <span className="h-2 w-2 rounded-full bg-zinc-300 inline-block shrink-0" />
          <span>{parseInline(headingText)}</span>
        </div>
      );
    } else if (line.startsWith("#### ")) {
      const headingText = line.replace("#### ", "").trim();
      renderedElements.push(
        <div
          key={`h4-${i}`}
          className="text-sm font-semibold text-zinc-200 tracking-tight mt-3 mb-1.5 flex items-center gap-2"
        >
          <span className="text-zinc-500 font-mono text-xs">§</span>
          <span>{parseInline(headingText)}</span>
        </div>
      );
    } else if (line.startsWith("- ")) {
      const bulletText = line.replace("- ", "").trim();
      renderedElements.push(
        <div
          key={`bullet-${i}`}
          className="flex items-start gap-2.5 my-1.5 text-sm text-zinc-300 leading-relaxed pl-3 border-l-2 border-white/10 hover:border-white/30 transition-colors"
        >
          <span className="text-zinc-500 select-none mt-0.5">•</span>
          <div className="flex-1">{parseInline(bulletText)}</div>
        </div>
      );
    } else {
      renderedElements.push(
        <p key={`p-${i}`} className="text-sm text-zinc-300 leading-relaxed my-1">
          {parseInline(line)}
        </p>
      );
    }
  }

  return (
    <div className="font-mono text-xs space-y-1 select-text">
      {renderedElements}
    </div>
  );
};
