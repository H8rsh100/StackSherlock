from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import json

app = FastAPI(title="StackSherlock API", description="Autonomous Incident Command Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TriggerIncidentRequest(BaseModel):
    scenario: str = "A"

class InvestigateRequest(BaseModel):
    incident_id: str

class LogMetricRequest(BaseModel):
    metric_name: str
    value: float

@app.post("/incident/trigger")
async def trigger_incident(request: TriggerIncidentRequest):
    return {"status": "triggered", "incident_id": "INC-2024-047", "scenario": request.scenario}

@app.get("/incident/{id}")
async def get_incident(id: str):
    return {
        "incident_id": id,
        "status": "investigating",
        "trigger": "error_rate_spike"
    }

async def mock_event_generator():
    events = [
        {"timestamp": "03:42:01 UTC", "type": "investigating", "message": "Pulling Elastic logs..."},
        {"timestamp": "03:42:05 UTC", "type": "reasoning", "message": "Anomaly detected in DB connections."},
        {"timestamp": "03:42:08 UTC", "type": "investigating", "message": "Querying GitLab for recent deployments..."},
        {"timestamp": "03:42:15 UTC", "type": "resolved", "message": "Found correlation: v2.3.1 deployed at 03:38"},
        {"timestamp": "03:42:20 UTC", "type": "investigating", "message": "Analyzing git diff with Claude API..."}
    ]
    for event in events:
        yield f"data: {json.dumps(event)}\n\n"
        await asyncio.sleep(1.5)

@app.get("/incident/{id}/stream")
async def incident_stream(id: str):
    return StreamingResponse(mock_event_generator(), media_type="text/event-stream")

@app.post("/agent/investigate")
async def start_investigation(request: InvestigateRequest):
    return {"status": "investigation_started", "incident_id": request.incident_id}

@app.get("/agent/hypotheses/{id}")
async def get_hypotheses(id: str):
    return {
        "incident_id": id,
        "hypotheses": [
            {"label": "Mock Hypothesis A", "confidence": 90},
            {"label": "Mock Hypothesis B", "confidence": 10}
        ]
    }

@app.get("/agent/confidence/{id}")
async def get_confidence(id: str):
    return {
        "incident_id": id,
        "total_confidence": 94,
        "signals": [
            {"signal": "Mock Signal 1", "score": 50},
            {"signal": "Mock Signal 2", "score": 44}
        ]
    }

@app.get("/agent/blast-radius/{id}")
async def get_blast_radius(id: str):
    return {
        "incident_id": id,
        "services_affected": 3,
        "estimated_users": 14200,
        "revenue_loss_per_hour": 14200
    }

import sys
import os

# Add the project root to sys.path so we can import the agent package when running from inside the backend directory
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agent.gitlab_mcp import execute_rollback

@app.post("/approval/approve/{id}")
async def approve_action(id: str):
    # This is the strict Human Approval Gate.
    # GitLab is NEVER touched unless this endpoint is hit.
    
    # In a real scenario, we would look up the targeted commit from MongoDB
    target_commit = "abc1234"  # Mocked from Scenario A
    
    # Execute the action via GitLab MCP
    result = execute_rollback(incident_id=id, commit_hash=target_commit)
    
    return {
        "status": "approved_and_executed", 
        "incident_id": id, 
        "gitlab_result": result
    }

@app.post("/approval/reject/{id}")
async def reject_action(id: str):
    return {"status": "rejected", "incident_id": id}

@app.get("/memory/similar/{id}")
async def find_similar_incidents(id: str):
    return {
        "incident_id": id,
        "similar_incidents": ["INC-2024-019"]
    }

@app.post("/memory/learn/{id}")
async def learn_incident(id: str):
    return {"status": "learned", "incident_id": id}

@app.get("/arize/status/{id}")
async def get_arize_status(id: str):
    return {
        "incident_id": id,
        "pre_fix_error_rate": 34.2,
        "post_fix_error_rate": 1.1,
        "baseline_held_seconds": 47,
        "incident_closed": False
    }

@app.post("/arize/log-metric")
async def log_arize_metric(request: LogMetricRequest):
    return {"status": "logged", "metric": request.metric_name, "value": request.value}

@app.get("/playbook/{pattern}")
async def get_playbook(pattern: str):
    return {
        "pattern": pattern,
        "playbook_id": "MOCK_PLAYBOOK_v1",
        "steps": ["Step 1", "Step 2", "Step 3"]
    }
