# SYSTEM_DESIGN.md — Chronos-SRE

Technical architecture reference. `PLAN.md` defines what to build and in what order; this file defines **how the components fit together technically, why each architectural decision was made, and how zero-mock deterministic verification is enforced**. Read this before implementing Phases 2–8 of `PLAN.md`.

---

## 1. High-Level Data Flow

```
┌─────────────────┐       ┌──────────────────────┐       ┌────────────────────────┐
│  Target Service │       │   FastAPI Ingress    │       │    Forensic Sifter     │
│  (Real Crash)   │──────▶│   /api/incident/     │──────▶│   Filters 50k logs to  │
│  Logs + Traces  │       │   stream             │       │   offending stacktrace │
└─────────────────┘       └──────────────────────┘       └───────────┬────────────┘
                                                                     │
   ┌─────────────────────────────────────────────────────────────────┴────────┐
   │                                                                          │
   ▼                                                                          ▼
┌────────────────────────┐                                       ┌────────────────────────┐
│ Git AST Diff Inspector │                                       │   Tavily Errata Scout  │
│ Scans recent commits   │                                       │   Searches live GitHub │
│ for semantic mutations │                                       │   issues & release errata│
└──────────┬─────────────┘                                       └────────────┬───────────┘
           │                                                                  │
           └─────────────────────────────┬────────────────────────────────────┘
                                         ▼
                 ┌────────────────────────────────────────────────┐
                 │       Nebius Token Factory Inference API       │
                 │     (nvidia/llama-3.1-nemotron-70b-instruct)   │
                 ├────────────────────────────────────────────────┤
                 │ 1. Hypothesis Generator (Proposes root cause)  │
                 │ 2. Adversarial Reward Critic (Filters hallu.)  │
                 │ 3. Deterministic Test Synthesizer (writes test)│
                 │ 4. Minimal AST Patch Synthesizer               │
                 └───────────────────────┬────────────────────────┘
                                         │
                                         ▼
                 ┌────────────────────────────────────────────────┐
                 │         Ephemeral Execution Sandbox            │
                 │        (Isolated Subprocess / Docker)          │
                 ├────────────────────────────────────────────────┤
                 │ Step A: Execute Repro Test ➔ Confirmed FAIL    │
                 │ Step B: Apply AST Patch in sandbox             │
                 │ Step C: Execute Repro Test ➔ Confirmed PASS    │
                 │ Step D: Execute Full Regression Suite ➔ PASS   │
                 └───────────────────────┬────────────────────────┘
                                         │
                                         ▼
                 ┌────────────────────────────────────────────────┐
                 │       Verified Pull Request Generator          │
                 │  - Emits GitHub PR via Octokit / REST API      │
                 │  - Streams verified telemetry & diff to UI     │
                 └────────────────────────────────────────────────┘
```

**The Core Architectural Principle:** No mock data, no static pre-baked results. Every incident processed by Chronos-SRE originates from a real running software application running under Python/Docker. The agent swarm analyzes real filesystem git commits, issues live HTTP requests to Tavily and Nebius Token Factory, and validates fixes by executing actual `pytest` subprocesses.

---

## 2. Component Responsibilities

### 2.1 Ingress & Forensic Log Sifter
- **Input:** Live stream of unformatted console logs, structured JSON logs, and OpenTelemetry distributed trace spans.
- **Output:** Isolated "Failure Signature" containing exact timestamp, exception stack trace, offending thread/coroutine ID, and correlated HTTP span.
- **Why this step exists:** Production systems produce hundreds of thousands of log lines per minute. Feeding raw log floods directly to an LLM wastes token budget and dilutes context. The Sifter utilizes deterministic regex and heuristic clustering to distill 50,000 log lines down to the essential 5–15 anomaly lines before LLM ingestion.

### 2.2 Git AST Diff Inspector
- **Input:** Target repository git history (latest N commits on the failing branch).
- **Output:** Semantic code changes (classes modified, function signature changes, locking mechanism alterations) extracted via Python's `ast` module.
- **Why it matters:** SREs know that 85% of production outages are triggered by a recent deployment. Correlating the failure signature directly with AST diffs narrows the search space from the entire codebase down to specific modified code blocks.

