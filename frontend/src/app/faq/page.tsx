"use client";

import React from "react";

export default function FAQPage() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-200">
      
      {/* Hero Header */}
      <section className="relative py-12 flex flex-col items-start gap-4">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase">
          Frequently Asked Questions
        </h1>
        <p className="text-xs text-neutral-404 font-mono uppercase tracking-wider text-neutral-400">
          Operational and integration specifications for developers and quantitative users
        </p>
      </section>

      {/* FAQ list */}
      <section className="flex flex-col gap-6">
        
        <div className="bg-[#0d0d0d] p-6 rounded-2xl border border-white/5 flex flex-col gap-2">
          <h4 className="font-bold text-white text-sm uppercase tracking-wide font-mono text-orange-500">
            [Q1] How does the PyTorch model make safety evaluations?
          </h4>
          <p className="text-xs text-neutral-400 leading-relaxed mt-1 font-mono">
            A: The LSTM model takes log-normalized sequence arrays of recent crashes and runs recurrent network layers to output the probability that the next flight crashes above 1.50x.
          </p>
        </div>

        <div className="bg-[#0d0d0d] p-6 rounded-2xl border border-white/5 flex flex-col gap-2">
          <h4 className="font-bold text-white text-sm uppercase tracking-wide font-mono text-orange-500">
            [Q2] What happens during the midnight rollover?
          </h4>
          <p className="text-xs text-neutral-400 leading-relaxed mt-1 font-mono">
            A: At exactly 23:59:59 local time, the database telemetry logs are archived under their calendar date (viewable in the History tab), and the active dashboard history resets to starting values.
          </p>
        </div>

        <div className="bg-[#0d0d0d] p-6 rounded-2xl border border-white/5 flex flex-col gap-2">
          <h4 className="font-bold text-white text-sm uppercase tracking-wide font-mono text-orange-500">
            [Q3] Why do the exits for the strategies change?
          </h4>
          <p className="text-xs text-neutral-400 leading-relaxed mt-1 font-mono">
            A: Exits are calculated based on the 25th, 50th, and 75th percentiles of the last 30 rounds. If the game crashes cold (majority of rounds below 1.2x), targets scale downward to manage risk. If the game runs hot, targets scale up to capture momentum.
          </p>
        </div>

        <div className="bg-[#0d0d0d] p-6 rounded-2xl border border-white/5 flex flex-col gap-2">
          <h4 className="font-bold text-white text-sm uppercase tracking-wide font-mono text-orange-500">
            [Q4] How is strategy confidence computed?
          </h4>
          <p className="text-xs text-neutral-400 leading-relaxed mt-1 font-mono">
            A: The confidence is a composite score combining the mathematical baseline probability of the target exit (0.97 / target), the empirical success rate of that target over the last 50 flights, and the model's active sequence trend forecast.
          </p>
        </div>

        <div className="bg-[#0d0d0d] p-6 rounded-2xl border border-white/5 flex flex-col gap-2">
          <h4 className="font-bold text-white text-sm uppercase tracking-wide font-mono text-orange-500">
            [Q5] What if the Scraper status is OFFLINE?
          </h4>
          <p className="text-xs text-neutral-400 leading-relaxed mt-1 font-mono">
            A: Verify Chrome is running with `--remote-debugging-port=9222` and that you have navigated to the Aviator game page in that browser session. Make sure the scraper command window is running.
          </p>
        </div>

      </section>

    </div>
  );
}
