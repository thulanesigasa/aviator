"use client";

import React from "react";

export default function FeaturesPage() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-200">
      
      {/* Hero Header */}
      <section className="relative py-12 flex flex-col items-start gap-4">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase">
          Features & Capabilities
        </h1>
        <p className="text-xs text-neutral-404 font-mono uppercase tracking-wider text-neutral-400">
          Real-time scraping, modeling, and quantitative strategy automation pipeline
        </p>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0d0d0d] p-6 rounded-2xl border border-white/5 flex flex-col gap-3 font-mono">
          <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">[01] TELEMETRY SCRAPER</span>
          <h3 className="text-lg font-bold text-white uppercase">Chrome CDP Link</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Playwright controller attaches to the active Chrome debugging port 9222, parses nested Aviator game DOM frames, detects flight resolutions immediately, and POSTs records to the database gateway.
          </p>
        </div>
        <div className="bg-[#0d0d0d] p-6 rounded-2xl border border-white/5 flex flex-col gap-3 font-mono">
          <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">[02] FORECAST ENGINE</span>
          <h3 className="text-lg font-bold text-white uppercase">PyTorch LSTM RNN</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Processes chronological multiplier inputs to calculate crash probability. Automatically triggers rolling backpropagation mini-epochs as new data is scraped to adapt model parameters dynamically.
          </p>
        </div>
        <div className="bg-[#0d0d0d] p-6 rounded-2xl border border-white/5 flex flex-col gap-3 font-mono">
          <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">[03] QUANT STRATEGY</span>
          <h3 className="text-lg font-bold text-white uppercase">Adaptive Targets</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Bypasses static hardcoded thresholds. Evaluates 25th, 50th, and 75th percentiles of the last 30 rounds to dynamically scale Conservative, Balanced, and Aggressive exit positions to live trends.
          </p>
        </div>
      </section>

      {/* Tech Stack Details */}
      <section className="bg-[#0d0d0d] p-8 rounded-2xl border border-white/5 flex flex-col gap-4">
        <h3 className="text-lg font-bold text-white uppercase tracking-tight font-mono">Integration Tech Stack</h3>
        <p className="text-xs text-neutral-400 leading-relaxed font-mono">
          The analyzer is built as a highly decoupled, multi-threaded pipeline designed to run locally with minimal processor overhead:
        </p>
        <div className="grid grid-cols-2 gap-6 font-mono text-xs mt-2 border-t border-white/5 pt-4">
          <div className="flex flex-col gap-1">
            <span className="text-neutral-500 text-[10px] uppercase font-bold">Automation API</span>
            <span className="text-white font-bold">Playwright (Chromium DevTools Protocol)</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-neutral-500 text-[10px] uppercase font-bold">Machine Learning Framework</span>
            <span className="text-white font-bold">PyTorch 2.0 (LSTM Sequence Layers)</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-neutral-500 text-[10px] uppercase font-bold">Bridge Gateway Server</span>
            <span className="text-white font-bold">FastAPI & Uvicorn (HTTP / WebSockets)</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-neutral-500 text-[10px] uppercase font-bold">Database Architecture</span>
            <span className="text-white font-bold">Supabase (PostgreSQL Cloud)</span>
          </div>
        </div>
      </section>

    </div>
  );
}
