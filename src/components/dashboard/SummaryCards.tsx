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
      label: "Produktion & Eigenverbrauch",
      value: `${formatNumber(s.yearlyProduction, 0)} kWh`,
      sub: `Eigenverbrauch: ${formatNumber(s.selfConsumption, 0)} kWh (${formatNumber(s.selfConsumptionRate, 1)}%)`,
      color: "var(--grad-amber-emerald)",
    },
    {
      icon: Battery,
      label: "Autarkiegrad",
      value: `${formatNumber(Math.min(s.autarkyRate, 100), 1)}%`,
      sub: `${formatNumber(s.gridPurchase, 0)} kWh / Jahr Netzbezug`,
      color: "var(--grad-blue-cyan)",
    },
    {
      icon: Euro,
      label: "Stromkosten-Ersparnis",
      value: formatCurrency(savingsFromSelfUse),
      sub: `${formatNumber(s.selfConsumption, 0)} kWh × ${tariff.electricityPrice.toFixed(1)} Cent/kWh`,
      color: "var(--grad-emerald-teal)",
    },
    {
      icon: Zap,
      label: "Einspeisevergütung",
      value: formatCurrency(s.feedInRevenue),
      sub: `${formatNumber(s.gridFeedIn, 0)} kWh eingespeist`,
      color: "var(--grad-violet-purple)",
    },
    {
      icon: TrendingUp,
      label: "Stromkosten (mit PV)",
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
      sub:
        isDistrict && heatingSavings > 0
          ? `Mit WP: ${formatCurrency(s.heatingCostsHeatpump)} (${formatCurrency(heatingSavingsMonthly)}/Monat gespart)`
          : isHeatpump
            ? `Gegenüber FW: ${formatCurrency(heatingSavings)}/Jahr günstiger`
            : districtHeating.enabled
              ? "Fernwärme aktiv"
              : heatPump.enabled
                ? "Wärmepumpe aktiv"
                : "Kein Heizsystem aktiv",
      color: "var(--grad-rose-orange)",
    },
    {
      icon: Euro,
      label: "Cashflow (20 Jahre)",
      value: formatCurrency(s.cumulativeCashflow20y),
      sub: `Investition: ${formatCurrency(s.totalInvestment)}`,
      color: "var(--grad-emerald-teal)",
    },
    {
      icon: Clock,
      label: "Amortisation",
      value:
        s.paybackPeriod > 0 ? `${formatNumber(s.paybackPeriod, 1)} Jahre` : "—",
      sub:
        s.breakEvenYear > 0
          ? `Break-Even im Jahr ${s.breakEvenYear}`
          : "Kein Break-Even in 20 J.",
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
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 transition-opacity duration-200 ${
          simulationRunning ? "opacity-50" : "opacity-100"
        }`}
      >
        {cards.map((card, i) => (
          <motion.div key={i} variants={item}>
            <Card className="group transition-all duration-300 cursor-default h-full border border-border bg-card">
              <CardContent className="p-4 sm:p-5 h-full">
                <div className="flex flex-row items-center justify-between w-full h-full gap-4">
                  {/* Left Side: Icon, Label, Subtext */}
                  <div className="flex flex-col items-start text-left flex-1 min-w-0">
                    <card.icon
                      className="h-5 w-5 mb-2 shrink-0"
                      style={{ 
                        color: 'transparent',
                        backgroundImage: card.color,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text'
                      }}
                    />
                    <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5 break-words w-full">
                      {card.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground break-words w-full opacity-80">
                      {card.sub}
                    </p>
                  </div>

                  {/* Right Side: Main Value */}
                  <div className="flex flex-col items-end text-right shrink-0">
                    <p
                      className="text-lg sm:text-xl md:text-2xl font-bold"
                      style={{ 
                        color: 'transparent',
                        backgroundImage: card.color,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text'
                      }}
                    >
                      {card.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
