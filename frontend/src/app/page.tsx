"use client";

import React from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import { MultiplierChart } from "@/components/dashboard/multiplier-chart";
import { SignalAlerts } from "@/components/dashboard/signal-alerts";
import { ScraperStatus } from "@/components/dashboard/scraper-status";

const WS_URL = "ws://localhost:8000/ws/dashboard";

export default function AviatorDashboard() {
  const { isConnected, latestTelemetry, history } = useWebSocket(WS_URL);

  const signal = latestTelemetry?.signal || { prediction: "AWAITING DATA", probability: 0, threshold: 0, timestamp: null };
  const scraperStatus = latestTelemetry?.status || { healthy: false, last_scrape_timestamp: null, total_daily_records: 0 };
  
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 font-sans selection:bg-primary-electric/30">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        
        <header className="flex items-center justify-between py-2 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-danger-rose to-orange-400 bg-clip-text text-transparent">
              Aviator LSTM Predictor
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Time-Series Sequence Analysis & Live Signals
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
          {/* Left Column: Charts */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <MultiplierChart data={history} />
          </div>

          {/* Right Column: AI Signals & Server Health */}
          <div className="flex flex-col gap-6">
            <SignalAlerts signal={signal} />
            <ScraperStatus status={scraperStatus} isConnected={isConnected} />
          </div>
        </div>
      </div>
    </div>
  );
}
