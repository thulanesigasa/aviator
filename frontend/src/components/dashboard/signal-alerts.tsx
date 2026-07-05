"use client";

import React from "react";

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
      isHighProb ? "bg-orange-950/20 border-orange-500/30" : 
      isWait ? "bg-red-950/20 border-red-900/30" : "bg-[#0d0d0d] border-white/5"
    }`}>
      <div className="border-b border-white/5 pb-3">
        <h2 className="text-lg font-bold tracking-tight text-white uppercase">LSTM AI Signal</h2>
        <p className="text-xs text-neutral-400 mt-0.5">Recurrent neural sequence safety evaluations</p>
      </div>

      <div className="flex flex-col gap-1 z-10">
        <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">Recommended Action</span>
        <span className={`text-2xl font-black tracking-tight ${isHighProb ? "text-orange-500 drop-shadow-[0_0_10px_rgba(251,113,133,0.5)]" : isWait ? "text-red-500" : "text-white"}`}>
          {signal.prediction}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-2 z-10">
        <div className="bg-[#050505] p-4 rounded-xl border border-white/5 flex flex-col">
          <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Confidence</span>
          <span className="text-lg font-bold font-mono text-white mt-1">{(signal.probability * 100).toFixed(1)}%</span>
        </div>
        <div className="bg-[#050505] p-4 rounded-xl border border-white/5 flex flex-col">
          <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Target Exit</span>
          <span className="text-lg font-bold font-mono text-white mt-1">{signal.threshold.toFixed(2)}x</span>
        </div>
      </div>
    </div>
  );
}
