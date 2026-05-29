"use client";

import { useMemo, useEffect, useState } from "react";
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
import { useTheme } from "next-themes";
import { useSimulationStore } from "@/store/useSimulationStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const { simulationResult } = useSimulationStore();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const data = useMemo(() => {
    if (!simulationResult?.monthlyResults) return [];
    return simulationResult.monthlyResults.map((r) => ({
      month: MONTHS[r.month - 1],
      Produktion: Math.round(r.production),
      Verbrauch: Math.round(r.consumption),
      Eigenverbrauch: Math.round(r.selfConsumption),
    }));
  }, [simulationResult]);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 w-full justify-start text-foreground">
            <BarChart3 className="h-5 w-5 text-emerald-500" />
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
                    stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
                  />
                  <XAxis
                    dataKey="month"
                    stroke={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.4)"}
                    tick={{ fill: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.6)", fontSize: 12 }}
                  />
                  <YAxis
                    stroke={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.4)"}
                    tick={{ fill: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.6)", fontSize: 12 }}
                    tickFormatter={(v) => `${v} kWh`}
                  />
                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      background: isDark ? "rgba(15,23,42,0.95)" : "rgba(255,255,255,0.95)",
                      border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
                      borderRadius: "12px",
                      backdropFilter: "blur(16px)",
                    }}
                    labelStyle={{ color: isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.9)" }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: "12px" }}
                    formatter={(value) => <span style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" }}>{value}</span>}
                  />
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
