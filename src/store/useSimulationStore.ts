"use client";

import { create } from "zustand";
import type {
  ConfigState,
  PVSystem,
  Battery,
  ConsumptionProfile,
  HeatPump,
  DistrictHeating,
  Heater,
  Tariff,
  SimulationResult,
  HeaterType,
  LoadProfileType,
  RoofSide,
} from "@/types";
import { runSimulation } from "@/lib/simulation";

const defaultRoofSides: RoofSide[] = [
  { azimuth: 0, tilt: 30, shading: 10, moduleCount: 12 },
  { azimuth: 90, tilt: 30, shading: 10, moduleCount: 8 },
  { azimuth: -90, tilt: 30, shading: 10, moduleCount: 5 },
];

const defaultPV: PVSystem = {
  pvPower: 24.5,
  batteryCapacity: 18,
  moduleCount: 60,
  roofSides: defaultRoofSides,
  locationPLZ: "80339",
  investmentCost: 20000,
  inverterCost: 3000,
  installationCost: 3000,
};

const defaultBattery: Battery = {
  capacity: 18,
  usableCapacity: 16.2,
  efficiency: 0.9,
  maxChargePower: 5,
  maxDischargePower: 5,
  cycleLifetime: 6000,
  replacementCost: 5000,
  strategy: "self-consumption",
};

const defaultConsumption: ConsumptionProfile = {
  householdConsumption: 4500,
  evConsumption: 1000,
  heatPumpConsumption: 0,
  additionalConsumers: [],
  loadProfiles: ["standard", "home-office"],
};

const defaultHeatPump: HeatPump = {
  type: "air",
  jazz: 3.5,
  heatDemand: 12000,
  hotWaterDemand: 2000,
  electricityConsumption: 4000,
  baseCosts: 200,
  workingPrice: 25,
  investmentCost: 15000,
  enabled: false,
};

const defaultDistrictHeating: DistrictHeating = {
  enabled: true,
  heatConsumption: 6213,
  workPrice: 0.1569,
  co2Cost: 64.39,
  basePrice: 506.4,
  monthlyCharge: 164,
};

const defaultGasHeater: Heater = {
  type: "gas",
  efficiency: 0.9,
  baseCosts: 150,
  workingPrice: 12,
  investmentCost: 8000,
  co2Factor: 0.24,
  enabled: false,
};

const defaultOilHeater: Heater = {
  type: "pellet",
  efficiency: 0.85,
  baseCosts: 200,
  workingPrice: 10,
  investmentCost: 10000,
  co2Factor: 0.32,
  enabled: false,
};

