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
    }
  }
];
