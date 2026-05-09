import os
import sys
import json
from elasticsearch import Elasticsearch
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

ELASTIC_URL = os.environ.get("ELASTIC_URL")
ELASTIC_API_KEY = os.environ.get("ELASTIC_API_KEY")

if not ELASTIC_URL or not ELASTIC_API_KEY:
    print("ERROR: ELASTIC_URL or ELASTIC_API_KEY missing in .env")
    print("Please set them in your .env file. (See .env.example)")
    sys.exit(1)

def seed_elastic():
    print("Connecting to Elastic Cloud...")
    es = Elasticsearch(
        ELASTIC_URL,
        api_key=ELASTIC_API_KEY
    )

    index_name = "stacksherlock-logs"

    # Create index if it doesn't exist
    if es.indices.exists(index=index_name):
        print(f"Deleting existing index '{index_name}'...")
        es.indices.delete(index=index_name)

    print(f"Creating index '{index_name}'...")
    es.indices.create(index=index_name)

    fixtures_path = os.path.join(os.path.dirname(__file__), '..', 'fixtures', 'scenario_a_logs.json')
    with open(fixtures_path, 'r') as f:
        logs = json.load(f)

    print("Indexing log fixtures...")
    for i, log in enumerate(logs):
        res = es.index(index=index_name, document=log)
        if res['result'] == 'created':
            print(f"  Indexed document {i+1}/{len(logs)}: [{log['timestamp']}] {log['message']}")
        else:
            print(f"  Failed to index document {i+1}")

    print("Refreshing index...")
    es.indices.refresh(index=index_name)
    print("Elastic seeding complete!")

if __name__ == "__main__":
    seed_elastic()
