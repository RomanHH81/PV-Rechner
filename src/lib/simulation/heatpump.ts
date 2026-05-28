// Heat Pump Simulation
import type { HeatPump } from "@/types";

export function calculateHeatPumpConsumption(heatPump: HeatPump): number {
  const { heatDemand, hotWaterDemand, jazz } = heatPump;
  return (heatDemand + hotWaterDemand) / jazz;
}

export function calculateMonthlyHeatDemand(totalDemand: number): number[] {
  // Monthly distribution factors for heating demand in Germany
  const monthlyFactors = [
    0.15, 0.13, 0.11, 0.08, 0.05, 0.02, 0.01, 0.01, 0.03, 0.07, 0.11, 0.14,
  ];
  return monthlyFactors.map((f) => totalDemand * f);
}
