import os
from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://your-project-ref.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "your-anon-key")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

async def insert_crash_record(multiplier: float, timestamp: str):
    """Inserts a new crash multiplier into the Supabase database."""
    data, count = supabase.table("crash_history").insert({
        "multiplier": multiplier,
        "timestamp": timestamp
    }).execute()
    return data

async def fetch_recent_crashes(limit: int = 50):
    """Fetches the most recent crashes for the LSTM model and UI."""
    response = supabase.table("crash_history").select("*").order("timestamp", desc=True).limit(limit).execute()
    return response
