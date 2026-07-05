"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, AlertTriangle, ShieldCheck } from "lucide-react";

interface SignalData {
  prediction: string;
  probability: number;
  threshold: number;
  timestamp: string | null;
}

interface SignalAlertsProps {
  signal?: SignalData | null;
}

export function SignalAlerts({ signal: initialSignal }: SignalAlertsProps) {
  const [signal, setSignal] = useState<SignalData>({
    prediction: "WAIT: Downward Trend",
    probability: 0.45,
    threshold: 1.50,
    timestamp: null,
  });

  // Sync with prop updates from WebSocket if active
  useEffect(() => {
    if (initialSignal) {
      setSignal(initialSignal);
    }
  }, [initialSignal]);

  // Set up 3s polling fallback loop to GET /api/signals/latest
  useEffect(() => {
    const pollSignals = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/signals/latest");
        if (res.ok) {
          const data = (await res.json()) as SignalData;
          setSignal(data);
        }
      } catch (err) {
        console.warn("[Signal Alerts] Polling signals gateway failed:", err);
      }
    };

    pollSignals();
    const timer = setInterval(pollSignals, 3000);
    return () => clearInterval(timer);
  }, []);

  const isHigh = signal.prediction.toLowerCase().includes("high");
  const isWait = signal.prediction.toLowerCase().includes("wait");
  
  let headerColor = "text-warning-amber border-warning-amber/10 bg-warning-amber/5";
  let icon = <AlertTriangle className="w-6 h-6 text-warning-amber" />;
  
  if (isHigh) {
    headerColor = "text-success-emerald border-success-emerald/10 bg-success-emerald/5";
    icon = <ShieldCheck className="w-6 h-6 text-success-emerald" />;
  } else if (isWait) {
    headerColor = "text-danger-rose border-danger-rose/10 bg-danger-rose/5";
    icon = <AlertTriangle className="w-6 h-6 text-danger-rose" />;
  }

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/5 bg-black/40 flex flex-col gap-5 flex-1 relative overflow-hidden">
      {/* Background neon glows */}
      <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 rounded-full ${
        isHigh ? "bg-success-emerald" : isWait ? "bg-danger-rose" : "bg-warning-amber"
      }`}></div>

      <div className="flex items-center gap-3 border-b border-white/5 pb-4 justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="text-primary-electric w-5 h-5" />
          <div>
            <h2 className="text-lg font-semibold tracking-wide">Predictive AI Signals</h2>
            <p className="text-xs text-gray-400">LSTM recurrent neural network sequence analysis</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Signal Display Block */}
        <div className={`flex items-center gap-4 p-4 rounded-xl border ${headerColor}`}>
          <div className="p-2 bg-black/40 rounded-lg">{icon}</div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">System Instruction</span>
            <span className="text-base font-extrabold tracking-tight">{signal.prediction}</span>
          </div>
        </div>

        {/* Inference Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/30 rounded-xl p-3 border border-white/5 flex flex-col gap-0.5">
            <span className="text-[10px] text-gray-400 uppercase font-semibold">LSTM Safety Probability</span>
            <span className="text-xl font-bold text-white font-mono">{(signal.probability * 100).toFixed(1)}%</span>
          </div>
          <div className="bg-black/30 rounded-xl p-3 border border-white/5 flex flex-col gap-0.5">
            <span className="text-[10px] text-gray-400 uppercase font-semibold">Strategy Target Cashout</span>
            <span className="text-xl font-bold text-white font-mono">{signal.threshold > 1.0 ? `${signal.threshold.toFixed(2)}x` : "N/A"}</span>
          </div>
        </div>

        {/* Timestamp */}
        {signal.timestamp && (
          <div className="text-[10px] text-gray-500 font-mono self-end">
            Last Prediction: {new Date(signal.timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
}
