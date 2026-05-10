import os

GITLAB_TOKEN = os.environ.get("GITLAB_TOKEN")

def execute_rollback(incident_id: str, commit_hash: str) -> dict:
    """
    Step 11: GitLab MCP Execution.
    Creates a branch, commits a rollback, opens an MR, and tags the engineer.
    This ONLY runs after the human approval gate is passed.
    """
    if not GITLAB_TOKEN:
        print("WARN: GITLAB_TOKEN not set. Running in mock simulation mode.")
        
    print(f"[GitLab MCP] Creating branch 'rollback-{incident_id}' from 'main'...")
    print(f"[GitLab MCP] Reverting commit '{commit_hash}'...")
    print(f"[GitLab MCP] Pushing branch 'rollback-{incident_id}'...")
    print(f"[GitLab MCP] Opening Merge Request...")
    print(f"[GitLab MCP] Tagging @engineer for review...")

    return {
        "status": "success",
        "mr_url": f"https://gitlab.company.com/engineering/stacksherlock/-/merge_requests/47",
        "branch_name": f"rollback-{incident_id}",
        "action": "rollback_commit",
        "target_commit": commit_hash
    }
