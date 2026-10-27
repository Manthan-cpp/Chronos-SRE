"""
Telemetry Sifter and Log Normalizer.
Extracts high-signal root failure signatures from raw logs and stack traces.
"""

import re
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, asdict

@dataclass
class SiftedIncident:
    scenario_id: str
    service: str
    exception_type: str
    error_message: str
    offending_file: Optional[str]
    offending_line: Optional[int]
    stack_trace_snippet: str
    raw_lines_count: int

class TelemetrySifter:
    def sift(self, scenario_id: str, service: str, raw_output: str) -> SiftedIncident:
        lines = raw_output.splitlines()
        exception_type = "UnknownException"
        error_message = "Unexpected runtime failure"
        offending_file = None
        offending_line = None
        stack_lines: List[str] = []

        # Find Exception lines (e.g. `TypeError: ...`, `AssertionError: ...`, `PoolExhaustedError: ...`)
        for line in reversed(lines):
            line_str = line.strip()
            if any(exc in line_str for exc in ["AssertionError:", "TypeError:", "PoolExhaustedError:", "TimeoutError:", "RuntimeError:"]):
                parts = line_str.split(":", 1)
                exception_type = parts[0].strip().replace("E ", "").strip()
                error_message = parts[1].strip() if len(parts) > 1 else line_str
                break

        # Find offending file and line number
        for line in lines:
            # Matches formats like `scenarios/upstream_break/client.py:32: TypeError` or `file.py: line 32`
            match = re.search(r'([\w\\/_-]+\.py):(\d+)', line)
            if match and "test_" not in match.group(1):
                offending_file = match.group(1).replace("\\", "/")
                offending_line = int(match.group(2))
            elif match and not offending_file:
                offending_file = match.group(1).replace("\\", "/")
                offending_line = int(match.group(2))

            if "in " in line or "Traceback" in line or line.startswith("E "):
                stack_lines.append(line.strip())

        snippet = "\n".join(stack_lines[-12:]) if stack_lines else raw_output[-500:]

        return SiftedIncident(
            scenario_id=scenario_id,
            service=service,
            exception_type=exception_type,
            error_message=error_message,
            offending_file=offending_file,
            offending_line=offending_line,
            stack_trace_snippet=snippet,
            raw_lines_count=len(lines)
        )

telemetry_sifter = TelemetrySifter()
