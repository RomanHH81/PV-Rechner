// Economics & Financial Calculations
import type {
  PVSystem,
  Tariff,
  YearlyResult,
  SimulationSummary,
  ConsumptionProfile,
  HeatPump,
  DistrictHeating,
  Heater,
} from "@/types";

export function calculateTotalInvestment(pvSystem: PVSystem): number {
  return (
    pvSystem.investmentCost + pvSystem.inverterCost + pvSystem.installationCost
  );
}

/**
 * Stromkostenberechnung (nur netzbezug + netzentgelte, basisgebühr separat ausgewiesen)
 */
export function calculateElectricityCosts(
  gridPurchase: number, // kWh/Jahr
  tariff: Tariff,
): { energyCost: number; gridCost: number; baseFee: number; total: number } {
  const energyCost = (gridPurchase * tariff.electricityPrice) / 100;
  const gridCost = tariff.gridFees * 12;
  const baseFee = tariff.baseFee;
  // total = netzbezug + netzentgelte (ohne basisgebühr, die wird separat gezeigt)
  const total = energyCost + gridCost;
  return { energyCost, gridCost, baseFee, total };
}

export function calculateFeedInRevenue(
  gridFeedIn: number,
  tariff: Tariff,
): number {
  return (gridFeedIn * tariff.feedInTariff) / 100;
}

export function calculateYearlyCostsWithoutPV(
  consumption: number,
  tariff: Tariff,
): number {
  const energyCost = (consumption * tariff.electricityPrice) / 100;
  const gridCost = tariff.gridFees * 12;
  return energyCost + gridCost + tariff.baseFee;
}

export function calculateHeatpumpAnnualCost(
  hp: HeatPump,
  tariff: Tariff,
): number {
  if (!hp.enabled) return 0;
  const hpConsumption =
    hp.jazz > 0 ? (hp.heatDemand + hp.hotWaterDemand) / hp.jazz : 0;
  const energyCost = (hpConsumption * tariff.electricityPrice) / 100;
  return energyCost + hp.baseCosts;
}

export function calculateDistrictAnnualCost(dh: DistrictHeating): number {
  if (!dh.enabled) return 0;
  const workCost = dh.heatConsumption * dh.workPrice;
  return workCost + dh.co2Cost + dh.basePrice;
}

export function calculateHPConsumption(hp: HeatPump): number {
  if (!hp.enabled) return 0;
  return hp.jazz > 0 ? (hp.heatDemand + hp.hotWaterDemand) / hp.jazz : 0;
}

/**
 * Kernfunktion: Berechnet die jährlichen Ergebnisse über 20 Jahre
 * mit Degradation (0,5%/Jahr), Strompreissteigerung, monatlicher
 * Überlappung von Produktion und Verbrauch.
 *
 * Cashflow_t = Ersparnis_t + Einspeisevergütung_t - Betriebskosten_t
 * Amortisation = Jahr, in dem kumulierter Cashflow >= 0
 */
