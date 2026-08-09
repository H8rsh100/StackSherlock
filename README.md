# StackSherlock

[![GitHub License](https://img.shields.io/github/license/H8rsh100/StackSherlock?style=for-the-badge&color=blue)](LICENSE)
[![Python Version](https://img.shields.io/badge/python-3.10%20%7C%203.11%20%7C%203.12-green?style=for-the-badge&logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react)](https://react.dev/)

> Modern observability tools tell you what failed. StackSherlock determines why, decides what to do, and executes the response.

StackSherlock is an autonomous AI-powered Incident Command Agent. When production error rates or latency spike, it investigates Elastic logs, audits git diffs, models the failure cascade, proposes a rollback, and waits for one human approval before GitLab execution. Arize validates recovery and MongoDB stores learned memory.

## Architectural workflow

```mermaid
graph TD
    A[Production Incident / Alert] -->|Error Spike| B(FastAPI Server)
    B -->|Fetch Logs| C[(Elastic Cloud Logs)]
    B -->|Check Deployments| D[(GitLab Deployments)]
    B -->|Fetch Similar Incidents| E[(MongoDB Incident History)]

    B -->|Orchestrate Context| F[Gemini Orchestrator]
    F -->|Git Diff Analysis| G[Claude API Code Auditor]

    F -->|Determine Root Cause| H[Reasoning Engine]
    H -->|Generate Root Cause Node Graph| I[React Flow Dashboard]

    I -->|Human Review and One-Click Approval| J{Approve Fix?}
    J -->|Yes| K[GitLab MCP Rollback MR]
    J -->|No| L[Mark Rejected]

    K -->|Monitor Post-Fix Metrics| M[Arize Telemetry Validation]
    M -->|Error Rate Normalizes| N[Write resolved incident to Mongo learned memory]
```

## Key capabilities

1. **Multi-LLM orchestration**: Gemini commands the investigation. Claude Sonnet audits the git diff risk.
2. **Interactive causal graph**: React Flow renders the cascade path as the agent investigates.
3. **GitLab MCP actions**: Creates a rollback branch and merge request after approval.
4. **Human-in-the-loop guardrails**: Confidence scores, audit modal, approve, and reject before any change lands.
5. **Memory feedback loop**: Resolved incidents return to MongoDB for faster later matches.

## Project structure

```
stacksherlock/
├── frontend/          # React + Tailwind + React Flow command center
├── backend/           # Python FastAPI API server
├── agent/             # Orchestrator, MCP tools, auditor hooks
├── fixtures/          # Simulated log streams and scenarios
├── scripts/           # Elastic indexing and MongoDB seeding
├── docker-compose.yml # Optional local multi-service run
└── README.md
```

## Configuration

Copy `.env.example` to `.env` in the project root:

```bash
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/stacksherlock
ELASTIC_URL=https://your-cluster-id.es.us-central1.gcp.cloud.es.io:443
ELASTIC_API_KEY=your_base64_encoded_api_key
GEMINI_API_KEY=your_google_ai_studio_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GITLAB_TOKEN=your_gitlab_personal_access_token
ARIZE_SPACE_KEY=your_arize_space_key
ARIZE_API_KEY=your_arize_api_key
```

Frontend optional override:

```bash
# frontend/.env
VITE_API_URL=http://localhost:8000
```

Without live credentials the demo runs in mock mode with fixture scenarios A and B.

## Run locally

### Backend

Requires Python 3.10+.

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
source venv/bin/activate
pip install -r requirements.txt
cd ..
python -m uvicorn backend.main:app --port 8000 --reload
```

API: `http://localhost:8000`  
Docs: `http://localhost:8000/docs`  
Health: `http://localhost:8000/health`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173/`.

### Docker Compose (optional)

```bash
docker compose up
```

## Demo flow

1. Open the landing page and enter the command center.
2. Pick Scenario A (Auth DB Exhaustion) or Scenario B (Redis Timeout Cascade).
3. Watch the live agent feed and animated causal graph.
4. Open **Why should I trust this?** to review diff, risk, and precedents.
5. **Approve & execute** to open the mock GitLab MR and run the Arize validation loop, or **Reject** to stop with no action.

## Tests and CI

```bash
pip install -r backend/requirements.txt pytest httpx
pytest backend/tests/
cd frontend && npm run build
```

GitHub Actions runs backend pytest plus frontend lint/build on pushes and pull requests to `main`.

## License

MIT. See [LICENSE](LICENSE).
