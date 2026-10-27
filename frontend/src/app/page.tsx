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
    connectedRepo,
    repoInput,
    setRepoInput,
    connectRepo,
    disconnectRepo,
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
    <div className="min-h-screen w-full relative font-sans" style={{ backgroundColor: "#dde1e6", color: "#0f172a" }}>
      {/* 1. CursorGrid in Light Mode with Soft Gray Background */}
      <CursorGrid
        cellSize={32}
        radius={120}
        fadeDuration={300}
        holdTime={400}
        color="#0f172a"
        gridColor="#94a3b8"
        lightMode={true}
        highlight="area"
        gridStyle="lines"
        falloff="smooth"
        lineWidth={1}
        maxOpacity={0.5}
        fillOpacity={0.08}
        gridOpacity={0.25}
        spotlight={0.8}
        cellGap={0}
        cellRadius={0}
        pulseSpeed={600}
        ambient={0.2}
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
          />

          {/* Navigation Tabs (Minimalist Monochrome) */}
          <div className="border-b border-black/[0.08] bg-[#dde1e6]/80 backdrop-blur-xl sticky top-[57px] z-40">
            <div className="mx-auto flex max-w-7xl items-center gap-8 px-6">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-2 py-3.5 text-xs font-mono uppercase tracking-wider font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === "overview"
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => setActiveTab("logs")}
                className={`flex items-center gap-2 py-3.5 text-xs font-mono uppercase tracking-wider font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === "logs"
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Terminal className="h-4 w-4" />
                <span>Telemetry & Logs</span>
                {liveLogs.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-black/[0.06] border border-black/10 text-slate-700">
                    {liveLogs.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("investigation")}
                className={`flex items-center gap-2 py-3.5 text-xs font-mono uppercase tracking-wider font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === "investigation"
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <SearchCode className="h-4 w-4" />
                <span>Root Cause Analysis</span>
                {isInvestigating && (
                  <span className="h-2 w-2 rounded-full bg-slate-900 animate-pulse" />
                )}
              </button>

              <button
                onClick={() => setActiveTab("patch")}
                className={`flex items-center gap-2 py-3.5 text-xs font-mono uppercase tracking-wider font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === "patch"
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <GitPullRequest className="h-4 w-4" />
                <span>Patch & Sandbox</span>
                {patch && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold">
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
