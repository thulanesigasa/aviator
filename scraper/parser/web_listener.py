import re
import json
import time
from playwright.sync_api import Page, WebSocket
from typing import Callable, Optional

class AviatorWebListener:
    """
    Scrapes Aviator crash results by hooking into the browser's raw WebSocket traffic
    and falling back to DOM inspection when necessary.
    """
    def __init__(self, page: Page, on_multiplier_callback: Callable[[float], None]):
        self.page = page
        self.on_multiplier = on_multiplier_callback
        self.active_websocket: Optional[WebSocket] = None
        self.setup_listeners()

    def setup_listeners(self):
        # Listen for WebSocket connections initiated by the page
        self.page.on("websocket", self._handle_websocket)

    def _handle_websocket(self, ws: WebSocket):
        self.active_websocket = ws
        print(f"[Scraper] WebSocket connected: {ws.url}")

        @ws.on("framereceived")
        def handle_frame(payload):
            try:
                # Intercept and decode WebSocket frames
                frame_text = ""
                if isinstance(payload, bytes):
                    frame_text = payload.decode("utf-8", errors="ignore")
                else:
                    frame_text = str(payload)

                # Look for typical Aviator telemetry keys
                # E.g. {"type": "crash", "val": 2.34} or similar payloads
                if "crash" in frame_text.lower() or "multiplier" in frame_text.lower() or "result" in frame_text.lower():
                    # Attempt JSON parsing
                    try:
                        data = json.loads(frame_text)
                        # Adapt to typical schema patterns
                        mult = data.get("multiplier") or data.get("val") or data.get("crash_value")
                        if mult:
                            self.on_multiplier(float(mult))
                            return
                    except json.JSONDecodeError:
                        pass
                    
                    # Regex fallback for unstructured messages (e.g. "crash:2.35" or "multiplier=4.20")
                    match = re.search(r'(?:crash|multiplier|result)[\s\:\=\"]+([0-9\.]+)', frame_text, re.IGNORECASE)
                    if match:
                        val = float(match.group(1))
                        self.on_multiplier(val)
            except Exception as e:
                print(f"[Scraper] Error parsing WebSocket frame: {e}")

    def check_dom_fallback(self) -> Optional[float]:
        """
        DOM fallback parsing that inspects active crash history indicators.
        """
        try:
            # Typical selectors for game multiplier lists
            selectors = [
                ".multiplier-history .item",
                ".crash-history .bubble",
                ".history-item",
                ".stats-list div"
            ]
            
            for selector in selectors:
                elements = self.page.locator(selector).all()
                if elements:
                    # Fetch latest item (often index 0 or -1 depending on list order)
                    latest_el = elements[-1]
                    text = latest_el.text_content()
                    if text:
                        # Extract float (e.g. "1.98x" -> 1.98)
                        match = re.search(r'([0-9\.]+)\s*[xX]?', text)
                        if match:
                            return float(match.group(1))
        except Exception as e:
            print(f"[Scraper] DOM fallback extraction failed: {e}")
        return None
