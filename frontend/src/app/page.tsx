"use client";

import React, { useState, useEffect } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import { MultiplierChart } from "@/components/dashboard/multiplier-chart";
import { PatternTable } from "@/components/dashboard/pattern-table";
import { SignalAlerts } from "@/components/dashboard/signal-alerts";
import { ScraperStatus } from "@/components/dashboard/scraper-status";

const WS_URL = "ws://localhost:8000/ws/dashboard";

interface ModalState {
  title: string;
  content: React.ReactNode;
}

export default function AviatorDashboard() {
  const { isConnected, latestTelemetry, history } = useWebSocket(WS_URL);
  const [activeTab, setActiveTab] = useState<"analytics" | "history">("analytics");
  const [modal, setModal] = useState<ModalState | null>(null);

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

  const openModal = (title: string, content: React.ReactNode) => {
    setModal({ title, content });
  };

  const renderFeaturesContent = () => (
    <div className="flex flex-col gap-3 text-xs leading-relaxed text-neutral-300">
      <p>Our telemetry scraping pipeline operates with low-latency components:</p>
      <ul className="list-disc pl-4 flex flex-col gap-1.5 font-mono">
        <li>DOM Scraping: Playwright async listener hooks directly into Chrome CDP port 9222.</li>
        <li>Supabase Logging: Saves crash parameters into remote databases.</li>
        <li>LSTM Engine: Feeds chronological batches of the last 15 elements into PyTorch layers.</li>
        <li>Real-time Websockets: Streams updates down to dashboard hook clients instantly.</li>
      </ul>
    </div>
  );

  const renderTechStackContent = () => (
    <div className="flex flex-col gap-3 text-xs leading-relaxed text-neutral-300">
      <p>The Aviator LSTM Project is built upon the following technologies:</p>
      <ul className="list-disc pl-4 flex flex-col gap-1 font-mono">
        <li>Python 3.11: Backend, Machine Learning & Scraper Runtime</li>
        <li>PyTorch: Recurrent neural network sequence modeling</li>
        <li>FastAPI: API router & websocket server bridge</li>
        <li>Supabase: PostgreSQL database cloud integration</li>
        <li>Next.js & Tailwind CSS: Interactive front-end visualizers</li>
      </ul>
    </div>
  );

  const renderFAQContent = () => (
    <div className="flex flex-col gap-4 text-xs leading-relaxed text-neutral-300">
      <div>
        <h4 className="font-bold text-white mb-1">Q: How does the PyTorch model make safety evaluations?</h4>
        <p className="font-mono">A: The LSTM model takes log-normalized sequence arrays of recent crashes and runs recurrent network layers to output the probability that the next flight crashes above 1.50x.</p>
      </div>
      <div>
        <h4 className="font-bold text-white mb-1">Q: What if the scraper status is OFFLINE?</h4>
        <p className="font-mono">A: Verify Chrome is running with "--remote-debugging-port=9222" and that your browser window has the Aviator game tab open.</p>
      </div>
    </div>
  );

  const renderArchitectureContent = () => (
    <div className="flex flex-col gap-3 text-xs leading-relaxed text-neutral-300">
      <p>Our decoupled pipeline consists of three independent run loops:</p>
      <ol className="list-decimal pl-4 flex flex-col gap-1.5 font-mono">
        <li>DOM Scraper: Attaches to Chrome CDP, extracts crashes, and POSTs to `/api/ingest`.</li>
        <li>Backend Router: Inserts rounds to Supabase and broadcasts states to WebSocket connections.</li>
        <li>LSTM Engine: Queries `/api/history`, runs inference, and updates signals.</li>
      </ol>
    </div>
  );

  const renderContactContent = () => (
    <div className="flex flex-col gap-3 text-xs leading-relaxed text-neutral-300">
      <p>Contact details for developer and operations inquiries:</p>
      <table className="w-full text-left font-mono border-collapse mt-2">
        <tbody>
          <tr className="border-b border-white/5">
            <td className="py-2 pr-4 font-bold text-white">Email</td>
            <td className="py-2 text-neutral-400">support@aviator-lstm.tech</td>
          </tr>
          <tr className="border-b border-white/5">
            <td className="py-2 pr-4 font-bold text-white">Developer</td>
            <td className="py-2 text-neutral-400">Thulane Sigasa</td>
          </tr>
          <tr className="border-b border-white/5">
            <td className="py-2 pr-4 font-bold text-white">GitHub</td>
            <td className="py-2 text-neutral-400">github.com/thulanesigasa/aviator</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans selection:bg-orange-500/30 flex flex-col justify-between gap-12">
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-6">
        
        {/* Header System with Navigation */}
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
          
          {/* Header navigation menus */}
          <div className="flex flex-wrap items-center gap-4 md:gap-5 text-xs text-neutral-400 font-medium">
            <button onClick={() => openModal("Features & Capabilities", renderFeaturesContent())} className="hover:text-white cursor-pointer transition-colors">Features</button>
            <button onClick={() => openModal("Integration Tech Stack", renderTechStackContent())} className="hover:text-white cursor-pointer transition-colors font-mono uppercase text-[11px]">Stack</button>
            <button onClick={() => openModal("Frequently Asked Questions", renderFAQContent())} className="hover:text-white cursor-pointer transition-colors">FAQ</button>
            <button onClick={() => openModal("Pipeline Architecture", renderArchitectureContent())} className="hover:text-white cursor-pointer transition-colors">Architecture</button>
            <button onClick={() => openModal("Pipeline Support Contacts", renderContactContent())} className="hover:text-white cursor-pointer transition-colors">Contact</button>
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
              <MultiplierChart 
                data={history} 
                targets={signal.strategies ? {
                  conservative: signal.strategies.conservative.target,
                  balanced: signal.strategies.balanced.target,
                  aggressive: signal.strategies.aggressive.target
                } : undefined}
              />
            </div>

            {/* Right Column: AI Signals & Server Health */}
            <div className="flex flex-col gap-6">
              <SignalAlerts signal={signal} />
              <ScraperStatus status={scraperStatus} isConnected={isConnected} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
            {/* Left Column: Historical Table with dynamic Date Selector */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <PatternTable 
                data={selectedDate === "today" ? history : (archivedHistory || [])} 
                selectedDate={selectedDate}
                availableDates={availableDates}
                onDateChange={setSelectedDate}
              />
            </div>

            {/* Right Column: Pipeline Status check */}
            <div className="flex flex-col gap-6">
              <ScraperStatus status={scraperStatus} isConnected={isConnected} />
            </div>
          </div>
        )}
      </div>

      {/* Footer System Redesign */}
      <footer className="w-full max-w-7xl mx-auto border-t border-white/5 pt-10 mt-6 flex flex-col gap-8 bg-black">
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
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-orange-500 transition-colors">GITHUB</a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-orange-500 transition-colors">LINKEDIN</a>
            </div>
          </div>

          {/* System Links */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white">System</span>
            <div className="flex flex-col gap-2 text-xs text-neutral-400 font-medium">
              <button onClick={() => openModal("Features & Capabilities", renderFeaturesContent())} className="text-left hover:text-orange-500 cursor-pointer transition-colors">Features</button>
              <button onClick={() => openModal("Integration Tech Stack", renderTechStackContent())} className="text-left hover:text-orange-500 cursor-pointer transition-colors">Tech Stack</button>
              <button onClick={() => setActiveTab("analytics")} className="text-left hover:text-orange-500 cursor-pointer transition-colors">Dashboard</button>
            </div>
          </div>

          {/* Resources Links */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white">Resources</span>
            <div className="flex flex-col gap-2 text-xs text-neutral-400 font-medium">
              <button onClick={() => openModal("Frequently Asked Questions", renderFAQContent())} className="text-left hover:text-orange-500 cursor-pointer transition-colors">FAQ</button>
              <button onClick={() => openModal("Pipeline Architecture", renderArchitectureContent())} className="text-left hover:text-orange-500 cursor-pointer transition-colors">Architecture</button>
              <button onClick={() => openModal("Pipeline Support Contacts", renderContactContent())} className="text-left hover:text-orange-500 cursor-pointer transition-colors">Contact</button>
            </div>
          </div>

          {/* Legal Links */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white">Policies</span>
            <div className="flex flex-col gap-2 text-xs text-neutral-400 font-medium">
              <button onClick={() => openModal("Privacy & Data Logging", (
                <div className="flex flex-col gap-3 text-xs leading-relaxed text-neutral-300">
                  <p>Our application logging values respect data confidentiality:</p>
                  <ul className="list-disc pl-4 flex flex-col gap-1 font-mono">
                    <li>We only read flight crash points and timestamps from the DOM.</li>
                    <li>No user-identifying markers, betting credentials, or account logs are processed.</li>
                    <li>Telemetry is stored strictly inside your local/private Supabase instance.</li>
                  </ul>
                </div>
              ))} className="text-left hover:text-orange-500 cursor-pointer transition-colors">Privacy Policy</button>
              <button onClick={() => openModal("Terms of Local Execution", (
                <div className="flex flex-col gap-3 text-xs leading-relaxed text-neutral-300">
                  <p>This software is provided for personal testing and quantitative modeling only. Commercial redistribution, high-frequency deployment, or using these strategies as automated advice is not permitted.</p>
                </div>
              ))} className="text-left hover:text-orange-500 cursor-pointer transition-colors">Terms of Service</button>
              <button onClick={() => openModal("Strategy Risk Disclaimer", (
                <div className="flex flex-col gap-3 text-xs leading-relaxed text-neutral-300">
                  <p className="font-bold text-orange-500 uppercase tracking-wide">Risk Warning:</p>
                  <p>Calculations and predictive safety percentages are experimental sequence outputs. Neural projections do not represent financial advice or guarantees. Algorithmic prediction metrics carry inherent risk.</p>
                </div>
              ))} className="text-left hover:text-orange-500 cursor-pointer transition-colors">Risk Disclaimer</button>
            </div>
          </div>

        </div>

        {/* Bottom copyright details */}
        <div className="border-t border-white/5 pt-6 pb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-[10px] text-neutral-500 font-mono">
            &copy; 2026 AVIATOR TECH. ALL RIGHTS RESERVED.
          </span>
          <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider font-mono">
            Designed for the modern quantitative analyst.
          </span>
        </div>
      </footer>

      {/* Clean minimal details modal layer */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md bg-[#0d0d0d] rounded-2xl p-6 border border-white/10 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-orange-500">{modal.title}</h3>
              <button
                onClick={() => setModal(null)}
                className="text-xs font-bold text-neutral-500 hover:text-white px-2 py-1 rounded bg-neutral-900 border border-neutral-800 transition-colors cursor-pointer"
              >
                CLOSE
              </button>
            </div>
            <div className="py-2">{modal.content}</div>
          </div>
        </div>
      )}
    </div>
  );
}
