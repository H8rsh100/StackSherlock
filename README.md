# StackSherlock

Autonomous Incident Command Agent. Detects system failures, investigates logs, audits code diffs, constructs visual root cause chains, and executes fixes — with one human approval click. Built with Gemini + Claude + Elastic + GitLab + MongoDB + Arize.

## The Philosophy Line

"Modern observability tools tell you WHAT failed. StackSherlock determines WHY, decides WHAT TO DO, and executes the response."

## What we are building

StackSherlock is an AI agent that operates like an autonomous SRE engineer. When a production incident occurs, it:

1. Pulls logs from Elastic
2. Correlates recent GitLab deployments
3. Queries MongoDB for historical incident patterns
4. Uses Gemini (orchestrator) + Claude API (code diff auditor) to build a ranked hypothesis list with confidence scores
5. Renders an animated visual root cause chain
6. Proposes a fix with full signal breakdown
7. Waits for human approval before touching anything
8. Creates a GitLab MR on approval
9. Monitors post-fix health via Arize
10. Writes the resolved incident back to MongoDB as learned memory

## Tech Stack

- **Frontend**: React + Tailwind + React Flow
- **Backend**: Python FastAPI with SSE streaming
- **Orchestrator**: Gemini via Google Cloud Agent Builder
- **Code Auditor**: Claude API (claude-sonnet-4-20250514)
- **Logs**: Elastic Cloud
- **Memory**: MongoDB Atlas
- **Validation**: Arize
- **Actions**: GitLab MCP

## Project Structure
```
stacksherlock/
├── frontend/          # React + Tailwind + React Flow
├── backend/           # Python FastAPI
├── agent/             # Gemini Agent Builder config + prompts
├── fixtures/          # Simulated log data, incident scenarios
├── scripts/           # Elastic indexing, MongoDB seeding
└── README.md
```
