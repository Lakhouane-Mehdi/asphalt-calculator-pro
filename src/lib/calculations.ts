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
    compactionFactor?: number; // e.g. 1.25 for 25% compaction
}

export const DEFAULT_COMPACTION_FACTOR = 1.25;

export function calculateLayer(params: AsphaltTonnageParams) {
    const { length, width, thickness, density, isLoose, compactionFactor = DEFAULT_COMPACTION_FACTOR } = params;

    let effectiveCompactedThickness = thickness;
    if (isLoose) {
        effectiveCompactedThickness = thickness / compactionFactor;
    }

    const area = length * width;
    const volume = area * (effectiveCompactedThickness / 100);
    const tonnage = volume * density;

    return {
        area: parseFloat(area.toFixed(1)),
        tonnage: parseFloat(tonnage.toFixed(2)),
    };
}

export function calculateTotal(layers: AsphaltTonnageParams[]) {
    if (!layers || layers.length === 0) return { area: 0, tonnage: 0, totalCost: 0 };

    let totalTonnage = 0;
    // Area is determined by length*width which is theoretically constant across layers if they cover the whole area
    // So we just take the first layer's area, or recalculate.
    const firstLayerArea = (layers[0].length * layers[0].width);

    layers.forEach(layer => {
        const result = calculateLayer(layer);
        totalTonnage += result.tonnage;
    });

    return {
        area: parseFloat(firstLayerArea.toFixed(1)),
        tonnage: parseFloat(totalTonnage.toFixed(2))
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
