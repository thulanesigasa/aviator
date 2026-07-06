import os
from datetime import datetime, timedelta
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

def get_utc_range_for_date(date_str: str, tz_offset_mins: int = 0) -> tuple:
    """Converts a local date (YYYY-MM-DD) and timezone offset to UTC start/end iso strings."""
    # Local start: YYYY-MM-DD 00:00:00
    local_start = datetime.strptime(date_str, "%Y-%m-%d")
    # UTC start = Local start - offset (offset is positive for east of GMT, e.g. +120 mins)
    utc_start = local_start - timedelta(minutes=tz_offset_mins)
    # UTC end = one day minus one second later
    utc_end = utc_start + timedelta(days=1) - timedelta(seconds=1)
    
    return utc_start.isoformat() + "Z", utc_end.isoformat() + "Z"

async def fetch_recent_crashes(limit: int = 1000, date_str: str = None, tz_offset: int = 0):
    """Fetches crashes, optionally filtered by a specific local date."""
    query = supabase.table("crash_history").select("*")
    if date_str:
        utc_start, utc_end = get_utc_range_for_date(date_str, tz_offset)
        query = query.gte("timestamp", utc_start).lte("timestamp", utc_end)
    response = query.order("timestamp", desc=True).limit(limit).execute()
    return response
