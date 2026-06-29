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

active_incident = {
    "incident_id": "INC-2024-047",
    "scenario": "A",
    "status": "investigating",
    "validation_step": 0
}

class TriggerIncidentRequest(BaseModel):
    scenario: str = "A"

class InvestigateRequest(BaseModel):
    incident_id: str

class LogMetricRequest(BaseModel):
    metric_name: str
    value: float

@app.post("/incident/trigger")
async def trigger_incident(request: TriggerIncidentRequest):
    scenario = request.scenario.upper()
    incident_id = "INC-2024-047" if scenario == "A" else "INC-2024-052"
    active_incident["incident_id"] = incident_id
    active_incident["scenario"] = scenario
    active_incident["status"] = "investigating"
    active_incident["validation_step"] = 0
    return {"status": "triggered", "incident_id": incident_id, "scenario": scenario}

@app.get("/incident/{id}")
async def get_incident(id: str):
    return {
        "incident_id": id,
        "status": active_incident["status"],
        "scenario": active_incident["scenario"],
        "trigger": "error_rate_spike"
    }

async def mock_event_generator(scenario: str):
    if scenario == "A":
        events = [
            {"timestamp": "03:42:01 UTC", "type": "investigating", "message": "Pulling Elastic logs for auth-service..."},
            {"timestamp": "03:42:05 UTC", "type": "reasoning", "message": "Anomaly detected: DB connection pool utilization at 95%."},
            {"timestamp": "03:42:08 UTC", "type": "investigating", "message": "Querying GitLab for recent deployments..."},
            {"timestamp": "03:42:15 UTC", "type": "resolved", "message": "Found correlation: auth-service v2.3.1 deployed at 03:38 UTC"},
            {"timestamp": "03:42:20 UTC", "type": "investigating", "message": "Analyzing git diff with Claude API..."}
        ]
    else:
        events = [
            {"timestamp": "14:19:01 UTC", "type": "investigating", "message": "Pulling Elastic logs for inventory-service..."},
            {"timestamp": "14:19:05 UTC", "type": "reasoning", "message": "Anomaly detected: Redis cache miss rate spiked to 80%."},
            {"timestamp": "14:19:08 UTC", "type": "investigating", "message": "Querying GitLab for recent deployments..."},
            {"timestamp": "14:19:15 UTC", "type": "resolved", "message": "Found correlation: inventory-service v3.0.0 deployed at 14:10 UTC"},
            {"timestamp": "14:19:20 UTC", "type": "investigating", "message": "Analyzing git diff with Claude API..."}
        ]
    for event in events:
        yield f"data: {json.dumps(event)}\n\n"
        await asyncio.sleep(1.2)

@app.get("/incident/{id}/stream")
async def incident_stream(id: str):
    scenario = active_incident["scenario"]
    return StreamingResponse(mock_event_generator(scenario), media_type="text/event-stream")

@app.post("/agent/investigate")
async def start_investigation(request: InvestigateRequest):
    return {"status": "investigation_started", "incident_id": request.incident_id}

@app.get("/agent/hypotheses/{id}")
async def get_hypotheses(id: str):
    scenario = active_incident["scenario"]
    if scenario == "A":
        return {
            "incident_id": id,
            "hypotheses": [
                {"label": "Deployment connection pool leak", "confidence": 94, "selected": True, "description": "Agent selected A because: deployment timestamp aligns within 4 minutes of error spike, code diff directly modifies connection pool limit from 100 to 10."},
                {"label": "DB cluster CPU saturation", "confidence": 61, "selected": False},
                {"label": "Redis timeout cascade", "confidence": 37, "selected": False}
            ],
            "selected_index": 0
        }
    else:
        return {
            "incident_id": id,
            "hypotheses": [
                {"label": "Redis timeout cascade", "confidence": 88, "selected": True, "description": "Agent selected A because: cache miss rate spiked to 80% immediately following v3.0.0 deployment, code diff reveals an aggressive 50ms connect timeout configuration."},
                {"label": "Primary DB read saturation", "confidence": 54, "selected": False},
                {"label": "API gateway routing failure", "confidence": 21, "selected": False}
            ],
            "selected_index": 0
        }

