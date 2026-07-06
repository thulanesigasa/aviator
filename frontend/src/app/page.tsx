"use client";

import React, { useState, useEffect } from "react";
import { useTelemetry } from "@/context/telemetry-context";
import { MultiplierChart } from "@/components/dashboard/multiplier-chart";
import { PatternTable } from "@/components/dashboard/pattern-table";
import { SignalAlerts } from "@/components/dashboard/signal-alerts";
import { ScraperStatus } from "@/components/dashboard/scraper-status";

type TabType = "analytics" | "history";

export default function AviatorDashboard() {
  const { isConnected, latestTelemetry, history } = useTelemetry();
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
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      
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
  );
}
