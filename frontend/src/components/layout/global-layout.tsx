"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTelemetry } from "@/context/telemetry-context";

export function GlobalLayout({ children }: { children: React.ReactNode }) {
  const { isConnected, theme, setTheme } = useTelemetry();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const tzOffset = typeof window !== "undefined" ? -new Date().getTimezoneOffset() : 0;

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
            <span className="text-neutral-850">|</span>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="bg-neutral-900 border border-white/5 text-neutral-300 rounded px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase font-bold hover:text-white cursor-pointer transition-colors"
            >
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 w-full">{children}</main>

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
              <Link href="/architecture" className="text-left hover:text-orange-500 transition-colors font-mono">Architecture</Link>
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
