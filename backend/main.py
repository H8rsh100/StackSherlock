from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import asyncio

app = FastAPI(title="StackSherlock API", description="Autonomous Incident Command Agent API")

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
    yield "data: {\"step\": 1, \"status\": \"started\"}\n\n"
    await asyncio.sleep(1)
    yield "data: {\"step\": 2, \"status\": \"investigating\"}\n\n"

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

@app.post("/approval/approve/{id}")
async def approve_action(id: str):
    return {"status": "approved", "incident_id": id, "gitlab_mr": "!47"}

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