@app.get("/agent/confidence/{id}")
async def get_confidence(id: str):
    scenario = active_incident["scenario"]
    if scenario == "A":
        return {
            "incident_id": id,
            "total_confidence": 94,
            "signals": [
                {"signal": "Deployment timestamp matches spike", "score": 31},
                {"signal": "Similar incident found March 14th", "score": 18},
                {"signal": "Memory leak logs detected", "score": 22},
                {"signal": "Failing endpoint isolated", "score": 11},
                {"signal": "Code diff affects auth pooling", "score": 12}
            ]
        }
    else:
        return {
            "incident_id": id,
            "total_confidence": 88,
            "signals": [
                {"signal": "Deploy timestamp matches timeout spike", "score": 35},
                {"signal": "Cache miss rate spike to 80%", "score": 25},
                {"signal": "Redis Timeout errors in logs", "score": 15},
                {"signal": "Code diff reduces connect timeout", "score": 13}
            ]
        }

@app.get("/agent/blast-radius/{id}")
async def get_blast_radius(id: str):
    scenario = active_incident["scenario"]
    if scenario == "A":
        return {
            "incident_id": id,
            "services_affected": 3,
            "estimated_users": 14200,
            "revenue_loss_per_hour": 14200,
            "severity": "P1",
            "services": ["auth-service", "checkout-api", "api-gateway"]
        }
    else:
        return {
            "incident_id": id,
            "services_affected": 2,
            "estimated_users": 18500,
            "revenue_loss_per_hour": 22000,
            "severity": "P1",
            "services": ["inventory-service", "checkout-api"]
        }

import sys
import os

# Add the project root to sys.path so we can import the agent package when running from inside the backend directory
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agent.gitlab_mcp import execute_rollback

@app.post("/approval/approve/{id}")
async def approve_action(id: str):
    # Transition the active incident state
    active_incident["status"] = "validating"
    active_incident["validation_step"] = 0
    
    target_commit = "abc1234" if active_incident["scenario"] == "A" else "inv_old_456"
    result = execute_rollback(incident_id=id, commit_hash=target_commit)
    
    return {
        "status": "approved_and_executed", 
        "incident_id": id, 
        "gitlab_result": result
    }

@app.post("/approval/reject/{id}")
async def reject_action(id: str):
    active_incident["status"] = "rejected"
    return {"status": "rejected", "incident_id": id}

@app.get("/memory/similar/{id}")
async def find_similar_incidents(id: str):
    scenario = active_incident["scenario"]
    similar = ["INC-2024-019"] if scenario == "A" else ["INC-2024-033"]
    return {
        "incident_id": id,
        "similar_incidents": similar
    }

@app.post("/memory/learn/{id}")
async def learn_incident(id: str):
    active_incident["status"] = "resolved"
    return {"status": "learned", "incident_id": id}

@app.get("/arize/status/{id}")
async def get_arize_status(id: str):
    status = active_incident["status"]
    scenario = active_incident["scenario"]
    
    pre_fix_error_rate = 34.2 if scenario == "A" else 42.0
    
    if status == "validating":
        step = active_incident["validation_step"]
        error_rates = [pre_fix_error_rate, 21.5, 11.2, 5.4, 1.8, 0.4]
        baseline_held = [0, 10, 20, 30, 45, 60]
        
        current_rate = error_rates[min(step, len(error_rates)-1)]
        held_secs = baseline_held[min(step, len(baseline_held)-1)]
        
        closed = step >= len(error_rates) - 1
        if closed:
            active_incident["status"] = "resolved"
        else:
            active_incident["validation_step"] += 1
            
        return {
            "incident_id": id,
            "pre_fix_error_rate": pre_fix_error_rate,
            "post_fix_error_rate": current_rate,
            "baseline_held_seconds": held_secs,
            "incident_closed": closed
        }
    elif status == "resolved":
        return {
            "incident_id": id,
            "pre_fix_error_rate": pre_fix_error_rate,
            "post_fix_error_rate": 0.4,
            "baseline_held_seconds": 60,
            "incident_closed": True
        }
    else:
        # investigating or rejected
        return {
            "incident_id": id,
            "pre_fix_error_rate": pre_fix_error_rate,
            "post_fix_error_rate": pre_fix_error_rate,
            "baseline_held_seconds": 0,
            "incident_closed": False
        }

