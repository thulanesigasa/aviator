"use client";

import React, { useState } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import { MultiplierChart } from "@/components/dashboard/multiplier-chart";
import { PatternTable } from "@/components/dashboard/pattern-table";
import { SignalAlerts } from "@/components/dashboard/signal-alerts";
import { ScraperStatus } from "@/components/dashboard/scraper-status";

const WS_URL = "ws://localhost:8000/ws/dashboard";

export default function AviatorDashboard() {
  const { isConnected, latestTelemetry, history } = useWebSocket(WS_URL);
  const [activeTab, setActiveTab] = useState<"analytics" | "history">("analytics");

  const signal = latestTelemetry?.signal || { prediction: "AWAITING DATA", probability: 0, threshold: 0, timestamp: null };
  const scraperStatus = latestTelemetry?.status || { healthy: false, last_scrape_timestamp: null, total_daily_records: 0 };
  
  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans selection:bg-orange-500/30">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* Minimal text-based header and status indicator */}
        <header className="flex items-center justify-between py-2 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white uppercase">
              Aviator LSTM <span className="text-orange-500">Predictor</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1 uppercase tracking-wider">
              Time-Series Sequence Analysis & Live Telemetry Stream
            </p>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1 rounded border border-neutral-800 bg-[#0d0d0d]">
            <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-orange-500 animate-pulse" : "bg-red-500"}`}></span>
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              {isConnected ? "ONLINE" : "OFFLINE"}
            </span>
          </div>
        </header>

        {/* Tab Navigation Menu */}
        <div className="flex gap-6 border-b border-neutral-900 pb-2">
          <button
            onClick={() => setActiveTab("analytics")}
            className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider transition-all relative cursor-pointer ${
              activeTab === "analytics" ? "text-orange-500" : "text-neutral-500 hover:text-white"
            }`}
          >
            Analytics
            {activeTab === "analytics" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-orange-500"></span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider transition-all relative cursor-pointer ${
              activeTab === "history" ? "text-orange-500" : "text-neutral-500 hover:text-white"
            }`}
          >
            History
            {activeTab === "history" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-orange-500"></span>
            )}
          </button>
        </div>

        {/* Dashboard Grid Workspace Toggle */}
        {activeTab === "analytics" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
            {/* Left Column: Multiplier Chart */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <MultiplierChart data={history} />
            </div>

            {/* Right Column: AI Signals & Server Health */}
            <div className="flex flex-col gap-6">
              <SignalAlerts signal={signal} />
              <ScraperStatus status={scraperStatus} isConnected={isConnected} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
            {/* Left Column: Historical Table with Limit Selector */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <PatternTable data={history} />
            </div>

            {/* Right Column: Pipeline Status check */}
            <div className="flex flex-col gap-6">
              <ScraperStatus status={scraperStatus} isConnected={isConnected} />
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}
