"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Activity } from "lucide-react";

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
    <div className="glass-panel rounded-2xl p-6 border border-white/5 bg-black/40 flex flex-col gap-5 flex-1">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4 justify-between">
        <div className="flex items-center gap-3">
          <Activity className="text-primary-electric w-5 h-5 animate-pulse" />
          <div>
            <h2 className="text-lg font-semibold tracking-wide">Multiplier Progression</h2>
            <p className="text-xs text-gray-400">Crash multiplier chronological trends (last 50 flights)</p>
          </div>
        </div>
      </div>

      <div className="h-[300px] w-full bg-black/20 rounded-xl p-2 border border-white/5">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMultiplier" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(244,63,94)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="rgb(244,63,94)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="index" 
                stroke="rgba(255,255,255,0.3)" 
                fontSize={11} 
                tickLine={false} 
              />
              <YAxis 
                stroke="rgba(255,255,255,0.3)" 
                fontSize={11} 
                tickLine={false} 
                domain={[1.0, 'auto']}
                tickFormatter={(val) => `${val.toFixed(1)}x`}
              />
              <Tooltip 
                contentStyle={{
                  background: "rgba(13, 17, 33, 0.95)",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                }}
                labelStyle={{ color: "#888", fontSize: "11px" }}
                itemStyle={{ color: "#fff", fontWeight: "bold" }}
                formatter={(value: any) => [`${parseFloat(value).toFixed(2)}x`, "Multiplier"]}
                labelFormatter={(label) => `Flight #${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="multiplier" 
                stroke="rgb(244,63,94)" 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#colorMultiplier)" 
                activeDot={{ r: 6, stroke: "#000", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-xs text-gray-500 gap-2">
            <span>Awaiting telemetry data stream to hydrate chart...</span>
          </div>
        )}
      </div>
    </div>
  );
}
