"use client";

import { motion } from "framer-motion";
import { Sun, Compass, Plus, Trash2, MapPin } from "lucide-react";
import { useSimulationStore } from "@/store/useSimulationStore";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDebouncedCalculate } from "@/hooks/useDebounce";

export function PVConfig() {
  const { pvSystem, setPVSystem, setRoofSide, addRoofSide, removeRoofSide } =
    useSimulationStore();
  const triggerCalculate = useDebouncedCalculate(150);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 w-full justify-start text-foreground">
            <Sun className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
            PV-Anlage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* PLZ */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              PLZ / Standort
            </label>
            <input
              type="text"
              value={pvSystem.locationPLZ}
              onChange={(e) => setPVSystem({ locationPLZ: e.target.value })}
              className="w-full rounded-xl border border-emerald-500/30 bg-background px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              placeholder="z.B. 80339"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">PV-Leistung</label>
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                {pvSystem.pvPower.toFixed(1)} kWp
              </span>
            </div>
            <Slider
              value={[pvSystem.pvPower]}
              onValueChange={([v]) => {
                setPVSystem({ pvPower: v });
                triggerCalculate();
              }}
              min={1}
              max={50}
              step={0.1}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">Batteriegröße</label>
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                {pvSystem.batteryCapacity.toFixed(1)} kWh
              </span>
            </div>
            <Slider
              value={[pvSystem.batteryCapacity]}
              onValueChange={([v]) => {
                setPVSystem({ batteryCapacity: v });
                triggerCalculate();
              }}
              min={0}
              max={50}
              step={0.5}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">Modulanzahl</label>
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                {pvSystem.moduleCount}
              </span>
            </div>
            <Slider
              value={[pvSystem.moduleCount]}
              onValueChange={([v]) => {
                setPVSystem({ moduleCount: v });
                triggerCalculate();
              }}
              min={4}
              max={80}
              step={1}
            />
          </div>

          {/* Roof Sides */}
          <div className="border-t  pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-muted-foreground">Dachflächen</h4>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  addRoofSide();
                  triggerCalculate();
                }}
                className="gap-1"
              >
                <Plus className="h-3 w-3" />
                Dach hinzufügen
              </Button>
            </div>

            {pvSystem.roofSides.map((side, index) => (
              <div
                key={index}
                className="mb-4 p-4 rounded-xl border border-emerald-500/30 bg-muted/30"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Dach {index + 1}
                  </span>
                  {pvSystem.roofSides.length > 1 && (
                    <button
                      onClick={() => {
                        removeRoofSide(index);
                        triggerCalculate();
                      }}
                      className="text-destructive hover:text-destructive/80 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Ausrichtung</label>
                    <div className="flex gap-1 mt-1">
                      {[
                        { v: 0, l: "S" },
                        { v: 90, l: "W" },
                        { v: -90, l: "O" },
                        { v: 180, l: "N" },
                      ].map((d) => (
                        <button
                          key={d.v}
                          onClick={() => {
                            setRoofSide(index, { azimuth: d.v });
                            triggerCalculate();
                          }}
                          className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                            side.azimuth === d.v
                              ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                              : "bg-background text-muted-foreground  hover:bg-muted"
                          }`}
                        >
                          {d.l}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground">Neigung</label>
                    <Slider
                      value={[side.tilt]}
                      onValueChange={([v]) => {
                        setRoofSide(index, { tilt: v });
                        triggerCalculate();
                      }}
                      min={0}
                      max={90}
                      step={1}
                    />
                    <span className="text-xs text-muted-foreground">{side.tilt}°</span>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground">Module</label>
                    <Slider
                      value={[side.moduleCount]}
                      onValueChange={([v]) => {
                        setRoofSide(index, { moduleCount: v });
                        triggerCalculate();
                      }}
                      min={0}
                      max={40}
                      step={1}
                    />
                    <span className="text-xs text-muted-foreground">
                      {side.moduleCount}
                    </span>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground">
                      Verschattung
                    </label>
                    <Slider
                      value={[side.shading]}
                      onValueChange={([v]) => {
                        setRoofSide(index, { shading: v });
                        triggerCalculate();
                      }}
                      min={0}
                      max={80}
                      step={5}
                    />
                    <span className="text-xs text-muted-foreground">
                      {side.shading}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
