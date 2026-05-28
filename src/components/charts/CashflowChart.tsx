"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import { motion } from "framer-motion";
import { useSimulationStore } from "@/store/useSimulationStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function CashflowChart() {
  const { simulationResult } = useSimulationStore();

  const data = useMemo(() => {
    if (!simulationResult?.yearlyResults) return [];
    return simulationResult.yearlyResults.map((r) => ({
      year: `Jahr ${r.year}`,
      Cashflow: Math.round(r.cumulativeCashflow),
      Investition: r.year === 1 ? -simulationResult.summary.totalInvestment : 0,
    }));
  }, [simulationResult]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cashflow Entwicklung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] min-h-[300px]">
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
                    stroke="rgba(255,255,255,0.05)"
                  />
                  <XAxis
                    dataKey="year"
                    stroke="rgba(255,255,255,0.3)"
                    tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                    interval={2}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.3)"
                    tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k €`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15,23,42,0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      backdropFilter: "blur(16px)",
                    }}
                    labelStyle={{ color: "rgba(255,255,255,0.9)" }}
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
                <p className="text-white/30 text-sm">Keine Daten verfügbar</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
