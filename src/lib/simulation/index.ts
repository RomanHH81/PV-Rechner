// Main Simulation Engine
import type {
  ConfigState,
  SimulationResult,
  MonthlyResult,
  Heater,
} from "@/types";
import { calculateMonthlyProduction } from "./pv";
import { calculateMonthlyConsumption } from "./consumption";
import {
  calculateYearlyResults,
  calculateSummary,
  calculateTotalInvestment,
  calculateDistrictAnnualCost,
  calculateHeatpumpAnnualCost,
  calculateHPConsumption,
} from "./economics";

function getActiveHeater(
  state: ConfigState & { gasHeater?: Heater; oilHeater?: Heater },
): { heater: Heater; annualCost: number } {
  // Priority: district > heatpump > gas > oil
  if (state.districtHeating.enabled) {
    return {
      heater: {
        type: "district-heating",
        efficiency: 1,
        baseCosts: 0,
        workingPrice: 0,
        investmentCost: 0,
        co2Factor: 0,
        enabled: true,
      },
      annualCost: calculateDistrictAnnualCost(state.districtHeating),
    };
  }
  if (state.heatPump.enabled) {
    const cost = calculateHeatpumpAnnualCost(state.heatPump, state.tariff);
    return { heater: state.heatPump as unknown as Heater, annualCost: cost };
  }
  if (state.gasHeater?.enabled) {
    const gas = state.gasHeater;
    const cost =
      gas.baseCosts +
      (state.consumption.householdConsumption * gas.workingPrice) / 100;
    return { heater: gas, annualCost: cost };
  }
  if (state.oilHeater?.enabled) {
    const oil = state.oilHeater;
    const cost =
      oil.baseCosts +
      (state.consumption.householdConsumption * oil.workingPrice) / 100;
    return { heater: oil, annualCost: cost };
  }
  return {
    heater: state.districtHeating as any,
    annualCost: calculateDistrictAnnualCost(state.districtHeating),
  };
}

export function runSimulation(
  config: ConfigState & { gasHeater?: Heater; oilHeater?: Heater },
): SimulationResult {
  const { pvSystem, consumption, tariff, heatPump, districtHeating } = config;
  const { heater, annualCost: heatingCost } = getActiveHeater(config);

  const monthlyProduction = calculateMonthlyProduction(pvSystem);
  const hpCons = calculateHPConsumption(heatPump);

  const totalConsumption = {
    ...consumption,
    heatPumpConsumption: (consumption.heatPumpConsumption || 0) + hpCons,
  };
  const monthlyConsumption = calculateMonthlyConsumption(totalConsumption);

  const monthlyResults: MonthlyResult[] = monthlyProduction.map(
    (production, i) => ({
      month: i + 1,
      production: Math.round(production * 100) / 100,
      consumption: Math.round(monthlyConsumption[i] * 100) / 100,
      selfConsumption:
        Math.round(Math.min(production, monthlyConsumption[i]) * 100) / 100,
      gridFeedIn:
        Math.round(Math.max(0, production - monthlyConsumption[i]) * 100) / 100,
      gridPurchase:
        Math.round(Math.max(0, monthlyConsumption[i] - production) * 100) / 100,
      batteryCharge: 0,
      batteryDischarge: 0,
    }),
  );

  const yearlyResults = calculateYearlyResults(
    monthlyProduction,
    monthlyConsumption,
    pvSystem,
    tariff,
    heatPump,
    districtHeating,
    heater,
    20,
  );

  const totalInvestment = calculateTotalInvestment(pvSystem);
  const totalCons = monthlyConsumption.reduce((a, b) => a + b, 0);

  const summary = calculateSummary(
    yearlyResults,
    totalInvestment,
    totalCons,
    tariff,
    heatPump,
    districtHeating,
    heater,
  );

  return { yearlyResults, monthlyResults, summary };
}
