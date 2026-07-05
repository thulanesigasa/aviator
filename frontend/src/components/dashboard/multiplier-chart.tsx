"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp, BarChart } from "lucide-react";

interface MultiplierItem {
  id: number | string;
  multiplier: number;
  timestamp: number | string;
}

interface MultiplierChartProps {
  data: MultiplierItem[];
}

export function MultiplierChart({ data }: MultiplierChartProps) {
  // Reverse chronological logs to chronological for plotting
  const chartData = [...data].reverse().map((item, idx) => ({
    index: idx + 1,
    multiplier: parseFloat(item.multiplier.toString()),
    // Cap visual plotting height to prevent single high multipliers (like 100x+) from flattening other data
    plotValue: Math.min(10.0, parseFloat(item.multiplier.toString()))
  }));

  return (
    <div className="glass-panel rounded-2xl p-6 flex flex-col gap-5 flex-1">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <BarChart className="text-primary-electric w-5 h-5" />
          <div>
            <h2 className="text-lg font-semibold tracking-wide">Multiplier Timeline Sequence</h2>
            <p className="text-xs text-gray-400">Sequence flow of latest rounds (capped visually at 10x for detail)</p>
          </div>
        </div>
      </div>

      <div className="h-[280px] w-full bg-black/20 rounded-xl p-2 border border-white/5 relative">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMult" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(250, 95%, 65%)" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="hsl(250, 95%, 65%)" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="index" 
                stroke="rgba(255, 255, 255, 0.3)" 
                fontSize={10}
                tickLine={false}
              />
              <YAxis 
                stroke="rgba(255, 255, 255, 0.3)" 
                fontSize={10}
                tickLine={false}
                domain={[1.0, 10.0]}
                tickFormatter={(val) => `${val.toFixed(1)}x`}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(13, 17, 33, 0.95)",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
                }}
                labelClassName="text-gray-500 font-semibold text-xs"
                formatter={(value: any, name: any, props: any) => {
                  // Display real multiplier value in tooltip, not the plotted capped value
                  const realVal = props.payload.multiplier;
                  return [`${realVal.toFixed(2)}x`, "Multiplier"];
                }}
              />
              <Area
                type="monotone"
                dataKey="plotValue"
                stroke="hsl(250, 95%, 65%)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorMult)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-xs text-gray-500 gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary-electric animate-ping"></span>
            <span>Awaiting crash sequence data feed...</span>
          </div>
        )}
      </div>
    </div>
  );
}
