"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useSimulationStore } from "@/store/useSimulationStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDebouncedCalculate } from "@/hooks/useDebounce";

export function InvestmentConfig() {
  const { pvSystem, setPVSystem } = useSimulationStore();
  const trigger = useDebouncedCalculate(150);

  // Gesamtinvestition = Anlage + Wechselrichter + Installation
  const totalInvestment = useMemo(
    () =>
      pvSystem.investmentCost +
      pvSystem.inverterCost +
      pvSystem.installationCost,
    [pvSystem.investmentCost, pvSystem.inverterCost, pvSystem.installationCost],
  );

  // Zwei separate Eingabefelder:
  // investmentCost = Anlagenkosten (gesamt)
  // installationCost = Rücklagen & Instandhaltung (€/Monat) – wir nutzen installationCost dafür
  const monthlyReserve = pvSystem.installationCost;

  // Lineare Abschreibung über 20 Jahre auf Gesamtinvestition
  const yearlyDepreciation = totalInvestment / 20;
  const monthlyDepreciation = yearlyDepreciation / 12;

  // Monatliche Gesamtbelastung = Abschreibung + Rücklagen
  const totalMonthlyCost = monthlyDepreciation + monthlyReserve;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-wider text-white/70">
            Investitions- & Rücklagenkosten
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <label className="block text-xs text-white/50 mb-2">
              Anlagenkosten (gesamt)
            </label>
            <div className="relative">
              <input
                type="number"
                value={pvSystem.investmentCost}
                onChange={(e) => {
                  setPVSystem({ investmentCost: Number(e.target.value) });
                  trigger();
                }}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40">
                €
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-2">
              Instandhaltung & Rücklagen (pro Monat)
            </label>
            <div className="relative">
              <input
                type="number"
                value={pvSystem.installationCost}
                onChange={(e) => {
                  setPVSystem({ installationCost: Number(e.target.value) });
                  trigger();
                }}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40">
                €/Monat
              </span>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50">
                  Gesamtinvestition (20 Jahre linear)
                </span>
                <span className="text-sm font-semibold text-white">
                  {new Intl.NumberFormat("de-DE", {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 0,
                  }).format(totalInvestment)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50">
                  Abschreibung pro Monat
                </span>
                <span className="text-sm font-semibold text-white">
                  {new Intl.NumberFormat("de-DE", {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 2,
                  }).format(monthlyDepreciation)}{" "}
                  / Monat
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50">
                  Instandhaltung & Rücklagen
                </span>
                <span className="text-sm font-semibold text-white">
                  {monthlyReserve} € / Monat
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-emerald-500/20">
                <span className="text-xs text-white/70 font-medium">
                  Gesamtbelastung pro Monat
                </span>
                <span className="text-sm font-bold text-emerald-400">
                  {new Intl.NumberFormat("de-DE", {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 2,
                  }).format(totalMonthlyCost)}{" "}
                  / Monat
                </span>
              </div>
              <p className="text-[10px] text-white/30 mt-2">
                Abschreibung:{" "}
                {new Intl.NumberFormat("de-DE", {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                }).format(totalInvestment)}{" "}
                / 20 Jahre ={" "}
                {new Intl.NumberFormat("de-DE", {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 2,
                }).format(monthlyDepreciation)}
                /Monat + {monthlyReserve} € Rücklagen
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