export function calculateYearlyResults(
  monthlyProduction: number[],
  monthlyConsumption: number[],
  pvSystem: PVSystem,
  tariff: Tariff,
  hp: HeatPump,
  dh: DistrictHeating,
  heater: Heater,
  years: number = 20,
): YearlyResult[] {
  const totalInvestment = calculateTotalInvestment(pvSystem);
  const results: YearlyResult[] = [];
  const hpCons = calculateHPConsumption(hp);

  for (let year = 0; year < years; year++) {
    // Strompreissteigerung (3% default)
    const priceIncrease = Math.pow(1 + tariff.annualIncrease / 100, year);
    const currentPrice = tariff.electricityPrice * priceIncrease;
    const currentFeedIn = tariff.feedInTariff * Math.pow(0.99, year); // 1% Degression Einspeisevergütung

    const currentTariff = {
      ...tariff,
      electricityPrice: currentPrice,
      feedInTariff: currentFeedIn,
    };

    // 0,5% Moduldegradation pro Jahr
    const degradationFactor = 1 - year * 0.005;
    const adjustedProd = monthlyProduction.map((p) => p * degradationFactor);

    // 1% Verbrauchssteigerung pro Jahr (WP-Strom ist bereits in monthlyConsumption enthalten)
    const consumptionIncrease = Math.pow(1.01, year);
    const adjustedCons = monthlyConsumption.map((c) => c * consumptionIncrease);

    const totalProd = adjustedProd.reduce((a, b) => a + b, 0);
    const totalCons = adjustedCons.reduce((a, b) => a + b, 0);

    // Monatliche Überlappung für Eigenverbrauch
    let totalSelfConsumption = 0;
    let totalGridFeedIn = 0;
    let totalGridPurchase = 0;

    for (let m = 0; m < 12; m++) {
      const p = adjustedProd[m];
      const c = adjustedCons[m];
      const overlap = Math.min(p, c);
      totalSelfConsumption += overlap;
      totalGridFeedIn += Math.max(0, p - c);
      totalGridPurchase += Math.max(0, c - p);
    }

    const selfConsumptionRate =
      totalProd > 0 ? totalSelfConsumption / totalProd : 0;
    const autarkyRate = totalCons > 0 ? totalSelfConsumption / totalCons : 0;

    // Stromkosten mit PV (nur Netzbezug)
    const {
      total: electricityCosts,
      energyCost,
      gridCost,
      baseFee,
    } = calculateElectricityCosts(totalGridPurchase, currentTariff);

    const feedInRevenue = calculateFeedInRevenue(
      totalGridFeedIn,
      currentTariff,
    );

    // Betriebskosten = 1,5% Wartung + 0,5% Rücklagen
    const maintenanceCosts = pvSystem.investmentCost * 0.015;
    const reserveFund = pvSystem.investmentCost * 0.005;
    const operatingCosts = maintenanceCosts + reserveFund;

    // Heizkosten (aktives System)
    const hpAnnual = calculateHeatpumpAnnualCost(hp, currentTariff);
    const dhAnnual = calculateDistrictAnnualCost(dh);
    const heaterAnnual = heater.enabled
      ? heater.baseCosts + (totalCons * heater.workingPrice) / 100
      : 0;

    let heatingCost = dhAnnual;
    if (!dh.enabled && hp.enabled) heatingCost = hpAnnual;
    else if (!dh.enabled && !hp.enabled && heater.enabled)
      heatingCost = heaterAnnual;

    // Ersparnis durch PV-Eigenverbrauch (Stromkosten, die nicht gezahlt werden müssen)
    const savingsFromPV = totalSelfConsumption * (currentPrice / 100);
    const totalSavingsFromPV = savingsFromPV + feedInRevenue;

    // Kosten ohne PV: gesamter Strom aus dem Netz + Heizung
    const costsWithoutPV =
      calculateYearlyCostsWithoutPV(totalCons, currentTariff) + heatingCost;

    // Kosten mit PV: Netzbezug + Heizung + Betrieb
    const totalCostsWithPV = electricityCosts + heatingCost + operatingCosts;

    // Jährliche Ersparnis durch PV
    const annualSavings = costsWithoutPV - totalCostsWithPV;

    // Cashflow in diesem Jahr = Ersparnis - Investition (nur Jahr 0)
    const cashflow = annualSavings - (year === 0 ? totalInvestment : 0);

    // Batterieaustausch alle 10 Jahre
    const batteryReplacement =
      pvSystem.batteryCapacity > 0 && year > 0 && year % 10 === 0
        ? pvSystem.batteryCapacity * 200
        : 0;
    const adjustedCashflow = cashflow - batteryReplacement;
    const prevCumulative = year > 0 ? results[year - 1].cumulativeCashflow : 0;

    results.push({
      year: year + 1,
      production: totalProd,
      consumption: totalCons,
      selfConsumption: totalSelfConsumption,
      gridFeedIn: Math.max(0, totalGridFeedIn),
      gridPurchase: Math.max(0, totalGridPurchase),
      selfConsumptionRate,
      autarkyRate: Math.min(autarkyRate, 1),
      batteryCycles: pvSystem.batteryCapacity > 0 ? 200 : 0,
      electricityCosts,
      feedInRevenue,
      savings: totalSavingsFromPV,
      operatingCosts,
      cashflow: adjustedCashflow,
      cumulativeCashflow: prevCumulative + adjustedCashflow,
    });
  }

  return results;
}

export function calculateSummary(
  yearlyResults: YearlyResult[],
  totalInvestment: number,
  totalConsumption: number,
  tariff: Tariff,
  hp: HeatPump,
  dh: DistrictHeating,
  heater: Heater,
): SimulationSummary {
  const firstYear = yearlyResults[0];

  let breakEvenYear = 0;
  for (const r of yearlyResults) {
    if (r.cumulativeCashflow >= 0) {
      breakEvenYear = r.year;
      break;
    }
  }

  const costsWithoutPV = calculateYearlyCostsWithoutPV(
    totalConsumption,
    tariff,
  );
  const hpAnnual = calculateHeatpumpAnnualCost(hp, tariff);
  const dhAnnual = calculateDistrictAnnualCost(dh);
  const hpCons = calculateHPConsumption(hp);

  let heatingCost = dhAnnual;
  if (!dh.enabled && hp.enabled) heatingCost = hpAnnual;
  else if (!dh.enabled && !hp.enabled && heater.enabled) {
    heatingCost =
      heater.baseCosts + (totalConsumption * heater.workingPrice) / 100;
  }

  return {
    yearlyProduction: firstYear.production,
    totalConsumption,
    selfConsumption: firstYear.selfConsumption,
    gridFeedIn: firstYear.gridFeedIn,
    gridPurchase: firstYear.gridPurchase,
    selfConsumptionRate: firstYear.selfConsumptionRate * 100,
    autarkyRate: firstYear.autarkyRate * 100,
    annualSavings: costsWithoutPV - firstYear.electricityCosts,
    feedInRevenue: firstYear.feedInRevenue,
    electricityCostsWithoutPV: costsWithoutPV,
    electricityCostsWithPV: firstYear.electricityCosts,
    breakEvenYear,
    paybackPeriod: breakEvenYear || 20,
    totalInvestment,
    cumulativeCashflow20y:
      yearlyResults[yearlyResults.length - 1].cumulativeCashflow,
    heatingCostsHeatpump: hpAnnual,
    heatingCostsDistrict: dhAnnual,
    heatingDelta: dhAnnual - hpAnnual,
    hpConsumption: hpCons,
  };
}
