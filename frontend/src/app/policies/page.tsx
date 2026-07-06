"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const policies = [
  { 
    id: "privacy", 
    name: "Privacy Policy",
    title: "1. Data Privacy & Telemetry Logging",
    content: (
      <div className="flex flex-col gap-5 text-neutral-400 font-mono text-[11px] leading-relaxed">
        <div>
          <h4 className="font-bold text-white uppercase text-xs mb-1">Clause 1.1: Scope of Telemetry Ingestion</h4>
          <p>This software operates strictly as a localized analysis tool. The Playwright scraper module connects asynchronously to Google Chrome over Chrome DevTools Protocol (CDP) port 9222. The ingestion process reads raw text node elements from the Aviator DOM (specifically the multiplier bubbles and the active multiplier gauge) to resolve crash parameters. It monitors multiplier values (e.g. 1.85x) and registers their corresponding Unix timestamps in the Supabase PostgreSQL database. No personal identity indicators, browser cookies, local credentials, account IDs, billing logs, or financial histories are ever parsed, processed, or logged.</p>
        </div>
        <div>
          <h4 className="font-bold text-white uppercase text-xs mb-1">Clause 1.2: Local Data Boundary and Storage</h4>
          <p>All collected crash records are logged directly into a Supabase database instance owned and controlled exclusively by you. Telemetry data remains entirely within your local pipeline. No data broker connections, external telemetry aggregators, or analytical third-party servers are connected. Database writes use row-level security (RLS) tokens to ensure communications between your local API server and your Supabase schema are encrypted over TLS 1.3. Your telemetry files are never shared with generalized AI model training networks or centralized data warehouses.</p>
        </div>
        <div>
          <h4 className="font-bold text-white uppercase text-xs mb-1">Clause 1.3: Scraper CDP Attachment and Authentication</h4>
          <p>When the Playwright scraper attaches to your active Chrome browser, it operates under read-only permissions for DOM elements. It does not monitor keyboard inputs, capture screenshot data, intercept network payloads containing banking variables, or harvest session tokens. Browser automation is restricted to scanning text contents within designated class selectors. All login cookies, username fields, and verification tokens remain local to your Chrome browser user profile directory, which is isolated from the scraper process.</p>
        </div>
        <div>
          <h4 className="font-bold text-white uppercase text-xs mb-1">Clause 1.4: Cookie and Browser Cache Policies</h4>
          <p>The FastAPI backend and Playwright scraper do not place cookies or tracking trackers on your computer. However, Chrome remote debug sessions will create temporary browser cache directories in the specified profile path (e.g., C:\chrome-automation-profile). These directories are used by Chrome to cache stylesheets, layouts, and frame configurations, and contain no telemetry data. You can delete these folders at any time without impacting database stability.</p>
        </div>
        <div>
          <h4 className="font-bold text-white uppercase text-xs mb-1">Clause 1.5: Data Retention Schedule and Deletion</h4>
          <p>Telemetry history is stored indefinitely in your database for sequence training. If you wish to delete recorded data, you can run a SQL purge command directly in your Supabase editor (e.g. TRUNCATE TABLE crash_history). The daily midnight rollover routine automates the separation of logs by local calendar date, resetting active history states and archiving records. Archived files remain in your postgres schema until you manually remove them.</p>
        </div>
        <div>
          <h4 className="font-bold text-white uppercase text-xs mb-1">Clause 1.6: Regulatory Compliance Standards</h4>
          <p>While the system is designed to execute locally, it complies with the principles of the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA) regarding data minimization. We do not gather, store, or sell any consumer data. You have absolute ownership and right of erasure over all files in your database schema, and can audit the python scraper and backend codebases at any time to verify compliance.</p>
        </div>
      </div>
    )
  },
  { 
    id: "terms", 
    name: "Terms of Service",
    title: "2. Terms of Local Execution",
    content: (
      <div className="flex flex-col gap-5 text-neutral-400 font-mono text-[11px] leading-relaxed">
        <div>
          <h4 className="font-bold text-white uppercase text-xs mb-1">Clause 2.1: Software License Grant</h4>
          <p>This software is provided under the terms of the MIT License. You are granted a non-exclusive, non-transferable, revocable license to run the scraper, backend, analytics, and frontend dashboard on your personal hardware. You may modify the sequence training variables, PyTorch weights checkpoints, and Next.js routing parameters for personal testing and simulation backtesting.</p>
        </div>
        <div>
          <h4 className="font-bold text-white uppercase text-xs mb-1">Clause 2.2: Computational Hardware Responsibility</h4>
          <p>You assume full responsibility for provisioning the hardware and virtual environments required to execute the services. Sequence training using PyTorch LSTMs requires adequate CPU and RAM processing capacity to compile rolling gradient descents. Running these calculations continuously can generate processor load. The developers are not liable for any thermal throttling, hardware degradation, or system errors caused by executing these python models.</p>
        </div>
        <div>
          <h4 className="font-bold text-white uppercase text-xs mb-1">Clause 2.3: Scraper Limitations and Anti-Botting Policies</h4>
          <p>The data scraper attaches to your active Chrome browser via CDP port 9222 to read values. It operates under polling delay intervals (1.5 seconds) to prevent excessive CPU consumption. This software is designed solely for statistical modeling and telemetry logging. Integrating the scraper outputs with automated betting APIs, key-press simulators, or automatic gaming triggers is strictly prohibited. You assume all responsibility and risk regarding terms of service violations on third-party websites.</p>
        </div>
        <div>
          <h4 className="font-bold text-white uppercase text-xs mb-1">Clause 2.4: Service Uptime and Scraper DOM Changes</h4>
          <p>This pipeline is provided "as is" and without guarantees of uptime. The scraper relies on identifying specific HTML class names (e.g. .stats-list or .bubble-multiplier). If the gaming platform undergoes a redesign, element paths change, or frame hierarchies are modified, the scraper will fail to parse values. You are responsible for monitoring the Scraper Status in the dashboard and updating selectors when structural changes occur.</p>
        </div>
        <div>
          <h4 className="font-bold text-white uppercase text-xs mb-1">Clause 2.5: Intellectual Property and Model Parameters</h4>
          <p>The LSTM recurrent neural network architecture, weights checkpoints (checkpoints/lstm_aviator.pth), data parsing listener code, and frontend dashboard designs remain open-source under the MIT license. You own all empirical telemetry data stored in your private Supabase database. You may not brand or redistribute this code as certified financial advisory systems or commercial prediction tools.</p>
        </div>
        <div>
          <h4 className="font-bold text-white uppercase text-xs mb-1">Clause 2.6: Indemnification and Limitation of Liability</h4>
          <p>In no event shall the developers, contributors, or copyright holders of this repository be liable for any claims, damages, losses, or costs arising from the use of this software. This includes, but is not limited to, financial losses, loss of data, database connection errors, browser occlusion delays, or uvicorn backend crashes. You execute these models entirely at your own risk.</p>
        </div>
      </div>
    )
  },
  { 
    id: "disclaimer", 
    name: "Risk Disclaimer",
    title: "3. Strategy Risk Warning",
    content: (
      <div className="flex flex-col gap-5 text-orange-500 font-mono text-[11px] leading-relaxed">
        <div>
          <h4 className="font-bold uppercase text-xs mb-1 text-orange-500">Clause 3.1: Sequence Variance and Streaks</h4>
          <p className="text-orange-400">The PyTorch LSTM model maps recent crash logs and forecasts exit safety percentages. However, crash game outcomes are generated by independent random number generators (RNGs) on each flight. The distribution is subject to high variance, clustering, and sudden cold runs. Neural network predictions are statistical forecasts of trend probability and do not represent guarantee indicators.</p>
        </div>
        <div>
          <h4 className="font-bold uppercase text-xs mb-1 text-orange-500">Clause 3.2: Mathematical Game Physics and Bounding</h4>
          <p className="text-orange-400">In crash games, the theoretical probability of a flight reaching multiplier target T is mathematically modeled as P(X &ge; T) = (1 - House Edge) / T. For example, assuming a standard 3% house edge, the probability of exceeding 1.15x is 84.3%, while the probability of exceeding 6.90x drops to 14.0%, and 74.0x is 1.3%. The composite confidence score in this dashboard blends this physics model with empirical session history and LSTM trend evaluations to illustrate risk parameters.</p>
        </div>
        <div>
          <h4 className="font-bold uppercase text-xs mb-1 text-orange-500">Clause 3.3: Inherent House Edge and Expectations</h4>
          <p className="text-orange-400">Crash games feature a built-in mathematical edge in favor of the operator (typically 2% to 5%). Because the game has a negative expectation profile, no algorithmic model, sequential trend mapping, or recursive neural network can reverse this edge over large sample sizes. Strategies represent statistical boundaries for risk moderation, not positive-expectation wealth systems.</p>
        </div>
        <div>
          <h4 className="font-bold uppercase text-xs mb-1 text-orange-500">Clause 3.4: Algorithmic Modeling Limits and Fallacies</h4>
          <p className="text-orange-400">Users must avoid fallacies such as the Gambler's Fallacy (believing a high crash is "due" after a series of low crashes). The LSTM model updates weights dynamically to capture current session trends, but it cannot alter round independence. Martingale doubling progressions or safety staking patterns can fail rapidly during unexpected clustering, resulting in total loss of stakes.</p>
        </div>
        <div>
          <h4 className="font-bold uppercase text-xs mb-1 text-orange-500">Clause 3.5: User Decision and Stake Management</h4>
          <p className="text-orange-400">All strategy metrics (Conservative, Balanced, Aggressive) and safety signals are intended for simulation testing. You are solely responsible for determining your stake management limits and evaluating target safety ratings. Never allocate stakes that you cannot afford to lose. Projections generated by this model are not financial advice.</p>
        </div>
      </div>
    )
  }
];

function PoliciesContent() {
  const searchParams = useSearchParams();
  const tabQuery = searchParams.get("tab");
  
  const [activePolicy, setActivePolicy] = useState("privacy");

  // Synchronize state if the browser URL query parameter changes
  useEffect(() => {
    if (tabQuery && ["privacy", "terms", "disclaimer"].includes(tabQuery)) {
      setActivePolicy(tabQuery);
    }
  }, [tabQuery]);

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
        <main className="flex-1 bg-[#0d0d0d] rounded-2xl border border-white/5 p-8 font-mono text-xs leading-relaxed flex flex-col gap-4 h-[450px] overflow-y-auto">
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

export default function PoliciesPage() {
  return (
    <Suspense fallback={<div className="font-mono text-xs text-neutral-500">Loading Policies Hub...</div>}>
      <PoliciesContent />
    </Suspense>
  );
}
