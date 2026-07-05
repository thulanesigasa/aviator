import { useEffect, useRef, useState, useCallback } from "react";

export interface CrashRecord {
  id?: number;
  multiplier: number;
  timestamp: string;
}

export interface SignalData {
  prediction: string;
  probability: number;
  threshold: number;
  timestamp: string | null;
}

export interface ScraperStatusData {
  healthy: boolean;
  last_scrape_timestamp: string | null;
  total_daily_records: number;
}

export interface TelemetryState extends CrashRecord {
  signal?: SignalData;
  status?: ScraperStatusData;
}

export function useWebSocket(url: string) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [latestTelemetry, setLatestTelemetry] = useState<TelemetryState | null>(null);
  const [history, setHistory] = useState<CrashRecord[]>([]);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch initial history from FastAPI HTTP endpoint to seed chart and tables
  const fetchInitialHistory = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:8000/api/history?limit=1000");
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
        if (data.length > 0) {
          const lastRecord = data[data.length - 1] as CrashRecord;
          setLatestTelemetry((prev) => ({
            ...prev,
            ...lastRecord
          }));
        }
      }
    } catch (err) {
      console.warn("[WS Hook] Unable to load initial crash history:", err);
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) return;

    setIsConnected(false);
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      console.log("[WS Hook] Connected to Aviator WebSocket Bridge.");
      fetchInitialHistory();
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        
        if (msg.type === "init") {
          setLatestTelemetry((prev) => ({
            multiplier: prev?.multiplier ?? 1.0,
            timestamp: prev?.timestamp ?? new Date().toISOString(),
            ...prev,
            signal: msg.signal as SignalData,
            status: msg.status as ScraperStatusData
          }));
        } 
        
        else if (msg.type === "multiplier") {
          const record = msg.payload as CrashRecord;
          setLatestTelemetry((prev) => ({
            ...prev,
            id: record.id,
            multiplier: record.multiplier,
            timestamp: record.timestamp,
            status: (msg.status as ScraperStatusData) || prev?.status
          }));
          
          // Append to history and enforce 1000-limit bounding
          setHistory((prev) => {
            const nextHistory = [...prev, record];
            if (nextHistory.length > 1000) {
              nextHistory.shift();
            }
            return nextHistory;
          });
        } 
        
        else if (msg.type === "signal") {
          setLatestTelemetry((prev) => ({
            multiplier: prev?.multiplier ?? 1.0,
            timestamp: prev?.timestamp ?? new Date().toISOString(),
            ...prev,
            signal: msg.payload as SignalData
          }));
        }
      } catch (err) {
        console.error("[WS Hook] Error parsing socket frame:", err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log("[WS Hook] Socket connection closed. Reconnecting in 3s...");
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = (err) => {
      console.error("[WS Hook] Socket error encountered:", err);
      ws.close();
    };
  }, [url, fetchInitialHistory]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [connect]);

  return {
    isConnected,
    latestTelemetry,
    history,
  };
}
