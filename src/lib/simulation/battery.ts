// Battery Simulation
import type { Battery } from "@/types";

export interface BatteryState {
  soc: number; // State of Charge (0-1)
  cycles: number;
  degradation: number;
}

export function simulateBatteryOperation(
  battery: Battery,
  excessPower: number, // kW (positive = excess, negative = deficit)
  currentSOC: number,
): {
  gridFeedIn: number;
  gridPurchase: number;
  newSOC: number;
} {
  const { usableCapacity, efficiency, maxChargePower, maxDischargePower } =
    battery;
  const capacity = usableCapacity;

  // Convert excess power to energy for this hour (assuming 1h resolution)
  const excessEnergy = excessPower;

  if (excessEnergy > 0) {
    // Excess PV - charge battery
    const maxChargeEnergy = maxChargePower;
    const possibleCharge = Math.min(excessEnergy * efficiency, maxChargeEnergy);
    const availableCapacity = capacity - currentSOC * capacity;
    const actualCharge = Math.min(possibleCharge, availableCapacity);

    const newSOC = (currentSOC * capacity + actualCharge) / capacity;
    const gridFeedIn = excessEnergy - actualCharge / efficiency;

    return { gridFeedIn: Math.max(0, gridFeedIn), gridPurchase: 0, newSOC };
  } else {
    // Deficit - discharge battery
    const deficit = Math.abs(excessEnergy);
    const maxDischargeEnergy = maxDischargePower;
    const possibleDischarge = Math.min(
      deficit / efficiency,
      maxDischargeEnergy,
    );
    const availableEnergy = currentSOC * capacity;
    const actualDischarge = Math.min(possibleDischarge, availableEnergy);

    const newSOC = (currentSOC * capacity - actualDischarge) / capacity;
    const gridPurchase = deficit - actualDischarge * efficiency;

    return { gridFeedIn: 0, gridPurchase: Math.max(0, gridPurchase), newSOC };
  }
}

export function calculateBatteryDegradation(
  cycles: number,
  cycleLifetime: number,
): number {
  return Math.min(cycles / cycleLifetime, 1);
}
