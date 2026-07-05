"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface CrashData {
  id?: number;
  multiplier: number;
  timestamp: string;
}

interface MultiplierChartProps {
  data: CrashData[];
}

export function MultiplierChart({ data }: MultiplierChartProps) {
  // Take last 50 entries
  const chartData = data.slice(-50).map((d, index) => ({
    index: index + 1,
    multiplier: d.multiplier,
    time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  }));

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/5 bg-[#0d0d0d] flex flex-col gap-5 flex-1">
      <div className="border-b border-white/5 pb-4">
        <h2 className="text-lg font-bold tracking-tight text-white uppercase">Multiplier Progression</h2>
        <p className="text-xs text-neutral-400 mt-0.5">Chronological crash points (last 50 flights)</p>
      </div>

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
    </div>
  );
}
