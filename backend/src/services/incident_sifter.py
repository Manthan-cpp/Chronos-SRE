"""
Incident Sifter Engine for Chronos-SRE.
Supports Dual-Mode Incident Ingestion:
- Mode B: Deterministic regex parsing of user-provided production stacktraces & exception logs.
- Mode A: Automatic conversion of GitHub issues and failed CI workflow runs into SRE incident envelopes.
"""

import re
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger("incident_sifter")

class IncidentSifter:
    """
    Parses and matches production error logs, stack traces, and GitHub issues
    against a target repository's file tree.
    """

    PYTHON_FILE_RE = re.compile(r'File\s+"([^"]+)",\s+line\s+(\d+)(?:,\s+in\s+([a-zA-Z0-9_<>\.]+))?')
    JS_TS_FILE_RE = re.compile(r'(?:at\s+(?:[^\s()]+\s+\()?)?([a-zA-Z0-9_\-\./\\]+\.(?:ts|tsx|js|jsx|py|go|rs)):(\d+)(?::(\d+))?\)?')
    EXCEPTION_RE = re.compile(r'([a-zA-Z0-9_]+Error|[a-zA-Z0-9_]+Exception|AssertionError|FATAL|CRITICAL):\s*(.*)')

    def _find_matching_file(self, candidate_path: str, repo_tree: List[str]) -> Optional[str]:
        """Matches a file path from a stacktrace against the repository file tree."""
        if not candidate_path:
            return None
        
        # Normalize slashes
        clean_cand = candidate_path.replace("\\", "/").strip("./")
        
        # 1. Exact match
        if clean_cand in repo_tree:
            return clean_cand

        # 2. Suffix match (e.g. '/app/src/utils.py' matches 'src/utils.py')
        for tree_file in repo_tree:
            if clean_cand.endswith(tree_file) or tree_file.endswith(clean_cand):
                return tree_file

        # 3. Basename match
        cand_base = clean_cand.split("/")[-1]
        for tree_file in repo_tree:
            if tree_file.split("/")[-1] == cand_base:
                return tree_file

        return None

    def parse_user_stacktrace(
        self,
        raw_trace: str,
        repo_tree: List[str],
        repo_name: str = "target-repo"
    ) -> Optional[Dict[str, Any]]:
        """
        Mode B: Parses user-provided stacktrace / error log, extracting failing file,
        line number, exception type, and callstack context.
        """
        if not raw_trace or not raw_trace.strip():
            return None

        lines = raw_trace.strip().splitlines()
        offending_file: Optional[str] = None
        offending_line: int = 1
        exception_type: str = "RuntimeError"
        error_message: str = "Unhandled exception detected in execution log"

        # 1. Search for Python style stack traces
        py_matches = list(self.PYTHON_FILE_RE.finditer(raw_trace))
        if py_matches:
            # The last match in Python stack traces is usually the offending line
            last_match = py_matches[-1]
            raw_file = last_match.group(1)
            offending_line = int(last_match.group(2))
            offending_file = self._find_matching_file(raw_file, repo_tree) or raw_file

        # 2. Search for JS/TS style stack traces if no Python match
        if not offending_file:
            js_matches = list(self.JS_TS_FILE_RE.finditer(raw_trace))
            for m in js_matches:
                raw_file = m.group(1)
                matched = self._find_matching_file(raw_file, repo_tree)
                if matched:
                    offending_file = matched
                    offending_line = int(m.group(2))
                    break

        # 3. Extract Exception Name & Message
        for line in reversed(lines):
            ex_match = self.EXCEPTION_RE.search(line)
            if ex_match:
                exception_type = ex_match.group(1)
                error_message = ex_match.group(2).strip() or line.strip()
                break
            elif "Error" in line or "Exception" in line or "Failed" in line:
                parts = line.strip().split(":", 1)
                exception_type = parts[0].strip()
                error_message = parts[1].strip() if len(parts) > 1 else line.strip()
                break

        # Fallback file if not matched from tree
        if not offending_file:
            # Pick primary entry point from repo tree if available
            candidates = [f for f in repo_tree if any(f.endswith(ext) for ext in [".py", ".ts", ".tsx", ".js"])]
            offending_file = candidates[0] if candidates else "src/index.py"

        incident_code = f"INGEST-{abs(hash(raw_trace)) % 900 + 100}"

        return {
            "id": incident_code.lower(),
            "code": incident_code,
            "title": f"Production Crash: {exception_type} in {offending_file.split('/')[-1]}",
            "service": repo_name.split("/")[-1],
            "failingFile": offending_file,
            "failingLine": offending_line,
            "exceptionType": exception_type,
            "errorMessage": error_message,
            "description": f"User-ingested production error log indicating fatal {exception_type} at line {offending_line} of {offending_file}.",
            "stackTrace": raw_trace.strip(),
            "sourceMode": "manual_stacktrace",
            "diagnosticReport": {
                "whatHappened": f"A production runtime exception ({exception_type}: {error_message}) halted execution in {offending_file} at line {offending_line}.",
                "whyItHappened": f"Analysis of the stacktrace indicates unhandled control flow or invalid state leading to {exception_type}.",
                "businessImpact": {
                    "severity": "P0 • Critical Outage",
                    "throughputImpact": "Production request failure observed on active workflow",
                    "slaBreachRisk": "Elevated - requires deterministic remediation"
                },
                "impactedServices": [
                    {"name": repo_name.split("/")[-1], "status": "DEGRADED"}
                ]
            },
            "fixReport": {
                "summary": f"Remediate {exception_type} in {offending_file} with non-breaking guards and defensive error handling.",
                "architecturalStrategy": f"Deterministic Exception Handling & Defensive AST Guarding",
                "steps": [
                    {"phase": "PHASE 1", "title": "Syntax & Call Hierarchy Analysis", "description": f"Inspect AST around line {offending_line} in {offending_file}."},
                    {"phase": "PHASE 2", "title": "Defensive State Enforcement", "description": "Wrap risky execution in safe guard clauses without regressions."},
                    {"phase": "PHASE 3", "title": "AST Static Validation", "description": "Ensure 100% syntax compliance and zero phantom import dependencies."}
                ]
            }
        }

    def sift_github_issues_and_ci(
        self,
        issues: List[Dict[str, Any]],
        ci_runs: List[Dict[str, Any]],
        repo_tree: List[str],
        repo_name: str = "target-repo"
    ) -> List[Dict[str, Any]]:
        """
        Mode A: Transforms GitHub issues and failed CI workflow runs into structured
        incident scenarios.
        """
        scenarios: List[Dict[str, Any]] = []

        # 1. Transform Open GitHub Issues
        for issue in issues:
            body = issue.get("body", "")
            title = issue.get("title", "")
            num = issue.get("number", 1)

            # Detect if issue references any file from repo tree
            matched_file = None
            for tree_file in repo_tree:
                base = tree_file.split("/")[-1]
                if base in body or base in title:
                    matched_file = tree_file
                    break
            
            if not matched_file:
                # Default to first non-config source file
                candidates = [f for f in repo_tree if any(f.endswith(ext) for ext in [".py", ".ts", ".tsx", ".js"])]
                matched_file = candidates[0] if candidates else "src/index.py"

            raw_labels = issue.get("labels", [])
            label_names = [l if isinstance(l, str) else l.get("name", "") for l in raw_labels]
            is_p0 = any("bug" in l.lower() or "critical" in l.lower() or "crash" in l.lower() for l in label_names)

            scenarios.append({
                "id": f"gh-issue-{num}",
                "code": f"ISSUE-#{num}",
                "title": f"GitHub Issue #{num}: {title}",
                "service": repo_name.split("/")[-1],
                "failingFile": matched_file,
                "failingLine": 1,
                "exceptionType": "GitHubIssueBug",
                "errorMessage": title,
                "description": (body[:250] + "...") if len(body) > 250 else (body or title),
                "stackTrace": f"# Reported in GitHub Issue #{num} ({issue.get('html_url')})\n\n{body or title}",
                "sourceMode": "github_issue",
                "diagnosticReport": {
                    "whatHappened": f"GitHub Issue #{num} reported: {title}",
                    "whyItHappened": f"Defect reported by repository contributors impacting target module {matched_file}.",
                    "businessImpact": {
                        "severity": "P0 • Production Outage" if is_p0 else "P1 • High Risk",
                        "throughputImpact": "Feature degradation reported in active codebase",
                        "slaBreachRisk": "Medium - Open Issue awaiting automated resolution"
                    },
                    "impactedServices": [
                        {"name": repo_name.split("/")[-1], "status": "IMPACTED"}
                    ]
                },
                "fixReport": {
                    "summary": f"Implement architectural fix addressing GitHub Issue #{num} in {matched_file}.",
                    "architecturalStrategy": "Issue-Driven Structural Remediation",
                    "steps": [
                        {"phase": "PHASE 1", "title": "Issue Requirement Extraction", "description": f"Extract defect criteria from issue #{num}."},
                        {"phase": "PHASE 2", "title": "Target Code Refactoring", "description": f"Apply safe structural adjustments in {matched_file}."},
                        {"phase": "PHASE 3", "title": "Verification & PR Generation", "description": "Stage verified diff for automated pull request linking issue."}
                    ]
                }
            })

        # 2. Transform Failed CI Workflows
        for run in ci_runs:
            run_id = run.get("run_id")
            name = run.get("name", "CI Workflow")
            branch = run.get("head_branch", "main")
            
            candidates = [f for f in repo_tree if "test" in f.lower() or any(f.endswith(ext) for ext in [".py", ".ts", ".tsx"])]
            target_file = candidates[0] if candidates else "tests/test_main.py"

            scenarios.append({
                "id": f"ci-fail-{run_id}",
                "code": f"CI-RUN-{str(run_id)[-4:]}",
                "title": f"Failed CI Workflow: {name} ({branch})",
                "service": repo_name.split("/")[-1],
                "failingFile": target_file,
                "failingLine": 1,
                "exceptionType": "ContinuousIntegrationFailure",
                "errorMessage": f"GitHub Actions workflow '{name}' failed with status {run.get('conclusion')}",
                "description": f"Automated CI build failure detected on branch '{branch}' (commit {run.get('head_sha')}).",
                "stackTrace": f"# GitHub Actions Workflow Run Failed: {name}\n# Run URL: {run.get('html_url')}\n# Branch: {branch}\n# Conclusion: {run.get('conclusion')}",
                "sourceMode": "github_ci",
                "diagnosticReport": {
                    "whatHappened": f"GitHub Actions workflow '{name}' failed on branch '{branch}'.",
                    "whyItHappened": "Test suite assertion failure or compilation break triggered non-zero exit code during CI build.",
                    "businessImpact": {
                        "severity": "P0 • Build Pipeline Stalled",
                        "throughputImpact": "Continuous integration and deployments blocked",
                        "slaBreachRisk": "High - Blocked release pipeline"
                    },
                    "impactedServices": [
                        {"name": repo_name.split("/")[-1], "status": "CI_FAILED"}
                    ]
                },
                "fixReport": {
                    "summary": f"Fix broken assertions and ensure clean pass for workflow '{name}'.",
                    "architecturalStrategy": "CI Regression Healing",
                    "steps": [
                        {"phase": "PHASE 1", "title": "CI Failure Log Sifting", "description": f"Isolate failing step in workflow '{name}'."},
                        {"phase": "PHASE 2", "title": "Patch Synthesization", "description": f"Synthesize regression patch for {target_file}."},
                        {"phase": "PHASE 3", "title": "Verification", "description": "Verify code changes pass static linting and tests."}
                    ]
                }
            })

        return scenarios

    def generate_candidate_targets(
        self,
        repo_tree: List[str],
        repo_name: str = "target-repo"
    ) -> List[Dict[str, Any]]:
        """
        Fallback when repo has 0 open issues and 0 CI failures:
        Presents key source files from repository tree for on-demand forensic inspection.
        """
        scenarios: List[Dict[str, Any]] = []
        source_files = [f for f in repo_tree if any(f.endswith(ext) for ext in [".py", ".ts", ".tsx", ".js", ".go"]) and not f.startswith(".")]

        # Take top 3 candidate files
        for i, file_path in enumerate(source_files[:3]):
            scenarios.append({
                "id": f"inspect-file-{i+1}",
                "code": f"CODE-AUDIT-{i+1:02d}",
                "title": f"Forensic Code Analysis: {file_path.split('/')[-1]}",
                "service": repo_name.split("/")[-1],
                "failingFile": file_path,
                "failingLine": 1,
                "exceptionType": "PotentialArchitecturalFlaw",
                "errorMessage": f"Autonomous structural audit of {file_path}",
                "description": f"Live source code audit for concurrency pitfalls, unhandled exceptions, and resource leaks in {file_path}.",
                "stackTrace": f"# Target Source File: {file_path}\n# Repository: {repo_name}\n# Ready for autonomous AST inspection & Nemotron reasoning.",
                "sourceMode": "code_audit",
                "diagnosticReport": {
                    "whatHappened": f"No open GitHub issues detected. Active target selected: {file_path}.",
                    "whyItHappened": "On-demand structural code analysis to identify performance bottlenecks and exception risks.",
                    "businessImpact": {
                        "severity": "P2 • Preventive Optimization",
                        "throughputImpact": "Proactive hardening against future production outages",
                        "slaBreachRisk": "Low - Proactive Remediation"
                    },
                    "impactedServices": [
                        {"name": repo_name.split("/")[-1], "status": "HEALTHY"}
                    ]
                },
                "fixReport": {
                    "summary": f"Apply defensive hardening and structural optimizations to {file_path}.",
                    "architecturalStrategy": "Defensive Code Hardening",
                    "steps": [
                        {"phase": "PHASE 1", "title": "AST Parsing", "description": f"Parse AST syntax tree for {file_path}."},
                        {"phase": "PHASE 2", "title": "Defensive Enhancements", "description": "Formulate safe, non-breaking architectural improvements."},
                        {"phase": "PHASE 3", "title": "Pull Request Staging", "description": "Stage verified enhancements for review."}
                    ]
                }
            })

        return scenarios

incident_sifter = IncidentSifter()
