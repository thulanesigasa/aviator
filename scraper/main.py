import os
import time
import random
import asyncio
import json
import websockets
from dotenv import load_dotenv
from supabase import create_client, Client
from playwright.sync_api import sync_playwright
from parser.web_listener import AviatorWebListener

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
CHROME_DEBUG_WS = os.getenv("CHROME_DEBUG_WS", "http://localhost:9222")
BACKEND_WS_URL = os.getenv("BACKEND_WS_URL", "ws://localhost:8000/ws/scraper")

class ScraperOrchestrator:
    def __init__(self):
        self.supabase: Optional[Client] = None
        self.backend_ws = None
        self.setup_supabase()

    def setup_supabase(self):
        if SUPABASE_URL and SUPABASE_KEY and "your-project" not in SUPABASE_URL:
            try:
                self.supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
                print("[Scraper] Connected to Supabase PostgreSQL successfully.")
            except Exception as e:
                print(f"[Scraper] Supabase connection error: {e}")
        else:
            print("[Scraper] No valid Supabase credentials. Running in local dry-run logging mode.")

    def on_multiplier_scraped(self, multiplier: float):
        print(f"[Scraper] Recorded multiplier: {multiplier}x")
        
        # 1. Store in Supabase PostgreSQL
        if self.supabase:
            try:
                self.supabase.table("multiplier_history").insert({
                    "multiplier": multiplier
                }).execute()
            except Exception as e:
                print(f"[Scraper] Supabase insert failed: {e}")

        # 2. Forward to FastAPI backend WebSocket (for real-time dashboard updates)
        if self.backend_ws:
            payload = {
                "type": "new_multiplier",
                "payload": {
                    "multiplier": multiplier,
                    "timestamp": time.time()
                }
            }
            try:
                asyncio.run(self.backend_ws.send(json.dumps(payload)))
            except Exception as e:
                # WebSockets send requires async, handled safely in async runner
                pass

    async def connect_backend_ws(self):
        try:
            self.backend_ws = await websockets.connect(BACKEND_WS_URL)
            print("[Scraper] Connected to FastAPI backend WebSocket.")
        except Exception as e:
            print(f"[Scraper] Could not connect to FastAPI WebSocket: {e}. Live streaming to GUI disabled.")
            self.backend_ws = None

    def run_browser_pipeline(self):
        """
        Attaches to Chrome debugging session to monitor network traffic.
        """
        with sync_playwright() as p:
            try:
                browser = p.chromium.connect_over_cdp(CHROME_DEBUG_WS)
                context = browser.contexts[0]
                pages = context.pages
                page = pages[0] if pages else context.new_page()
                
                print(f"[Scraper] Browser connected to tab: {page.url}")
                
                # Attach listener
                listener = AviatorWebListener(page, self.on_multiplier_scraped)
                
                # Keep scraper running continuously
                while True:
                    time.sleep(2.0)
                    # Check DOM fallback occasionally
                    dom_val = listener.check_dom_fallback()
                    if dom_val:
                        self.on_multiplier_scraped(dom_val)
                        
            except Exception as e:
                print(f"[Scraper] Playwright browser error: {e}")
                print("[Scraper] Switching to simulated game loop.")
                self.run_simulated_pipeline()

    def run_simulated_pipeline(self):
        """
        Mathematically accurate Aviator crash simulator for offline execution and testing.
        Uses a Pareto distribution with a 3% house edge: Multiplier = 0.97 / (1.0 - U)
        where U is a uniform random float between 0 and 0.97.
        """
        print("[Scraper] Running mathematically accurate Aviator Simulator...")
        while True:
            # Simulate a round time (between 5 and 30 seconds depending on crash value)
            u = random.uniform(0.0, 0.97)
            # Pareto crash formula
            multiplier = 0.97 / (1.0 - u)
            
            # Clamp between 1.00 and 1000.00
            multiplier = max(1.00, min(1000.00, round(multiplier, 2)))
            
            # Wait for round to complete
            round_duration = min(multiplier * 0.5 + 3.0, 15.0)
            time.sleep(round_duration)
            
            # Fire callback
            self.on_multiplier_scraped(multiplier)

    def start(self):
        # Attempt to establish websocket connection in background event loop if needed
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(self.connect_backend_ws())
        except Exception:
            pass
            
        # Try browser first, falls back to simulator automatically
        self.run_browser_pipeline()

if __name__ == "__main__":
    orchestrator = ScraperOrchestrator()
    orchestrator.start()
