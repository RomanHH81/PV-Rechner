// PV Production Simulation
import type { PVSystem, RoofSide } from "@/types";

// Monthly production factors for Germany (kWh/kWp)
const MONTHLY_FACTORS: number[] = [
  35, 55, 95, 130, 155, 160, 155, 140, 105, 70, 40, 30,
];

interface AzimuthEntry {
  angle: number;
  factor: number;
}

const AZIMUTH_FACTORS: AzimuthEntry[] = [
  { angle: 0, factor: 1.0 },
  { angle: 45, factor: 0.96 },
  { angle: 90, factor: 0.9 },
  { angle: -45, factor: 0.96 },
  { angle: -90, factor: 0.9 },
  { angle: 135, factor: 0.8 },
  { angle: -135, factor: 0.8 },
  { angle: 180, factor: 0.7 },
];

const MONTHLY_ORIENTATION_FACTORS: Record<string, number[]> = {
  south: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
  east: [0.95, 0.98, 1.0, 1.03, 1.03, 1.02, 1.0, 1.0, 0.98, 0.97, 0.95, 0.95],
  west: [0.95, 0.98, 1.0, 1.03, 1.03, 1.02, 1.0, 1.0, 0.98, 0.97, 0.95, 0.95],
  north: [0.7, 0.72, 0.75, 0.78, 0.8, 0.82, 0.82, 0.8, 0.78, 0.75, 0.72, 0.7],
};

function getOrientationName(azimuth: number): string {
  if (azimuth >= -22 && azimuth <= 22) return "south";
  if (azimuth >= 23 && azimuth <= 112) return "west";
  if (azimuth <= -23 && azimuth >= -112) return "east";
  return "north";
}

function getAzimuthFactor(azimuth: number): number {
  let nearest = AZIMUTH_FACTORS[0];
  let minDiff = Math.abs(azimuth - nearest.angle);
  for (const entry of AZIMUTH_FACTORS) {
    const diff = Math.abs(azimuth - entry.angle);
    if (diff < minDiff) {
      minDiff = diff;
      nearest = entry;
    }
  }
  return nearest.factor;
}

export function calculateMonthlyProduction(pvSystem: PVSystem): number[] {
  const totalMonthly = Array(12).fill(0);

  // If no roof sides configured, use legacy calculation
  if (!pvSystem.roofSides || pvSystem.roofSides.length === 0) {
    const tiltFactor = 1 - Math.abs(30 - 30) * 0.003;
    const shadingFactor = 1;
    const azimuthFactor = 1.0;

    return MONTHLY_FACTORS.map((factor) => {
      const baseProduction = factor * pvSystem.pvPower;
      return baseProduction * tiltFactor * shadingFactor * azimuthFactor;
    });
  }

  // Calculate production per roof side
  const kWpPerModule = pvSystem.pvPower / pvSystem.moduleCount;

  for (const side of pvSystem.roofSides) {
    const sideKWp = side.moduleCount * kWpPerModule;
    const tiltFactor = 1 - Math.abs(side.tilt - 30) * 0.003;
    const shadingFactor = 1 - side.shading / 100;
    const azimuthFactor = getAzimuthFactor(side.azimuth);
    const orientationFactors =
      MONTHLY_ORIENTATION_FACTORS[getOrientationName(side.azimuth)] ||
      MONTHLY_ORIENTATION_FACTORS.south;

    for (let m = 0; m < 12; m++) {
      totalMonthly[m] +=
        MONTHLY_FACTORS[m] *
        sideKWp *
        tiltFactor *
        shadingFactor *
        azimuthFactor *
        orientationFactors[m];
    }
  }

  return totalMonthly;
}

export function calculateYearlyProduction(pvSystem: PVSystem): number {
  return calculateMonthlyProduction(pvSystem).reduce((a, b) => a + b, 0);
}

export function calculateKWPPerModule(pvSystem: PVSystem): number {
  return pvSystem.pvPower / pvSystem.moduleCount;
}
