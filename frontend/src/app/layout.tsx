import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TelemetryProvider } from "@/context/telemetry-context";
import { GlobalLayout } from "@/components/layout/global-layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aviator Time-Series Analyzer",
  description: "Real-time data pipeline, crash database logger, and predictive AI sequence signals for the Aviator game.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TelemetryProvider>
          <GlobalLayout>
            {children}
          </GlobalLayout>
        </TelemetryProvider>
      </body>
    </html>
  );
}
