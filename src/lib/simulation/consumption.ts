// Consumption Profile Generator
import type { ConsumptionProfile, LoadProfileType } from "@/types";

// Monthly consumption distribution factors for Germany
const MONTHLY_FACTORS: Record<string, number[]> = {
  standard: [
    0.09, 0.085, 0.085, 0.08, 0.08, 0.08, 0.09, 0.09, 0.08, 0.08, 0.08, 0.08,
  ],
  "home-office": [
    0.09, 0.08, 0.09, 0.08, 0.08, 0.08, 0.08, 0.08, 0.08, 0.08, 0.09, 0.09,
  ],
  family: [
    0.08, 0.08, 0.08, 0.08, 0.09, 0.09, 0.1, 0.09, 0.08, 0.08, 0.07, 0.08,
  ],
  senior: [
    0.09, 0.09, 0.08, 0.08, 0.08, 0.08, 0.08, 0.08, 0.08, 0.08, 0.09, 0.09,
  ],
  "night-worker": [
    0.08, 0.08, 0.08, 0.08, 0.08, 0.09, 0.09, 0.09, 0.08, 0.08, 0.08, 0.09,
  ],
};

// Average of multiple profiles for combined selection
export function calculateMonthlyConsumption(
  profile: ConsumptionProfile,
): number[] {
  const totalConsumption =
    profile.householdConsumption +
    profile.evConsumption +
    profile.heatPumpConsumption +
    profile.additionalConsumers.reduce(
      (sum, c) => sum + (c.power * c.hoursPerDay * c.daysPerYear) / 1000,
      0,
    );

  // If multiple profiles selected, average their factors
  const profiles: LoadProfileType[] =
    profile.loadProfiles && profile.loadProfiles.length > 0
      ? profile.loadProfiles
      : ["standard"];

  const combinedFactors = Array(12).fill(0);
  for (const p of profiles) {
    const factors = MONTHLY_FACTORS[p] || MONTHLY_FACTORS.standard;
    for (let i = 0; i < 12; i++) {
      combinedFactors[i] += factors[i] / profiles.length;
    }
  }

  return combinedFactors.map((f) => totalConsumption * f);
}

export function calculateTotalConsumption(profile: ConsumptionProfile): number {
  return calculateMonthlyConsumption(profile).reduce((a, b) => a + b, 0);
}
