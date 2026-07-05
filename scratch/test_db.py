import os
import asyncio
from dotenv import load_dotenv
from supabase import create_client, Client

env_path = os.path.join(os.path.dirname(__file__), "../.env")
load_dotenv(env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

print(f"Supabase URL: {SUPABASE_URL}")
print(f"Supabase Key: {SUPABASE_KEY[:15]}...{SUPABASE_KEY[-15:] if SUPABASE_KEY else ''}")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

async def main():
    try:
        print("Attempting to insert test record into 'crash_history' table...")
        res = supabase.table("crash_history").insert({
            "multiplier": 1.25,
            "timestamp": "2026-07-05T18:00:00Z"
        }).execute()
        print("Success! Inserted data:")
        print(res)
    except Exception as e:
        print("Failed to insert record!")
        print(f"Error detail: {e}")
        
    try:
        print("\nAttempting to fetch recent records from 'crash_history' table...")
        res = supabase.table("crash_history").select("*").limit(5).execute()
        print("Success! Fetched data:")
        print(res)
    except Exception as e:
        print("Failed to fetch records!")
        print(f"Error detail: {e}")

if __name__ == "__main__":
    asyncio.run(main())
