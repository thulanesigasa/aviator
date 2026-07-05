"use client";

import React from "react";

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
    <div className="glass-panel rounded-2xl p-6 border border-white/5 bg-[#0d0d0d] flex flex-col gap-4">
      <div className="border-b border-white/5 pb-3">
        <h2 className="text-lg font-bold tracking-tight text-white uppercase">Pipeline Health</h2>
        <p className="text-xs text-neutral-400 mt-0.5">Ingestion link status and socket diagnostics</p>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-neutral-400">WebSocket Link</span>
        {isConnected ? (
          <span className="text-xs font-black text-orange-500 bg-orange-950/20 px-2 py-0.5 rounded border border-orange-500/20 uppercase tracking-wide">ACTIVE</span>
        ) : (
          <span className="text-xs font-black text-red-500 bg-red-950/20 px-2 py-0.5 rounded border border-red-900/20 uppercase tracking-wide">OFFLINE</span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-neutral-400">Scraper Status</span>
        <span className={`text-xs font-black px-2 py-0.5 rounded border uppercase tracking-wide ${status.healthy ? "text-orange-500 border-orange-500/20 bg-orange-950/20" : "text-neutral-400 border-neutral-800 bg-neutral-900/30"}`}>
          {status.healthy ? "SYNCING" : "WAITING FOR DOM"}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-neutral-400">Session Records</span>
        <span className="text-sm font-bold font-mono text-white">{status.total_daily_records.toLocaleString()} rows</span>
      </div>
    </div>
  );
}
