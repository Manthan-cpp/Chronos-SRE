import { IncidentScenario } from "../types/incident";

export const PRESET_SCENARIOS: IncidentScenario[] = [
  {
    id: "async_deadlock",
    code: "ASYNC-DEADLOCK-402",
    title: "Reentrant Lock Deadlock in Task Worker Pool",
    severity: "CRITICAL",
    service: "worker-queue-service",
    category: "Concurrency",
    description: "Production async worker threads are deadlocking when handling batched priority tasks due to unshielded reentrant mutex locks.",
    failingFile: "src/workers/queue_processor.py",
    sampleLogs: [
      "[2026-10-27 14:12:01.104] [INFO] [worker.pool] Spawning 16 async worker tasks on partition: 4",
      "[2026-10-27 14:12:02.341] [WARN] [worker.pool] WorkerThread-3 acquired lock_A, awaiting lock_B...",
      "[2026-10-27 14:12:02.342] [WARN] [worker.pool] WorkerThread-7 acquired lock_B, awaiting lock_A...",
      "[2026-10-27 14:12:15.002] [FATAL] [healthcheck] Liveness probe FAILED. 16/16 coroutines blocked > 12000ms",
      "[2026-10-27 14:12:15.003] [CRITICAL] [healthcheck] DeadlockDetectedError: Circular dependency on MutexLock(0x7fff) and MutexLock(0x8aaa)",
      "[2026-10-27 14:12:15.004] [FATAL] [service] Process terminating with SIGABRT (Exit code 134)"
    ],
    sampleTrace: {
      traceId: "7f8a912b3c4d5e6f",
      spanId: "9901ad42c",
      endpoint: "/api/v2/tasks/batch-dispatch",
      durationMs: 12890,
      httpStatus: 504
    },
    sampleCommit: {
      hash: "a91f42d",
      author: "alex.kumar@hypercloud.io",
      message: "perf: parallelize priority queue batch dispatch with dual mutex locks",
      timestamp: "18 minutes ago"
    },
    diagnosticReport: {
      whatHappened: "High-priority batch jobs in the background worker pool froze completely during peak traffic. All 16 async worker tasks stopped responding to liveness health checks, triggering an automatic SIGABRT container crash and leaving the task queue stalled.",
      whyItHappened: "A classic circular mutex deadlock occurred between two asynchronous processing pipelines. Pipeline Alpha acquired Lock A and waited for Lock B to become free. Simultaneously, Pipeline Beta acquired Lock B and waited for Lock A. Because neither pipeline released its acquired lock and neither specified a timeout, both worker coroutines blocked each other permanently, starving all subsequent requests.",
      impactedServices: [
        {
          name: "worker-queue-service",
          role: "Background Async Task Execution",
          status: "CRITICAL",
          latency: "12,890ms (Timed Out)"
        },
        {
          name: "order-orchestrator",
          role: "Upstream Microservice Coordinator",
          status: "DEGRADED",
          latency: "5,020ms (HTTP 504)"
        },
        {
          name: "notification-relay",
          role: "Customer Event Dispatcher",
          status: "DEGRADED",
          latency: "3,400ms (High Queue Lag)"
        }
      ],
      businessImpact: {
        severity: "P0 • Production Outage",
        throughputImpact: "100% batch ingestion stalled (~4,800 events/min dropped)",
        slaBreachRisk: "Immediate 99.9% availability SLA violation",
        financialRisk: "Estimated $3,500/min in delayed fulfillment"
      }
    },
    fixReport: {
      summary: "Enforces strict global lock ordering (Lock Alpha must ALWAYS be acquired before Lock Beta across all code paths) to mathematically eliminate the circular dependency condition.",
      architecturalStrategy: "Global Deterministic Lock Hierarchy",
      steps: [
        {
          phase: "Phase 1",
          title: "Forensic Root Cause Pinpointed",
          description: "Nemotron AST engine isolated scenarios/async_deadlock/worker.py lines 32-35. Inverted lock acquisition (acquiring Lock Beta followed by Lock Alpha) was identified as the catalyst for the circular deadlock.",
          badge: "AST Verified"
        },
        {
          phase: "Phase 2",
          title: "Code Architecture Mutation",
          description: "Mutated process_pipeline_beta to acquire Lock Alpha FIRST, and then Lock Beta. This guarantees both pipelines request shared resources in an identical deterministic order, making deadlocks impossible.",
          badge: "Safe AST Transform"
        },
        {
          phase: "Phase 3",
          title: "Deterministic Sandbox Verification",
          description: "Executed pytest under a 50-coroutine concurrent load simulation. Pre-patch test confirmed deadlocks (EXIT 1 • Bug Confirmed). Post-patch test completed 1,000 batch operations in 0.08s with zero deadlocks (EXIT 0 • Fix Verified).",
          badge: "EXIT 0 Verified"
        },
        {
          phase: "Phase 4",
          title: "Automated PR & Safe Rollout",
          description: "Generated pull request on branch fix/nemotron-async-deadlock-402. Zero schema or database migrations required; safe for immediate blue/green rollout with zero downtime.",
          badge: "PR Ready"
        }
      ]
    }
  },
  {
    id: "upstream_break",
    code: "UPSTREAM-BREAK-501",
    title: "Breaking Schema Parameter in Upstream HTTP Client",
    severity: "HIGH",
    service: "payment-gateway-relay",
    category: "Dependency",
    description: "Third-party HTTP client updated to major version 3.0.0; keyword argument 'verify_ssl' was renamed to 'ssl_verify' causing immediate runtime crashes.",
    failingFile: "src/clients/gateway_relay.py",
    sampleLogs: [
      "[2026-10-27 14:20:10.012] [INFO] [relay.init] Client initialized with package httpx-upstream v3.0.1",
      "[2026-10-27 14:20:11.890] [ERROR] [relay.dispatch] Failed to sign egress payload for tx_id: 991823",
      "[2026-10-27 14:20:11.891] [ERROR] [relay.dispatch] TypeError: RequestConfig.__init__() got an unexpected keyword argument 'verify_ssl'",
      "[2026-10-27 14:20:11.892] [CRITICAL] [fastapi] Unhandled 500 in POST /v1/settlements - 48 requests failed in 3s"
    ],
    sampleTrace: {
      traceId: "4b9910c2837f1a9d",
      spanId: "128fa8910",
      endpoint: "/v1/settlements/execute",
      durationMs: 412,
      httpStatus: 500
    },
    sampleCommit: {
      hash: "88bf901",
      author: "sarah.chen@finops.io",
      message: "chore(deps): bump httpx-upstream from 2.8.4 to 3.0.1",
      timestamp: "45 minutes ago"
    },
    diagnosticReport: {
      whatHappened: "Outbound payment settlement calls immediately failed with HTTP 500 errors right after an automated scheduled dependency bump of the third-party HTTP client library.",
      whyItHappened: "The upstream library released breaking major version 3.0.0, which renamed the constructor parameter 'strict_mode=True' to 'validation_level=\"strict\"'. When the payment relay tried to initiate an outbound request, Python raised an unhandled TypeError: __init__() got an unexpected keyword argument.",
      impactedServices: [
        {
          name: "payment-gateway-relay",
          role: "Outbound Merchant Settlement API",
          status: "CRITICAL",
          latency: "412ms (HTTP 500)"
        },
        {
          name: "checkout-orchestrator",
          role: "Core Checkout Flow Service",
          status: "CRITICAL",
          latency: "580ms (Failed Transactions)"
        },
        {
          name: "accounting-sync",
          role: "Financial Ledger Sync Pipeline",
          status: "DEGRADED",
          latency: "1,200ms (High Retry Volume)"
        }
      ],
      businessImpact: {
        severity: "P0 • Payment Processing Blocked",
        throughputImpact: "48 settlement transactions failing every 3 seconds",
        slaBreachRisk: "Severe violation of core payment reliability SLA",
        financialRisk: "Immediate merchant transaction revenue blockage"
      }
    },
    fixReport: {
      summary: "Upgraded the HTTP client initialization to use modern 'validation_level=\"strict\"' parameter syntax, restoring SSL verification and outbound HTTP connectivity.",
      architecturalStrategy: "Upstream Schema Harmonization",
      steps: [
        {
          phase: "Phase 1",
          title: "Tavily Scout Changelog Discovery",
          description: "Autonomous Tavily agent retrieved the official v3.0.0 release notes from GitHub, confirming that strict_mode was deprecated in v2.9 and removed in v3.0.0.",
          badge: "Tavily Grounded"
        },
        {
          phase: "Phase 2",
          title: "Code Syntax Modernization",
          description: "Replaced deprecated strict_mode=True with validation_level=\"strict\" in scenarios/upstream_break/client.py, maintaining strict SSL validation.",
          badge: "Clean Patch"
        },
        {
          phase: "Phase 3",
          title: "Deterministic Sandbox Verification",
          description: "Ran mock payment gateway integration suite. Pre-patch test reproduced runtime crash (EXIT 1 • Bug Confirmed). Post-patch test verified successful TLS handshake and valid settlement response (EXIT 0 • Fix Verified).",
          badge: "EXIT 0 Verified"
        },
        {
          phase: "Phase 4",
          title: "Automated PR & Safe Rollout",
          description: "Generated pull request on branch fix/nemotron-upstream-break-501 with dependency pin. Safe for immediate canary deployment.",
          badge: "PR Ready"
        }
      ]
    }
  },
  {
    id: "pool_leak",
    code: "POOL-LEAK-503",
    title: "Async Database Session Leak in Error Handler",
    severity: "CRITICAL",
    service: "user-ledger-api",
    category: "Resource Exhaustion",
    description: "Async database sessions are not released inside transaction rollback blocks, exhausting the connection pool limit under burst traffic.",
    failingFile: "src/database/session_manager.py",
    sampleLogs: [
      "[2026-10-27 14:31:00.120] [INFO] [db.pool] Pool status: 18/20 connections checked out",
      "[2026-10-27 14:31:01.401] [WARN] [db.pool] Pool status: 20/20 connections checked out. Queue size: 14",
      "[2026-10-27 14:31:03.990] [ERROR] [db.pool] TimeoutError: QueuePool limit of size 20 overflow 10 reached, connection timed out, timeout 5.00",
      "[2026-10-27 14:31:04.001] [CRITICAL] [service] 503 Service Unavailable: Database connection pool starved"
    ],
    sampleTrace: {
      traceId: "1f2e3d4c5b6a7980",
      spanId: "665544332",
      endpoint: "/api/v1/ledger/balance",
      durationMs: 5040,
      httpStatus: 503
    },
    sampleCommit: {
      hash: "d4e21a0",
      author: "marcus.vance@ledgertech.com",
      message: "refactor: custom error interceptor for ledger mutations",
      timestamp: "2 hours ago"
    },
    diagnosticReport: {
      whatHappened: "The User Ledger API degraded severely during a traffic surge, returning HTTP 503 errors and timing out after 5,000ms. Database CPU was healthy, but no new queries could execute.",
      whyItHappened: "Database sessions created for ledger operations were never returned to the connection pool when an unexpected validation exception occurred. While the transaction was rolled back, the underlying connection remained checked out, eventually exhausting the pool limit of 20 connections.",
      impactedServices: [
        {
          name: "user-ledger-api",
          role: "Core Financial Balance Service",
          status: "CRITICAL",
          latency: "5,040ms (Timeout)"
        },
        {
          name: "balance-query-service",
          role: "Read-Side Ledger Queries",
          status: "DEGRADED",
          latency: "4,890ms (Queued Requests)"
        },
        {
          name: "audit-worker",
          role: "Ledger Consistency Validator",
          status: "HEALTHY",
          latency: "14ms (Isolated Pool)"
        }
      ],
      businessImpact: {
        severity: "P1 • Service Starvation",
        throughputImpact: "Pool starved: 100% of mutation traffic rejected",
        slaBreachRisk: "API p99 latency breached > 5,000ms",
        financialRisk: "Ledger transaction timeouts causing repeated client retries"
      }
    },
    fixReport: {
      summary: "Refactored session lifecycle to use an async context manager with guaranteed cleanup, ensuring every checked-out connection is returned to the pool even during errors.",
      architecturalStrategy: "Deterministic RAII Resource Cleanup",
      steps: [
        {
          phase: "Phase 1",
          title: "Connection Leak Audit",
          description: "Identified that exception catch blocks in src/database/session_manager.py called rollback() without an enclosing finally: await session.close().",
          badge: "AST Verified"
        },
        {
          phase: "Phase 2",
          title: "Async Context Manager Pattern",
          description: "Wrapped the session scope in an async generator context manager (async with get_session()), ensuring automatic release regardless of execution outcome.",
          badge: "Safe Refactor"
        },
        {
          phase: "Phase 3",
          title: "Deterministic Sandbox Verification",
          description: "Ran pool stress test simulating 100 consecutive transaction errors. Pre-patch test ran out of connections and timed out (EXIT 1 • Bug Confirmed). Post-patch test recycled all 20 connections successfully (EXIT 0 • Fix Verified).",
          badge: "EXIT 0 Verified"
        },
        {
          phase: "Phase 4",
          title: "Automated PR & Safe Rollout",
          description: "Generated pull request on branch fix/nemotron-pool-leak-503. Verified zero connection leaks under 500 QPS burst.",
          badge: "PR Ready"
        }
      ]
    }
  }
];
