import React from "react";
import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-200">
      
      {/* Back to Dashboard Link */}
      <div className="pt-2">
        <Link href="/" className="text-xs font-black uppercase text-neutral-500 hover:text-white transition-colors tracking-widest font-mono">
          &larr; Back to Dashboard
        </Link>
      </div>

      {/* Hero Header */}
      <section className="relative py-12 flex flex-col items-start gap-4">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase">
          Support & Contact
        </h1>
        <p className="text-xs text-neutral-404 font-mono uppercase tracking-wider text-neutral-400">
          Developer support coordinates and operational repository details
        </p>
      </section>

      {/* Contact Grids */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
        
        <div className="bg-[#0d0d0d] p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Support Coordinates</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-neutral-500 uppercase font-bold">Email Address</span>
              <span className="text-white font-bold">support@aviator-lstm.tech</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-neutral-500 uppercase font-bold">Lead Developer</span>
              <span className="text-white font-bold">Thulane Sigasa</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500 uppercase font-bold">Active Engine</span>
              <span className="text-white font-bold">PyTorch / WebSockets</span>
            </div>
          </div>
        </div>

        <div className="bg-[#0d0d0d] p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Developer Source</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-neutral-500 uppercase font-bold">GitHub Repo</span>
              <a href="https://github.com/thulanesigasa/aviator" target="_blank" rel="noreferrer" className="text-orange-500 hover:underline">thulanesigasa/aviator</a>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-neutral-500 uppercase font-bold">Release Tag</span>
              <span className="text-white font-bold">v1.2.0-stable</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500 uppercase font-bold">Local License</span>
              <span className="text-white font-bold">MIT Open License</span>
            </div>
          </div>
        </div>

      </section>

    </div>
  );
}
