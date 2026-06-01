"use client";

import { motion } from "framer-motion";
import {
  Sun,
  Battery,
  Euro,
  TrendingUp,
  Clock,
  Zap,
  Flame,
  BarChart3,
} from "lucide-react";
import { useSimulationStore } from "@/store/useSimulationStore";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { useEffect, useState } from "react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function SummaryCards() {
  const { simulationResult, simulationRunning, districtHeating, heatPump, tariff } =
    useSimulationStore();
  const [mounted, setMounted] = useState(false);
  const s = simulationResult?.summary;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!s) {
    return (
      <div className="col-span-full flex items-center justify-center py-20">
        <div className="text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-sm">
            Konfiguriere deine PV-Anlage und starte die Berechnung
          </p>
        </div>
      </div>
    );
  }

  const savingsFromSelfUse = s.selfConsumption * (tariff.electricityPrice / 100);
  const isDistrict = districtHeating.enabled;
  const isHeatpump = heatPump.enabled;

  const heatingSavings = s.heatingCostsDistrict - s.heatingCostsHeatpump;
  const heatingSavingsMonthly = heatingSavings / 12;

  const cards = [
    {
      icon: Sun,
      label: "Produktion",
      value: `${formatNumber(s.yearlyProduction, 0)} kWh`,
      sub: `Eigenverbrauch: ${formatNumber(s.selfConsumptionRate, 1)}%`,
      color: "var(--grad-amber-emerald)",
    },
    {
      icon: Battery,
      label: "Autarkie",
      value: `${formatNumber(Math.min(s.autarkyRate, 100), 1)}%`,
      sub: `${formatNumber(s.gridPurchase, 0)} kWh Netz`,
      color: "var(--grad-blue-cyan)",
    },
    {
      icon: Euro,
      label: "Ersparnis",
      value: formatCurrency(savingsFromSelfUse),
      sub: `${tariff.electricityPrice.toFixed(1)} Cent/kWh`,
      color: "var(--grad-emerald-teal)",
    },
    {
      icon: Zap,
      label: "Einspeisung",
      value: formatCurrency(s.feedInRevenue),
      sub: `${formatNumber(s.gridFeedIn, 0)} kWh`,
      color: "var(--grad-violet-purple)",
    },
    {
      icon: TrendingUp,
      label: "Stromkosten",
      value: formatCurrency(s.electricityCostsWithPV),
      sub: `Ohne PV: ${formatCurrency(s.electricityCostsWithoutPV)}`,
      color: "var(--grad-orange-amber)",
    },
    {
      icon: Flame,
      label: "Heizkosten",
      value: formatCurrency(
        isDistrict
          ? s.heatingCostsDistrict
          : isHeatpump
            ? s.heatingCostsHeatpump
            : 0,
      ),
      sub: isHeatpump ? "Wärmepumpe" : isDistrict ? "Fernwärme" : "Inaktiv",
      color: "var(--grad-rose-orange)",
    },
    {
      icon: Euro,
      label: "Cashflow",
      value: formatCurrency(s.cumulativeCashflow20y),
      sub: "20 Jahre Gesamt",
      color: "var(--grad-emerald-teal)",
    },
    {
      icon: Clock,
      label: "Amortisation",
      value:
        s.paybackPeriod > 0 ? `${formatNumber(s.paybackPeriod, 1)} J.` : "—",
      sub: s.breakEvenYear > 0 ? `Jahr ${s.breakEvenYear}` : "Kein Break-Even",
      color: "var(--grad-emerald-teal)",
    },
  ];

  return (
    <div className="relative">
      {simulationRunning && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-xl">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          </div>
        </div>
      )}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 md:gap-4"
      >
        {cards.map((card, i) => (
          <motion.div key={i} variants={item}>
            <Card className="group transition-all duration-300 cursor-default border border-border bg-card shadow-sm hover:shadow-md">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col items-start gap-1">
                  {/* Top Row: Icon + Label */}
                  <div className="flex items-center gap-2 w-full mb-1">
                    <card.icon
                      className="h-4 w-4 shrink-0"
                      style={{ 
                        color: 'transparent',
                        backgroundImage: card.color,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text'
                      }}
                    />
                    <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">
                      {card.label}
                    </p>
                  </div>
                  
                  {/* Middle Row: Value */}
                  <p
                    className="text-base sm:text-lg md:text-xl font-bold leading-tight"
                    style={{ 
                      color: 'transparent',
                      backgroundImage: card.color,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text'
                    }}
                  >
                    {card.value}
                  </p>
                  
                  {/* Bottom Row: Subtext */}
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate w-full opacity-70">
                    {card.sub}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
