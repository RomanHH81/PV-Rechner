"use client";

import { useEffect, useRef } from "react";
import { useSimulationStore } from "@/store/useSimulationStore";

export function useAutoCalculate() {
  const calculate = useSimulationStore((state) => state.calculate);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let prevPv = useSimulationStore.getState().pvSystem;
    let prevBattery = useSimulationStore.getState().battery;
    let prevConsumption = useSimulationStore.getState().consumption;
    let prevTariff = useSimulationStore.getState().tariff;
    let prevHeatPump = useSimulationStore.getState().heatPump;
    let prevDistrict = useSimulationStore.getState().districtHeating;
    let prevHeater = useSimulationStore.getState().heater;

    const unsub = useSimulationStore.subscribe(() => {
      const state = useSimulationStore.getState();
      const changed =
        state.pvSystem !== prevPv ||
        state.battery !== prevBattery ||
        state.consumption !== prevConsumption ||
        state.tariff !== prevTariff ||
        state.heatPump !== prevHeatPump ||
        state.districtHeating !== prevDistrict ||
        state.heater !== prevHeater;

      if (changed) {
        prevPv = state.pvSystem;
        prevBattery = state.battery;
        prevConsumption = state.consumption;
        prevTariff = state.tariff;
        prevHeatPump = state.heatPump;
        prevDistrict = state.districtHeating;
        prevHeater = state.heater;

        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => calculate(), 200);
      }
    });

    return () => {
      unsub();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [calculate]);
}
