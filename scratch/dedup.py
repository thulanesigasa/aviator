import os
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

env_path = os.path.join(os.path.dirname(__file__), "../.env")
load_dotenv(env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def parse_iso(ts_str):
    return datetime.fromisoformat(ts_str.replace("Z", "+00:00"))

def clean_duplicates():
    print("[Dedup] Fetching recent 1000 records to inspect...")
    response = supabase.table("crash_history").select("*").order("timestamp", desc=False).limit(1000).execute()
    records = response.data or []
    
    if not records:
        print("[Dedup] No records found.")
        return
        
    duplicates_to_delete = []
    
    for i in range(1, len(records)):
        prev = records[i - 1]
        curr = records[i]
        
        prev_time = parse_iso(prev["timestamp"])
        curr_time = parse_iso(curr["timestamp"])
        time_diff = (curr_time - prev_time).total_seconds()
        
        # If identical multiplier within 8 seconds, it is a duplicate round registration
        if curr["multiplier"] == prev["multiplier"] and abs(time_diff) < 8.0:
            print(f"[Dedup] Duplicate found: Round #{curr['id']} ({curr['multiplier']}x) is identical to #{prev['id']} ({prev['multiplier']}x) with diff {time_diff:.1f}s.")
            duplicates_to_delete.append(curr["id"])
            
    if duplicates_to_delete:
        print(f"[Dedup] Purging {len(duplicates_to_delete)} duplicate records from database...")
        for row_id in duplicates_to_delete:
            try:
                supabase.table("crash_history").delete().eq("id", row_id).execute()
                print(f"[Dedup] Deleted duplicate ID: {row_id}")
            except Exception as e:
                print(f"[Dedup] Error deleting row {row_id}: {e}")
        print("[Dedup] Purge completed successfully.")
    else:
        print("[Dedup] No duplicate rounds identified.")

if __name__ == "__main__":
    clean_duplicates()
