"use client";

import React from "react";

export default function ArchitecturePage() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-200">
      
      {/* Hero Header */}
      <section className="relative py-12 flex flex-col items-start gap-4">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase">
          Pipeline Architecture
        </h1>
        <p className="text-xs text-neutral-404 font-mono uppercase tracking-wider text-neutral-400">
          Visual decoupling structure of Playwright scraping, FastAPI gateways, and PyTorch RNN modeling loops
        </p>
      </section>

      {/* Technical Flow Steps */}
      <section className="flex flex-col gap-6 font-mono text-xs">
        
        <div className="bg-[#0d0d0d] p-6 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center font-bold text-orange-500 text-lg">01</div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-neutral-500 uppercase">Automation Layer</span>
            <h4 className="font-bold text-white uppercase text-sm">Chrome CDP Scraper</h4>
            <p className="text-neutral-400 leading-relaxed max-w-2xl mt-1">
              The Playwright async process attaches to Google Chrome over CDP debugging port 9222. It continuously scans the active Aviator window, parses the history DOM on round resolutions, and POSTs new crash values to the database.
            </p>
          </div>
        </div>

        <div className="bg-[#0d0d0d] p-6 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center font-bold text-orange-500 text-lg">02</div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-neutral-500 uppercase">Data Routing Layer</span>
            <h4 className="font-bold text-white uppercase text-sm">FastAPI Bridge Gateway</h4>
            <p className="text-neutral-400 leading-relaxed max-w-2xl mt-1">
              Validates payloads, inserts flight records into Supabase PostgreSQL, caches system variables, and coordinates WebSocket streams to all open frontend dashboards.
            </p>
          </div>
        </div>

        <div className="bg-[#0d0d0d] p-6 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center font-bold text-orange-500 text-lg">03</div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-neutral-500 uppercase">Inference & Optimization Layer</span>
            <h4 className="font-bold text-white uppercase text-sm">LSTM Analytics RNN</h4>
            <p className="text-neutral-400 leading-relaxed max-w-2xl mt-1">
              Pulls history logs from the backend, log-normalizes multipliers, runs a forward pass to forecast next-round probabilities, and runs Adam/BCE backpropagation cycles to optimize weights.
            </p>
          </div>
        </div>

        <div className="bg-[#0d0d0d] p-6 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center font-bold text-orange-500 text-lg">04</div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-neutral-500 uppercase">Presentation Layer</span>
            <h4 className="font-bold text-white uppercase text-sm">React Dashboard Portal</h4>
            <p className="text-neutral-400 leading-relaxed max-w-2xl mt-1">
              A Next.js front-end client running Recharts charts, chronological history tables, daily rollover filters, and quantitative target exit gauges that dynamically update via WebSocket frames.
            </p>
          </div>
        </div>

      </section>

    </div>
  );
}
