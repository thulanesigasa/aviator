"use client";

import React from "react";
import Link from "next/link";

export default function PoliciesPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans selection:bg-orange-500/30 flex flex-col justify-between gap-12">
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-8 animate-in fade-in duration-200">
        
        {/* Navigation Header */}
        <header className="flex items-center justify-between py-2 border-b border-white/5 pb-6">
          <Link href="/" className="text-sm font-black uppercase text-neutral-400 hover:text-white transition-colors tracking-widest font-mono">
            &larr; BACK TO DASHBOARD
          </Link>
          <span className="text-[10px] font-mono text-orange-500 uppercase tracking-widest">
            REGULATORY POLICIES
          </span>
        </header>

        {/* Hero Header */}
        <section className="relative py-12 flex flex-col items-start gap-4">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase">
            Operational Policies
          </h1>
          <p className="text-xs text-neutral-400 font-mono uppercase tracking-wider">
            Privacy parameters, terms of execution, and quantitative risk disclaimers
          </p>
        </section>

        {/* Policies Content */}
        <section className="flex flex-col gap-8 font-mono text-xs">
          
          {/* Privacy */}
          <div className="bg-[#0d0d0d] p-8 rounded-2xl border border-white/5 flex flex-col gap-3">
            <h3 className="text-lg font-bold text-white uppercase tracking-wide border-b border-white/5 pb-3">[01] Data Privacy & Telemetry Logging</h3>
            <p className="text-xs text-neutral-400 leading-relaxed mt-1">
              This software runs as a localized pipeline. It attaches to your active Chrome browser via CDP port 9222 and only reads raw flight multipliers and resolve timestamps from the DOM elements. 
            </p>
            <p className="text-xs text-neutral-400 leading-relaxed">
              No account usernames, passwords, cookies, billing logs, card details, or gaming session records are accessed, cached, or dispatched. All scraped telemetry parameters are kept securely in your local Supabase database instance.
            </p>
          </div>

          {/* Terms */}
          <div className="bg-[#0d0d0d] p-8 rounded-2xl border border-white/5 flex flex-col gap-3">
            <h3 className="text-lg font-bold text-white uppercase tracking-wide border-b border-white/5 pb-3">[02] Terms of Local Execution</h3>
            <p className="text-xs text-neutral-400 leading-relaxed mt-1">
              This quantitative analyzer is provided strictly for educational modeling, sequence backtesting, and simulation checks. Users assume full responsibility for running these scripts on their hardware. 
            </p>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Commercial sale, automatic execution (botting), or claiming these outputs represent standard or guaranteed advising advice is not permitted under this MIT-licensed system.
            </p>
          </div>

          {/* Disclaimers */}
          <div className="bg-orange-950/20 p-8 rounded-2xl border border-orange-500/20 flex flex-col gap-3">
            <h3 className="text-lg font-bold text-orange-500 uppercase tracking-wide border-b border-orange-500/20 pb-3">[03] Strategy Risk Warning</h3>
            <p className="text-xs text-orange-400/80 leading-relaxed mt-1">
              Recurrent sequence modeling (LSTM) generates forecasts based on historical outcome sequences. Crash games are designed around independent round probability, meaning outputs do not guarantee future success. 
            </p>
            <p className="text-xs text-orange-400/80 leading-relaxed">
              Clustered cold streaks, high variance, and instant 1.00x crashes occur. Users must exercise extreme caution when testing simulation parameters.
            </p>
          </div>

        </section>

      </div>

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto border-t border-white/5 pt-6 text-center">
        <span className="text-[10px] text-neutral-500 font-mono">
          &copy; {new Date().getFullYear()} AVIATOR TECH. REGULATORY STATEMENTS.
        </span>
      </footer>
    </div>
  );
}
