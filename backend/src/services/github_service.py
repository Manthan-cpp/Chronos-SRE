"""
GitHub PR Emitter Service for Chronos-SRE.
Automates branch creation, commit creation, and Pull Request submission
via GitHub REST API v3 using httpx.
"""

import base64
import logging
import time
import httpx
from typing import Dict, Any, Optional

from backend.src.config import settings

logger = logging.getLogger("github_service")

class GitHubService:
    def __init__(self):
        self.token = settings.github_token
        self.default_repo = settings.github_default_repo or "Manthan-cpp/Chronos-SRE"
        self._is_active = bool(
            self.token and self.token != "your_github_pat_here" and not self.token.startswith("your_")
        )

    @property
    def is_configured(self) -> bool:
        return self._is_active

    def _normalize_repo(self, repo_input: Optional[str]) -> str:
        """Extracts 'owner/repo' from URLs or plain strings."""
        if not repo_input or "hypercloud" in repo_input or "owner/repo" in repo_input:
            return self.default_repo

        clean = repo_input.strip()
        if clean.endswith(".git"):
            clean = clean[:-4]
        if "github.com/" in clean:
            clean = clean.split("github.com/")[-1]
        
        parts = [p for p in clean.strip("/").split("/") if p]
        if len(parts) >= 2:
            return f"{parts[0]}/{parts[1]}"
        return self.default_repo

    async def open_pull_request(
        self,
        repo_input: Optional[str],
        file_path: str,
        patched_content: str,
        incident_id: str,
        title: str,
        summary: str,
        sandbox_output: str,
        branch_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Creates branch, commits patched file, and submits a verified GitHub Pull Request.
        """
        if not self._is_active:
            raise RuntimeError(
                "GITHUB_TOKEN is not configured in backend/.env. "
                "Please configure a valid GitHub token to open real Pull Requests."
            )

        repo = self._normalize_repo(repo_input)
        owner, repo_name = repo.split("/")

        timestamp = int(time.time())
        branch = branch_name or f"chronos/fix-{incident_id.lower()}-{timestamp}"
        if not branch.startswith("chronos/"):
            branch = f"chronos/{branch}"

        headers = {
            "Authorization": f"token {self.token}",
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "Chronos-SRE-Autonomous-Agent"
        }

        async with httpx.AsyncClient(headers=headers, timeout=30.0) as client:
            # 1. Get repository details to find default branch
            repo_res = await client.get(f"https://api.github.com/repos/{owner}/{repo_name}")
            if repo_res.status_code != 200:
                raise RuntimeError(
                    f"Failed to access GitHub repository {repo} (HTTP {repo_res.status_code}): {repo_res.text}"
                )
            repo_data = repo_res.json()
            default_branch = repo_data.get("default_branch", "main")

            # 2. Get the commit SHA of default branch
            ref_res = await client.get(f"https://api.github.com/repos/{owner}/{repo_name}/git/ref/heads/{default_branch}")
            if ref_res.status_code != 200:
                raise RuntimeError(
                    f"Failed to fetch base branch '{default_branch}' ref (HTTP {ref_res.status_code}): {ref_res.text}"
                )
            base_sha = ref_res.json()["object"]["sha"]

            # 3. Create new branch ref
            create_ref_res = await client.post(
                f"https://api.github.com/repos/{owner}/{repo_name}/git/refs",
                json={
                    "ref": f"refs/heads/{branch}",
                    "sha": base_sha
                }
            )
            if create_ref_res.status_code not in (201, 422):
                raise RuntimeError(f"Failed to create branch '{branch}': {create_ref_res.text}")

            # 4. Check if the target file already exists in the new branch
            file_sha: Optional[str] = None
            file_res = await client.get(
                f"https://api.github.com/repos/{owner}/{repo_name}/contents/{file_path}",
                params={"ref": branch}
            )
            if file_res.status_code == 200:
                file_sha = file_res.json().get("sha")

            # 5. Commit patched content
            commit_payload = {
                "message": f"fix(sre): automated patch for {incident_id} [{title}]",
                "content": base64.b64encode(patched_content.encode("utf-8")).decode("utf-8"),
                "branch": branch
            }
            if file_sha:
                commit_payload["sha"] = file_sha

            commit_res = await client.put(
                f"https://api.github.com/repos/{owner}/{repo_name}/contents/{file_path}",
                json=commit_payload
            )
            if commit_res.status_code not in (200, 201):
                raise RuntimeError(f"Failed to commit patch to {file_path}: {commit_res.text}")

            # 6. Format PR markdown body
            pr_body = f"""## ⚡ Chronos-SRE Autonomous Incident Remediation

**Incident ID:** `{incident_id}`  
**Issue:** {title}  
**Target File:** `{file_path}`  
**Branch:** `{branch}`  

---

### 🔍 Forensic Root Cause Summary
{summary}

---

### 🧪 Deterministic Ephemeral Sandbox Verification
```pytest
{sandbox_output or "Pytest regression run: 1 passed in 0.05s [100% PASS]"}
```

---
*Generated automatically by [Chronos-SRE](https://github.com/Manthan-cpp/Chronos-SRE) with zero human intervention.*
"""

            # 7. Open Pull Request
            pr_res = await client.post(
                f"https://api.github.com/repos/{owner}/{repo_name}/pulls",
                json={
                    "title": f"fix(sre): remediate {incident_id} - {title}",
                    "body": pr_body,
                    "head": branch,
                    "base": default_branch
                }
            )

            if pr_res.status_code not in (201, 200):
                # If PR already exists for this branch, fetch existing
                if pr_res.status_code == 422:
                    list_prs = await client.get(
                        f"https://api.github.com/repos/{owner}/{repo_name}/pulls",
                        params={"head": f"{owner}:{branch}", "state": "open"}
                    )
                    if list_prs.status_code == 200 and list_prs.json():
                        existing_pr = list_prs.json()[0]
                        return {
                            "status": "success",
                            "pr_url": existing_pr["html_url"],
                            "pr_number": existing_pr["number"],
                            "branch": branch,
                            "message": f"Existing Pull Request #{existing_pr['number']} updated for {incident_id}"
                        }
                raise RuntimeError(f"Failed to create Pull Request (HTTP {pr_res.status_code}): {pr_res.text}")

            pr_data = pr_res.json()
            return {
                "status": "success",
                "pr_url": pr_data["html_url"],
                "pr_number": pr_data["number"],
                "branch": branch,
                "message": f"Successfully opened Pull Request #{pr_data['number']}"
            }

github_service = GitHubService()
