/**
 * Core mathematical models for the Asphalt Calculator.
 * Decoupled from React to ensure precision, testability, and reuse.
 */

export interface AsphaltTonnageParams {
    length: number;
    width: number;
    thickness: number; // cm
    density: number; // t/m³
    isLoose?: boolean;
}

export const COMPACTION_FACTOR = 1.25;

/**
 * Calculates asphalt tonnage and area.
 */
export function calculateAsphalt(params: AsphaltTonnageParams) {
    const { length, width, thickness, density, isLoose } = params;

    let effectiveCompactedThickness = thickness;
    if (isLoose) {
        effectiveCompactedThickness = thickness / COMPACTION_FACTOR;
    }

    const area = length * width;
    const volume = area * (effectiveCompactedThickness / 100);
    const tonnage = volume * density;

    return {
        area: parseFloat(area.toFixed(1)),
        tonnage: parseFloat(tonnage.toFixed(2)),
    };
}

export interface CoolingPredictionParams {
    mixTemp: number;
    airTemp: number;
    windSpeed: number;
}

/**
 * Heuristic model to predict time until asphalt reaches cessation temperature (80°C).
 */
export function predictCoolingTime(params: CoolingPredictionParams): number {
    const { mixTemp, airTemp, windSpeed } = params;
    const cessationTemp = 80;

    if (mixTemp <= cessationTemp) return 0;

    const deltaT = mixTemp - airTemp;
    const windFactor = 1 + (windSpeed / 30);
    const coolingRatePerMin = (deltaT * 0.02) * windFactor;

    const tempDiff = mixTemp - cessationTemp;
    return Math.max(0, Math.floor(tempDiff / coolingRatePerMin));
}

export interface TruckLogisticsParams {
    plantRate: number; // t/h
    truckCapacity: number; // t
    cycleTime: number; // min
}

/**
 * Calculates logistics requirements for asphalt fleet.
 */
export function calculateLogistics(params: TruckLogisticsParams) {
    const { plantRate, truckCapacity, cycleTime } = params;

    if (plantRate <= 0 || truckCapacity <= 0 || cycleTime <= 0) {
        return { trucksRequired: 0, loadInterval: 0 };
    }

    const trucksPerHour = plantRate / truckCapacity;
    const interval = 60 / trucksPerHour;
    const trucks = Math.ceil(cycleTime / interval);

    return {
        trucksRequired: trucks,
        loadInterval: parseFloat(interval.toFixed(1)),
    };
}
