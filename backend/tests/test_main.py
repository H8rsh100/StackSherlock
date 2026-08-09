from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "stacksherlock-api"


def test_read_root_docs():
    """Verify that Swagger/OpenAPI docs endpoint is accessible."""
    response = client.get("/openapi.json")
    assert response.status_code == 200
    assert response.json()["info"]["title"] == "StackSherlock API"


def test_trigger_incident_scenario_a():
    """Verify triggering Scenario A changes active incident status and ID."""
    response = client.post("/incident/trigger", json={"scenario": "A"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "triggered"
    assert data["incident_id"] == "INC-2024-047"
    assert data["scenario"] == "A"


def test_trigger_incident_scenario_b():
    response = client.post("/incident/trigger", json={"scenario": "B"})
    assert response.status_code == 200
    data = response.json()
    assert data["incident_id"] == "INC-2024-052"
    assert data["scenario"] == "B"


def test_get_incident_status():
    """Verify getting current incident details."""
    client.post("/incident/trigger", json={"scenario": "A"})
    response = client.get("/incident/INC-2024-047")
    assert response.status_code == 200
    data = response.json()
    assert data["incident_id"] == "INC-2024-047"
    assert data["status"] == "investigating"


def test_get_hypotheses():
    """Verify hypotheses are fetched and ranked for Scenario A."""
    client.post("/incident/trigger", json={"scenario": "A"})
    response = client.get("/agent/hypotheses/INC-2024-047")
    assert response.status_code == 200
    data = response.json()
    assert "hypotheses" in data
    assert len(data["hypotheses"]) > 0
    assert data["hypotheses"][0]["confidence"] == 94


def test_get_causal_graph():
    client.post("/incident/trigger", json={"scenario": "A"})
    response = client.get("/agent/graph/INC-2024-047")
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Auth DB Exhaustion"
    assert len(data["nodes"]) == 5
    assert len(data["edges"]) == 4


def test_get_audit_payload():
    client.post("/incident/trigger", json={"scenario": "A"})
    response = client.get("/agent/audit/INC-2024-047")
    assert response.status_code == 200
    data = response.json()
    assert "git_diff" in data
    assert data["claude_risk_assessment"]["risk_level"] == "CRITICAL"
    assert len(data["mongodb_precedents"]) >= 1


def test_approve_rollback_flow():
    """Verify approval transitions status and executes GitLab mock rollback."""
    client.post("/incident/trigger", json={"scenario": "A"})
    response = client.post("/approval/approve/INC-2024-047")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "approved_and_executed"
    assert data["gitlab_result"]["status"] == "success"
    assert "mr_url" in data["gitlab_result"]

    status_resp = client.get("/incident/INC-2024-047")
    assert status_resp.json()["status"] == "validating"


def test_reject_flow():
    client.post("/incident/trigger", json={"scenario": "A"})
    response = client.post("/approval/reject/INC-2024-047")
    assert response.status_code == 200
    assert response.json()["status"] == "rejected"
    status_resp = client.get("/incident/INC-2024-047")
    assert status_resp.json()["status"] == "rejected"


def test_arize_validation_loop():
    """Verify Arize validation step-by-step resolution simulation."""
    client.post("/incident/trigger", json={"scenario": "A"})
    client.post("/approval/approve/INC-2024-047")

    closed = False
    for _ in range(10):
        response = client.get("/arize/status/INC-2024-047")
        assert response.status_code == 200
        closed = response.json()["incident_closed"]
        if closed:
            break

    assert closed is True

    status_resp = client.get("/incident/INC-2024-047")
    assert status_resp.json()["status"] == "resolved"


def test_learn_incident():
    """Verify learning/memory archival of resolved incident."""
    response = client.post("/memory/learn/INC-2024-047")
    assert response.status_code == 200
    assert response.json()["status"] == "learned"
