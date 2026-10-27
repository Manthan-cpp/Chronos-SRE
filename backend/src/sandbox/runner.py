"""
Ephemeral Execution Sandbox & Deterministic Patch Verifier.
Executes real pytest reproduction, applies patches, and verifies that tests transition from FAIL to PASS.
"""

import sys
import shutil
import tempfile
import subprocess
from pathlib import Path
from typing import Dict, Any

class SandboxVerifier:
    def verify_patch(
        self,
        scenario_id: str,
        scenario_dir: Path,
        patch_diff: str,
        target_file_rel: str,
        patched_code: str
    ) -> Dict[str, Any]:
        """
        Creates an isolated temporary sandbox, applies patched code, and runs pytest.
        """
        temp_dir = tempfile.mkdtemp(prefix=f"chronos_sandbox_{scenario_id.lower()}_")
        sandbox_path = Path(temp_dir)

        try:
            # 1. Copy original scenario codebase to sandbox
            dest_scenario_dir = sandbox_path / "scenarios" / scenario_dir.name
            dest_scenario_dir.parent.mkdir(parents=True, exist_ok=True)
            shutil.copytree(scenario_dir, dest_scenario_dir)

            # 2. Run initial test to verify FAIL
            test_file = dest_scenario_dir / [f.name for f in dest_scenario_dir.glob("test_*.py")][0]
            pre_res = subprocess.run(
                [sys.executable, "-m", "pytest", str(test_file), "-v", "--no-header"],
                cwd=str(sandbox_path),
                capture_output=True,
                text=True
            )
            pre_fail = (pre_res.returncode != 0)

            # 3. Apply the patch to the target file
            target_path = dest_scenario_dir / Path(target_file_rel).name
            with open(target_path, "w", encoding="utf-8") as f:
                f.write(patched_code)

            # 4. Run post-patch test to verify PASS
            post_res = subprocess.run(
                [sys.executable, "-m", "pytest", str(test_file), "-v", "--no-header"],
                cwd=str(sandbox_path),
                capture_output=True,
                text=True
            )
            post_pass = (post_res.returncode == 0)

            verified = pre_fail and post_pass

            return {
                "scenario_id": scenario_id,
                "sandbox_dir": str(sandbox_path),
                "pre_patch_failed": pre_fail,
                "pre_patch_output": pre_res.stdout.strip(),
                "post_patch_passed": post_pass,
                "post_patch_output": post_res.stdout.strip(),
                "verified": verified,
                "summary": "PASS (Regression Verified)" if verified else "FAIL (Patch did not resolve issue)"
            }
        finally:
            shutil.rmtree(sandbox_path, ignore_errors=True)

sandbox_verifier = SandboxVerifier()
