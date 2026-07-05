"use client";

import React from "react";
import { Server, Wifi, WifiOff } from "lucide-react";

interface ScraperStatusProps {
  status: {
    healthy: boolean;
    last_scrape_timestamp: string | null;
    total_daily_records: number;
  };
  isConnected: boolean;
}

export function ScraperStatus({ status, isConnected }: ScraperStatusProps) {
  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/5 bg-black/40 flex flex-col gap-4">
      <div className="flex items-center gap-3 border-b border-white/5 pb-3">
        <Server className="text-gray-400 w-5 h-5" />
        <h2 className="text-sm font-semibold tracking-wide text-white">Data Pipeline Health</h2>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">WebSocket Link</span>
        {isConnected ? (
          <span className="flex items-center gap-1.5 text-xs font-bold text-success-emerald bg-success-emerald/10 px-2 py-1 rounded-md border border-success-emerald/20"><Wifi className="w-3 h-3"/> ACTIVE</span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-bold text-danger-rose bg-danger-rose/10 px-2 py-1 rounded-md border border-danger-rose/20"><WifiOff className="w-3 h-3"/> OFFLINE</span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">Scraper Status</span>
        <span className={`text-xs font-bold px-2 py-1 rounded-md border ${status.healthy ? "text-success-emerald border-success-emerald/20" : "text-warning-amber border-warning-amber/20"}`}>
          {status.healthy ? "SYNCING" : "WAITING FOR DOM"}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">Session Records</span>
        <span className="text-sm font-mono text-white">{status.total_daily_records.toLocaleString()} rows</span>
      </div>
    </div>
  );
}
