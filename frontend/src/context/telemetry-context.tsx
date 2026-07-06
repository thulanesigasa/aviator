"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useWebSocket, TelemetryState, CrashRecord } from "@/hooks/use-websocket";

interface TelemetryContextType {
  isConnected: boolean;
  latestTelemetry: TelemetryState | null;
  history: CrashRecord[];
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

const WS_URL = "ws://localhost:8000/ws/dashboard";

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const { isConnected, latestTelemetry, history } = useWebSocket(WS_URL);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Apply Theme Mode class globally on HTML document
  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light-theme");
    } else {
      document.documentElement.classList.remove("light-theme");
    }
  }, [theme]);

  return (
    <TelemetryContext.Provider value={{ isConnected, latestTelemetry, history, theme, setTheme }}>
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetry() {
  const context = useContext(TelemetryContext);
  if (context === undefined) {
    throw new Error("useTelemetry must be used within a TelemetryProvider");
  }
  return context;
}
