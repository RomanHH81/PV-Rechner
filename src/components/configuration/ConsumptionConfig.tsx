"use client";

import { motion } from "framer-motion";
import { Zap, Car } from "lucide-react";
import { useSimulationStore } from "@/store/useSimulationStore";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LoadProfileType } from "@/types";
import { useDebouncedCalculate } from "@/hooks/useDebounce";

const loadProfiles: { value: LoadProfileType; label: string }[] = [
  { value: "standard", label: "Standard" },
  { value: "home-office", label: "Home Office" },
  { value: "family", label: "Familie" },
  { value: "senior", label: "Senior" },
  { value: "night-worker", label: "Nachtschicht" },
];

export function ConsumptionConfig() {
  const { consumption, setConsumption, toggleLoadProfile, tariff, setTariff } =
    useSimulationStore();
  const triggerCalculate = useDebouncedCalculate(150);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 w-full justify-start text-foreground">
            <Zap className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
            Verbrauch & Tarif
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">Haushaltsstrom</label>
              <span className="text-sm font-semibold text-foreground">
                {consumption.householdConsumption.toLocaleString("de-DE")} kWh
              </span>
            </div>
            <Slider
              value={[consumption.householdConsumption]}
              onValueChange={([v]) => {
                setConsumption({ householdConsumption: v });
                triggerCalculate();
              }}
              min={1000}
              max={20000}
              step={100}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground flex items-center gap-1">
                <Car className="h-3.5 w-3.5" />
                E-Auto
              </label>
              <span className="text-sm font-semibold text-foreground">
                {consumption.evConsumption.toLocaleString("de-DE")} kWh
              </span>
            </div>
            <Slider
              value={[consumption.evConsumption]}
              onValueChange={([v]) => {
                setConsumption({ evConsumption: v });
                triggerCalculate();
              }}
              min={0}
              max={15000}
              step={100}
            />
          </div>

          {/* Multi-Select Load Profiles */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              Lastprofile (mehrere wählbar)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {loadProfiles.map((profile) => {
                const isActive = consumption.loadProfiles.includes(
                  profile.value,
                );
                return (
                  <button
                    key={profile.value}
                    onClick={() => {
                      toggleLoadProfile(profile.value);
                      triggerCalculate();
                    }}
                    className={`rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                        : "bg-background text-muted-foreground  hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {profile.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tariff */}
          <div className="border-t  pt-6 space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Stromtarif</h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-muted-foreground">Strompreis</label>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {tariff.electricityPrice.toFixed(1)} Cent/kWh
                </span>
              </div>
              <Slider
                value={[tariff.electricityPrice]}
                onValueChange={([v]) => {
                  setTariff({ electricityPrice: v });
                  triggerCalculate();
                }}
                min={15}
                max={60}
                step={0.5}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-muted-foreground">
                  Einspeisevergütung
                </label>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {tariff.feedInTariff.toFixed(1)} Cent/kWh
                </span>
              </div>
              <Slider
                value={[tariff.feedInTariff]}
                onValueChange={([v]) => {
                  setTariff({ feedInTariff: v });
                  triggerCalculate();
                }}
                min={0}
                max={20}
                step={0.5}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-muted-foreground">Netzentgelte</label>
                <span className="text-sm font-semibold text-foreground">
                  {tariff.gridFees.toFixed(1)} €/Monat
                </span>
              </div>
              <Slider
                value={[tariff.gridFees]}
                onValueChange={([v]) => {
                  setTariff({ gridFees: v });
                  triggerCalculate();
                }}
                min={0}
                max={30}
                step={0.5}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-muted-foreground">
                  Jährliche Steigerung
                </label>
                <span className="text-sm font-semibold text-foreground">
                  {tariff.annualIncrease.toFixed(1)}%
                </span>
              </div>
              <Slider
                value={[tariff.annualIncrease]}
                onValueChange={([v]) => {
                  setTariff({ annualIncrease: v });
                  triggerCalculate();
                }}
                min={0}
                max={10}
                step={0.5}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
