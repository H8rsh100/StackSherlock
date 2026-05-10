import os
import sys
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGO_URI = os.environ.get("MONGO_URI")
SCENARIO = os.environ.get("SCENARIO", "A").upper()

if not MONGO_URI:
    print("ERROR: MONGO_URI environment variable is missing!")
    print("Please set it in your .env file. (See .env.example)")
    sys.exit(1)

def seed_database():
    print("Connecting to MongoDB...")
    client = MongoClient(MONGO_URI)
    db = client.stacksherlock

    print("Clearing existing data...")
    db.incidents.delete_many({})
    db.playbooks.delete_many({})

    if SCENARIO == "A":
        # Scenario A: Auth DB Exhaustion
        historical_incident = {
            "incident_id": "INC-2024-019",
            "timestamp": "2024-03-14T10:00:00Z",
            "status": "resolved",
            "trigger": "error_rate_spike",
            "affected_services": ["auth-service"],
            "pattern_fingerprint": "auth_pool_exhaustion_v1",
            "resolution": {
                "action": "rollback",
                "commit": "old123",
                "gitlab_mr": "!12",
                "resolved_by": "@AdityaSharma",
                "approved_by": "engineer@company.com",
                "mttr_minutes": 23
            },
            "learned": True
        }
        playbook = {
            "playbook_id": "AUTH_DB_CASCADE_FAILURE_v2",
            "pattern": "auth_pool_exhaustion",
            "steps": [
                "Isolate deployment commit",
                "Validate connection leak via logs",
                "Rollback auth-service to previous tag",
                "Monitor latency for 60 seconds"
            ],
            "times_triggered": 3,
            "avg_mttr_minutes": 9
        }
        current_incident = {
            "incident_id": "INC-2024-047",
            "timestamp": "2024-06-10T03:42:00Z",
            "status": "investigating",
            "trigger": "error_rate_spike",
            "affected_services": ["auth-service", "checkout-api"],
            "blast_radius": {
                "services_affected": 3,
                "estimated_users": 14200,
                "revenue_loss_per_hour": 14200
            },
            "pattern_fingerprint": "auth_pool_exhaustion_v1",
            "learned": False
        }
    else:
        # Scenario B: Redis Timeout Cascade
        historical_incident = {
            "incident_id": "INC-2024-033",
            "timestamp": "2024-05-22T09:15:00Z",
            "status": "resolved",
            "trigger": "error_rate_spike",
            "affected_services": ["inventory-service"],
            "pattern_fingerprint": "redis_timeout_cascade_v1",
            "resolution": {
                "action": "rollback",
                "commit": "inv_old_456",
                "gitlab_mr": "!28",
                "resolved_by": "@AdityaSharma",
                "approved_by": "engineer@company.com",
                "mttr_minutes": 15
            },
            "learned": True
        }
        playbook = {
            "playbook_id": "REDIS_TIMEOUT_CASCADE_v1",
            "pattern": "redis_timeout_cascade",
            "steps": [
                "Identify high cache miss rate in logs",
                "Isolate inventory-service deployment",
                "Rollback inventory-service to previous tag",
                "Monitor Redis load for 60 seconds"
            ],
            "times_triggered": 1,
            "avg_mttr_minutes": 15
        }
        current_incident = {
            "incident_id": "INC-2024-052",
            "timestamp": "2024-06-11T14:19:00Z",
            "status": "investigating",
            "trigger": "error_rate_spike",
            "affected_services": ["inventory-service", "checkout-api"],
            "blast_radius": {
                "services_affected": 2,
                "estimated_users": 18500,
                "revenue_loss_per_hour": 22000
            },
            "pattern_fingerprint": "redis_timeout_cascade_v1",
            "learned": False
        }

    print(f"Inserting Scenario {SCENARIO} historical incident...")
    db.incidents.insert_one(historical_incident)

    print(f"Inserting Scenario {SCENARIO} playbook...")
    db.playbooks.insert_one(playbook)

    print(f"Inserting current incident {current_incident['incident_id']} stub...")
    db.incidents.insert_one(current_incident)

    print("Seeding complete!")

if __name__ == "__main__":
    seed_database()
