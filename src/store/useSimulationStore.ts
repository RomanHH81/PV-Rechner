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

const defaultPV: PVSystem = {
  pvPower: 0,
  batteryCapacity: 0,
  moduleCount: 0,
  roofSides: [],
  locationPLZ: "",
  investmentCost: 0,
  inverterCost: 0,
  installationCost: 0,
};

const defaultBattery: Battery = {
  capacity: 0,
  usableCapacity: 0,
  efficiency: 0.9,
  maxChargePower: 0,
  maxDischargePower: 0,
  cycleLifetime: 0,
  replacementCost: 0,
  strategy: "self-consumption",
};

const defaultConsumption: ConsumptionProfile = {
  householdConsumption: 0,
  evConsumption: 0,
  heatPumpConsumption: 0,
  additionalConsumers: [],
  loadProfiles: [],
};

const defaultHeatPump: HeatPump = {
  type: "air",
  jazz: 0,
  heatDemand: 0,
  hotWaterDemand: 0,
  electricityConsumption: 0,
  baseCosts: 0,
  workingPrice: 0,
  investmentCost: 0,
  enabled: false,
};

const defaultDistrictHeating: DistrictHeating = {
  enabled: true,
  heatConsumption: 0,
  workPrice: 0,
  co2Cost: 0,
  basePrice: 0,
  monthlyCharge: 0,
};

const defaultGasHeater: Heater = {
  type: "gas",
  efficiency: 0,
  baseCosts: 0,
  workingPrice: 0,
  investmentCost: 0,
  co2Factor: 0,
  enabled: false,
};

const defaultOilHeater: Heater = {
  type: "pellet",
  efficiency: 0,
  baseCosts: 0,
  workingPrice: 0,
  investmentCost: 0,
  co2Factor: 0,
  enabled: false,
};

const defaultTariff: Tariff = {
  electricityPrice: 0,
  feedInTariff: 0,
  annualIncrease: 0,
  gridFees: 0,
  baseFee: 0,
  dynamicTariff: false,
};

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
          { azimuth: 0, tilt: 30, shading: 0, moduleCount: 0 },
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

