"use client";

import { motion } from "framer-motion";
import { Sun, Moon, Zap } from "lucide-react";
import { useSimulationStore } from "@/store/useSimulationStore";
import { Button } from "@/components/ui/button";

export function Header() {
  const { darkMode, toggleDarkMode } = useSimulationStore();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`sticky top-0 z-50 w-full border-b backdrop-blur-2xl ${
        darkMode
          ? "border-white/10 bg-slate-950/80"
          : "border-slate-200 bg-white/80"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/25">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1
              className={`text-lg font-bold tracking-tight ${
                darkMode ? "text-white" : "text-slate-900"
              }`}
            >
              PV Rechner
            </h1>
            <p
              className={`text-[10px] font-medium tracking-wider uppercase ${
                darkMode ? "text-white/40" : "text-slate-500"
              }`}
            >
              Wirtschaftlichkeitsanalyse
            </p>
          </div>
        </motion.div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-xl"
          >
            {darkMode ? (
              <Sun className="h-4 w-4 text-yellow-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700" />
            )}
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
