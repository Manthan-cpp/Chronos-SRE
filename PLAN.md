# PLAN.md — Chronos-SRE

An autonomous site reliability engineering (SRE) war-room platform: when a production outage occurs, Chronos-SRE sifts through high-velocity telemetry, maps recent Git AST diffs, uses Tavily to search external package errata, and employs NVIDIA Nemotron-70B on Nebius Token Factory to generate a hypothesis, criticize hallucinations, and deterministically verify a code patch in an isolated execution sandbox before submitting a verified GitHub Pull Request.

This plan is written so that **any coding agent (Antigravity, Codex, Claude Code, or a fresh session) can resume work at the start of any phase or sub-phase without prior conversation history.** Read section 0 before anything else every time you pick this up.

---

## 0. How Any Agent Resumes Work Here

**Read `docs/STATUS.md` first, always.** It tracks the current project state, locked decisions, and next steps in this format:

```markdown
# Project Status

Last updated: <ISO timestamp>
Last completed: <Phase N.M — name>
In progress: <Phase N.M — name, or "none">

## What exists right now
- <file/module> — <what it does, current state: done / partial / broken>

## Decisions locked in
- <anything settled that shouldn't be re-litigated>

## Known issues / open questions
- <anything unresolved the next agent needs to know>

## Next action
- <the exact next command or task>
```

Before starting any phase, verify its "Prerequisites" actually exist on disk. Do not trust documentation blindly; inspect the files.

---

## 1. NVIDIA x Nebius Global AI Hackathon Context

- **Event:** NVIDIA x Nebius Global AI Hackathon (Devpost).
- **Core Technology Mandate:** Must run on **Nebius Token Factory** or **Nebius AI Cloud** and utilize **NVIDIA open-source models** (Nemotron family, specifically `nvidia/llama-3.1-nemotron-70b-instruct`).
- **Partner Integration:** Leverages **Tavily API** for real-time live search grounding.
- **Track:** **Coding and Agentic Engineering Track** (Autonomous developer & SRE tools).
- **Zero-Cost Constraint:** 100% software-only; utilizes free Nebius Builder credits, Tavily free-tier, and local execution sandboxes. No paid cloud GPUs required.
- **Judges Focus:**
  - *NVIDIA AI Engineers (Abhinav Balasubramanian, Nancy Agarwal):* Looking for deep reasoning, self-critique, and code verification using Nemotron.
  - *Nebius Token Factory Team (Dylan Bristot, AbdulMajed Raja):* Looking for high token throughput, low latency, and real-time agentic execution.
  - *Tavily Team (Ricky Johnson, Suchismita Sahu):* Looking for practical live web grounding.

---

## 2. Tech Stack & Zero-Mock Policy

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Lucide Icons, Monaco Code Editor (`@monaco-editor/react`).
- **Backend:** Python (FastAPI), Asyncio, SSE (Server-Sent Events) streaming.
- **AI Inference:** Nebius Token Factory OpenAI-compatible API (`https://api.studio.nebius.ai/v1/`) running `nvidia/llama-3.1-nemotron-70b-instruct`.
- **Search Tooling:** Tavily Search API.
- **Execution Sandbox:** Local isolated Python virtual environments / ephemeral Docker containers executing real `pytest` subprocesses.
- **ABSOLUTE ZERO-MOCK POLICY:** Every single telemetry trace, crash log, git commit, and test execution originates from **real running software processes**. There are no hardcoded fake JSON responses or simulated AI strings.

---

## 3. User Inputs Required (Exact Timing & Setup Guide)

The user only needs to supply three environment variables inside `.env`:

```bash
# Required in Phase 0 / Phase 3
NEBIUS_API_KEY=your_nebius_token_factory_key

# Required in Phase 0 / Phase 4
TAVILY_API_KEY=your_tavily_search_api_key

# Required in Phase 0 / Phase 8 (Optional for local test, mandatory for live PR creation)
GITHUB_TOKEN=your_github_personal_access_token
```

