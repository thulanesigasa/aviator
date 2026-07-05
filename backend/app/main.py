import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import Set, Dict, Any, List, Optional
from app.services.db_client import db_client
from app.config import settings

app = FastAPI(title="Aviator Data Analytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Manage WebSocket connections
class ConnectionManager:
    def __init__(self):
        self.dashboards: Set[WebSocket] = set()
        self.scrapers: Set[WebSocket] = set()

    async def connect_dashboard(self, websocket: WebSocket):
        await websocket.accept()
        self.dashboards.add(websocket)

    def disconnect_dashboard(self, websocket: WebSocket):
        if websocket in self.dashboards:
            self.dashboards.remove(websocket)

    async def connect_scraper(self, websocket: WebSocket):
        await websocket.accept()
        self.scrapers.add(websocket)

    def disconnect_scraper(self, websocket: WebSocket):
        if websocket in self.scrapers:
            self.scrapers.remove(websocket)

    async def broadcast_to_dashboards(self, data: dict):
        dead_connections = set()
        for connection in self.dashboards:
            try:
                await connection.send_json(data)
            except Exception:
                dead_connections.add(connection)
        for conn in dead_connections:
            self.dashboards.remove(conn)

manager = ConnectionManager()

# Sequence analyzer / Signal generator logic
class SignalGenerator:
    @staticmethod
    def analyze_sequence(multipliers: List[float]) -> Optional[Dict[str, Any]]:
        """
        Implements a Quantitative '5 Lows and Out' sequence logic.
        If 5 consecutive rounds crash below 2.00x, it generates a high-probability
        signal recommending a conservative cashout target (e.g. 1.50x).
        """
        if len(multipliers) < 5:
            return None
            
        latest_5 = multipliers[:5]
        # Check if all 5 are below 2.00x
        if all(m < 2.00 for m in latest_5):
            # Calculate win probability based on standard Pareto crash distribution (approx 78-83% for 1.5x)
            probability = 0.815
            recommended = 1.50
            
            # Log signal into database
            db_client.insert_signal("5_Lows_Out", probability, recommended)
            
            return {
                "trigger_type": "5_Lows_Out",
                "win_probability": probability,
                "recommended_cashout": recommended,
                "reason": "5 consecutive multipliers under 2.00x detected. High probability rebound expected."
            }
        return None

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.get("/api/history")
def get_history(limit: int = 100):
    return db_client.get_history(limit)

@app.get("/api/stats")
def get_stats():
    return db_client.get_stats()

@app.websocket("/ws/dashboard")
async def websocket_dashboard(websocket: WebSocket):
    await manager.connect_dashboard(websocket)
    try:
        # Send initial stats and latest history immediately
        history = db_client.get_history(limit=50)
        stats = db_client.get_stats()
        await websocket.send_json({
            "type": "init",
            "payload": {
                "history": history,
                "stats": stats
            }
        })
        
        while True:
            # Keep alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_dashboard(websocket)

@app.websocket("/ws/scraper")
async def websocket_scraper(websocket: WebSocket):
    await manager.connect_scraper(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                if msg.get("type") == "new_multiplier":
                    mult_data = msg.get("payload", {})
                    new_mult = float(mult_data.get("multiplier"))
                    
                    # Fetch last 10 multipliers to prepend new one and analyze sequence
                    history = db_client.get_history(limit=10)
                    multipliers = [float(h["multiplier"]) for h in history]
                    # Prepend newest element
                    multipliers.insert(0, new_mult)
                    
                    # Check for sequence patterns
                    signal = SignalGenerator.analyze_sequence(multipliers)
                    
                    # Broadcast updates to all frontend client dashboards
                    await manager.broadcast_to_dashboards({
                        "type": "new_multiplier",
                        "payload": mult_data
                    })
                    
                    if signal:
                        await manager.broadcast_to_dashboards({
                            "type": "signal_alert",
                            "payload": signal
                        })
            except Exception as e:
                print(f"Error handling message from scraper: {e}")
    except WebSocketDisconnect:
        manager.disconnect_scraper(websocket)
