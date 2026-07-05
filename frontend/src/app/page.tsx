"use client";

import React, { useEffect, useState } from "react";
import { Activity, ShieldAlert, Cpu, BarChart3, TrendingUp, HelpCircle, CheckCircle2 } from "lucide-react";
import { ScraperStatus } from "@/components/dashboard/scraper-status";
import { SignalAlerts, SignalPayload } from "@/components/dashboard/signal-alerts";
import { MultiplierChart } from "@/components/dashboard/multiplier-chart";
import { PatternTable } from "@/components/dashboard/pattern-table";

interface MultiplierItem {
  id: number | string;
  multiplier: number;
  timestamp: number | string;
}

interface StatsPayload {
  count: number;
  avg_multiplier: number;
  win_rate_1_5x: number;
  win_rate_2_0x: number;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/dashboard";

export default function DashboardPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [wsStatus, setWsStatus] = useState<"CONNECTED" | "CONNECTING" | "DISCONNECTED">("DISCONNECTED");
  const [history, setHistory] = useState<MultiplierItem[]>([]);
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [scraperActive, setScraperActive] = useState(false);
  const [latestSignal, setLatestSignal] = useState<SignalPayload | null>(null);
  const [lastScrapedTime, setLastScrapedTime] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);

    let socket: WebSocket;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      setWsStatus("CONNECTING");
      socket = new WebSocket(WS_URL);

      socket.onopen = () => {
        setWsStatus("CONNECTED");
        setScraperActive(true); // default active when backend is live
      };

      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          
          if (msg.type === "init") {
            const payload = msg.payload;
            setHistory(payload.history || []);
            setStats(payload.stats || null);
          } 
          
          else if (msg.type === "new_multiplier") {
            const data = msg.payload as MultiplierItem;
            setHistory((prev) => {
              const updated = [data, ...prev];
              // Cap at 100 entries locally
              return updated.slice(0, 100);
            });
            
            // Adjust local stats calculations
            setStats((prev) => {
              if (!prev) return null;
              const count = prev.count + 1;
              const mult = parseFloat(data.multiplier.toString());
              const avg = (prev.avg_multiplier * prev.count + mult) / count;
              const pass1_5 = mult >= 1.50 ? 1 : 0;
              const pass2_0 = mult >= 2.00 ? 1 : 0;
              
              const wr15 = (prev.win_rate_1_5x * prev.count + pass1_5) / count;
              const wr20 = (prev.win_rate_2_0x * prev.count + pass2_0) / count;

              return {
                count,
                avg_multiplier: round(avg, 2),
                win_rate_1_5x: round(wr15, 4),
                win_rate_2_0x: round(wr20, 4)
              };
            });

            // Update scraper active checks
            setLastScrapedTime(new Date().toLocaleTimeString());
            setScraperActive(true);
          } 
          
          else if (msg.type === "signal_alert") {
            const signal = msg.payload as SignalPayload;
            setLatestSignal(signal);
            // Clear warning alert automatically after 10 seconds
            setTimeout(() => {
              setLatestSignal(null);
            }, 10000);
          }
        } catch (err) {
          console.error("Failed to parse websocket message:", err);
        }
      };

      socket.onclose = () => {
        setWsStatus("DISCONNECTED");
        setScraperActive(false);
        reconnectTimeout = setTimeout(connect, 3000);
      };

      socket.onerror = () => {
        socket.close();
      };
    };

    connect();

    return () => {
      if (socket) socket.close();
      clearTimeout(reconnectTimeout);
    };
  }, []);

  const round = (num: number, dec: number) => {
    return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
  };

  return (
    <main className="min-h-screen p-6 md:p-10 flex flex-col gap-8">
      {/* Header Bar */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-electric to-accent-cyan flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent flex items-center gap-2">
              Aviator Crash Analyzer <span className="text-xs px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-primary-electric font-semibold uppercase tracking-wide">Data Pipeline</span>
            </h1>
            <p className="text-xs md:text-sm text-gray-400">
              Scraping multipliers 24/7, predicting sequences, and generating actionable edge signals
            </p>
          </div>
        </div>
        
        {/* API connection */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-300">
          <CheckCircle2 className="w-4 h-4 text-success-emerald" />
          <span>WebSocket Status: <strong>{wsStatus}</strong></span>
        </div>
      </header>

      {/* Metrics Badges Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="glass-panel rounded-2xl p-5 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Scraped Logs</span>
            <span className="text-3xl font-bold text-white font-mono">
              {stats?.count ? stats.count.toLocaleString() : "0"}
            </span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-primary-electric/10 border border-primary-electric/25 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary-electric" />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Mean Crash Multiplier</span>
            <span className="text-3xl font-bold text-white font-mono">
              {stats?.avg_multiplier ? `${stats.avg_multiplier.toFixed(2)}x` : "1.00x"}
            </span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-accent-cyan/10 border border-accent-cyan/25 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-accent-cyan" />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">1.50x Target Win Rate</span>
            <span className="text-3xl font-bold text-white font-mono">
              {stats?.win_rate_1_5x ? `${(stats.win_rate_1_5x * 100).toFixed(1)}%` : "0.0%"}
            </span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-success-emerald/10 border border-success-emerald/25 flex items-center justify-center">
            <span className="text-xs font-bold text-success-emerald">1.5x</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">2.00x Target Win Rate</span>
            <span className="text-3xl font-bold text-white font-mono">
              {stats?.win_rate_2_0x ? `${(stats.win_rate_2_0x * 100).toFixed(1)}%` : "0.0%"}
            </span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-warning-amber/10 border border-warning-amber/25 flex items-center justify-center">
            <span className="text-xs font-bold text-warning-amber">2.0x</span>
          </div>
        </div>
      </div>

      {/* Main layout grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Middle area charts & logs */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {isMounted && <MultiplierChart data={history.slice(0, 50)} />}
          <PatternTable history={history} />
        </div>

        {/* Right status panels */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <ScraperStatus 
            isActive={scraperActive}
            totalScraped={stats?.count ?? 0}
            lastActive={lastScrapedTime}
          />
          <SignalAlerts signal={latestSignal} />
        </div>
      </div>
    </main>
  );
}