### 2.3 Tavily Errata & External Scout
- **Input:** External package names and versions extracted from `requirements.txt` / `package.json` that appear in the crash stack trace.
- **Output:** Live web intelligence: recent GitHub issues, CVE disclosures, deprecation notices, or upstream package regressions.
- **Why it matters:** When a bug is caused by a third-party dependency breaking (e.g. `pydantic` v2 migration, upstream network library timeout changes), internal codebase inspection alone is insufficient. Tavily fetches real-time external ground truth that was published after the LLM's training cutoff.

### 2.4 Nemotron Dual-Agent Reasoning & Reward Critic
- **Model:** `nvidia/llama-3.1-nemotron-70b-instruct` served via **Nebius Token Factory**.
- **Role 1 (Hypothesis Generator):** Formulates 3 concrete, technically grounded hypotheses explaining how the git commit + external errata caused the failure signature.
- **Role 2 (Adversarial Critic):** Uses Nemotron's reward-guided critique to rigorously cross-examine each hypothesis against the code AST. It discards hallucinations and selects the single deterministic root cause.
- **Role 3 (Test & Patch Synthesizer):** Generates:
  1. A standalone reproduction test (`test_repro.py`) that deterministically asserts the failure.
  2. A clean, minimal code patch that resolves the issue without modifying public interfaces.

### 2.5 Ephemeral Execution Sandbox
- **Input:** Target repository source code, `test_repro.py`, and proposed patch.
- **Execution Lifecycle:**
  1. Spawns an isolated Python `venv` or ephemeral container.
  2. Runs `pytest test_repro.py` ➔ **Must exit with returncode != 0** (proves the bug exists and is reproducible).
  3. Applies the proposed patch using `git apply`.
  4. Runs `pytest test_repro.py` ➔ **Must exit with returncode == 0** (proves the patch fixes the failure).
  5. Runs the project's existing test suite ➔ **Must exit with returncode == 0** (proves zero regressions).
- **Safety Guarantee:** If any step fails, the patch is rejected, feedback is returned to the Nemotron Critic loop, and a re-attempt is triggered. No unverified code is ever surfaced to the user.

### 2.6 Verified Pull Request Emitter
- **Input:** Validated patch, test output logs, and root-cause explanation.
- **Output:** Automated GitHub Pull Request containing:
  - Incident summary and root-cause analysis.
  - The deterministic reproduction test case.
  - The code fix.
  - Real sandbox execution logs proving regression tests pass.

---

## 3. Dual-Agent Nemotron Reasoning Protocol

To maximize the unique strengths of NVIDIA's Nemotron model family, we implement a structured prompt-debate cycle:

```
[Sifter Telemetry + AST Diff + Tavily Context]
                    │
                    ▼
┌────────────────────────────────────────────────────────┐
│ AGENT 1: Nemotron Hypothesis Generator                 │
│ Prompt: Systematically analyze causality. Propose 3     │
│ root-cause hypotheses with file paths and line numbers.│
└───────────────────┬────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────┐
│ AGENT 2: Nemotron Adversarial Critic                   │
│ Prompt: Challenge each hypothesis. Can this state be   │
│ reached given the AST? Score each 0.0 - 1.0.           │
│ Reject any ungrounded theory.                          │
└───────────────────┬────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────┐
│ AGENT 3: Nemotron Test & Patch Synthesizer             │
│ Prompt: For the winning hypothesis, emit ONLY a valid  │
│ pytest function and unified git diff.                  │
└────────────────────────────────────────────────────────┘
```

---

## 4. Ephemeral Sandbox Architecture

The sandbox runs locally or inside lightweight Docker containers to guarantee zero cloud compute cost:

```python
# Conceptual Execution Loop in backend/src/sandbox/runner.py
class SandboxRunner:
    def __init__(self, repo_dir: str):
        self.repo_dir = repo_dir

    def run_command(self, cmd: list[str]) -> subprocess.CompletedProcess:
        return subprocess.run(
            cmd,
            cwd=self.repo_dir,
            capture_output=True,
            text=True,
            timeout=30 # Prevent infinite loops
        )

    def verify_patch(self, repro_test_code: str, patch_diff: str) -> VerificationResult:
        # Step 1: Write repro test
        self.write_file("tests/test_chronos_repro.py", repro_test_code)
        
        # Step 2: Confirm failure
        initial_test = self.run_command(["pytest", "tests/test_chronos_repro.py"])
        if initial_test.returncode == 0:
            return VerificationResult(success=False, reason="Repro test did not fail on buggy code")

        # Step 3: Apply patch
        self.apply_patch(patch_diff)

        # Step 4: Confirm pass
        patched_test = self.run_command(["pytest", "tests/test_chronos_repro.py"])
        if patched_test.returncode != 0:
            return VerificationResult(success=False, reason="Patch failed to resolve repro test")

        # Step 5: Regression check
        full_suite = self.run_command(["pytest", "tests/"])
        return VerificationResult(success=(full_suite.returncode == 0), logs=patched_test.stdout)
```

