"use client";

import React, { useState } from "react";
import Link from "next/link";

const policies = [
  { 
    id: "privacy", 
    name: "Privacy Policy",
    title: "1. Data Privacy & Telemetry Logging",
    content: (
      <div className="flex flex-col gap-4">
        <p>This software operates strictly as a localized analysis tool. It attaches to Google Chrome over CDP port 9222 and only reads raw flight crash points and timestamps from the DOM layout tree.</p>
        <p>No user account names, login passwords, security cookies, billing histories, or banking credentials are ever accessed, recorded, or transmitted to outside networks.</p>
        <p>All recorded telemetry parameters are stored securely inside your local/private Supabase instance for model retraining sequences.</p>
      </div>
    )
  },
  { 
    id: "terms", 
    name: "Terms of Service",
    title: "2. Terms of Local Execution",
    content: (
      <div className="flex flex-col gap-4">
        <p>This quantitative sequence analyzer is designed for personal research, backtesting simulation checkups, and educational time-series exercises.</p>
        <p>Commercial packaging, high-frequency bot integrations, or utilizing these projections as standard or guaranteed financial advisory advice is strictly prohibited.</p>
        <p>You assume all technical and operational risks associated with deploying and running these scripts locally.</p>
      </div>
    )
  },
  { 
    id: "disclaimer", 
    name: "Risk Disclaimer",
    title: "3. Strategy Risk Warning",
    content: (
      <div className="flex flex-col gap-4 text-orange-500">
        <p className="font-bold">Important warning regarding sequence variance:</p>
        <p>Recurrent Neural Network modeling (LSTM) maps and forecasts trends based on historical sequences. Because crash multiplier outcomes are generated independently, neural metrics do not guarantee safety or future positive performance.</p>
        <p>Streak clusters, sudden down-trends, and immediate 1.00x crashes are common. Run simulation parameters with caution.</p>
      </div>
    )
  }
];

export default function PoliciesPage() {
  const [activePolicy, setActivePolicy] = useState("privacy");
  const current = policies.find(p => p.id === activePolicy) || policies[0];

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-200">
      
      {/* Back Link */}
      <div className="pt-2">
        <Link href="/" className="text-xs font-black uppercase text-neutral-500 hover:text-white transition-colors tracking-widest font-mono">
          &larr; Back to Dashboard
        </Link>
      </div>

      {/* Hero Header */}
      <section className="relative border-b border-white/5 pb-6">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase">Operational Policies</h1>
        <p className="text-xs text-neutral-404 font-mono uppercase tracking-wide text-neutral-400">Data logging boundaries, software terms, and risk disclosures</p>
      </section>

      {/* Sidebar Layout */}
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Navigation */}
        <aside className="md:w-64 flex-shrink-0">
          <nav className="flex flex-col gap-2">
            {policies.map((p) => {
              const isActive = activePolicy === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setActivePolicy(p.id)}
                  className={`text-left px-4 py-3 text-xs font-bold font-mono uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? "bg-orange-500 text-black border-orange-500 shadow-lg shadow-orange-500/10"
                      : "bg-[#0d0d0d] text-neutral-400 border-white/5 hover:text-white hover:border-white/10"
                  }`}
                >
                  {p.name}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 bg-[#0d0d0d] rounded-2xl border border-white/5 p-8 font-mono text-xs leading-relaxed flex flex-col gap-4">
          <h3 className="text-lg font-bold text-white uppercase border-b border-white/5 pb-3">
            {current.title}
          </h3>
          <div className="text-neutral-300 flex flex-col gap-4">
            {current.content}
          </div>
        </main>

      </div>
      
    </div>
  );
}
