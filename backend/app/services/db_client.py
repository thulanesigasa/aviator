import asyncio
from supabase import create_client, Client
from app.config import settings

# Initialize Supabase client
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

async def insert_crash_record(multiplier: float, timestamp: str):
    """
    Inserts a newly scraped multiplier round into the public.crash_history table.
    Executes in a threadpool to prevent blocking FastAPI's async loops.
    """
    payload = {
        "multiplier": multiplier,
        "timestamp": timestamp
    }
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        None,
        lambda: supabase.table("crash_history").insert(payload).execute()
    )

async def fetch_recent_crashes(limit: int = 50):
    """
    Queries the latest crash multipliers sorted by timestamp in descending order.
    """
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        None,
        lambda: supabase.table("crash_history")
            .select("*")
            .order("timestamp", desc=True)
            .limit(limit)
            .execute()
    )
