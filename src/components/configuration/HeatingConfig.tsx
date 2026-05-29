"use client";

import { motion } from "framer-motion";
import { Flame, Snowflake, Fuel, Droplets } from "lucide-react";
import { useSimulationStore } from "@/store/useSimulationStore";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDebouncedCalculate } from "@/hooks/useDebounce";
import { formatCurrency } from "@/lib/utils";

export function HeatingConfig() {
  const {
    heatPump,
    districtHeating,
    gasHeater,
    oilHeater,
    setHeatPump,
    setDistrictHeating,
    setGasHeater,
    setOilHeater,
    toggleHeatpumpEnabled,
    toggleDistrictHeatEnabled,
    toggleGasHeaterEnabled,
    toggleOilHeaterEnabled,
    simulationResult,
    darkMode,
  } = useSimulationStore();

  const trigger = useDebouncedCalculate(150);
  const s = simulationResult?.summary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Flame className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
            Heizsysteme
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Kostenvergleich */}
          {s && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-muted border border-border">
                <p className="text-xs text-muted-foreground">Aktive Heizung</p>
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mt-1">
                  {districtHeating.enabled
                    ? "Fernwärme"
                    : heatPump.enabled
                      ? "Wärmepumpe"
                      : gasHeater.enabled
                        ? "Gas"
                        : oilHeater.enabled
                          ? "Öl"
                          : "Keine"}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-muted border border-border">
                <p className="text-xs text-muted-foreground">Heizkosten/Jahr</p>
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mt-1">
                  {formatCurrency(
                    s.heatingCostsHeatpump > 0
                      ? s.heatingCostsHeatpump
                      : s.heatingCostsDistrict > 0
                        ? s.heatingCostsDistrict
                        : 0,
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Fernwärme */}
          <div>
            <button
              onClick={() => {
                toggleDistrictHeatEnabled();
                trigger();
              }}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                districtHeating.enabled
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-muted border-border opacity-60"
              }`}
            >
              <span className="font-medium text-sm text-foreground flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                Fernwärme{" "}
                <span className="text-[10px] text-muted-foreground">(Default)</span>
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  districtHeating.enabled
                    ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                    : "bg-muted-foreground/10 text-muted-foreground"
                }`}
              >
                {districtHeating.enabled ? "aktiv" : "inaktiv"}
              </span>
            </button>
            {districtHeating.enabled && (
              <div className="mt-3 space-y-3 pl-2">
                <SliderField
                  label="Verbrauch"
                  value={districtHeating.heatConsumption}
                  onChange={(v) => {
                    setDistrictHeating({ heatConsumption: v });
                    trigger();
                  }}
                  min={0}
                  max={40000}
                  step={100}
                  suffix="kWh"
                  color="orange"
                />
                <SliderField
                  label="Arbeitspreis"
                  value={districtHeating.workPrice * 1000}
                  onChange={(v) => {
                    setDistrictHeating({ workPrice: v / 1000 });
                    trigger();
                  }}
                  min={0}
                  max={400}
                  step={1}
                  suffix="Cent/kWh"
                  color="orange"
                />
                <SliderField
                  label="CO₂-Kosten"
                  value={districtHeating.co2Cost}
                  onChange={(v) => {
                    setDistrictHeating({ co2Cost: v });
                    trigger();
                  }}
                  min={0}
                  max={500}
                  step={1}
                  suffix="€"
                />
                <SliderField
                  label="Grundpreis"
                  value={districtHeating.basePrice}
                  onChange={(v) => {
                    setDistrictHeating({ basePrice: v });
                    trigger();
                  }}
                  min={0}
                  max={1500}
                  step={10}
                  suffix="€/Jahr"
                />
              </div>
            )}
          </div>

          {/* Wärmepumpe */}
          <div>
            <button
              onClick={() => {
                toggleHeatpumpEnabled();
                trigger();
              }}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                heatPump.enabled
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-muted border-border opacity-60"
              }`}
            >
              <span className="font-medium text-sm text-foreground flex items-center gap-2">
                <Snowflake className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                Wärmepumpe
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  heatPump.enabled
                    ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                    : "bg-muted-foreground/10 text-muted-foreground"
                }`}
              >
                {heatPump.enabled ? "aktiv" : "inaktiv"}
              </span>
            </button>
            {heatPump.enabled && (
              <div className="mt-3 space-y-3 pl-2">
                <SliderField
                  label="Wärmebedarf"
                  value={heatPump.heatDemand}
                  onChange={(v) => {
                    setHeatPump({ heatDemand: v });
                    trigger();
                  }}
                  min={2000}
                  max={30000}
                  step={100}
                  suffix="kWh"
                  color="emerald"
                />
                <SliderField
                  label="Warmwasser"
                  value={heatPump.hotWaterDemand}
                  onChange={(v) => {
                    setHeatPump({ hotWaterDemand: v });
                    trigger();
                  }}
                  min={0}
                  max={6000}
                  step={50}
                  suffix="kWh"
                  color="emerald"
                />
                <SliderField
                  label="JAZ"
                  value={heatPump.jazz}
                  onChange={(v) => {
                    setHeatPump({ jazz: v });
                    trigger();
                  }}
                  min={1.5}
                  max={6}
                  step={0.1}
                  suffix=""
                  color="emerald"
                />
                <SliderField
                  label="Zusatzkosten"
                  value={heatPump.baseCosts}
                  onChange={(v) => {
                    setHeatPump({ baseCosts: v });
                    trigger();
                  }}
                  min={0}
                  max={1000}
                  step={10}
                  suffix="€/Jahr"
                />
              </div>
            )}
          </div>

          {/* Gas */}
          <div>
            <button
              onClick={() => {
                toggleGasHeaterEnabled();
                trigger();
              }}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                gasHeater.enabled
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-muted border-border opacity-60"
              }`}
            >
              <span className="font-medium text-sm text-foreground flex items-center gap-2">
                <Fuel className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Gasheizung
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  gasHeater.enabled
                    ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                    : "bg-muted-foreground/10 text-muted-foreground"
                }`}
              >
                {gasHeater.enabled ? "aktiv" : "inaktiv"}
              </span>
            </button>
            {gasHeater.enabled && (
              <div className="mt-3 space-y-3 pl-2">
                <SliderField
                  label="Grundkosten"
                  value={gasHeater.baseCosts}
                  onChange={(v) => {
                    setGasHeater({ baseCosts: v });
                    trigger();
                  }}
                  min={0}
                  max={500}
                  step={10}
                  suffix="€/Jahr"
                  color="blue"
                />
                <SliderField
                  label="Arbeitspreis"
                  value={gasHeater.workingPrice}
                  onChange={(v) => {
                    setGasHeater({ workingPrice: v });
                    trigger();
                  }}
                  min={0}
                  max={30}
                  step={0.5}
                  suffix="Cent/kWh"
                  color="blue"
                />
              </div>
            )}
          </div>

          {/* Öl */}
          <div>
            <button
              onClick={() => {
                toggleOilHeaterEnabled();
                trigger();
              }}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                oilHeater.enabled
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-muted border-border opacity-60"
              }`}
            >
              <span className="font-medium text-sm text-foreground flex items-center gap-2">
                <Droplets className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                Ölheizung
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  oilHeater.enabled
                    ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                    : "bg-muted-foreground/10 text-muted-foreground"
                }`}
              >
                {oilHeater.enabled ? "aktiv" : "inaktiv"}
              </span>
            </button>
            {oilHeater.enabled && (
              <div className="mt-3 space-y-3 pl-2">
                <SliderField
                  label="Grundkosten"
                  value={oilHeater.baseCosts}
                  onChange={(v) => {
                    setOilHeater({ baseCosts: v });
                    trigger();
                  }}
                  min={0}
                  max={500}
                  step={10}
                  suffix="€/Jahr"
                  color="amber"
                />
                <SliderField
                  label="Arbeitspreis"
                  value={oilHeater.workingPrice}
                  onChange={(v) => {
                    setOilHeater({ workingPrice: v });
                    trigger();
                  }}
                  min={0}
                  max={30}
                  step={0.5}
                  suffix="Cent/kWh"
                  color="amber"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
  color = "emerald",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  suffix: string;
  color?: string;
}) {
  const textColor =
    color === "orange"
      ? "text-orange-600 dark:text-orange-400"
      : color === "emerald"
        ? "text-emerald-600 dark:text-emerald-400"
        : color === "blue"
          ? "text-blue-600 dark:text-blue-400"
          : "text-amber-600 dark:text-amber-400";
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-semibold ${textColor}`}>
          {step < 1
            ? value.toFixed(1)
            : Math.round(value).toLocaleString("de-DE")}{" "}
          {suffix}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
      />
    </div>
  );
}
