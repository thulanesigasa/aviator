"use client";

import React from "react";
import { BrainCircuit } from "lucide-react";

interface SignalPayload {
  prediction: string;
  probability: number;
  threshold: number;
  timestamp: string | null;
}

export function SignalAlerts({ signal }: { signal: SignalPayload }) {
  const isHighProb = signal.probability >= 0.7;
  const isWait = signal.prediction.includes("WAIT");

  return (
    <div className={`glass-panel rounded-2xl p-6 border flex flex-col gap-4 relative overflow-hidden transition-colors ${
      isHighProb ? "bg-success-emerald/10 border-success-emerald/30" : 
      isWait ? "bg-danger-rose/10 border-danger-rose/30" : "bg-black/40 border-white/5"
    }`}>
      <div className="flex items-center gap-3 border-b border-white/5 pb-3">
        <BrainCircuit className={isHighProb ? "text-success-emerald" : "text-primary-electric"} />
        <h2 className="text-lg font-semibold tracking-wide text-white">LSTM AI Signal</h2>
      </div>

      <div className="flex flex-col gap-1 z-10">
        <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Recommended Action</span>
        <span className={`text-2xl font-bold tracking-tight ${isHighProb ? "text-success-emerald drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" : isWait ? "text-danger-rose" : "text-white"}`}>
          {signal.prediction}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-2 z-10">
        <div className="bg-black/40 p-3 rounded-xl border border-white/5 flex flex-col">
          <span className="text-[10px] text-gray-500 uppercase font-bold">Confidence</span>
          <span className="text-lg font-mono text-white">{(signal.probability * 100).toFixed(1)}%</span>
        </div>
        <div className="bg-black/40 p-3 rounded-xl border border-white/5 flex flex-col">
          <span className="text-[10px] text-gray-500 uppercase font-bold">Target Exit</span>
          <span className="text-lg font-mono text-white">{signal.threshold.toFixed(2)}x</span>
        </div>
      </div>
    </div>
  );
}
