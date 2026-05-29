"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSimulationStore } from "@/store/useSimulationStore";
import { useAutoCalculate } from "@/hooks/useAutoCalculate";
import { Header } from "@/components/layout/Header";
import { PVConfig } from "@/components/configuration/PVConfig";
import { ConsumptionConfig } from "@/components/configuration/ConsumptionConfig";
import { HeatingConfig } from "@/components/configuration/HeatingConfig";
import { InvestmentConfig } from "@/components/configuration/InvestmentConfig";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { ProductionChart } from "@/components/charts/ProductionChart";
import { CashflowChart } from "@/components/charts/CashflowChart";
import { useTheme } from "next-themes";

export default function DashboardPage() {
  const { calculate, simulationResult } = useSimulationStore();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useAutoCalculate();

  useEffect(() => {
    setMounted(true);
    if (!simulationResult) {
      calculate();
    }
  }, []);

  return (
    <div className="min-h-screen transition-colors duration-300 bg-[var(--color-background)] text-[var(--gray-12)] selection:bg-emerald-500/30">
      {/* Background Effects (only in dark mode) */}
      {mounted && theme === "dark" && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[100px]" />
          <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-emerald-400/5 blur-[150px]" />
        </div>
      )}

      <Header />

      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-left w-full"
        >
          <h2 className="text-2xl font-bold text-[var(--gray-12)]">Dashboard</h2>
          <p className="text-sm mt-1 text-[var(--gray-10)]">
            PV-Wirtschaftlichkeitsanalyse – alle Werte reagieren in Echtzeit
          </p>
        </motion.div>

        {/* Results Summary */}
        <div className="mb-8">
          <SummaryCards />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ProductionChart />
          <CashflowChart />
        </div>

        {/* Configuration – Left column: Investment + Verbrauch | Right: PV */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="space-y-6">
            <InvestmentConfig />
            <ConsumptionConfig />
          </div>
          <div className="space-y-6">
            <PVConfig />
          </div>
        </div>

        {/* Heating Config (full width) */}
        <HeatingConfig />
      </main>
    </div>
  );
}
