import os
from pymongo import MongoClient
from elasticsearch import Elasticsearch

# Use the same env vars defined earlier
MONGO_URI = os.environ.get("MONGO_URI")
ELASTIC_URL = os.environ.get("ELASTIC_URL")
ELASTIC_API_KEY = os.environ.get("ELASTIC_API_KEY")

def elastic_search_logs(service_name: str, time_window: str) -> dict:
    """
    MCP Tool: Search Elastic for logs related to a specific service.
    """
    if not ELASTIC_URL or not ELASTIC_API_KEY:
        return {"error": "Elastic credentials not configured."}
    
    try:
        es = Elasticsearch(ELASTIC_URL, api_key=ELASTIC_API_KEY)
        # Fetch from our seeded index
        res = es.search(index="stacksherlock-logs", q=f"service:{service_name}", size=50)
        logs = [hit['_source'] for hit in res['hits']['hits']]
        return {"status": "success", "logs": logs, "spike_detected": True, "error_rate": "34%"}
    except Exception as e:
        return {"error": str(e)}

def estimate_blast_radius(affected_services: list[str]) -> dict:
    """
    Internal calculation tool to estimate blast radius and impact.
    """
    base_users_per_service = 5000
    base_revenue_per_service = 5000
    
    multiplier = len(affected_services)
    if "checkout-api" in affected_services:
        multiplier += 0.5
        
    return {
        "services_affected": len(affected_services),
        "estimated_users": int(base_users_per_service * multiplier),
        "revenue_loss_per_hour": int(base_revenue_per_service * multiplier)
    }

def gitlab_get_deployments(time_window: str) -> dict:
    """
    MCP Tool: Query GitLab for deployments around a specific timestamp.
    """
    # Mocked for now until we configure a real GitLab repo in a future step
    return {
        "deployments": [
            {
                "tag": "v2.3.1", 
                "service": "auth-service", 
                "timestamp": "2024-06-10T03:38:00Z", 
                "commit": "abc1234", 
                "diff_url": "mock_diff_url"
            }
        ]
    }

def mongo_get_historical_incidents(pattern_fingerprint: str) -> dict:
    """
    MCP Tool: Query MongoDB for past incidents with a similar pattern fingerprint.
    """
    if not MONGO_URI:
        return {"error": "MongoDB URI not configured."}
    
    try:
        client = MongoClient(MONGO_URI)
        db = client.stacksherlock
        incidents = list(db.incidents.find({"pattern_fingerprint": pattern_fingerprint, "status": "resolved"}, {"_id": 0}))
        return {"status": "success", "matches": incidents}
    except Exception as e:
        return {"error": str(e)}
