import os
import asyncio
from dotenv import load_dotenv
from parser.web_listener import AviatorWebListener

load_dotenv()

CDP_URL = os.getenv("CHROME_CDP_URL", "http://localhost:9222")
API_INGEST_URL = os.getenv("API_INGEST_URL", "http://localhost:8000/api/ingest")

async def main():
    print("="*60)
    print("AVIATOR SCRAPER RUNNER ENGINE BOOTING UP")
    print(f"Target Chrome CDP Address: {CDP_URL}")
    print(f"Target Backend API Ingest: {API_INGEST_URL}")
    print("="*60)

    listener = AviatorWebListener(cdp_url=CDP_URL, api_url=API_INGEST_URL)
    
    retry_delay = 2
    while True:
        try:
            connected = await listener.connect()
            if connected:
                # Reset retry delay upon successful connection
                retry_delay = 2
                await listener.start_listening()
            else:
                print(f"[Runner] Unable to connect. Retrying in {retry_delay}s...")
                await asyncio.sleep(retry_delay)
                retry_delay = min(retry_delay * 1.5, 30)
        except KeyboardInterrupt:
            print("[Runner] Stopping scraper loop...")
            break
        except Exception as e:
            print(f"[Runner] Unexpected error: {e}. Retrying in {retry_delay}s...")
            await asyncio.sleep(retry_delay)
            retry_delay = min(retry_delay * 1.5, 30)
        finally:
            await listener.cleanup()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("[Runner] Scraper execution stopped by user command.")
