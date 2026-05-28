// Tariff & Price Simulation
import type { Tariff } from "@/types";

export function calculateEffectivePrice(tariff: Tariff, year: number): number {
  const increase = Math.pow(1 + tariff.annualIncrease / 100, year);
  return (tariff.electricityPrice + tariff.gridFees) * increase;
}

export function calculateFeedInPrice(tariff: Tariff, year: number): number {
  // Feed-in tariff degression (1% per year)
  return tariff.feedInTariff * Math.pow(0.99, year);
}
