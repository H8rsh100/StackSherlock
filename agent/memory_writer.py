import os
from pymongo import MongoClient
from datetime import datetime

MONGO_URI = os.environ.get("MONGO_URI")

def write_resolved_incident(incident_data: dict) -> dict:
    """
    Step 13: MongoDB Memory Write.
    Writes the fully resolved incident document to MongoDB as learned memory.
    """
    if not MONGO_URI:
        print("WARN: MONGO_URI not set. Running in mock memory mode.")
        return {"status": "mock_success", "message": "Incident memory mocked."}

    try:
        client = MongoClient(MONGO_URI)
        db = client.stacksherlock
        
        # Ensure the incident is marked as learned and resolved
        incident_data["status"] = "resolved"
        incident_data["learned"] = True
        incident_data["learned_at"] = datetime.utcnow().isoformat()
        
        # Upsert the incident using incident_id
        db.incidents.update_one(
            {"incident_id": incident_data["incident_id"]},
            {"$set": incident_data},
            upsert=True
        )
        print(f"[Memory Write] Successfully learned incident {incident_data['incident_id']}")
        return {"status": "success", "message": "Incident learned and stored."}
    except Exception as e:
        return {"error": f"Failed to write memory to MongoDB: {str(e)}"}

def update_playbook_stats(playbook_id: str, current_mttr_minutes: int) -> dict:
    """
    Updates the playbook trigger count and recalculates the average MTTR.
    """
    if not MONGO_URI:
        return {"status": "mock_success"}
        
    try:
        client = MongoClient(MONGO_URI)
        db = client.stacksherlock
        
        playbook = db.playbooks.find_one({"playbook_id": playbook_id})
        if playbook:
            times_triggered = playbook.get("times_triggered", 0)
            avg_mttr = playbook.get("avg_mttr_minutes", 0)
            
            # Recalculate rolling average
            new_times = times_triggered + 1
            new_avg = ((avg_mttr * times_triggered) + current_mttr_minutes) / new_times
            
            db.playbooks.update_one(
                {"playbook_id": playbook_id},
                {"$set": {
                    "times_triggered": new_times,
                    "avg_mttr_minutes": round(new_avg, 2)
                }}
            )
            print(f"[Memory Write] Playbook {playbook_id} updated. New average MTTR: {round(new_avg, 2)}m")
            return {"status": "success", "new_avg_mttr": round(new_avg, 2)}
        return {"error": "Playbook not found."}
    except Exception as e:
        return {"error": f"Failed to update playbook stats: {str(e)}"}
