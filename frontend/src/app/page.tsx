"use client";

import React, { useEffect, useState } from "react";
import { Activity, ShieldCheck, BarChart3, TrendingUp, Sparkles, CheckCircle2 } from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";
import { MultiplierChart } from "@/components/dashboard/multiplier-chart";
import { PatternTable } from "@/components/dashboard/pattern-table";
import { SignalAlerts } from "@/components/dashboard/signal-alerts";
import { ScraperStatus } from "@/components/dashboard/scraper-status";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/dashboard";

export default function DashboardPage() {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  
  // Connect to the Aviator centralized socket gateway
  const {
    isConnected,
    latestTelemetry,
    latestSignal,
    scraperStatus,
    history,
  } = useWebSocket(WS_URL);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Compute session KPIs
  const totalScraped = history.length;
  const avgMultiplier = totalScraped > 0 
    ? history.reduce((sum, item) => sum + item.multiplier, 0) / totalScraped
    : 1.00;
    
  const winRate15 = totalScraped > 0
    ? history.filter((item) => item.multiplier >= 1.50).length / totalScraped
    : 0.0;
    
  const winRate20 = totalScraped > 0
    ? history.filter((item) => item.multiplier >= 2.00).length / totalScraped
    : 0.0;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-gray-200 p-6 md:p-10 flex flex-col gap-8">
      {/* Header Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0a0a0a]/80 border-b border-white/5 pb-5 pt-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.4)]">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent flex items-center gap-2">
              Aviator Crash Game Analyzer
              <span className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-rose-500 font-semibold uppercase tracking-wide">
                Live Data Ingestion
              </span>
            </h1>
            <p className="text-xs text-gray-400">
              Continuous DOM monitoring, Supabase tracking, and LSTM recurrent network safety projections
            </p>
          </div>
        </div>
        
        {/* Connection status indicator */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-black/40 border border-white/5">
          <ShieldCheck className={`w-4 h-4 ${isConnected ? "text-success-emerald" : "text-danger-rose"}`} />
          <span className="text-xs font-semibold text-gray-300">
            {isConnected ? "WebSocket Online" : "Awaiting API Handshake"}
          </span>
        </div>
      </header>

      {/* Metrics Row Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        
        {/* Total Logs */}
        <div className="glass-panel rounded-2xl p-5 flex items-center justify-between bg-black/40 border border-white/5">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Session Flights</span>
            <span className="text-3xl font-bold text-white font-mono tracking-tight">
              {totalScraped}
            </span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-rose-500/10 border border-rose-500/25 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-rose-500" />
          </div>
        </div>

        {/* Mean Multiplier */}
        <div className="glass-panel rounded-2xl p-5 flex items-center justify-between bg-black/40 border border-white/5">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Mean Crash Point</span>
            <span className="text-3xl font-bold text-white font-mono tracking-tight">
              {avgMultiplier.toFixed(2)}x
            </span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-amber-500" />
          </div>
        </div>

        {/* 1.50x Target Success */}
        <div className="glass-panel rounded-2xl p-5 flex items-center justify-between bg-black/40 border border-white/5">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">1.50x Success Rate</span>
            <span className="text-3xl font-bold text-white font-mono tracking-tight">
              {(winRate15 * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
            <span className="text-xs font-bold text-emerald-500 font-mono">1.50</span>
          </div>
        </div>

        {/* 2.00x Target Success */}
        <div className="glass-panel rounded-2xl p-5 flex items-center justify-between bg-black/40 border border-white/5">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">2.00x Success Rate</span>
            <span className="text-3xl font-bold text-white font-mono tracking-tight">
              {(winRate20 * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center">
            <span className="text-xs font-bold text-indigo-500 font-mono">2.00</span>
          </div>
        </div>
      </div>

      {/* Main Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Section (span 2): Multiplier Progression Chart and History Table */}
        <div className="lg:col-span-2 flex flex-col gap-6 w-full">
          {isMounted && <MultiplierChart data={history} />}
          <PatternTable data={history} />
        </div>

        {/* Right Section (span 1): AI Signals alerts and Scraper status logs */}
        <div className="lg:col-span-1 flex flex-col gap-6 w-full">
          <SignalAlerts signal={latestSignal} />
          <ScraperStatus status={scraperStatus} isConnected={isConnected} />
        </div>

      </div>
    </main>
  );
}
