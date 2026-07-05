"use client";

import React, { useState } from "react";

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
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Clone and reverse history array so that the newest is displayed first in the table
  const reversedData = [...data].reverse();
  const totalPages = Math.max(Math.ceil(reversedData.length / itemsPerPage), 1);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = reversedData.slice(startIndex, startIndex + itemsPerPage);

  const getBadgeStyle = (mult: number) => {
    if (mult < 1.20) {
      return "bg-red-950/30 border-red-900/50 text-red-500";
    }
    if (mult >= 2.00) {
      return "bg-orange-950/30 border-orange-500/50 text-orange-500";
    }
    return "bg-neutral-900/30 border-neutral-800 text-neutral-400";
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/5 bg-[#0d0d0d] flex flex-col gap-4 flex-1">
      
      {/* Header and Rows Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white uppercase">Historical Flights</h2>
          <p className="text-xs text-neutral-400 mt-0.5">Live records parsed from the web listener stream</p>
        </div>
        
        {/* Limit Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Rows per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1); // Reset to page 1 on page size alteration
            }}
            className="bg-[#050505] border border-neutral-850 text-neutral-300 rounded px-2.5 py-1 text-xs font-mono focus:outline-none focus:border-orange-500 cursor-pointer transition-colors"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/5 text-neutral-500">
              <th className="py-3 px-2 font-medium uppercase text-xs">Index</th>
              <th className="py-3 px-2 font-medium uppercase text-xs">Multiplier</th>
              <th className="py-3 px-2 font-medium uppercase text-xs">Timestamp (UTC)</th>
              <th className="py-3 px-2 font-medium uppercase text-xs">Outcome Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => {
                const globalIndex = reversedData.length - (startIndex + index);
                return (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                    <td className="py-3 px-2 font-mono text-neutral-500">#{globalIndex}</td>
                    <td className="py-3 px-2 font-bold font-mono text-white">
                      {item.multiplier.toFixed(2)}x
                    </td>
                    <td className="py-3 px-2 text-neutral-400 font-mono">
                      {new Date(item.timestamp).toISOString().replace("T", " ").slice(0, 19)}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2.5 py-0.5 rounded border text-[10px] font-bold tracking-wider ${getBadgeStyle(item.multiplier)}`}>
                        {item.multiplier < 1.20 ? "COLD" : item.multiplier >= 2.00 ? "HOT" : "STABLE"}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="py-8 text-center text-neutral-600 text-xs">
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
          <span className="text-xs text-neutral-500 font-mono">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, reversedData.length)} of {reversedData.length} records
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((c) => Math.max(c - 1, 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 text-[11px] font-bold rounded bg-neutral-900 border border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              PREV
            </button>
            <button
              onClick={() => setCurrentPage((c) => Math.min(c + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 text-[11px] font-bold rounded bg-neutral-900 border border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              NEXT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
