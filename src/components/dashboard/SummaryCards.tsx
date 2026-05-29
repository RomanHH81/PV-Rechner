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
  const { simulationResult, simulationRunning, districtHeating, heatPump } =
    useSimulationStore();
  const s = simulationResult?.summary;

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

  // Merge production + self consumption into one card
  const savingsFromSelfUse = s.selfConsumption * (30 / 100);
  const isDistrict = districtHeating.enabled;
  const isHeatpump = heatPump.enabled;

  // Heating savings: Fernwärme vs Wärmepumpe
  const heatingSavings = s.heatingCostsDistrict - s.heatingCostsHeatpump;
  const heatingSavingsMonthly = heatingSavings / 12;

  const cards = [
    {
      icon: Sun,
      label: "Produktion & Eigenverbrauch",
      value: `${formatNumber(s.yearlyProduction, 0)} kWh`,
      sub: `Eigenverbrauch: ${formatNumber(s.selfConsumption, 0)} kWh (${formatNumber(s.selfConsumptionRate, 1)}%)`,
      color: "from-amber-400 to-emerald-500",
      double: true,
    },
    {
      icon: Battery,
      label: "Autarkiegrad",
      value: `${formatNumber(Math.min(s.autarkyRate, 100), 1)}%`,
      sub: `${formatNumber(s.gridPurchase, 0)} kWh / Jahr Netzbezug`,
      color: "from-blue-400 to-cyan-500",
    },
    {
      icon: Euro,
      label: "Stromkosten-Ersparnis",
      value: formatCurrency(savingsFromSelfUse),
      sub: `${formatNumber(s.selfConsumption, 0)} kWh × 30 Cent/kWh`,
      color: "from-emerald-400 to-teal-500",
    },
    {
      icon: Zap,
      label: "Einspeisevergütung",
      value: formatCurrency(s.feedInRevenue),
      sub: `${formatNumber(s.gridFeedIn, 0)} kWh eingespeist`,
      color: "from-violet-400 to-purple-500",
    },
    {
      icon: TrendingUp,
      label: "Stromkosten (mit PV)",
      value: formatCurrency(s.electricityCostsWithPV),
      sub: `Ohne PV: ${formatCurrency(s.electricityCostsWithoutPV)}`,
      color: "from-orange-400 to-amber-500",
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
      color: "from-rose-400 to-orange-500",
    },
    {
      icon: Euro,
      label: "Cashflow (20 Jahre)",
      value: formatCurrency(s.cumulativeCashflow20y),
      sub: `Investition: ${formatCurrency(s.totalInvestment)}`,
      color: "from-emerald-400 to-green-500",
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
      color: "from-emerald-400 to-emerald-600",
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
            <Card className="group hover:border-primary/20 transition-all duration-300 cursor-default">
              <CardContent className="p-3 md:p-5 flex flex-col items-start text-left w-full">
                <div className="flex items-center gap-2 mb-2 md:mb-3 w-full justify-start">
                  <card.icon
                    className={`h-4 w-4 md:h-5 md:w-5 bg-gradient-to-br ${card.color} bg-clip-text text-transparent`}
                  />
                  <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {card.label}
                  </p>
                </div>
                <p
                  className={`text-xl md:text-2xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}
                >
                  {card.value}
                </p>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">
                  {card.sub}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
