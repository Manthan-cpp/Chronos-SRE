"use client";

import React, { useState } from "react";
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

  const {
    scenarios,
    activeScenario,
    handleSelectScenario,
    liveLogs,
    isStreamingLogs,
    isInvestigating,
    agents,
    reasoningText,
    tokenMetrics,
    sandboxExecution,
    patch,
    repoUrl,
    setRepoUrl,
    isCreatingPR,
    prCreated,
    prUrl,
    prNumber,
    systemStatus,
    triggerSimulation,
    triggerInvestigation,
    createPullRequest,
    resetAll
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
    <div className="min-h-screen w-full relative font-sans" style={{ backgroundColor: "#06070a", color: "#f8fafc" }}>
      {/* 1. CursorGrid Wrapper with exact parameters from React Bits configuration */}
      <CursorGrid
        cellSize={32}
        radius={60}
        fadeDuration={300}
        holdTime={400}
        color="#ffffff"
        gridColor="#ffffff"
        highlight="area"
        gridStyle="lines"
        falloff="smooth"
        lineWidth={1}
        maxOpacity={1}
        fillOpacity={0.06}
        gridOpacity={0.08}
        spotlight={0.6}
        cellGap={0}
        cellRadius={0}
        pulseSpeed={600}
        ambient={0}
        edgeFade={0.2}
        clickPulse={true}
        intro={false}
        style={{ width: "100%", minHeight: "100vh", position: "relative", backgroundColor: "#06070a" }}
      >
        {/* 2. Interactive Foreground Layer */}
        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Navbar */}
          <Navbar
            scenarios={scenarios}
            activeScenario={activeScenario}
            onSelectScenario={handleSelectScenario}
            repoUrl={repoUrl}
            onRepoUrlChange={setRepoUrl}
            isInvestigating={isInvestigating}
            systemStatus={systemStatus}
            onTriggerInvestigation={handleStartInvestigation}
            onReset={resetAll}
          />

          {/* Navigation Tabs */}
          <div className="border-b border-slate-800/80 bg-[#07090e]/75 backdrop-blur-md sticky top-0 z-40">
            <div className="mx-auto flex max-w-7xl items-center gap-8 px-6">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  activeTab === "overview"
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => setActiveTab("logs")}
                className={`flex items-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  activeTab === "logs"
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <Terminal className="h-4 w-4" />
                <span>Telemetry & Logs</span>
                {liveLogs.length > 2 && (
                  <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                    {liveLogs.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("investigation")}
                className={`flex items-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  activeTab === "investigation"
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <SearchCode className="h-4 w-4" />
                <span>Root Cause Analysis</span>
                {isInvestigating && (
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                )}
              </button>

              <button
                onClick={() => setActiveTab("patch")}
                className={`flex items-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  activeTab === "patch"
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <GitPullRequest className="h-4 w-4" />
                <span>Patch & Sandbox</span>
                {patch && (
                  <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-green-950/80 border border-green-800/80 text-green-300 font-semibold">
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
                scenario={activeScenario}
                systemStatus={systemStatus}
                repoUrl={repoUrl}
                onRepoUrlChange={setRepoUrl}
                isSimulating={isStreamingLogs}
                isInvestigating={isInvestigating}
                onSimulate={handleSimulate}
                onInvestigate={handleStartInvestigation}
                onNavigateToTab={(tab) => setActiveTab(tab as TabKey)}
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
                reasoningText={reasoningText}
                isInvestigating={isInvestigating}
                tokenMetrics={tokenMetrics}
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
              />
            )}
          </main>
        </div>
      </CursorGrid>
    </div>
  );
}
