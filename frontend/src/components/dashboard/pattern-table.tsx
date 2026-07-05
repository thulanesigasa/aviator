"use client";

import React, { useState } from "react";
import { History, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

interface CrashData {
  id?: number;
  multiplier: number;
  timestamp: string;
}

interface PatternTableProps {
  data: CrashData[];
}

export function PatternTable({ data }: PatternTableProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Clone and reverse history array so that the newest is displayed first in the table
  const reversedData = [...data].reverse();
  const totalPages = Math.max(Math.ceil(reversedData.length / itemsPerPage), 1);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = reversedData.slice(startIndex, startIndex + itemsPerPage);

  const getBadgeStyle = (mult: number) => {
    if (mult < 1.20) {
      return "bg-danger-rose/10 border-danger-rose/20 text-danger-rose";
    }
    if (mult >= 5.00) {
      return "bg-success-emerald/10 border-success-emerald/20 text-success-emerald shadow-[0_0_12px_rgba(16,185,129,0.15)]";
    }
    return "bg-white/5 border-white/10 text-gray-300";
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/5 bg-black/40 flex flex-col gap-4 flex-1">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <History className="text-primary-electric w-5 h-5" />
        <div>
          <h2 className="text-lg font-semibold tracking-wide">Historical Crashes</h2>
          <p className="text-xs text-gray-400">Live records parsed from the web listener stream</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/5 text-gray-400">
              <th className="py-3 px-2 font-medium">Index</th>
              <th className="py-3 px-2 font-medium">Multiplier</th>
              <th className="py-3 px-2 font-medium">Timestamp (UTC)</th>
              <th className="py-3 px-2 font-medium">Outcome Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => {
                const globalIndex = reversedData.length - (startIndex + index);
                return (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="py-3 px-2 font-mono text-gray-500">#{globalIndex}</td>
                    <td className="py-3 px-2 font-bold font-mono text-white">
                      {item.multiplier.toFixed(2)}x
                    </td>
                    <td className="py-3 px-2 text-gray-400 font-mono">
                      {new Date(item.timestamp).toISOString().replace("T", " ").slice(0, 19)}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle(item.multiplier)}`}>
                        {item.multiplier < 1.20 ? "COLD" : item.multiplier >= 5.00 ? "HOT" : "STABLE"}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-500 text-xs">
                  No historical flight records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
          <span className="text-xs text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((c) => Math.max(c - 1, 1))}
              disabled={currentPage === 1}
              className="p-1 rounded bg-white/5 border border-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((c) => Math.min(c + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1 rounded bg-white/5 border border-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
