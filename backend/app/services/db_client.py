from supabase import create_client, Client
from app.config import settings
from typing import List, Dict, Any

class SupabaseDbClient:
    """
    Interfaces the FastAPI server with the Supabase database.
    """
    def __init__(self):
        self.client: Optional[Client] = None
        if "your-project" not in settings.SUPABASE_URL:
            try:
                self.client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            except Exception as e:
                print(f"[Backend DB] Supabase init failed: {e}")

    def get_history(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Retrieves the latest crash multipliers sorted by timestamp descending.
        """
        if not self.client:
            # Mock fallback data for offline mode
            import time
            return [
                {"id": i, "timestamp": time.time() - (i * 10), "multiplier": round(1.5 + (i % 3) * 0.5, 2)}
                for i in range(limit)
            ]
        try:
            response = self.client.table("multiplier_history") \
                .select("*") \
                .order("timestamp", desc=True) \
                .limit(limit) \
                .execute()
            return response.data or []
        except Exception as e:
            print(f"[Backend DB] Error fetching history: {e}")
            return []

    def get_stats(self) -> Dict[str, Any]:
        """
        Returns average crash multipliers, win rate ratios at standard targets.
        """
        history = self.get_history(limit=500)
        if not history:
            return {"count": 0, "avg": 1.0, "win_rate_1_5x": 0.0, "win_rate_2_0x": 0.0}

        multipliers = [float(h["multiplier"]) for h in history]
        count = len(multipliers)
        avg = sum(multipliers) / count
        
        # Calculate win rates for 1.5x and 2.0x target values
        win_1_5 = sum(1 for m in multipliers if m >= 1.50) / count
        win_2_0 = sum(1 for m in multipliers if m >= 2.00) / count

        return {
            "count": count,
            "avg_multiplier": round(avg, 2),
            "win_rate_1_5x": round(win_1_5, 4),
            "win_rate_2_0x": round(win_2_0, 4)
        }

    def insert_signal(self, trigger_type: str, win_probability: float, recommended_cashout: float):
        if not self.client:
            print(f"[Backend DB Mock] Signal logged: {trigger_type} ({win_probability * 100}%)")
            return
        try:
            self.client.table("pattern_signals").insert({
                "trigger_type": trigger_type,
                "win_probability": win_probability,
                "recommended_cashout": recommended_cashout
            }).execute()
        except Exception as e:
            print(f"[Backend DB] Error inserting signal: {e}")

db_client = SupabaseDbClient()
