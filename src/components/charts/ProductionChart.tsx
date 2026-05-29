"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { useSimulationStore } from "@/store/useSimulationStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";

const MONTHS = [
  "Jan",
  "Feb",
  "Mär",
  "Apr",
  "Mai",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Okt",
  "Nov",
  "Dez",
];

export function ProductionChart() {
  const { simulationResult, darkMode } = useSimulationStore();

  const data = useMemo(() => {
    if (!simulationResult?.monthlyResults) return [];
    return simulationResult.monthlyResults.map((r) => ({
      month: MONTHS[r.month - 1],
      Produktion: Math.round(r.production),
      Verbrauch: Math.round(r.consumption),
      Eigenverbrauch: Math.round(r.selfConsumption),
    }));
  }, [simulationResult]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 w-full justify-start text-foreground">
            <BarChart3 className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
            Monatsproduktion & Verbrauch
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] min-h-[300px] min-w-0">
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                <BarChart data={data} barGap={2}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
                  />
                  <XAxis
                    dataKey="month"
                    stroke={darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.5)"}
                    tick={{ fill: darkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.6)", fontSize: 12 }}
                  />
                  <YAxis
                    stroke={darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.5)"}
                    tick={{ fill: darkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.6)", fontSize: 12 }}
                    tickFormatter={(v) => `${v} kWh`}
                  />
                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      background: darkMode ? "rgba(15,23,42,0.95)" : "rgba(255,255,255,0.95)",
                      border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
                      borderRadius: "12px",
                      backdropFilter: "blur(16px)",
                    }}
                    labelStyle={{ color: darkMode ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.9)" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", color: darkMode ? "white" : "black" }} />
                  <Bar
                    dataKey="Produktion"
                    fill="url(#productionGrad)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Verbrauch"
                    fill="url(#consumptionGrad)"
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient
                      id="productionGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient
                      id="consumptionGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#60a5fa" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground text-sm">Keine Daten verfügbar</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
