"use client";

import React from "react";

interface StrategyDetail {
  name: string;
  target: number;
  confidence: number;
}

interface SignalPayload {
  prediction: string;
  probability: number;
  threshold: number;
  timestamp: string | null;
  strategies?: {
    conservative: StrategyDetail;
    balanced: StrategyDetail;
    aggressive: StrategyDetail;
  };
}

export function SignalAlerts({ signal }: { signal: SignalPayload }) {
  const isHighProb = signal.probability >= 0.7;
  const isWait = signal.prediction.includes("WAIT");

  // Fallback defaults if backend has not calculated them yet
  const strategies = signal.strategies || {
    conservative: { 
      name: "Conservative", 
      target: 1.15, 
      confidence: Math.round(Math.min((signal.probability || 0.5) * 130, 99)) 
    },
    balanced: { 
      name: "Balanced (LSTM)", 
      target: signal.threshold > 1 ? signal.threshold : 1.20, 
      confidence: Math.round((signal.probability || 0.5) * 100) 
    },
    aggressive: { 
      name: "Aggressive", 
      target: 1.70, 
      confidence: Math.round(Math.max((signal.probability || 0.5) * 70, 1)) 
    }
  };

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
        <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Recommended Action</span>
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

      {/* Strategies list section */}
      <div className="border-t border-white/5 pt-4 mt-2 z-10 flex flex-col gap-3">
        <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Active Quantitative Strategies</span>
        <div className="flex flex-col gap-2">
          {Object.values(strategies).map((strat: any, i) => (
            <div key={i} className="flex items-center justify-between bg-[#050505] p-3 rounded-lg border border-white/5 font-mono text-xs">
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-555 uppercase font-bold text-neutral-400">{strat.name}</span>
                <span className="text-white font-bold mt-0.5">{strat.target.toFixed(2)}x Exit</span>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="text-[10px] text-neutral-555 uppercase font-bold text-neutral-400">Confidence</span>
                <span className={`font-bold mt-0.5 ${
                  strat.confidence >= 70 ? "text-orange-500" : 
                  strat.confidence >= 40 ? "text-neutral-350" : 
                  "text-neutral-500"
                }`}>
                  {strat.confidence}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
