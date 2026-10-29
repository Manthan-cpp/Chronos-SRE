"use client";

import React, { useState, useEffect } from "react";
import CursorGrid from "../components/CursorGrid";
import { Navbar } from "../components/Navbar";
import { OverviewTab } from "../components/tabs/OverviewTab";
import { LogsTab } from "../components/tabs/LogsTab";
import { InvestigationTab } from "../components/tabs/InvestigationTab";
import { PatchTab } from "../components/tabs/PatchTab";
import { useIncidentStream } from "../hooks/useIncidentStream";
import { LayoutDashboard, Terminal, SearchCode, GitPullRequest } from "lucide-react";

type TabKey = "overview" | "logs" | "investigation" | "patch";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Initialize theme from localStorage or default strictly to light theme
  useEffect(() => {
    try {
      const saved = localStorage.getItem("chronos-theme");
      if (saved === "dark") {
        setIsDarkMode(true);
        document.documentElement.classList.add("dark");
      } else {
        setIsDarkMode(false);
        document.documentElement.classList.remove("dark");
      }
    } catch {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      try {
        if (next) {
          document.documentElement.classList.add("dark");
          localStorage.setItem("chronos-theme", "dark");
        } else {
          document.documentElement.classList.remove("dark");
          localStorage.setItem("chronos-theme", "light");
        }
      } catch {
        // Fallback
      }
      return next;
    });
  };

  const {
    connectedRepo,
    repoInput,
    setRepoInput,
    repoMetadata,
    fileTree,
    manualLogInput,
    setManualLogInput,
    isConnectingRepo,
    isDiscoveringIncidents,
    discoveryMode,
    discoverIncidents,
    loadBenchmarkScenarios,
    connectRepo,
    disconnectRepo,
    scenarios,
    activeScenario,
    handleSelectScenario,
    liveLogs,
    isStreamingLogs,
    isInvestigating,
    agents,
    activePhaseMessage,
    reasoningText,
    tokenMetrics,
    sandboxExecution,
    patch,
    isCreatingPR,
    prCreated,
    prUrl,
    prNumber,
    systemStatus,
    triggerSimulation,
    triggerInvestigation,
    createPullRequest
  } = useIncidentStream();

  const handleStartInvestigation = () => {
    triggerInvestigation();
    setActiveTab("investigation");
  };

  const handleSimulate = () => {
    triggerSimulation();
    setActiveTab("logs");
  };

  return (
    <div className="min-h-screen w-full relative font-sans overflow-x-hidden bg-[var(--background)] text-[var(--foreground)] transition-colors duration-200">
      {/* 1. CursorGrid with Dynamic Dark/Light Monochrome Adaptation */}
      <CursorGrid
        cellSize={32}
        radius={120}
        fadeDuration={300}
        holdTime={400}
        color={isDarkMode ? "#ffffff" : "#0f172a"}
        gridColor={isDarkMode ? "#27272a" : "#94a3b8"}
        lightMode={!isDarkMode}
        highlight="area"
        gridStyle="lines"
        falloff="smooth"
        lineWidth={1}
        maxOpacity={isDarkMode ? 0.4 : 0.5}
        fillOpacity={isDarkMode ? 0.05 : 0.08}
        gridOpacity={isDarkMode ? 0.35 : 0.25}
        spotlight={0.8}
        cellGap={0}
        cellRadius={0}
        pulseSpeed={600}
        ambient={isDarkMode ? 0.15 : 0.2}
        edgeFade={0.15}
        clickPulse={true}
        intro={false}
        style={{ width: "100%", minHeight: "100vh", position: "relative" }}
      >
        {/* 2. Interactive Foreground Layer */}
        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Minimalist Header */}
          <Navbar
            connectedRepo={connectedRepo}
            repoInput={repoInput}
            onRepoInputChange={setRepoInput}
            onConnectRepo={connectRepo}
            onDisconnectRepo={disconnectRepo}
            scenarios={scenarios}
            activeScenario={activeScenario}
            onSelectScenario={handleSelectScenario}
            isInvestigating={isInvestigating}
            systemStatus={systemStatus}
            onTriggerInvestigation={handleStartInvestigation}
            isDarkMode={isDarkMode}
            onToggleDarkMode={handleToggleDarkMode}
          />

          {/* Navigation Tabs (Strictly Monochrome Dual-Theme) */}
          <div className="border-b border-black/[0.08] dark:border-white/10 bg-[var(--tab-bar-bg)] backdrop-blur-xl sticky top-[57px] z-40 transition-colors">
            <div className="mx-auto flex max-w-7xl items-center gap-8 px-6">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-2 py-3.5 text-xs font-mono uppercase tracking-wider font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === "overview"
                    ? "border-slate-900 text-slate-900 dark:border-zinc-100 dark:text-zinc-100"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => setActiveTab("logs")}
                className={`flex items-center gap-2 py-3.5 text-xs font-mono uppercase tracking-wider font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === "logs"
                    ? "border-slate-900 text-slate-900 dark:border-zinc-100 dark:text-zinc-100"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                <Terminal className="h-4 w-4" />
                <span>Telemetry & Logs</span>
                {liveLogs.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-black/[0.06] border border-black/10 text-slate-700 dark:bg-white/10 dark:border-white/15 dark:text-zinc-300">
                    {liveLogs.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("investigation")}
                className={`flex items-center gap-2 py-3.5 text-xs font-mono uppercase tracking-wider font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === "investigation"
                    ? "border-slate-900 text-slate-900 dark:border-zinc-100 dark:text-zinc-100"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                <SearchCode className="h-4 w-4" />
                <span>Root Cause Analysis</span>
                {isInvestigating && (
                  <span className="h-2 w-2 rounded-full bg-slate-900 dark:bg-zinc-100 animate-pulse" />
                )}
              </button>

              <button
                onClick={() => setActiveTab("patch")}
                className={`flex items-center gap-2 py-3.5 text-xs font-mono uppercase tracking-wider font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === "patch"
                    ? "border-slate-900 text-slate-900 dark:border-zinc-100 dark:text-zinc-100"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                <GitPullRequest className="h-4 w-4" />
                <span>Patch & Sandbox</span>
                {patch && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-slate-900 text-zinc-100 border border-slate-700 dark:bg-zinc-100 dark:text-zinc-950 dark:border-zinc-300 font-semibold">
                    Verified
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Tab Content Viewport */}
          <main className="flex-1 mx-auto max-w-7xl w-full p-6">
            {activeTab === "overview" && (
              <OverviewTab
                connectedRepo={connectedRepo}
                repoInput={repoInput}
                onRepoInputChange={setRepoInput}
                onConnectRepo={connectRepo}
                scenario={activeScenario}
                scenarios={scenarios}
                onSelectScenario={handleSelectScenario}
                systemStatus={systemStatus}
                isSimulating={isStreamingLogs}
                isInvestigating={isInvestigating}
                onSimulate={handleSimulate}
                onNavigateToTab={(tab) => setActiveTab(tab as TabKey)}
                repoMetadata={repoMetadata}
                fileTree={fileTree}
                manualLogInput={manualLogInput}
                onManualLogInputChange={setManualLogInput}
                onDiscoverIncidents={(customLog) => discoverIncidents(connectedRepo || "", customLog)}
                onLoadBenchmarks={loadBenchmarkScenarios}
                isConnectingRepo={isConnectingRepo}
                isDiscoveringIncidents={isDiscoveringIncidents}
                discoveryMode={discoveryMode}
              />
            )}

            {activeTab === "logs" && (
              <LogsTab
                scenario={activeScenario}
                liveLogs={liveLogs}
                isStreamingLogs={isStreamingLogs}
              />
            )}

            {activeTab === "investigation" && (
              <InvestigationTab
                agents={agents}
                activePhaseMessage={activePhaseMessage}
                reasoningText={reasoningText}
                isInvestigating={isInvestigating}
                tokenMetrics={tokenMetrics}
                scenario={activeScenario}
              />
            )}

            {activeTab === "patch" && (
              <PatchTab
                patch={patch}
                sandbox={sandboxExecution}
                onCreatePR={createPullRequest}
                isCreatingPR={isCreatingPR}
                prCreated={prCreated}
                prUrl={prUrl}
                prNumber={prNumber}
                scenario={activeScenario}
              />
            )}
          </main>
        </div>
      </CursorGrid>
    </div>
  );
}
