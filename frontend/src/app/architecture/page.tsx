"use client";

import React from "react";
import Link from "next/link";

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans selection:bg-orange-500/30 flex flex-col justify-between gap-12">
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-8 animate-in fade-in duration-200">
        
        {/* Navigation Header */}
        <header className="flex items-center justify-between py-2 border-b border-white/5 pb-6">
          <Link href="/" className="text-sm font-black uppercase text-neutral-400 hover:text-white transition-colors tracking-widest font-mono">
            &larr; BACK TO DASHBOARD
          </Link>
          <span className="text-[10px] font-mono text-orange-500 uppercase tracking-widest">
            SYSTEM DIAGRAM
          </span>
        </header>

        {/* Hero Header */}
        <section className="relative py-12 flex flex-col items-start gap-4">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase">
            Pipeline Architecture
          </h1>
          <p className="text-xs text-neutral-400 font-mono uppercase tracking-wider">
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

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto border-t border-white/5 pt-6 text-center">
        <span className="text-[10px] text-neutral-500 font-mono">
          &copy; {new Date().getFullYear()} AVIATOR TECH. SCHEMATIC ARCHITECTURE DOCUMENT.
        </span>
      </footer>
    </div>
  );
}
