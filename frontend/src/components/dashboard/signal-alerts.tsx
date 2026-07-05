"use client";

import React from "react";
import { AlertCircle, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";

export interface SignalPayload {
  trigger_type: string;
  win_probability: number;
  recommended_cashout: number;
  reason: string;
}

interface SignalAlertsProps {
  signal: SignalPayload | null;
}

export function SignalAlerts({ signal }: SignalAlertsProps) {
  if (!signal) {
    return (
      <div className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4 min-h-[180px]">
        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500">
          <AlertCircle className="w-6 h-6 animate-pulse" />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-white">Monitoring Sequences</h3>
          <p className="text-xs text-gray-400 max-w-[240px]">
            Waiting for sequence patterns (e.g. 5 low rounds) to generate actionable entry signals.
          </p>
        </div>
      </div>
    );
  }

  const probPercent = (signal.win_probability * 100).toFixed(1);

  return (
    <div className="glass-panel rounded-2xl p-6 flex flex-col gap-5 border-warning-amber/25 bg-gradient-to-br from-card-dark via-card-dark to-warning-amber/5 relative overflow-hidden">
      
      {/* Decorative warning glow lights */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-warning-amber/10 blur-2xl rounded-full"></div>

      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-warning-amber w-5 h-5" />
          <h2 className="text-lg font-semibold tracking-wide">AI Strategy Alert</h2>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 bg-warning-amber/10 border border-warning-amber/20 rounded-md text-warning-amber uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Pattern Triggered
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Win Probability */}
        <div className="flex flex-col gap-1 p-4 bg-black/30 rounded-xl border border-white/5">
          <span className="text-xs text-gray-400 font-medium">Win Probability</span>
          <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
            {probPercent}%
          </span>
        </div>

        {/* Recommended Cashout Target */}
        <div className="flex flex-col gap-1 p-4 bg-black/30 rounded-xl border border-white/5">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-success-emerald" />
            <span>Target Cashout</span>
          </div>
          <span className="text-3xl font-extrabold text-success-emerald tracking-tight font-mono">
            {signal.recommended_cashout.toFixed(2)}x
          </span>
        </div>
      </div>

      {/* Strategy Reason */}
      <div className="bg-warning-amber/5 border border-warning-amber/10 rounded-xl p-3 text-xs text-warning-amber leading-relaxed flex gap-2">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          <strong>{signal.trigger_type}</strong>: {signal.reason}
        </span>
      </div>
    </div>
  );
}
