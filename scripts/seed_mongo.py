import os
import sys
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGO_URI = os.environ.get("MONGO_URI")

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

    # Seed Historical Incident (March 14th)
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

    # Seed Playbook
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

    print("Inserting Scenario A historical incident...")
    db.incidents.insert_one(historical_incident)

    print("Inserting Scenario A playbook...")
    db.playbooks.insert_one(playbook)

    # Current Incident Stub
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
    print("Inserting current incident INC-2024-047 stub...")
    db.incidents.insert_one(current_incident)

    print("Seeding complete!")

if __name__ == "__main__":
    seed_database()
