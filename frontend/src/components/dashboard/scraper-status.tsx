"use client";

import React from "react";
import { Radio, Database, Cpu, HelpCircle } from "lucide-react";

interface ScraperStatusProps {
  isActive: boolean;
  totalScraped: number;
  lastActive: string | null;
}

export function ScraperStatus({ isActive, totalScraped, lastActive }: ScraperStatusProps) {
  return (
    <div className="glass-panel rounded-2xl p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <Cpu className="text-primary-electric w-5 h-5" />
          <h2 className="text-lg font-semibold tracking-wide">Data Pipeline Status</h2>
        </div>
        
        {/* Active badge */}
        <div
          className={`px-3 py-1 text-xs font-semibold rounded-full border flex items-center gap-1.5 ${
            isActive
              ? "text-success-emerald bg-success-emerald/10 border-success-emerald/20 glow-active"
              : "text-gray-400 bg-white/5 border-white/10"
          }`}
        >
          <Radio className={`w-3.5 h-3.5 ${isActive ? "animate-pulse" : ""}`} />
          {isActive ? "LIVE SCRAPING" : "SCRAPER OFFLINE"}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Scraped Count */}
        <div className="flex justify-between items-center bg-black/25 p-4 rounded-xl border border-white/5">
          <div className="flex items-center gap-2.5">
            <Database className="text-accent-cyan w-4 h-4" />
            <span className="text-sm text-gray-300">Daily Multipliers Saved</span>
          </div>
          <span className="text-lg font-bold text-white font-mono">
            {totalScraped.toLocaleString()}
          </span>
        </div>

        {/* Pipeline Details */}
        <div className="flex flex-col gap-2.5 pt-2 text-xs text-gray-400">
          <div className="flex justify-between">
            <span>Last Scraped Match</span>
            <span className="text-white font-mono">{lastActive || "Never"}</span>
          </div>
          <div className="flex justify-between">
            <span>Interception Port</span>
            <span className="text-white font-mono">9222 (CDP Session)</span>
          </div>
          <div className="flex justify-between">
            <span>Database Mode</span>
            <span className="text-primary-electric font-semibold">Supabase PostgreSQL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