@app.post("/arize/log-metric")
async def log_arize_metric(request: LogMetricRequest):
    return {"status": "logged", "metric": request.metric_name, "value": request.value}

@app.get("/playbook/{pattern}")
async def get_playbook(pattern: str):
    scenario = active_incident["scenario"]
    if scenario == "A":
        return {
            "pattern": pattern,
            "playbook_id": "AUTH_DB_CASCADE_FAILURE_v2",
            "steps": [
                "Isolate deployment v2.3.1",
                "Validate connection leak via logs",
                "Rollback auth-service to v2.3.0",
                "Monitor latency for 60 seconds"
            ]
        }
    else:
        return {
            "pattern": pattern,
            "playbook_id": "REDIS_TIMEOUT_CASCADE_v1",
            "steps": [
                "Identify cache miss rate spike",
                "Isolate inventory-service deployment",
                "Rollback inventory-service to v2.9.0",
                "Monitor Redis load for 60 seconds"
            ]
        }

@app.get("/agent/audit/{id}")
async def get_incident_audit(id: str):
    scenario = active_incident["scenario"]
    if scenario == "A":
        return {
            "incident_id": id,
            "git_diff": """diff --git a/auth-service/config.go b/auth-service/config.go
index a4f2f9b..b2c3d4e 100644
--- a/auth-service/config.go
+++ b/auth-service/config.go
@@ -10,7 +10,7 @@ type DBConfig struct {
 
 func LoadConfig() DBConfig {
 	return DBConfig{
-		MaxConnections: 100,
+		MaxConnections: 10, // Optimize database resources
 		TimeoutSeconds: 30,
 	}
 }""",
            "claude_risk_assessment": {
                "risk_level": "CRITICAL",
                "summary": "Database pool constriction triggers immediate connection exhaustion under standard load, cascading failure into checkout-api.",
                "analysis": "Reducing MaxConnections from 100 to 10 limits the auth-service container to a maximum of 10 parallel database connections. Peak auth traffic requires ~45 connections. This causes requests to wait and eventually time out, cascading database pool exhaustion down to checkout-api."
            },
            "mongodb_precedents": [
                {
                    "incident_id": "INC-2024-019",
                    "date": "2024-03-14",
                    "scenario": "DB Exhaustion",
                    "resolution": "Rollback auth-service deployment to restore pool limit. Database pool limits stabilized checkout-api latencies immediately."
                }
            ]
        }
    else:
        return {
            "incident_id": id,
            "git_diff": """diff --git a/inventory-service/redis_client.py b/inventory-service/redis_client.py
index e83d1c1..f92d4b2 100644
--- a/inventory-service/redis_client.py
+++ b/inventory-service/redis_client.py
@@ -5,5 +5,5 @@ class RedisConfig:
     def __init__(self):
         self.host = "redis-primary"
         self.port = 6379
-        self.timeout = 2.0
+        self.timeout = 0.1 # Minimize blocking operations
         self.retries = 3""",
            "claude_risk_assessment": {
                "risk_level": "HIGH",
                "summary": "Redis cache connection timeout is too aggressive, resulting in persistent timeouts under transient latency fluctuations.",
                "analysis": "Setting the socket timeout to 100ms (0.1s) does not allow enough headroom for normal network jitter or heavy cache lookups. When Redis fails to respond within 100ms, inventory-service falls back to query the primary database. The database CPU immediately spikes to 100% under the un-cached query volume, crashing the checkout-api."
            },
            "mongodb_precedents": [
                {
                    "incident_id": "INC-2024-033",
                    "date": "2024-05-02",
                    "scenario": "Redis Cache Cascade",
                    "resolution": "Rollback inventory-service and revert connection timeout to 2.0s. CPU load on primary database normalized within 2 minutes."
                }
            ]
        }