---

## 5. API Contracts & Real-Time SSE Protocol

### 5.1 Trigger Incident Diagnosis
```http
POST /api/incident/trigger
Content-Type: application/json

{
  "scenarioId": "ASYNC-DEADLOCK-402",
  "targetRepoPath": "scenarios/async_worker_deadlock",
  "autoCreatePR": false
}
```

### 5.2 Real-time Server-Sent Events (SSE) Stream
```http
GET /api/incident/stream?sessionId=sess_89123
Accept: text/event-stream
```

**SSE Event Payloads:**
- `event: telemetry` — Emits parsed crash stack trace and trace IDs.
- `event: agent_state` — Emits current active agent (`SIFTING`, `RESEARCHING`, `REASONING`, `SANDBOXING`, `VERIFIED`).
- `event: token_stream` — Live streaming markdown tokens from Nemotron with instant token counter (`tokens_per_second`).
- `event: sandbox_exec` — Live terminal output from `pytest` execution (`FAIL` ➔ `PASS`).
- `event: resolution` — Final unified git diff, PR URL, and summary report.

---

## 6. Nebius Token Factory Economics & Latency Budget

### Why Nebius Token Factory is Critical:
A full incident resolution requires ~4,000 to 7,000 tokens generated across the multi-agent debate (log analysis + critique + test generation + patch synthesis). 
- **On standard closed APIs:** Latency is 15–25 tokens/sec, resulting in a total runtime of > 90 seconds (too slow for a live hackathon demo or 3 AM incident triage).
- **On Nebius Token Factory:** Throughput reaches **100–160+ tokens/sec**. The complete 4-step multi-agent reasoning loop completes in **under 20 seconds**.

### End-to-End Latency Budget:

| Pipeline Stage | Target Latency | Notes |
| :--- | :--- | :--- |
| Log Ingress & AST Sifting | ~500ms | Local deterministic parsing |
| Tavily Live Web Lookup | ~1.5s – 2.5s | Live external GitHub/web search |
| Nemotron Hypothesis & Critic | ~10s – 14s | Nebius Token Factory (~140 tok/s) |
| Ephemeral Sandbox Execution | ~3s – 5s | Local `pytest` subprocess run |
| Frontend Render & PR Prep | ~300ms | Immediate UI update |
| **Total End-to-End Duration** | **~18s – 25s** | **Within the gold standard for live demo** |

---

## 7. Security, Privacy & Data Handling

- **Zero-Retention Telemetry:** Customer logs and stack traces are processed entirely in-memory and discarded upon session completion.
- **Environment Scrubbing:** Secrets, API keys, and sensitive tokens in log traces are automatically stripped via regex before being dispatched to the LLM or Tavily APIs.
- **Sandbox Containment:** All code execution occurs in dedicated, ephemeral scratch directories with a strict 30-second subprocess timeout to prevent infinite loops, fork bombs, or network exfiltration.

---

## 8. Known Architectural Risks & Mitigations

1. **Flaky Concurrency Tests in Sandbox:** Concurrency bugs (e.g. race conditions) may not trigger 100% of the time on single-threaded test runners.
   * *Mitigation:* The synthesized reproduction test uses deterministic stress hooks (e.g. `asyncio.gather` with forced yield points) to guarantee reliable reproduction.
2. **Third-Party API Rate Limits:** Tavily or Nebius API spikes.
   * *Mitigation:* Exponential backoff retry handler wrapped inside the agent state machine with client-side status banners.
3. **Complex Multi-File Bug Spans:** A bug that spans across 10 different files.
   * *Mitigation:* Focus the initial SRE scope on targeted bug modules pinpointed by the AST Diff Inspector, ensuring precision and high testability.
