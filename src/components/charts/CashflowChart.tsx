"use client";

import { useMemo, useEffect, useState } from "react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { useTheme } from "next-themes";
import { useSimulationStore } from "@/store/useSimulationStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function CashflowChart() {
  const { simulationResult } = useSimulationStore();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const data = useMemo(() => {
    if (!simulationResult?.yearlyResults) return [];
    return simulationResult.yearlyResults.map((r) => ({
      year: `Jahr ${r.year}`,
      Cashflow: Math.round(r.cumulativeCashflow),
      Investition: r.year === 1 ? -simulationResult.summary.totalInvestment : 0,
    }));
  }, [simulationResult]);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 w-full justify-start text-foreground">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            Cashflow Entwicklung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] min-h-[300px] min-w-0">
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                <AreaChart data={data}>
                  <defs>
                    <linearGradient
                      id="cashflowGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
                  />
                  <XAxis
                    dataKey="year"
                    stroke={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.4)"}
                    tick={{ fill: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.6)", fontSize: 11 }}
                    interval={2}
                  />
                  <YAxis
                    stroke={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.4)"}
                    tick={{ fill: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.6)", fontSize: 11 }}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k €`}
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
                    formatter={(value: any) => [formatCurrency(Number(value))]}
                  />
                  <Area
                    type="monotone"
                    dataKey="Cashflow"
                    stroke="#34d399"
                    strokeWidth={2}
                    fill="url(#cashflowGrad)"
                    dot={{ fill: "#34d399", r: 3 }}
                    activeDot={{ r: 5, fill: "#34d399" }}
                  />
                </AreaChart>
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
