import asyncio
import datetime
import httpx
from playwright.async_api import async_playwright, Page, Browser, BrowserContext
from typing import Optional

class AviatorWebListener:
    """
    Playwright-based asynchronous web scraper that connects to Chrome CDP,
    monitors the Aviator DOM history, and sends results to the backend API.
    """
    def __init__(self, cdp_url: str = "http://localhost:9222", api_url: str = "http://localhost:8000/api/ingest"):
        self.cdp_url = cdp_url
        self.api_url = api_url
        self.playwright = None
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None
        self.page: Optional[Page] = None
        
        # Selectors commonly associated with the Aviator history bar
        self.history_selectors = [
            ".stats-list div:first-child",
            ".payout:first-child",
            ".bubble-multiplier:first-child",
            ".stats-list .bubble-multiplier:first-child",
            ".multipliers-history .multiplier-item:first-child",
            ".history-ribbon div:first-child"
        ]
        self.last_multiplier: Optional[float] = None
        self.is_active = False

    async def connect(self) -> bool:
        """
        Attempts to attach to Chrome on port 9222.
        """
        try:
            self.playwright = await async_playwright().start()
            print(f"[Scraper] Connecting to Chrome CDP at {self.cdp_url}...")
            self.browser = await self.playwright.chromium.connect_over_cdp(self.cdp_url)
            self.context = self.browser.contexts[0]
            
            # Locate the active page running the Aviator game
            pages = self.context.pages
            for p in pages:
                url = p.url.lower()
                title = (await p.title()).lower()
                if "aviator" in url or "aviator" in title or "crash" in url:
                    self.page = p
                    break
            
            if not self.page and pages:
                self.page = pages[0]
                
            if self.page:
                self.page.set_default_timeout(5000)
                print(f"[Scraper] Successfully attached to page: {self.page.url}")
                return True
            else:
                print("[Scraper] No active browser pages found.")
                return False
        except Exception as e:
            print(f"[Scraper] Connection error: {e}")
            return False

    async def get_latest_multiplier(self) -> Optional[float]:
        """
        Reads the DOM of the Aviator page or its child frames to extract the most recent multiplier.
        Dynamically attaches to the correct tab if the URL or title changes.
        """
        if not self.context:
            return None

        # Dynamically locate/re-attach to the page running the Aviator game
        try:
            pages = self.context.pages
            target_page = None
            for p in pages:
                try:
                    url = p.url.lower()
                    title = (await p.title()).lower()
                    if "aviator" in url or "aviator" in title or "crash" in url:
                        target_page = p
                        break
                except Exception:
                    continue
            
            if target_page:
                self.page = target_page
            elif not self.page and pages:
                self.page = pages[0]
        except Exception as e:
            print(f"[Scraper] Error scanning active pages: {e}")

        if not self.page:
            return None

        for selector in self.history_selectors:
            # 1. Try checking the main page DOM
            try:
                element = self.page.locator(selector).first
                if await element.is_visible():
                    text = await element.text_content()
                    if text:
                        clean_text = text.replace("x", "").replace("X", "").replace("×", "").strip()
                        try:
                            return float(clean_text)
                        except ValueError:
                            pass
            except Exception:
                pass

            # 2. Try checking all child frames/iframes embedded in the page
            try:
                frames = self.page.frames
                for frame in frames:
                    try:
                        element = frame.locator(selector).first
                        if await element.is_visible():
                            text = await element.text_content()
                            if text:
                                clean_text = text.replace("x", "").replace("X", "").replace("×", "").strip()
                                try:
                                    return float(clean_text)
                                except ValueError:
                                    pass
                    except Exception:
                        continue
            except Exception:
                pass

        return None

    async def start_listening(self):
        """
        Continuously polls the page, detects new completed multipliers,
        and posts telemetry payload details to the backend API.
        """
        self.is_active = True
        print("[Scraper] Ingestion loop started. Monitoring Aviator DOM...")
        
        async with httpx.AsyncClient(timeout=5.0) as client:
            while self.is_active:
                try:
                    # Guard browser connection health
                    if not self.page or self.page.is_closed():
                        print("[Scraper] Browser connection lost. Attempting to reconnect...")
                        await self.cleanup()
                        await asyncio.sleep(5.0)
                        if await self.connect():
                            continue
                        else:
                            await asyncio.sleep(5.0)
                            continue

                    current_mult = await self.get_latest_multiplier()
                    
                    # If we successfully parsed a multiplier and it has updated
                    if current_mult is not None:
                        if self.last_multiplier is None:
                            # Initialize last multiplier state without triggering API post
                            self.last_multiplier = current_mult
                            print(f"[Scraper] Tracking initialized. Current multiplier: {current_mult}x")
                        elif current_mult != self.last_multiplier:
                            self.last_multiplier = current_mult
                            utc_now = datetime.datetime.now(datetime.timezone.utc).isoformat()
                            
                            payload = {
                                "multiplier": current_mult,
                                "timestamp": utc_now
                            }
                            print(f"[Scraper] Round completed: {current_mult}x detected at {utc_now}")
                            
                            # Deliver flight data payload to FastAPI server
                            try:
                                response = await client.post(self.api_url, json=payload)
                                if response.status_code == 200:
                                    print("[Scraper] Payload ingested by API successfully.")
                                else:
                                    print(f"[Scraper] API ingestion failure: HTTP {response.status_code}")
                            except Exception as e:
                                print(f"[Scraper] Ingestion request error: {e}")
                    
                except Exception as e:
                    print(f"[Scraper] Ingestion loop error: {e}")
                    
                # Poll every 1.5 seconds (Aviator rounds last at least 5-10s, this is more than fast enough)
                await asyncio.sleep(1.5)

    async def cleanup(self):
        """
        Closes page resources.
        """
        try:
            if self.browser:
                await self.browser.close()
            if self.playwright:
                await self.playwright.stop()
        except Exception:
            pass
        self.page = None
        self.browser = None
        self.playwright = None
