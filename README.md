# 🤖 StackSherlock

[![GitHub License](https://img.shields.io/github/license/H8rsh100/StackSherlock?style=for-the-badge&color=blue)](LICENSE)
[![Python Version](https://img.shields.io/badge/python-3.10%20%7C%203.11%20%7C%203.12-green?style=for-the-badge&logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react)](https://react.dev/)
[![React Flow](https://img.shields.io/badge/React%20Flow-FF007A?style=for-the-badge&logo=react-flow&logoColor=white)](https://reactflow.dev/)

> **"Modern observability tools tell you WHAT failed. StackSherlock determines WHY, decides WHAT TO DO, and executes the response."**

StackSherlock is an autonomous **AI-powered Incident Command Agent (SRE)**. When production services spike in error rates or latency, StackSherlock automatically triggers an investigation: pulling Elastic logs, auditing git diffs via LLMs, modeling the failure cascading path, proposing a rollback fix, and requesting human-in-the-loop authorization to merge the hotfix.

---

## 🗺️ Architectural Workflow

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
    
    I -->|Human Review & One-Click Approval| J{Approve Fix?}
    J -->|Yes| K[GitLab MCP Rollback MR]
    J -->|No| L[Mark Rejected]
    
    K -->|Monitor Post-Fix Metrics| M[Arize Model/Telemetry Validation]
    M -->|Error Rate Normalizes| N[Write resolved incident to Mongo learned memory]
```

---

## ✨ Key Capabilities

1. **Multi-LLM Orchestration**: Employs **Gemini** as the overall command orchestrator and **Claude Sonnet** as the code-level git diff risk auditor to ensure precision diagnosis.
2. **Interactive Cascading Root Cause Graph**: Renders the dependency propagation of failures using **React Flow**, making complex cascade paths visually clear.
3. **Automated GitLab MCP Integrations**: Generates a rollback branch, pushes changes, and creates a Merge Request automatically.
4. **Guardrails & Human-in-the-loop**: Never deploys fixes autonomously; exposes a unified dashboard highlighting the risk-assessment, confidence scoring, and playbook logs with a single-click "Approve & Execute" button.
5. **Continuous Memory Feedback Loop**: Backs resolved cases into MongoDB, referencing historical precedents to speed up subsequent debugging cycles.

---

## 📂 Project Structure

```
stacksherlock/
├── frontend/          # React + Tailwind + React Flow Dashboard
├── backend/           # Python FastAPI API Server
├── agent/             # Gemini Agent Builder configs, MCP tools & prompts
├── fixtures/          # Simulated log streams, incident scenarios
├── scripts/           # Elastic indexing & MongoDB seeding tools
└── README.md
```

---

## ⚙️ Configuration & Environment Setup

Duplicate `.env.example` to `.env` in the root directory:

```bash
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/stacksherlock

# Elastic Cloud
ELASTIC_URL=https://your-cluster-id.es.us-central1.gcp.cloud.es.io:443
ELASTIC_API_KEY=your_base64_encoded_api_key

# Gemini Agent Orchestrator
GEMINI_API_KEY=your_google_ai_studio_key

# Claude Auditor
ANTHROPIC_API_KEY=your_anthropic_api_key

# GitLab MCP
GITLAB_TOKEN=your_gitlab_personal_access_token

# Arize API
ARIZE_SPACE_KEY=your_arize_space_key
ARIZE_API_KEY=your_arize_api_key
```

---

## 🚀 Running locally

### 1. Backend Server Setup
Requires Python 3.10+.

```bash
cd backend
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
python -m uvicorn main:app --port 8000 --reload
```

The API will be available at `http://localhost:8000`. You can inspect the Swagger interactive documentation at `http://localhost:8000/docs`.

### 2. Frontend Dashboard Setup

```bash
cd frontend
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open `http://localhost:5173/` in your browser.

---

## 🤝 License

This project is open-source and available under the [MIT License](LICENSE).
