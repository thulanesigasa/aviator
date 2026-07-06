"use client";

import React, { useState, useEffect } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import { MultiplierChart } from "@/components/dashboard/multiplier-chart";
import { PatternTable } from "@/components/dashboard/pattern-table";
import { SignalAlerts } from "@/components/dashboard/signal-alerts";
import { ScraperStatus } from "@/components/dashboard/scraper-status";

const WS_URL = "ws://localhost:8000/ws/dashboard";

type TabType = "analytics" | "history" | "features" | "faq" | "architecture" | "policies" | "contact";

export default function AviatorDashboard() {
  const { isConnected, latestTelemetry, history } = useWebSocket(WS_URL);
  const [activeTab, setActiveTab] = useState<TabType>("analytics");

  // Archive States
  const [selectedDate, setSelectedDate] = useState<string>("today");
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [archivedHistory, setArchivedHistory] = useState<any[] | null>(null);

  const signal = latestTelemetry?.signal || { prediction: "AWAITING DATA", probability: 0, threshold: 0, timestamp: null };
  const scraperStatus = latestTelemetry?.status || { healthy: false, last_scrape_timestamp: null, total_daily_records: 0 };
  
  const tzOffset = typeof window !== "undefined" ? -new Date().getTimezoneOffset() : 0;

  // Poll unique calendar dates with telemetry logs from backend
  useEffect(() => {
    const fetchDates = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/history/dates?tz_offset=${tzOffset}`);
        if (res.ok) {
          const dates = await res.json();
          setAvailableDates(dates);
        }
      } catch (err) {
        console.error("Error loading historical dates:", err);
      }
    };

    fetchDates();
    const interval = setInterval(fetchDates, 15000);
    return () => clearInterval(interval);
  }, [tzOffset]);

  // Query static history archives when non-today date is chosen
  useEffect(() => {
    if (selectedDate === "today") {
      setArchivedHistory(null);
      return;
    }

    const fetchArchive = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/history?limit=1000&date=${selectedDate}&tz_offset=${tzOffset}`);
        if (res.ok) {
          const data = await res.json();
          setArchivedHistory(data);
        }
      } catch (err) {
        console.error("Error loading archived data:", err);
      }
    };

    fetchArchive();
  }, [selectedDate, tzOffset]);

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans selection:bg-orange-500/30 flex flex-col justify-between gap-12">
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-6">
        
        {/* Header System */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between py-2 border-b border-white/5 pb-6 gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2">
                <span>Aviator LSTM</span> <span className="text-orange-500">Predictor</span>
                <span className={`w-2 h-2 rounded-full inline-block ${isConnected ? "bg-orange-500 animate-pulse" : "bg-red-500"}`}></span>
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5 uppercase tracking-wider font-medium">
                Sequence Analysis & Live Telemetry Stream
              </p>
            </div>
          </div>
          <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest bg-neutral-900/50 border border-white/5 px-3 py-1.5 rounded-full">
            Local Clock: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (GMT{tzOffset >= 0 ? `+${tzOffset/60}` : tzOffset/60})
          </div>
        </header>

        {/* Tab Navigation Menu */}
        <div className="flex flex-wrap gap-4 md:gap-6 border-b border-neutral-900 pb-2">
          {(["analytics", "history", "features", "faq", "architecture", "policies", "contact"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider transition-all relative cursor-pointer ${
                activeTab === tab ? "text-orange-500" : "text-neutral-500 hover:text-white"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-orange-500"></span>
              )}
            </button>
          ))}
        </div>

        {/* 1. Analytics Section */}
        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <MultiplierChart 
                data={history} 
                targets={signal.strategies ? {
                  conservative: signal.strategies.conservative.target,
                  balanced: signal.strategies.balanced.target,
                  aggressive: signal.strategies.aggressive.target
                } : undefined}
              />
            </div>
            <div className="flex flex-col gap-6">
              <SignalAlerts signal={signal} />
              <ScraperStatus status={scraperStatus} isConnected={isConnected} />
            </div>
          </div>
        )}

        {/* 2. History Section */}
        {activeTab === "history" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <PatternTable 
                data={selectedDate === "today" ? history : (archivedHistory || [])} 
                selectedDate={selectedDate}
                availableDates={availableDates}
                onDateChange={setSelectedDate}
              />
            </div>
            <div className="flex flex-col gap-6">
              <ScraperStatus status={scraperStatus} isConnected={isConnected} />
            </div>
          </div>
        )}

        {/* 3. Features Section */}
        {activeTab === "features" && (
          <div className="flex flex-col gap-8 mt-2 animate-in fade-in duration-200">
            <div className="border-b border-white/5 pb-4">
              <h2 className="text-3xl font-extrabold tracking-tight text-white uppercase">Features & Capabilities</h2>
              <p className="text-xs text-neutral-400 mt-1 uppercase tracking-wide">Dynamic predictive modeling and telemetry automation overview</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0d0d0d] p-6 rounded-2xl border border-white/5 flex flex-col gap-3 font-mono">
                <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">Automation</span>
                <h3 className="text-lg font-bold text-white uppercase">Continuous DOM Scraper</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Attached over Chrome CDP port 9222, the Playwright automation driver tracks game frames, identifies outcome elements instantly on resolution, and registers records in Postgres.
                </p>
              </div>
              <div className="bg-[#0d0d0d] p-6 rounded-2xl border border-white/5 flex flex-col gap-3 font-mono">
                <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">Machine Learning</span>
                <h3 className="text-lg font-bold text-white uppercase">PyTorch LSTM Predictor</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Processes historical sequence logs to identify sequential patterns. Fits weights dynamically using rolling mini-epoch SGD optimizations as new rounds complete.
                </p>
              </div>
              <div className="bg-[#0d0d0d] p-6 rounded-2xl border border-white/5 flex flex-col gap-3 font-mono">
                <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">Analytics</span>
                <h3 className="text-lg font-bold text-white uppercase">Trend-Adaptive Exits</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Translates game momentum into risk brackets. Calculates targets dynamically using 25th, 50th, and 75th percentiles of the active session trend history.
                </p>
              </div>
            </div>
            <div className="bg-[#0d0d0d] p-8 rounded-2xl border border-white/5 flex flex-col gap-4">
              <h3 className="text-lg font-bold text-white uppercase tracking-tight">System Tech Stack Summary</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 font-mono text-xs mt-2">
                <div className="flex flex-col gap-1">
                  <span className="text-neutral-500 text-[10px] uppercase">Core Backend</span>
                  <span className="text-white font-bold">Python 3.11</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-neutral-500 text-[10px] uppercase">ML Modeling</span>
                  <span className="text-white font-bold">PyTorch / RNN</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-neutral-500 text-[10px] uppercase">Storage Hub</span>
                  <span className="text-white font-bold">Supabase (PostgreSQL)</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-neutral-500 text-[10px] uppercase">UI Architecture</span>
                  <span className="text-white font-bold">Next.js & Recharts</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. FAQ Section */}
        {activeTab === "faq" && (
          <div className="flex flex-col gap-8 mt-2 animate-in fade-in duration-200">
            <div className="border-b border-white/5 pb-4">
              <h2 className="text-3xl font-extrabold tracking-tight text-white uppercase">Frequently Asked Questions</h2>
              <p className="text-xs text-neutral-400 mt-1 uppercase tracking-wide">Common integration, modeling, and operational questions answered</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0d0d0d] p-6 rounded-2xl border border-white/5 flex flex-col gap-2">
                <h4 className="font-bold text-white text-sm uppercase tracking-wide">Q: How does the model calculate safety percentages?</h4>
                <p className="text-xs text-neutral-400 leading-relaxed mt-1 font-mono">
                  A: The confidence index is a composite blend of mathematical game physics (0.97 / target), empirical session success rates over the last 50 flights, and active LSTM sequence trends.
                </p>
              </div>
              <div className="bg-[#0d0d0d] p-6 rounded-2xl border border-white/5 flex flex-col gap-2">
                <h4 className="font-bold text-white text-sm uppercase tracking-wide">Q: What happens to data during the midnight rollover?</h4>
                <p className="text-xs text-neutral-400 leading-relaxed mt-1 font-mono">
                  A: At exactly 23:59:59 local time, the telemetry system closes the current daily logs, archives the records under their calendar date (visible in the History dropdown), and starts a fresh readings cache.
                </p>
              </div>
              <div className="bg-[#0d0d0d] p-6 rounded-2xl border border-white/5 flex flex-col gap-2">
                <h4 className="font-bold text-white text-sm uppercase tracking-wide">Q: Why do targets change dynamically?</h4>
                <p className="text-xs text-neutral-400 leading-relaxed mt-1 font-mono">
                  A: When the game runs hot (long flights), target thresholds automatically rise to capture larger multipliers. If a cold streak hits, targets drop down to protect your session bankroll.
                </p>
              </div>
              <div className="bg-[#0d0d0d] p-6 rounded-2xl border border-white/5 flex flex-col gap-2">
                <h4 className="font-bold text-white text-sm uppercase tracking-wide">Q: How do I resolve an OFFLINE scraper status?</h4>
                <p className="text-xs text-neutral-400 leading-relaxed mt-1 font-mono">
                  A: Ensure Chrome is launched with "--remote-debugging-port=9222" and that the browser window containing the Hollywoodbets Aviator tab is open (even if minimized).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 5. Architecture Section */}
        {activeTab === "architecture" && (
          <div className="flex flex-col gap-8 mt-2 animate-in fade-in duration-200">
            <div className="border-b border-white/5 pb-4">
              <h2 className="text-3xl font-extrabold tracking-tight text-white uppercase">Pipeline Architecture</h2>
              <p className="text-xs text-neutral-400 mt-1 uppercase tracking-wide">Decoupled microservice loop configuration and data structures</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 font-mono text-xs">
              <div className="bg-[#0d0d0d] p-6 rounded-2xl border border-white/5 flex flex-col gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center font-bold text-orange-500">1</div>
                <span className="text-[10px] text-neutral-500 uppercase">Step 1: Scrape</span>
                <h4 className="font-bold text-white uppercase text-sm">Chrome CDP Link</h4>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Playwright client attaches to port 9222, pulls the DOM history list, and POSTs resolved multipliers to the backend gateway.
                </p>
              </div>
              <div className="bg-[#0d0d0d] p-6 rounded-2xl border border-white/5 flex flex-col gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center font-bold text-orange-500">2</div>
                <span className="text-[10px] text-neutral-500 uppercase">Step 2: Gate</span>
                <h4 className="font-bold text-white uppercase text-sm">FastAPI Bridge</h4>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Validates data payloads, writes flight logs into Supabase, and broadcasts updates over persistent WebSocket connections.
                </p>
              </div>
              <div className="bg-[#0d0d0d] p-6 rounded-2xl border border-white/5 flex flex-col gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center font-bold text-orange-500">3</div>
                <span className="text-[10px] text-neutral-500 uppercase">Step 3: Train & Forecast</span>
                <h4 className="font-bold text-white uppercase text-sm">PyTorch LSTM</h4>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Queries history, executes rolling gradient descents to adapt weights, and calculates risk-stratified strategy exits.
                </p>
              </div>
              <div className="bg-[#0d0d0d] p-6 rounded-2xl border border-white/5 flex flex-col gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center font-bold text-orange-500">4</div>
                <span className="text-[10px] text-neutral-500 uppercase">Step 4: Stream</span>
                <h4 className="font-bold text-white uppercase text-sm">React Dashboard</h4>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Hydrates live Recharts trends, processes chronological tables, and renders strategy visualizers in real-time.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 6. Policies Section */}
        {activeTab === "policies" && (
          <div className="flex flex-col gap-8 mt-2 animate-in fade-in duration-200">
            <div className="border-b border-white/5 pb-4">
              <h2 className="text-3xl font-extrabold tracking-tight text-white uppercase">Operational Policies</h2>
              <p className="text-xs text-neutral-400 mt-1 uppercase tracking-wide">Privacy logs, execution terms, and strategy disclaimers</p>
            </div>
            
            <div className="flex flex-col gap-6 max-w-4xl">
              {/* Privacy Policy */}
              <div className="bg-[#0d0d0d] p-8 rounded-2xl border border-white/5 flex flex-col gap-3">
                <h3 className="text-lg font-bold text-white uppercase tracking-wide">1. Data Privacy & Telemetry Logging</h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-mono">
                  This system processes game telemetry data strictly within a local pipeline. We only read publicly available flight crash multipliers and timestamps from the browser DOM. No user-identifying attributes, account credentials, billing details, or gaming session logs are monitored, stored, or shared.
                </p>
              </div>

              {/* Terms of Service */}
              <div className="bg-[#0d0d0d] p-8 rounded-2xl border border-white/5 flex flex-col gap-3">
                <h3 className="text-lg font-bold text-white uppercase tracking-wide">2. Terms of Local Execution</h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-mono">
                  This software is provided purely for local research, statistical modeling, and backtest evaluation. Users assume all responsibility and risk regarding the execution of these services. Commercial redistribution, automated betting deployment, or marketing these predictions as financial advice is strictly prohibited.
                </p>
              </div>

              {/* Risk Disclaimer */}
              <div className="bg-orange-950/20 p-8 rounded-2xl border border-orange-500/20 flex flex-col gap-3">
                <h3 className="text-lg font-bold text-orange-500 uppercase tracking-wide">3. Strategy Risk & Variance Disclaimer</h3>
                <p className="text-xs text-orange-400/80 leading-relaxed font-mono">
                  Neural network predictions and strategy exits are calculated based on pattern distributions. Past outcomes do not guarantee future results. Algorithmic modeling is subject to sudden game shifts, streak clustering, and high variance. Manage simulation stakes with caution.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 7. Contact Section */}
        {activeTab === "contact" && (
          <div className="flex flex-col gap-8 mt-2 animate-in fade-in duration-200">
            <div className="border-b border-white/5 pb-4">
              <h2 className="text-3xl font-extrabold tracking-tight text-white uppercase">Contact & Support</h2>
              <p className="text-xs text-neutral-400 mt-1 uppercase tracking-wide">Developer support and operational outreach grids</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
              <div className="bg-[#0d0d0d] p-6 rounded-2xl border border-white/5 flex flex-col gap-4 font-mono">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Support Coordinates</h3>
                <div className="flex flex-col gap-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-500 uppercase">Support Email</span>
                    <span className="text-white font-bold">support@aviator-lstm.tech</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 uppercase">Developer</span>
                    <span className="text-white font-bold">Thulane Sigasa</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 uppercase">Active Core</span>
                    <span className="text-white font-bold">FastAPI / WebSockets</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0d0d0d] p-6 rounded-2xl border border-white/5 flex flex-col gap-4 font-mono">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Repository Details</h3>
                <div className="flex flex-col gap-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-500 uppercase">GitHub Repo</span>
                    <a href="https://github.com/thulanesigasa/aviator" target="_blank" rel="noreferrer" className="text-orange-500 hover:underline">thulanesigasa/aviator</a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 uppercase">Version Tag</span>
                    <span className="text-white font-bold">v1.2.0-stable</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 uppercase">Licensing</span>
                    <span className="text-white font-bold">MIT Open License</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Footer System */}
      <footer className="w-full max-w-7xl mx-auto border-t border-white/5 pt-10 mt-12 flex flex-col gap-8 bg-black">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Main Logo & Pipeline Summary */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-black uppercase text-white tracking-widest">
              aviator <span className="text-orange-500">tech</span>
            </span>
            <p className="text-xs text-neutral-405 leading-relaxed max-w-xs text-neutral-400">
              Empowering algorithmic analysts with recurrent neural network time-series calculations to model safety thresholds and manage flight trend data.
            </p>
            <div className="flex gap-4 mt-2 text-[10px] font-bold text-neutral-400 font-mono tracking-wider">
              <a href="https://github.com/thulanesigasa/aviator" target="_blank" rel="noreferrer" className="hover:text-orange-500 transition-colors">GITHUB</a>
              <span className="text-neutral-600">|</span>
              <span className="text-neutral-500">SUPPORT ACTIVE</span>
            </div>
          </div>

          {/* System Links */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white">System</span>
            <div className="flex flex-col gap-2 text-xs text-neutral-400 font-medium">
              <button onClick={() => setActiveTab("features")} className="text-left hover:text-orange-500 cursor-pointer transition-colors">Features</button>
              <button onClick={() => setActiveTab("architecture")} className="text-left hover:text-orange-500 cursor-pointer transition-colors font-mono uppercase text-[11px]">Architecture</button>
              <button onClick={() => setActiveTab("analytics")} className="text-left hover:text-orange-500 cursor-pointer transition-colors">Dashboard</button>
            </div>
          </div>

          {/* Resources Links */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white">Resources</span>
            <div className="flex flex-col gap-2 text-xs text-neutral-400 font-medium">
              <button onClick={() => setActiveTab("faq")} className="text-left hover:text-orange-500 cursor-pointer transition-colors">FAQ</button>
              <button onClick={() => setActiveTab("contact")} className="text-left hover:text-orange-500 cursor-pointer transition-colors font-mono uppercase text-[11px]">Contact</button>
            </div>
          </div>

          {/* Policies Links */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white">Policies</span>
            <div className="flex flex-col gap-2 text-xs text-neutral-400 font-medium">
              <button onClick={() => setActiveTab("policies")} className="text-left hover:text-orange-500 cursor-pointer transition-colors">Privacy Policy</button>
              <button onClick={() => setActiveTab("policies")} className="text-left hover:text-orange-500 cursor-pointer transition-colors font-mono uppercase text-[11px]">Terms of Service</button>
              <button onClick={() => setActiveTab("policies")} className="text-left hover:text-orange-500 cursor-pointer transition-colors font-mono uppercase text-[11px]">Risk Disclaimer</button>
            </div>
          </div>

        </div>

        {/* Bottom copyright details */}
        <div className="border-t border-white/5 pt-6 pb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-[10px] text-neutral-500 font-mono">
            &copy; {new Date().getFullYear()} AVIATOR TECH. ALL RIGHTS RESERVED.
          </span>
          <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider font-mono">
            Designed for the modern quantitative analyst.
          </span>
        </div>
      </footer>

    </div>
  );
}