const defaultTariff: Tariff = {
  electricityPrice: 30,
  feedInTariff: 8,
  annualIncrease: 3,
  gridFees: 10,
  baseFee: 100,
  dynamicTariff: false,
};
// Separate from ConfigState interface to avoid conflicts
interface SimulationStore extends ConfigState {
  gasHeater: Heater;
  oilHeater: Heater;
  setPVSystem: (pv: Partial<PVSystem>) => void;
  setRoofSide: (index: number, side: Partial<RoofSide>) => void;
  addRoofSide: () => void;
  removeRoofSide: (index: number) => void;
  setBattery: (battery: Partial<Battery>) => void;
  setConsumption: (consumption: Partial<ConsumptionProfile>) => void;
  toggleLoadProfile: (profile: LoadProfileType) => void;
  setHeatPump: (hp: Partial<HeatPump>) => void;
  setDistrictHeating: (dh: Partial<DistrictHeating>) => void;
  setHeater: (heater: Partial<Heater>) => void;
  setGasHeater: (heater: Partial<Heater>) => void;
  setOilHeater: (heater: Partial<Heater>) => void;
  setTariff: (tariff: Partial<Tariff>) => void;
  setSelectedHeaterType: (type: HeaterType) => void;
  toggleHeatpumpEnabled: () => void;
  toggleDistrictHeatEnabled: () => void;
  toggleGasHeaterEnabled: () => void;
  toggleOilHeaterEnabled: () => void;
  calculate: () => void;
}
export const useSimulationStore = create<SimulationStore>((set, get) => ({
  pvSystem: defaultPV,
  battery: defaultBattery,
  consumption: defaultConsumption,
  heatPump: defaultHeatPump,
  districtHeating: defaultDistrictHeating,
  heater: defaultGasHeater,
  gasHeater: defaultGasHeater,
  oilHeater: defaultOilHeater,
  tariff: defaultTariff,
  simulationRunning: false,
  simulationResult: null,
  selectedHeaterType: "district-heating",
  heatpumpEnabled: false,
  districtHeatEnabled: true,

  setPVSystem: (pv) =>
    set((state) => ({ pvSystem: { ...state.pvSystem, ...pv } })),

  setRoofSide: (index, side) =>
    set((state) => {
      const newSides = [...state.pvSystem.roofSides];
      newSides[index] = { ...newSides[index], ...side };
      return { pvSystem: { ...state.pvSystem, roofSides: newSides } };
    }),

  addRoofSide: () =>
    set((state) => ({
      pvSystem: {
        ...state.pvSystem,
        roofSides: [
          ...state.pvSystem.roofSides,
          { azimuth: 0, tilt: 30, shading: 0, moduleCount: 5 },
        ],
      },
    })),

  removeRoofSide: (index) =>
    set((state) => ({
      pvSystem: {
        ...state.pvSystem,
        roofSides: state.pvSystem.roofSides.filter((_, i) => i !== index),
      },
    })),

  setBattery: (battery) =>
    set((state) => ({ battery: { ...state.battery, ...battery } })),

  setConsumption: (consumption) =>
    set((state) => ({ consumption: { ...state.consumption, ...consumption } })),

  toggleLoadProfile: (profile) =>
    set((state) => {
      const current = state.consumption.loadProfiles;
      const exists = current.includes(profile);
      return {
        consumption: {
          ...state.consumption,
          loadProfiles: exists
            ? current.filter((p) => p !== profile)
            : [...current, profile],
        },
      };
    }),

  setHeatPump: (hp) =>
    set((state) => ({ heatPump: { ...state.heatPump, ...hp } })),

  setDistrictHeating: (dh) =>
    set((state) => ({
      districtHeating: { ...state.districtHeating, ...dh },
    })),

  setHeater: (heater) =>
    set((state) => ({ heater: { ...state.heater, ...heater } })),

  setGasHeater: (heater) =>
    set((state) => ({ gasHeater: { ...state.gasHeater, ...heater } })),

  setOilHeater: (heater) =>
    set((state) => ({ oilHeater: { ...state.oilHeater, ...heater } })),

  setTariff: (tariff) =>
    set((state) => ({ tariff: { ...state.tariff, ...tariff } })),

  setSelectedHeaterType: (type) => set({ selectedHeaterType: type }),
  toggleHeatpumpEnabled: () =>
    set((state) => ({
      heatPump: { ...state.heatPump, enabled: !state.heatPump.enabled },
    })),
  toggleDistrictHeatEnabled: () =>
    set((state) => ({
      districtHeating: {
        ...state.districtHeating,
        enabled: !state.districtHeating.enabled,
      },
    })),
  toggleGasHeaterEnabled: () =>
    set((state) => ({
      gasHeater: { ...state.gasHeater, enabled: !state.gasHeater.enabled },
    })),
  toggleOilHeaterEnabled: () =>
    set((state) => ({
      oilHeater: { ...state.oilHeater, enabled: !state.oilHeater.enabled },
    })),

  calculate: () => {
    set({ simulationRunning: true });
    const state = get();
    setTimeout(() => {
      const result = runSimulation(state);
      set({ simulationResult: result, simulationRunning: false });
    }, 100);
  },
}));
