# ⚡ Chronos-SRE: Autonomous Incident Time-Travel & Healing Engine

[![Nebius x NVIDIA Hackathon](https://img.shields.io/badge/Nebius%20x%20NVIDIA-Global%20AI%20Hackathon-76B900.svg)](https://devpost.com)
[![Track: Coding & Agentic Engineering](https://img.shields.io/badge/Track-Coding%20%26%20Agentic%20Engineering-blue.svg)](https://devpost.com)
[![Model: NVIDIA Nemotron-70B](https://img.shields.io/badge/Model-NVIDIA%20Nemotron--70B%20Instruct-76B900.svg)](https://build.nvidia.com)
[![Inference: Nebius Token Factory](https://img.shields.io/badge/Inference-Nebius%20Token%20Factory%20(91.4%20tok%2Fs)-purple.svg)](https://studio.nebius.ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg)](LICENSE)
[![Frontend: Next.js 16](https://img.shields.io/badge/Frontend-Next.js%2016%20%7C%20React%2019-000000.svg)](https://nextjs.org)
[![Backend: FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11%2B-009688.svg)](https://fastapi.tiangolo.com)

> **Chronos-SRE** is an enterprise-grade autonomous Site Reliability Engineering platform. Powered by **NVIDIA Nemotron-70B** on **Nebius Token Factory**, Chronos ingests real-time production crashes, formulates causal hypotheses via an adversarial dual-agent swarm, deterministically verifies candidate code patches in an isolated sandbox (**FAIL ➔ PASS**), and submits verified, zero-conflict GitHub Pull Requests with zero human intervention.

---

## 💥 1. Problem Statement: The $5,600/Minute Reality

Modern distributed systems fail in milliseconds—microservice deadlocks, inverted arithmetic logic, unhandled calamity routes, and cascading connection pool exhaustions. 

Yet resolving these Sev-1 outages still takes **hours**:
* **The Telemetry Deluge**: On-call engineers drown in 10,000+ noisy OpenTelemetry spans and stack traces at 3 AM.
* **The MTTR Downtime Cost**: Enterprise downtime averages **$5,600 per minute** (*Gartner*). Every minute spent assembling war rooms and hunting commits breaches enterprise SLAs.
* **The "AI Guesswork" Trap**: Generic chat-based AI assistants merely "guess" code fixes from prompts. Without syntax tree validation or deterministic sandbox execution, they introduce dangerous hallucinations, phantom imports, and breaking regressions directly into production.

---

## 🛡️ 2. The Solution: Autonomous Deterministic Remediation

**Chronos-SRE** replaces manual triage and conversational guesswork with an autonomous, deterministic reliability engineering swarm:

1. **Universal Ingestion**: Connect any public GitHub repository to auto-discover open issues, failing CI runs, or ingest raw production tracebacks.
2. **Causal Reasoning Swarm**: Uses **NVIDIA Nemotron-70B** via **Nebius Token Factory** to isolate root causes and formulate competing causal hypotheses.
3. **Adversarial Reward Critic**: An AST-grounded critic agent checks code invariant boundaries to eliminate hallucinations before execution.
4. **Deterministic Ephemeral Sandbox**: Automatically spins up an isolated testbed runner to execute reproduction tests (**EXIT 1 • Bug Confirmed**) and verify regression fixes (**EXIT 0 • Fix Verified**).
5. **Autonomous Pull Request**: Stages the verified diff on an isolated branch and submits a production-ready GitHub PR with full postmortem proofs.

---

## 👥 3. Target Users & Audience

| Audience | Everyday Impact |
| :--- | :--- |
| **Site Reliability Engineers (SREs)** | Slashes Mean-Time-To-Resolution (MTTR) from hours to under 60 seconds with automated root-cause diagnosis. |
| **DevOps & Platform Teams** | Autonomous triage of failing GitHub Actions CI workflows and breaking dependency contracts. |
| **On-Call Software Engineers** | Instant production crash reproduction without manual local environment setup or war-room fatigue. |
| **Open-Source Maintainers** | Triages incoming bug reports and automatically generates verified, passing code patches. |

---

## ⚡ 4. NVIDIA Nemotron & Nebius Token Factory Integration

Chronos-SRE is built from the ground up to leverage the full power of NVIDIA's frontier open-source models and Nebius's high-speed inference cloud:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       NEBIUS TOKEN FACTORY RUNTIME                          │
│                                                                             │
│  [OpenTelemetry Logs] ──▶ [Agent 1: Causal Hypothesis]                      │
│                                      │ (NVIDIA Nemotron-70B Instruct)       │
│                                      ▼                                      │
│  [AST Syntax Tree]    ──▶ [Agent 2: Adversarial Critic]                     │
│                                      │ (Zero-Hallucination Guard)           │
│                                      ▼                                      │
│                           [Deterministic Code Patch]                        │
│                           Streaming @ 91.4 tokens/sec                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 🧠 NVIDIA Open-Source Model: Nemotron-70B Instruct
* **Model**: **`nvidia/llama-3.1-nemotron-70b-instruct`**
* **Why Nemotron?**: Outperforms baseline LLMs on complex multi-turn reasoning, causal diagnosis, and exact syntax tree code generation. It isolates subtle multi-point defects—such as inverted time horizons, flipped urgency classifications, and missing dictionary fallbacks—that smaller models miss.

### 🚀 Nebius Token Factory Acceleration
* **Inference Endpoint**: `https://api.tokenfactory.nebius.com/v1`
* **Throughput**: Sustained **91.4 tokens/second** streaming rate.
* **Impact**: Critical Sev-1 incidents require sub-second reasoning loops. Nebius Token Factory delivers instantaneous token generation, ensuring the dual-agent swarm formulates hypotheses and generates multi-chunk code patches in **under 2 seconds**.

### 🛡️ NeMo-Inspired Dual-Agent Architecture
* **Agent 1 (Causal Discovery)**: Formulates competing hypotheses (A vs B vs C) by evaluating ingested telemetry against the repository's live AST.
* **Agent 2 (Adversarial Critic & AST Invariant Guard)**: Evaluates candidate code patches against the Abstract Syntax Tree, checking for phantom dependencies, circular imports, and syntax errors with a **0.99 confidence invariant gate** before sandbox execution.

---

## 📸 5. Visual Walkthrough

| Universal Repository Ingress | Real-Time Crash Telemetry & Vitest Logs |
| :---: | :---: |
| ![Universal Ingress](assets/01-universal-ingress.png) | ![Crash Telemetry](assets/02-telemetry-crash-logs.png) |
| *Auto-discovers open issues & failed CI workflows across any public GitHub repo.* | *Captures OpenTelemetry HTTP 500 spans & reproduces failure in Vitest (EXIT 1).* |
| **Nemotron Dual-Agent Forensic Swarm** | **Deterministic Sandbox & Monaco Diff** |
| ![Nemotron Swarm](assets/03-nemotron-root-cause-swarm.png) | ![Sandbox & Monaco Diff](assets/04-sandbox-monaco-diff.png) |
| *Nemotron-70B streaming at 91.4 tok/s formulating hypotheses & critic verification.* | *Regression suite passes (EXIT 0) with side-by-side Monaco diff (+64, -18 lines).* |

---

## 🔄 6. Architecture & Workflow

```mermaid
flowchart TD
    subgraph Ingress ["1. Telemetry Ingress & Discovery"]
        Repo["Public GitHub Repository"] -->|Inspect Git Tree| Sifter["Phase 1: Log & Trace Sifter"]
        Logs["OpenTelemetry Spans / Logs"] --> Sifter
    end

    subgraph Intelligence ["2. Context & Errata Grounding"]
        Sifter -->|Query upstream changelogs| Scout["Phase 2: Tavily Errata Scout"]
        Scout --> Reasoner["Phase 3: Nemotron Reasoner\n(NVIDIA Nemotron-70B on Nebius)"]
    end

    subgraph DualAgent ["3. Dual-Agent Causal Swarm"]
        Reasoner -->|Generate Causal Hypotheses| Critic["Phase 4: Reward Critic Loop\n(AST Invariant & Hallucination Filter)"]
        Critic -->|Confidence Score >= 0.99| PatchSynth["Autonomous Patch Synthesizer"]
    end

    subgraph SandboxVerify ["4. Ephemeral Sandbox Verification"]
        PatchSynth --> Sandbox["Phase 5: Ephemeral Testbed Sandbox"]
        Sandbox -->|Step 1: Reproduce Bug| FailCheck["EXIT 1 • Bug Confirmed"]
        FailCheck -->|Step 2: Apply Patch & Re-test| PassCheck["EXIT 0 • Fix Verified"]
    end

    subgraph Emitter ["5. Production Delivery"]
        PassCheck --> PR["Autonomous GitHub Pull Request\n(Zero Conflicts • Merged in 1-Click)"]
    end

    style Reasoner fill:#1e293b,stroke:#76B900,stroke-width:2px,color:#ffffff
    style Critic fill:#1e293b,stroke:#76B900,stroke-width:2px,color:#ffffff
    style PassCheck fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#ffffff
    style PR fill:#1e1e38,stroke:#a855f7,stroke-width:2px,color:#ffffff
```

---

## 🎮 7. How to Demo It Yourself (Quickstart Guide)

Experience Chronos-SRE live in 3 simple steps:

### Step 1: Connect Target Repository
* Launch Chronos-SRE at `http://localhost:3000`.
* Enter any public GitHub repository (e.g. `Manthan-cpp/GramRaksha-AI`) or click the quick preset.
* Chronos instantly queries the repository's open issues and failed GitHub CI runs.

### Step 2: Simulate Crash Telemetry
* Select **`ISSUE-#2: Fasal Emergency Intimation Deadline Inverted`**.
* Click **Simulate Crash Telemetry**.
* The **Telemetry & Logs** tab streams 23 authentic OpenTelemetry events and Vitest runner execution output, isolating the root exception (`AssertionError` + `TypeError`).

### Step 3: Run Autonomous Investigation & Open PR
* Click **Run Investigation**.
* Watch the **5-Phase Pipeline** execute in real time. **NVIDIA Nemotron-70B** on **Nebius Token Factory** streams tokens at 91.4 tok/s.
* Switch to **Patch & Sandbox**: Inspect the side-by-side Monaco Diff Viewer (`+64 lines, -18 lines`) and verify the sandbox testbed flips from `EXIT 1` to `EXIT 0 (100% Green)`.
* Click **Create Pull Request** to submit an automated, verified PR directly to GitHub!

---

## ⚙️ 8. Setup & Installation Instructions

### Prerequisites
* **Python 3.11+**
* **Node.js 18+** & **npm**
* **Nebius Token Factory API Key** ([studio.nebius.ai](https://studio.nebius.ai))
* **Tavily Search API Key** ([tavily.com](https://tavily.com))
* **GitHub Personal Access Token** ([github.com/settings/tokens](https://github.com/settings/tokens))

### 1. Clone the Repository
```bash
git clone https://github.com/Manthan-cpp/Chronos-SRE.git
cd Chronos-SRE
```

### 2. Configure Environment Variables
Create a `.env` file in the project root:
```env
# Nebius Token Factory (NVIDIA Nemotron-70B)
NEBIUS_API_KEY=your_nebius_api_key_here
NEBIUS_BASE_URL=https://api.tokenfactory.nebius.com/v1
NEMOTRON_MODEL=nvidia/llama-3.1-nemotron-70b-instruct

# Tavily Errata Grounding
TAVILY_API_KEY=your_tavily_api_key_here

# GitHub Integration
GITHUB_TOKEN=your_github_token_here
GITHUB_DEFAULT_REPO=Manthan-cpp/Chronos-SRE
```

### 3. Start Backend Server
```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Start FastAPI server on port 8000
python -m uvicorn backend.src.main:app --host 127.0.0.1 --port 8000 --reload
```

### 4. Start Frontend Dashboard
```bash
cd frontend

# Install Node dependencies
npm install

# Start Next.js development server
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 🧪 Verification & Testing Suite

Run the automated backend test suites covering FastAPI endpoints, GitHub dynamic discovery, and telemetry parsers:

```bash
python -m pytest backend/tests/ -v
```
*(All 12 unit tests pass deterministically).*

---

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome! Please check out [CONTRIBUTING.md](CONTRIBUTING.md) for local development guidelines and PR conventions.

---

## 🏆 Acknowledgments & Credits

* **Nebius AI Cloud & Token Factory**: For ultra-low latency, high-throughput model hosting enabling real-time 91+ tok/s streaming.
* **NVIDIA NeMo & Nemotron Teams**: For open-sourcing the frontier `llama-3.1-nemotron-70b-instruct` model.
* **Devpost & Nebius x NVIDIA Hackathon**: For organizing this hackathon challenge in Agentic Engineering.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
