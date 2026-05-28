// ============================================================
// PV Wirtschaftlichkeitsrechner - Type Definitions
// ============================================================

export interface PVSystem {
  pvPower: number; // kWp
  batteryCapacity: number; // kWh
  moduleCount: number;
  roofSides: RoofSide[]; // Multiple Dachseiten
  locationPLZ: string;
  investmentCost: number; // EUR
  inverterCost: number; // EUR
  installationCost: number; // EUR
}

export interface RoofSide {
  azimuth: number; // Grad (0=Süd, 90=Ost, -90=West, 180=Nord)
  tilt: number; // Grad (0-90)
  shading: number; // 0-100%
  moduleCount: number; // Anzahl Module auf dieser Seite
}

export interface Battery {
  capacity: number; // kWh
  usableCapacity: number; // kWh
  efficiency: number; // 0-1 (round-trip)
  maxChargePower: number; // kW
  maxDischargePower: number; // kW
  cycleLifetime: number;
  replacementCost: number;
  strategy: BatteryStrategy;
}

export type BatteryStrategy =
  | "self-consumption"
  | "price-optimized"
  | "emergency-power";

export interface ConsumptionProfile {
  householdConsumption: number;
  evConsumption: number;
  heatPumpConsumption: number;
  additionalConsumers: Consumer[];
  loadProfiles: LoadProfileType[]; // Multiple auswählbar
}

export type LoadProfileType =
  | "standard"
  | "home-office"
  | "family"
  | "senior"
  | "night-worker";

export interface Consumer {
  name: string;
  power: number;
  hoursPerDay: number;
  daysPerYear: number;
}

export interface HeatPump {
  type: HeatPumpType;
  jazz: number;
  heatDemand: number;
  hotWaterDemand: number;
  electricityConsumption: number;
  baseCosts: number;
  workingPrice: number;
  investmentCost: number;
  enabled: boolean;
}

export type HeatPumpType = "air" | "ground" | "water";

export interface DistrictHeating {
  enabled: boolean;
  heatConsumption: number;
  workPrice: number;
  co2Cost: number;
  basePrice: number;
  monthlyCharge: number;
}

export interface Heater {
  type: HeaterType;
  efficiency: number;
  baseCosts: number;
  workingPrice: number;
  investmentCost: number;
  co2Factor: number;
  enabled: boolean;
}

export type HeaterType =
  | "heatpump"
  | "district-heating"
  | "gas"
  | "pellet"
  | "hybrid";

export interface Tariff {
  electricityPrice: number;
  feedInTariff: number;
  annualIncrease: number;
  gridFees: number;
  baseFee: number;
  dynamicTariff: boolean;
}

export interface SimulationResult {
  yearlyResults: YearlyResult[];
  monthlyResults: MonthlyResult[];
  hourlyResults?: HourlyResult[];
  summary: SimulationSummary;
}

export interface YearlyResult {
  year: number;
  production: number;
  consumption: number;
  selfConsumption: number;
  gridFeedIn: number;
  gridPurchase: number;
  selfConsumptionRate: number;
  autarkyRate: number;
  batteryCycles: number;
  electricityCosts: number;
  feedInRevenue: number;
  savings: number;
  operatingCosts: number;
  cashflow: number;
  cumulativeCashflow: number;
}

export interface MonthlyResult {
  month: number;
  production: number;
  consumption: number;
  selfConsumption: number;
  gridFeedIn: number;
  gridPurchase: number;
  batteryCharge: number;
  batteryDischarge: number;
}

export interface HourlyResult {
  hour: number;
  production: number;
  consumption: number;
  batterySOC: number;
  gridImport: number;
  gridExport: number;
  price: number;
}

export interface SimulationSummary {
  yearlyProduction: number;
  totalConsumption: number;
  selfConsumption: number;
  gridFeedIn: number;
  gridPurchase: number;
  selfConsumptionRate: number;
  autarkyRate: number;
  annualSavings: number;
  feedInRevenue: number;
  electricityCostsWithoutPV: number;
  electricityCostsWithPV: number;
  breakEvenYear: number;
  paybackPeriod: number;
  totalInvestment: number;
  cumulativeCashflow20y: number;
  heatingCostsHeatpump: number;
  heatingCostsDistrict: number;
  heatingDelta: number;
  hpConsumption: number;
}

export interface ConfigState {
  pvSystem: PVSystem;
  battery: Battery;
  consumption: ConsumptionProfile;
  heatPump: HeatPump;
  districtHeating: DistrictHeating;
  heater: Heater;
  tariff: Tariff;
  simulationRunning: boolean;
  simulationResult: SimulationResult | null;
  selectedHeaterType: HeaterType;
  heatpumpEnabled: boolean;
  districtHeatEnabled: boolean;
  darkMode: boolean;
}
