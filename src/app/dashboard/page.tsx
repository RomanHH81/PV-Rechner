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
import styles from "@/styles/components/Dashboard.module.scss";

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
    <div className={styles.dashboardContainer}>
      {/* Background Effects (only in dark mode) */}
      {mounted && theme === "dark" && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[100px]" />
          <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-emerald-400/5 blur-[150px]" />
        </div>
      )}

      <Header />

      <main className={styles.mainContent}>
        {/* Hero */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.hero}
        >
          <h1>Dashboard</h1>
          <p>
            PV-Wirtschaftlichkeitsanalyse – alle Werte reagieren in Echtzeit
          </p>
        </motion.header>

        {/* Results Summary */}
        <section aria-labelledby="summary-heading" className="mb-8">
          <h2 id="summary-heading" className="sr-only">Zusammenfassung der Ergebnisse</h2>
          <SummaryCards />
        </section>

        {/* Charts Row */}
        <section aria-labelledby="charts-heading" className={styles.chartsRow}>
          <h2 id="charts-heading" className="sr-only">Grafische Auswertungen</h2>
          <ProductionChart />
          <CashflowChart />
        </section>

        {/* Configuration – Left column: Investment + Verbrauch | Right: PV */}
        <div className={styles.configGrid}>
          <section aria-labelledby="config-finance-heading" className="space-y-6">
            <h2 id="config-finance-heading" className="sr-only">Finanzen & Verbrauch</h2>
            <InvestmentConfig />
            <ConsumptionConfig />
          </section>
          <section aria-labelledby="config-pv-heading" className="space-y-6">
            <h2 id="config-pv-heading" className="sr-only">Photovoltaik-Konfiguration</h2>
            <PVConfig />
          </section>
        </div>

        {/* Heating Config (full width) */}
        <section aria-labelledby="config-heating-heading">
          <h2 id="config-heating-heading" className="sr-only">Heizsystem-Konfiguration</h2>
          <HeatingConfig />
        </section>
      </main>
    </div>
  );
}
