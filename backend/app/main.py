import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Set, Dict, Any, Optional
from app.services.db_client import insert_crash_record, fetch_recent_crashes

app = FastAPI(title="Aviator Analyzer API Gateway")

# Enable CORS for Next.js dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CrashPayload(BaseModel):
    multiplier: float
    timestamp: str

# Shared runtime state caches
class SystemStateStore:
    def __init__(self):
        self.dashboards: Set[WebSocket] = set()
        self.latest_signal: Dict[str, Any] = {
            "prediction": "WAIT: Downward Trend",
            "probability": 0.45,
            "threshold": 1.50,
            "timestamp": None
        }
        self.scraper_status: Dict[str, Any] = {
            "healthy": False,
            "last_scrape_timestamp": None,
            "total_daily_records": 0
        }

state = SystemStateStore()

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.post("/api/ingest")
async def ingest_crash(payload: CrashPayload):
    """
    Ingestion endpoint called by the Playwright scraper.
    Writes telemetry parameters to Supabase, updates status checks, and broadcasts to active clients.
    """
    try:
        # Save payload to Supabase
        await insert_crash_record(payload.multiplier, payload.timestamp)
        
        # Update live scraper status details
        state.scraper_status["healthy"] = True
        state.scraper_status["last_scrape_timestamp"] = payload.timestamp
        state.scraper_status["total_daily_records"] += 1
        
        # Broadcast updating metrics immediately to dashboards
        broadcast_payload = {
            "type": "multiplier",
            "payload": {
                "multiplier": payload.multiplier,
                "timestamp": payload.timestamp
            },
            "status": state.scraper_status
        }
        await broadcast_message(broadcast_payload)
        return {"status": "success"}
    except Exception as e:
        state.scraper_status["healthy"] = False
        raise HTTPException(status_code=500, detail=f"Database write failure: {e}")

@app.get("/api/history")
async def get_history(limit: int = 50):
    """
    HTTP endpoint retrieving recent crash records from Supabase.
    """
    try:
        response = await fetch_recent_crashes(limit)
        data = response.data or []
        # Re-sort to chronological order for dashboard charts
        data.reverse()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/signals/latest")
def get_signals():
    """
    Serves the latest neural network prediction.
    """
    return state.latest_signal

@app.post("/api/signals/update")
async def update_signals(signal_payload: Dict[str, Any]):
    """
    Private endpoint called by the LSTM analytics service to post predictions.
    """
    state.latest_signal = {
        "prediction": signal_payload.get("prediction", "WAIT"),
        "probability": signal_payload.get("probability", 0.0),
        "threshold": signal_payload.get("threshold", 1.50),
        "timestamp": signal_payload.get("timestamp")
    }
    
    # Broadcast updating predictions payload immediately to dashboard WS clients
    await broadcast_message({
        "type": "signal",
        "payload": state.latest_signal
    })
    return {"status": "success"}

@app.websocket("/ws/dashboard")
async def websocket_dashboard(websocket: WebSocket):
    """
    Registers a dashboard connection and streams telemetry updates.
    """
    await websocket.accept()
    state.dashboards.add(websocket)
    print(f"[API] Dashboard client connected. Total clients: {len(state.dashboards)}")
    
    # Send initial states upon connect handshake
    try:
        await websocket.send_json({
            "type": "init",
            "signal": state.latest_signal,
            "status": state.scraper_status
        })
        while True:
            # Maintain active connection
            await websocket.receive_text()
    except WebSocketDisconnect:
        state.dashboards.remove(websocket)
        print(f"[API] Dashboard disconnected. Remaining: {len(state.dashboards)}")

async def broadcast_message(message: dict):
    """
    Broadcasts message payloads to all connected dashboard websockets.
    """
    dead_sockets = set()
    for ws in state.dashboards:
        try:
            await ws.send_json(message)
        except Exception:
            dead_sockets.add(ws)
            
    for dead in dead_sockets:
        if dead in state.dashboards:
            state.dashboards.remove(dead)
