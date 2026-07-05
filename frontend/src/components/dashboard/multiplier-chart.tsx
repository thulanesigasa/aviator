"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface CrashData {
  id?: number;
  multiplier: number;
  timestamp: string;
}

interface StrategyTargets {
  conservative: number;
  balanced: number;
  aggressive: number;
}

interface MultiplierChartProps {
  data: CrashData[];
  targets?: StrategyTargets;
}

export function MultiplierChart({ data, targets }: MultiplierChartProps) {
  const totalFlights = data.length;
  
  // Resolve dynamic targets with fallbacks for WAIT states (where targets are 1.0x)
  const consTarget = targets && targets.conservative > 1.0 ? targets.conservative : 1.15;
  const balTarget = targets && targets.balanced > 1.0 ? targets.balanced : 1.35;
  const aggTarget = targets && targets.aggressive > 1.0 ? targets.aggressive : 1.70;

  // Calculate historical win rates across all session flights
  const consWins = data.filter(d => d.multiplier >= consTarget).length;
  const consRate = totalFlights > 0 ? (consWins / totalFlights) * 100 : 0;
  
  const balWins = data.filter(d => d.multiplier >= balTarget).length;
  const balRate = totalFlights > 0 ? (balWins / totalFlights) * 100 : 0;
  
  const aggWins = data.filter(d => d.multiplier >= aggTarget).length;
  const aggRate = totalFlights > 0 ? (aggWins / totalFlights) * 100 : 0;

  // Take last 50 entries for visual line chart progression
  const chartData = data.slice(-50).map((d, index) => ({
    index: index + 1,
    multiplier: d.multiplier,
    time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  }));

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/5 bg-[#0d0d0d] flex flex-col gap-6 flex-1">
      
      {/* Title block */}
      <div className="border-b border-white/5 pb-4">
        <h2 className="text-lg font-bold tracking-tight text-white uppercase">Multiplier Progression</h2>
        <p className="text-xs text-neutral-400 mt-0.5">Chronological crash points (last 50 flights)</p>
      </div>

      {/* Chart container */}
      <div className="h-[300px] w-full bg-[#050505] rounded-xl p-2 border border-white/5">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMultiplier" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(255, 102, 0)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="rgb(255, 102, 0)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis 
                dataKey="index" 
                stroke="rgba(255,255,255,0.2)" 
                fontSize={11} 
                tickLine={false} 
              />
              <YAxis 
                stroke="rgba(255,255,255,0.2)" 
                fontSize={11} 
                tickLine={false} 
                domain={[1.0, 'auto']}
                tickFormatter={(val) => `${val.toFixed(1)}x`}
              />
              <Tooltip 
                contentStyle={{
                  background: "#0d0d0d",
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#737373", fontSize: "11px" }}
                itemStyle={{ color: "#ff6600", fontWeight: "bold" }}
                formatter={(value: any) => [`${parseFloat(value).toFixed(2)}x`, "Multiplier"]}
                labelFormatter={(label) => `Flight #${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="multiplier" 
                stroke="#ff6600" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorMultiplier)" 
                activeDot={{ r: 5, stroke: "#000", strokeWidth: 2, fill: "#ff6600" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-xs text-neutral-500 gap-2">
            <span>Awaiting telemetry data stream to hydrate chart...</span>
          </div>
        )}
      </div>

      {/* Live Backtest Win Rates Section */}
      <div className="border-t border-white/5 pt-5 flex flex-col gap-4">
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-wider text-white">Historical Strategy Performance</span>
          <span className="text-[10px] text-neutral-500 mt-0.5 font-mono uppercase tracking-wide">
            Live backtest success rates calculated across all {totalFlights} session flights
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-1">
          {/* Conservative Win Rate */}
          <div className="bg-[#050505] p-4 rounded-xl border border-white/5 flex flex-col gap-3 font-mono">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-neutral-555 uppercase font-bold text-neutral-400">Conservative Strategy ({consTarget.toFixed(2)}x)</span>
              <span className="text-2xl font-black text-white">{consRate.toFixed(1)}%</span>
              <span className="text-[10px] text-neutral-500 mt-0.5">{consWins} of {totalFlights} wins</span>
            </div>
            <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-orange-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${consRate}%` }}
              ></div>
            </div>
          </div>

          {/* Balanced Win Rate */}
          <div className="bg-[#050505] p-4 rounded-xl border border-white/5 flex flex-col gap-3 font-mono">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-neutral-555 uppercase font-bold text-neutral-400">Balanced LSTM Strategy ({balTarget.toFixed(2)}x)</span>
              <span className="text-2xl font-black text-white">{balRate.toFixed(1)}%</span>
              <span className="text-[10px] text-neutral-500 mt-0.5">{balWins} of {totalFlights} wins</span>
            </div>
            <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-orange-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${balRate}%` }}
              ></div>
            </div>
          </div>

          {/* Aggressive Win Rate */}
          <div className="bg-[#050505] p-4 rounded-xl border border-white/5 flex flex-col gap-3 font-mono">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-neutral-555 uppercase font-bold text-neutral-400">Aggressive Strategy ({aggTarget.toFixed(2)}x)</span>
              <span className="text-2xl font-black text-white">{aggRate.toFixed(1)}%</span>
              <span className="text-[10px] text-neutral-500 mt-0.5">{aggWins} of {totalFlights} wins</span>
            </div>
            <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-orange-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${aggRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
