"use client";

import React from "react";
import { Link2, Link2Off, Calendar, Database, CheckCircle2, XCircle } from "lucide-react";

interface ScraperStatusData {
  healthy: boolean;
  last_scrape_timestamp: string | null;
  total_daily_records: number;
}

interface ScraperStatusProps {
  status: ScraperStatusData;
  isConnected: boolean; // WebSocket connection state
}

export function ScraperStatus({ status, isConnected }: ScraperStatusProps) {
  // Scraper is running and posting if status.healthy is true and ws is connected
  const isPipelineActive = status.healthy && isConnected;

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/5 bg-black/40 flex flex-col gap-5 flex-1">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          {isPipelineActive ? (
            <Link2 className="text-success-emerald w-5 h-5 animate-pulse" />
          ) : (
            <Link2Off className="text-danger-rose w-5 h-5" />
          )}
          <div>
            <h2 className="text-lg font-semibold tracking-wide">Ingestion Health</h2>
            <p className="text-xs text-gray-400">Playwright continuous background parser state</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Connection status pills */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-black/30 rounded-xl p-3 border border-white/5 flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] text-gray-500 uppercase font-semibold">FastAPI Link</span>
              <span className="text-xs font-bold text-white">{isConnected ? "ONLINE" : "OFFLINE"}</span>
            </div>
            {isConnected ? (
              <CheckCircle2 className="w-5 h-5 text-success-emerald" />
            ) : (
              <XCircle className="w-5 h-5 text-danger-rose" />
            )}
          </div>
          <div className="bg-black/30 rounded-xl p-3 border border-white/5 flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] text-gray-500 uppercase font-semibold">Web Scraper</span>
              <span className="text-xs font-bold text-white">{status.healthy ? "ACTIVE" : "STANDBY"}</span>
            </div>
            {status.healthy ? (
              <CheckCircle2 className="w-5 h-5 text-success-emerald animate-pulse" />
            ) : (
              <XCircle className="w-5 h-5 text-gray-600" />
            )}
          </div>
        </div>

        {/* Aggregated details list */}
        <div className="flex flex-col gap-3 pt-2">
          {/* Daily count */}
          <div className="flex items-center justify-between text-xs text-gray-400 border-b border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-primary-electric" />
              <span>Today's Logged Runs</span>
            </div>
            <span className="font-semibold text-white font-mono">{status.total_daily_records}</span>
          </div>

          {/* Last timestamp */}
          <div className="flex items-center justify-between text-xs text-gray-400 border-b border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary-electric" />
              <span>Last Ingestion Time</span>
            </div>
            <span className="font-semibold text-white font-mono">
              {status.last_scrape_timestamp 
                ? new Date(status.last_scrape_timestamp).toLocaleTimeString()
                : "No data received"
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