### Step-by-Step Instructions for the User:
1. **Nebius Token Factory API Key:**
   - Go to [studio.nebius.ai](https://studio.nebius.ai) and sign in.
   - Navigate to **API Keys** -> Click **Create API Key**.
   - Copy the key and paste it as `NEBIUS_API_KEY` in `backend/.env`.
2. **Tavily API Key:**
   - Go to [tavily.com](https://tavily.com) and sign up for a free account.
   - Copy the API key from the dashboard and paste it as `TAVILY_API_KEY` in `backend/.env`.
3. **GitHub Token:**
   - Go to GitHub -> Settings -> Developer Settings -> Personal Access Tokens (Tokens classic).
   - Generate a token with the `repo` scope enabled.
   - Paste it as `GITHUB_TOKEN` in `backend/.env`.

---

## PHASE 0 — Workspace Scaffolding & Credentials Setup

**Goal:** Establish clean repository structure, configure environment templates, and verify credentials.

**Prerequisites:** Node.js (v18+) and Python (v3.10+) installed.

### 0.1 — Monorepo Layout Setup
- Initialize `frontend/` (Next.js), `backend/` (FastAPI), and `scenarios/` directories.
- Configure `.gitignore` to prevent any API keys or sandbox artifacts from being committed.

### 0.2 — Environment Configuration
- Create `backend/.env.example` with placeholders for `NEBIUS_API_KEY`, `TAVILY_API_KEY`, and `GITHUB_TOKEN`.
- Create a configuration validator (`backend/src/config.py`) that checks environment variables cleanly without crashing the dev server.

### 0.3 — Cost & Token Instrumentation Setup
- Implement `backend/src/lib/token_logger.py` to record tokens generated, latency per call, and estimated spend to ensure execution remains within free-tier credits.

**Deliverables:** Monorepo directory structure, `.env.example`, and configuration validation utility.

**Resumability check:** Running `python backend/src/config.py` confirms environment configuration and prints missing keys gracefully.

**Report (plain language):**
- **Implemented:** Monorepo folder hierarchy (`frontend/`, `backend/`, `scenarios/`), environment templates, and token tracking instrumentation.
- **Significance:** Sets the baseline for reproducible agent handoffs and keeps API consumption safely tracked.
- **Next Phase:** Build the full SRE War-Room UI Dashboard so the entire operational surface is immediately visual and interactive.

---

## PHASE 1 — Frontend SRE War-Room UI Dashboard (UI-First)

**Goal:** Build the complete, high-contrast SRE War-Room UI dashboard per `DESIGN.md` so that the entire operational surface is visible before connecting backend pipelines.

**Prerequisites:** Phase 0 complete.

### 1.1 — Next.js Application Scaffolding
- Initialize Next.js 14 with TypeScript, Tailwind CSS, and Lucide icons in `frontend/`.
- Configure dark mode theme tokens (`#090D16`, `#111827`, `#030712`) matching `DESIGN.md`.

### 1.2 — 3-Column War-Room Layout
- Build persistent Top Command Bar with system status indicator, incident selector, and Nebius Token Factory throughput counter (`tok/s`).
- Implement Column 1 (30%): Incident Ingress (Live terminal log stream, OpenTelemetry trace card, Git commit diff card).
- Implement Column 2 (40%): Forensic Agent DAG State Machine & Streaming Nemotron reasoning console with auto-scroll.
- Implement Column 3 (30%): Verified Patch Sandbox (Reproduction terminal, Monaco Code Diff viewer, Regression test pass badge, and GitHub PR trigger button).

### 1.3 — Interactive Monaco Diff Viewer Component
- Integrate `@monaco-editor/react` to render side-by-side and inline syntax-highlighted git diffs with additions and deletions clearly formatted.

### 1.4 — Real-time SSE Connection Hook
- Implement `useIncidentStream` hook ready to consume Server-Sent Events from the backend (`/api/incident/stream`), featuring fallback demo controls for instant testing.

**Deliverables:** Fully interactive, running Next.js web application running at `http://localhost:3000`.

**Resumability check:** Launching `npm run dev` in `frontend/` opens the 3-column SRE War-Room in the browser without console errors, and the Monaco diff editor renders correctly.

**Report (plain language):**
- **Implemented:** Complete SRE War-Room UI dashboard featuring the 3-column triage layout, streaming terminal consoles, Monaco code diff viewer, and incident selection controls.
- **Significance:** Delivers immediate visual fidelity and lets judges and developers see the full operational dashboard upfront.
- **Next Phase:** Construct the real-world incident failure lab containing real runnable Python applications with reproducible bugs (zero mock data).

---

## PHASE 2 — Real-World Incident Failure Lab (Zero-Mock Suite)

**Goal:** Create 3 independent, real, executable software packages with real reproducible bugs that crash under test.

**Prerequisites:** Phase 1 complete.

### 2.1 — Scenario 1: Async Worker Deadlock (`ASYNC-DEADLOCK-402`)
- Create `scenarios/async_deadlock/` containing a real asynchronous task queue worker using `asyncio`.
- Introduce a real concurrency deadlock where two workers compete for cross-dependent locks without a timeout.
- Provide a unit test (`test_worker.py`) that reliably hangs or fails with an assertion error.

### 2.2 — Scenario 2: Third-Party Upstream Deprecation (`UPSTREAM-BREAK-501`)
- Create `scenarios/upstream_break/` using an HTTP client integration.
- Introduce an upstream library breaking change where a kwargs parameter was renamed in the latest package release.
- Provide a unit test that fails with `TypeError: unexpected keyword argument`.

### 2.3 — Scenario 3: Connection Pool Starvation (`POOL-LEAK-503`)
- Create `scenarios/pool_leak/` with an async database connection pool.
- Simulate an unhandled exception inside a transaction that fails to release the acquired connection back to the pool.
- Provide a unit test that exhausts the pool and crashes with `TimeoutError: QueuePool limit exceeded`.

### 2.4 — Incident Harness & Telemetry Emitter
- Build a Python runner (`scenarios/runner.py`) that runs any scenario, captures stdout/stderr, and outputs real OpenTelemetry-compatible JSON traces.

**Deliverables:** Three complete, self-contained, failing Python packages in `scenarios/` with automated test harnesses.

**Resumability check:** Running `python scenarios/runner.py ASYNC-DEADLOCK-402` produces real crash logs and exits with returncode 1.

**Report (plain language):**
- **Implemented:** Three genuine, runnable software packages with real concurrency, dependency, and resource starvation bugs.
- **Significance:** Enforces the Zero-Mock Policy; all downstream agents will work on actual software bugs rather than synthetic text.
- **Next Phase:** Connect the Nebius Token Factory API and verify live Nemotron-70B model inference.

---

## PHASE 3 — Nebius Token Factory & Nemotron-70B Live Integration

**Goal:** Establish high-throughput inference client connecting to Nebius Token Factory serving `nvidia/llama-3.1-nemotron-70b-instruct`.

**Prerequisites:** User provides `NEBIUS_API_KEY` in `backend/.env`.

### 3.1 — Nebius Inference Client Setup
- Implement `backend/src/services/nebius_client.py` using the OpenAI-compatible SDK pointing to `https://api.studio.nebius.ai/v1/`.
- Configure model target: `nvidia/llama-3.1-nemotron-70b-instruct`.

### 3.2 — Live Connectivity & Throughput Spike
- Build a verification script (`backend/tests/test_nebius_spike.py`) that streams tokens from Nemotron-70B and measures real-world tokens/second and TTFT (Time To First Token).
- Validate that streaming responses yield > 80 tokens/sec.

### 3.3 — Streaming SSE Adapter
- Connect the Nebius streaming generator to an async queue to allow real-time forwarding over HTTP Server-Sent Events to the frontend.

**Deliverables:** `backend/src/services/nebius_client.py` and passing connectivity test script.

**Resumability check:** Running `python -m backend.tests.test_nebius_spike` prints streaming text from Nemotron-70B and logs tokens/sec metrics to console.

**Report (plain language):**
- **Implemented:** Nebius Token Factory API client with streaming support for `nvidia/llama-3.1-nemotron-70b-instruct`.
- **Significance:** Validates the primary hackathon infrastructure requirement and measures the real-time inference speed needed for live agent loops.
- **Next Phase:** Build the Tavily Live Web & Errata Scout Agent to fetch real external dependency changes.

---

## PHASE 4 — Tavily Live Web & Errata Scout Agent

**Goal:** Implement real-time search agent using Tavily to retrieve GitHub issues, changelogs, and package errata for crashing dependencies.

**Prerequisites:** User provides `TAVILY_API_KEY` in `backend/.env`.

### 4.1 — Tavily Client Integration
- Implement `backend/src/services/tavily_scout.py` utilizing the official Tavily Python SDK or REST endpoint.

### 4.2 — Dependency Manifest & Stacktrace Extractor
- Extract third-party package names and version strings directly from crash stack traces.
- Query Tavily for specific query patterns: `"<package_name>" "<error_message>" site:github.com/issues OR site:pypi.org`.

### 4.3 — Live Context Distiller
- Filter raw Tavily search results down to concise, relevant snippets containing breaking changes or deprecation notices to feed into the Nemotron prompt context.

**Deliverables:** Working Tavily search service with automated query synthesis from stack traces.

**Resumability check:** Running `python -m backend.tests.test_tavily_scout` executes a live web search for a known package issue and returns verified GitHub issue snippets.

**Report (plain language):**
- **Implemented:** Tavily search agent that automatically detects breaking third-party dependencies from stack traces and fetches live GitHub issues.
- **Significance:** Provides real-time external ground truth beyond the LLM's static training cutoff, directly addressing the partner judging criteria.
- **Next Phase:** Implement the Telemetry & Git AST Forensic Sifter to extract failure signatures and code diffs.

---

## PHASE 5 — Telemetry & Git AST Forensic Sifter Engine

**Goal:** Distill high-volume production logs and analyze Git AST diffs to isolate the exact semantic changes responsible for an outage.

**Prerequisites:** Phase 2 complete (incident scenarios available).

### 5.1 — Telemetry Sifter & Trace Normalizer
- Implement `backend/src/forensics/sifter.py` to parse raw application logs and extract:
  - Fatal exception type and line number.
  - Correlated OpenTelemetry Trace ID.
  - Offending module path.

### 5.2 — Git AST Diff Inspector
- Implement `backend/src/forensics/git_ast.py` using Python's native `ast` module.
- Compare the target repository's current commit against the previous commit to detect semantic changes (e.g. removed locks, changed signatures, missing context managers).

### 5.3 — Unified Forensic Packet Generator
- Combine the Sifter output, AST diff, and Tavily errata into a structured `ForensicPacket` ready for the Nemotron reasoning loop.

**Deliverables:** `sifter.py` and `git_ast.py` capable of analyzing any scenario folder.

**Resumability check:** Running `python -m backend.forensics.sifter scenarios/async_deadlock` generates an accurate forensic packet without errors.

**Report (plain language):**
- **Implemented:** Automated log sifter and Git AST diff inspector that filters noisy logs down to the exact offending lines and semantic code mutations.
- **Significance:** Keeps the LLM prompt focused on high-signal code modifications rather than wasting context on thousands of irrelevant log lines.
- **Next Phase:** Build the Nemotron Dual-Agent Reasoning & Adversarial Critic loop.

---

## PHASE 6 — Nemotron Dual-Agent Reasoning & Reward Critic Loop

**Goal:** Implement the multi-agent debate loop where Nemotron generates hypotheses, cross-examines them against the code AST, and synthesizes a deterministic fix.

**Prerequisites:** Phase 3, 4, and 5 complete.

### 6.1 — Agent 1: Root-Cause Hypothesis Generator
- Craft prompt instructing Nemotron-70B to formulate 3 technically grounded hypotheses explaining how the code commit triggered the failure signature.

### 6.2 — Agent 2: Adversarial Reward Critic
- Implement critique prompt instructing Nemotron to evaluate each hypothesis against the code AST, assign confidence scores (0.0 to 1.0), and aggressively reject hallucinations.

### 6.3 — Agent 3: Deterministic Test & Patch Synthesizer
- For the validated hypothesis, prompt Nemotron to generate:
  1. `test_repro.py`: A self-contained pytest script reproducing the crash.
  2. A minimal unified Git diff patch fixing the bug.

**Deliverables:** Multi-agent reasoning pipeline in `backend/src/agents/orchestrator.py`.

**Resumability check:** Executing the agent loop on `scenarios/async_deadlock` outputs a structured hypothesis, critique score, test code, and unified diff.

**Report (plain language):**
- **Implemented:** Dual-agent Nemotron reasoning and critique loop that formulates root-cause theories, weeds out hallucinations, and generates code patches.
- **Significance:** Directly showcases the advanced reasoning and reward-modeling strengths of NVIDIA Nemotron-70B to the hackathon judges.
- **Next Phase:** Build the Ephemeral Execution Sandbox to deterministically verify the fix before showing it to the user.

---

## PHASE 7 — Ephemeral Sandbox & Deterministic Test Verifier

**Goal:** Safely execute tests and patches in an isolated sandbox to mathematically guarantee the fix works before creating a PR.

**Prerequisites:** Phase 6 complete.

### 7.1 — Isolated Sandbox Runner
- Implement `backend/src/sandbox/runner.py` to manage ephemeral working directories and execute subprocess commands with strict timeouts.

### 7.2 — Deterministic 5-Step Verification Cycle
- **Step 1:** Copy scenario codebase to ephemeral sandbox.
- **Step 2:** Write `test_repro.py` generated by Nemotron.
- **Step 3:** Run `pytest test_repro.py` ➔ **Assert FAIL** (verifies test is not a false positive).
- **Step 4:** Apply unified git diff patch to sandbox files.
- **Step 5:** Run `pytest test_repro.py` ➔ **Assert PASS** (verifies fix works).
- **Step 6:** Run full project test suite ➔ **Assert PASS** (verifies zero regressions).

### 7.3 — Self-Correction Feedback Loop
- If Step 5 or 6 fails, forward the compiler/pytest error logs back to the Nemotron Critic loop for one automated re-attempt.

**Deliverables:** `backend/src/sandbox/runner.py` with verified reproduction and patch testing.

**Resumability check:** Running the sandbox runner against `scenarios/async_deadlock` with a generated patch outputs a full green test verification log.

**Report (plain language):**
- **Implemented:** Ephemeral sandbox runner that enforces the 5-step deterministic verification cycle (Fail ➔ Patch ➔ Pass).
- **Significance:** Guarantees that no hallucinated or broken code is ever presented to the user or submitted to GitHub.
- **Next Phase:** Build the FastAPI Orchestrator and connect real-time SSE streaming to the frontend.

---

## PHASE 8 — FastAPI Orchestrator & Live SSE Streaming

**Goal:** Tie the backend agents to the Next.js frontend via real-time Server-Sent Events (SSE).

**Prerequisites:** Phase 1 (Frontend) and Phase 7 (Sandbox) complete.

### 8.1 — FastAPI Server & Endpoints
- Implement `backend/src/main.py`:
  - `POST /api/incident/trigger`: Initiates diagnosis on a chosen scenario.
  - `GET /api/incident/stream`: SSE stream broadcasting live agent progress.
  - `POST /api/pr/create`: Submits verified patch to GitHub via Octokit / REST API.

### 8.2 — SSE Event Dispatcher
- Stream live events to the frontend:
  - `event: telemetry` (stack traces & logs)
  - `event: agent_state` (active agent node in DAG)
  - `event: token_stream` (Nemotron tokens streaming with live tokens/sec)
  - `event: sandbox_exec` (terminal output from pytest)
  - `event: resolution` (final Monaco diff & PR readiness)

### 8.3 — Full Frontend-Backend Integration
- Wire the frontend's `useIncidentStream` hook to the real FastAPI SSE endpoint.
- Verify end-to-end execution from selecting an incident in the UI to seeing the verified diff.

**Deliverables:** Complete, integrated full-stack application running locally.

**Resumability check:** Triggering an incident in the browser UI displays live streaming logs, active agent transitions, streaming Nemotron reasoning, and final green test verification without reloading.

**Report (plain language):**
- **Implemented:** FastAPI backend with real-time SSE event dispatcher wired directly to the Next.js frontend War-Room dashboard.
- **Significance:** Unifies all modular subsystems into a seamless, responsive, real-time command center.
- **Next Phase:** Implement the GitHub Pull Request Emitter for automated branch and PR creation.

---

## PHASE 9 — Verified GitHub PR Emitter & End-to-End Trial

**Goal:** Automate live GitHub branch creation, commit, and Pull Request submission, and run end-to-end stress tests across all scenarios.

**Prerequisites:** User provides `GITHUB_TOKEN` in `backend/.env`.

### 9.1 — GitHub API PR Emitter
- Implement `backend/src/services/github_service.py` to create a new branch (`chronos/fix-<incident-id>`), commit the verified patch, and open a PR with markdown verification logs.

### 9.2 — End-to-End Scenario Verification Trial
- Run full triage on all 3 real scenarios:
  1. `ASYNC-DEADLOCK-402`
  2. `UPSTREAM-BREAK-501`
  3. `POOL-LEAK-503`
- Record pass rate, end-to-end latency, and token consumption in `docs/test_results.md`.

**Deliverables:** Automated GitHub PR service and benchmark trial results in `docs/test_results.md`.

**Resumability check:** Triggering the "Create PR" button from the UI creates an actual live Pull Request on a GitHub repository.

**Report (plain language):**
- **Implemented:** Automated GitHub PR emitter and end-to-end verification across all three real incident scenarios.
- **Significance:** Completes the loop from 3 AM server crash to verified, mergeable GitHub Pull Request.
- **Next Phase:** Deploy the frontend to Vercel and prepare reproducible Docker containers.

---

## PHASE 10 — Zero-Cost Deployment & Packaging

**Goal:** Provide zero-cost hosting and one-command local reproduction for hackathon judges.

**Prerequisites:** Phase 9 complete.

### 10.1 — Docker Compose Packaging
- Create `docker-compose.yml` that builds and launches both frontend and backend locally with a single command: `docker compose up`.

### 10.2 — Vercel Frontend Deployment
- Deploy the Next.js frontend to Vercel free tier with environment variables configured.

### 10.3 — Render / Railway Backend Deployment
- Deploy the FastAPI backend to Render/Railway free tier, or provide simple public ngrok/cloudflared tunnel instructions for live evaluation.

**Deliverables:** Production deployment files (`Dockerfile`, `docker-compose.yml`, live Vercel URL).

**Resumability check:** Running `docker compose up` starts the entire system cleanly on a fresh machine.

**Report (plain language):**
- **Implemented:** Docker Compose orchestration and zero-cost cloud deployment for the frontend.
- **Significance:** Ensures judges can immediately evaluate the live project via web link or test it locally with zero friction.
- **Next Phase:** Assemble the final Devpost submission package and record the demo video.

---

## PHASE 11 — Devpost Submission & Demo Packaging

**Goal:** Deliver the complete hackathon submission package matching all Devpost requirements.

**Prerequisites:** Phase 10 complete.

### 11.1 — Comprehensive README.md
- Document project inspiration, architecture diagram, how it leverages Nebius Token Factory and NVIDIA Nemotron, local setup guide, and zero-mock guarantee.

### 11.2 — 3-Minute Demo Video Script & Recording
- Script structured for maximum judge impact:
  - *0:00 - 0:30:* The Problem (3 AM outage, SRE fatigue, 50,000 messy logs).
  - *0:30 - 1:15:* Live Incident Ingress & Sifter (Zero-mock real crash).
  - *1:15 - 2:00:* Nebius Token Factory + Nemotron-70B dual-agent debate and Tavily search in action.
  - *2:00 - 2:40:* Ephemeral Sandbox (Failing test ➔ Patch ➔ Passing test).
  - *2:40 - 3:00:* Live GitHub PR created & conclusion.

### 11.3 — Final Devpost Checklist Verification
- Verify all required fields: Track selection, Nebius Token Factory usage proof, video link, public GitHub repository.

**Deliverables:** Final `README.md`, video script, and completed Devpost submission text.

**Resumability check:** All hackathon requirements from the official Devpost page are checked off and documented.

**Report (plain language):**
- **Implemented:** Final documentation, demo video script, and Devpost submission package.
- **Significance:** Positions Chronos-SRE for top consideration across all judging criteria.
- **Next Phase:** Project complete; ready for official submission.

---

## Appendix — Repository File Map

```
chronos-sre/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx               — Main SRE War-Room Dashboard
│   │   │   └── layout.tsx             — Dark Terminal Layout & Tokens
│   │   ├── components/
│   │   │   ├── TopCommandBar.tsx      — System Status & Token Factory Meter
│   │   │   ├── IncidentIngress.tsx    — Telemetry & Log Stream Panel
│   │   │   ├── AgentDAGGraph.tsx      — Active Agent State Machine Visualization
│   │   │   ├── ReasoningStream.tsx    — Live Streaming Nemotron Tokens
│   │   │   ├── SandboxTerminal.tsx    — Pytest Execution Terminal
│   │   │   └── MonacoDiffViewer.tsx   — Syntax-Highlighted Code Diff Viewer
│   │   └── hooks/
│   │       └── useIncidentStream.ts   — Real-time SSE Connection Hook
├── backend/
│   ├── src/
│   │   ├── main.py                    — FastAPI App & SSE Endpoints
│   │   ├── config.py                  — Credentials & Environment Validator
│   │   ├── services/
│   │   │   ├── nebius_client.py       — Nebius Token Factory Nemotron-70B Client
│   │   │   ├── tavily_scout.py        — Tavily Real-time Web Search Service
│   │   │   └── github_service.py      — Automated Pull Request Emitter
│   │   ├── forensics/
│   │   │   ├── sifter.py              — Log & Telemetry Distiller
│   │   │   └── git_ast.py             — Git AST Semantic Diff Analyzer
│   │   ├── agents/
│   │   │   └── orchestrator.py        — Nemotron Dual-Agent Debate Engine
│   │   └── sandbox/
│   │       └── runner.py              — Ephemeral Pytest Sandbox Verifier
├── scenarios/
│   ├── async_deadlock/                — Concurrency Bug Scenario
│   ├── upstream_break/                — Dependency Deprecation Scenario
│   ├── pool_leak/                     — Resource Starvation Scenario
│   └── runner.py                      — Real Incident Execution Harness
├── docs/
│   ├── STATUS.md                      — Active Resumption Ledger (Read First)
│   ├── test_results.md                — Benchmark & Trial Metrics
│   └── feasibility_results.md         — Token Factory Baseline Numbers
├── SYSTEM_DESIGN.md                   — Technical Architecture Spec
├── DESIGN.md                          — Visual & UX Spec
└── PLAN.md                            — This Master Execution Plan
```
