"use client";

import React from "react";
import { History, Eye } from "lucide-react";

interface MultiplierItem {
  id: number | string;
  multiplier: number;
  timestamp: number | string;
}

interface PatternTableProps {
  history: MultiplierItem[];
}

export function PatternTable({ history }: PatternTableProps) {
  const getBadgeStyle = (mult: number) => {
    if (mult < 1.20) {
      return "bg-danger-rose/10 border-danger-rose/25 text-danger-rose";
    } else if (mult < 2.00) {
      return "bg-white/5 border-white/10 text-gray-300";
    } else if (mult < 10.00) {
      return "bg-primary-electric/10 border-primary-electric/25 text-primary-electric";
    } else {
      return "bg-warning-amber/10 border-warning-amber/25 text-warning-amber font-bold";
    }
  };

  const getFormatTime = (timeInput: number | string) => {
    try {
      const timeMs = typeof timeInput === "number" ? timeInput * 1000 : Date.parse(timeInput);
      const date = new Date(timeMs);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return "00:00:00";
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 flex flex-col gap-5">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <History className="text-primary-electric w-5 h-5" />
        <div>
          <h2 className="text-lg font-semibold tracking-wide">Live Roll Log</h2>
          <p className="text-xs text-gray-400">Chronological history of incoming multiplier crash events</p>
        </div>
      </div>

      <div className="max-h-[300px] overflow-y-auto border border-white/5 rounded-xl bg-black/20">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-[10px] text-gray-500 font-bold uppercase tracking-wider bg-white/2">
              <th className="py-3 px-4">Time</th>
              <th className="py-3 px-4">Multiplier</th>
              <th className="py-3 px-4">Category</th>
            </tr>
          </thead>
          <tbody>
            {history.length > 0 ? (
              history.map((item, idx) => {
                const mult = parseFloat(item.multiplier.toString());
                
                let category = "Low (1-2x)";
                if (mult < 1.20) category = "Instant-Crash";
                else if (mult >= 10.00) category = "Golden (10x+)";
                else if (mult >= 2.00) category = "Medium (2-10x)";

                return (
                  <tr key={idx} className="border-b border-white/5 text-sm text-gray-300 hover:bg-white/2 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-xs">
                      {getFormatTime(item.timestamp)}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-md border text-xs font-semibold font-mono ${getBadgeStyle(mult)}`}>
                        {mult.toFixed(2)}x
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-xs font-medium">
                      {category}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={3} className="py-8 text-center text-xs text-gray-500 font-mono">
                  Awaiting database log writes...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
