export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface IncidentDiagnosticReport {
  whatHappened: string;
  whyItHappened: string;
  impactedServices: Array<{
    name: string;
    role: string;
    status: "CRITICAL" | "DEGRADED" | "HEALTHY";
    latency: string;
  }>;
  businessImpact: {
    severity: string;
    throughputImpact: string;
    slaBreachRisk: string;
    financialRisk: string;
  };
}

export interface FixReportStep {
  phase: string;
  title: string;
  description: string;
  badge?: string;
  codeSnippet?: {
    before?: string;
    after?: string;
  };
}

export interface IncidentFixReport {
  summary: string;
  architecturalStrategy: string;
  steps: FixReportStep[];
}

export interface IncidentScenario {
  id: string;
  code: string;
  title: string;
  severity: Severity;
  service: string;
  category: "Concurrency" | "Dependency" | "Resource Exhaustion";
  description: string;
  failingFile: string;
  sampleLogs: string[];
  sampleTrace: {
    traceId: string;
    spanId: string;
    endpoint: string;
    durationMs: number;
    httpStatus: number;
  };
  sampleCommit: {
    hash: string;
    author: string;
    message: string;
    timestamp: string;
  };
  diagnosticReport?: IncidentDiagnosticReport;
  fixReport?: IncidentFixReport;
}

export type AgentNodeId = "sifter" | "tavily" | "nemotron_hypothesis" | "nemotron_critic" | "sandbox" | "pr_emitter";

export interface AgentNode {
  id: AgentNodeId;
  label: string;
  role: string;
  status: "idle" | "running" | "completed" | "failed";
  durationMs?: number;
  badge?: string;
  message?: string;
}

export interface TokenMetrics {
  tokensPerSecond: number;
  totalTokens: number;
  durationSeconds: number;
  model: string;
}

export interface SandboxExecution {
  step: "idle" | "reproducing" | "reproduced_fail" | "patching" | "verified_pass";
  reproCommand: string;
  initialOutput: string;
  initialExitCode: number;
  patchedOutput?: string;
  patchedExitCode?: number;
  regressionSuitePassed?: boolean;
}

export interface PatchInfo {
  filePath: string;
  originalCode: string;
  patchedCode: string;
  diffSummary: string;
  branchName: string;
  prUrl?: string;
}
