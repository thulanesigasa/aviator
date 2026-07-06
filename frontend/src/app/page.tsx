"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useWebSocket } from "@/hooks/use-websocket";
import { MultiplierChart } from "@/components/dashboard/multiplier-chart";
import { PatternTable } from "@/components/dashboard/pattern-table";
import { SignalAlerts } from "@/components/dashboard/signal-alerts";
import { ScraperStatus } from "@/components/dashboard/scraper-status";

const WS_URL = "ws://localhost:8000/ws/dashboard";

type TabType = "analytics" | "history";

export default function AviatorDashboard() {
  const { isConnected, latestTelemetry, history } = useWebSocket(WS_URL);
  const [activeTab, setActiveTab] = useState<TabType>("analytics");

  // Archive States
  const [selectedDate, setSelectedDate] = useState<string>("today");
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [archivedHistory, setArchivedHistory] = useState<any[] | null>(null);

  // Layout Theme State
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Floating Scroll Button State
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

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

  // Apply Theme Mode changes globally on HTML element
  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light-theme");
    } else {
      document.documentElement.classList.remove("light-theme");
    }
  }, [theme]);

  // Track window scroll coordinates to toggle Scroll Top vs Scroll Bottom states
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 250) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollAction = () => {
    if (showScrollTop) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans selection:bg-orange-500/30 flex flex-col justify-between gap-12">
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-6">
        
        {/* Header System */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between py-2 border-b border-white/5 pb-6 gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2">
                <Link href="/" className="hover:text-neutral-200 transition-colors">
                  Aviator LSTM <span className="text-orange-500">Predictor</span>
                </Link>
                <span className={`w-2 h-2 rounded-full inline-block ${isConnected ? "bg-orange-500 animate-pulse" : "bg-red-500"}`}></span>
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5 uppercase tracking-wider font-medium">
                Sequence Analysis & Live Telemetry Stream
              </p>
            </div>
          </div>
          
          {/* Header navigation menus routing to dedicated pages */}
          <div className="flex flex-wrap items-center gap-4 md:gap-5 text-xs text-neutral-400 font-medium">
            <Link href="/features" className="hover:text-white transition-colors">Features</Link>
            <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
            <Link href="/architecture" className="hover:text-white transition-colors">Architecture</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            <span className="text-neutral-805">|</span>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="bg-neutral-900 border border-white/5 text-neutral-300 rounded px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase font-bold hover:text-white cursor-pointer transition-colors"
            >
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>
        </header>

        {/* Tab Navigation Menu */}
        <div className="flex gap-6 border-b border-neutral-900 pb-2">
          {(["analytics", "history"] as TabType[]).map((tab) => (
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

        {/* 1. Analytics Tab Workspace */}
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

        {/* 2. History Tab Workspace */}
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
              <Link href="/features" className="text-left hover:text-orange-500 transition-colors">Features</Link>
              <Link href="/architecture" className="text-left hover:text-orange-500 transition-colors">Architecture</Link>
              <Link href="/" className="text-left hover:text-orange-500 transition-colors">Dashboard</Link>
            </div>
          </div>

          {/* Resources Links */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white">Resources</span>
            <div className="flex flex-col gap-2 text-xs text-neutral-400 font-medium">
              <Link href="/faq" className="text-left hover:text-orange-500 transition-colors">FAQ</Link>
              <Link href="/contact" className="text-left hover:text-orange-500 transition-colors">Contact</Link>
            </div>
          </div>

          {/* Policies Links */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white">Policies</span>
            <div className="flex flex-col gap-2 text-xs text-neutral-400 font-medium">
              <Link href="/policies" className="text-left hover:text-orange-500 transition-colors">Privacy Policy</Link>
              <Link href="/policies" className="text-left hover:text-orange-500 transition-colors font-mono">Terms of Service</Link>
              <Link href="/policies" className="text-left hover:text-orange-500 transition-colors font-mono">Risk Disclaimer</Link>
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

      {/* Floating Scroll-to-Top / Scroll-to-Bottom Controller Button */}
      <button
        onClick={handleScrollAction}
        title={showScrollTop ? "Scroll to Top" : "Scroll to Bottom"}
        className="fixed bottom-6 right-6 w-12 h-12 bg-neutral-900 border border-orange-500/50 hover:border-orange-500 text-orange-500 rounded-full flex items-center justify-center font-bold text-lg shadow-[0_4px_20px_rgba(255,102,0,0.15)] hover:shadow-[0_4px_20px_rgba(255,102,0,0.3)] transition-all cursor-pointer z-50 select-none font-mono"
      >
        {showScrollTop ? "↑" : "↓"}
      </button>

    </div>
  );
}
