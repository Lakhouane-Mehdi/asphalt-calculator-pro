/**
 * Core mathematical models for the Asphalt Calculator.
 * Decoupled from React to ensure precision, testability, and reuse.
 */

/**
 * Parses user-entered numbers in both German and English notation.
 * Handles thousands separators: "1.234,56" → 1234.56, "1,234.56" → 1234.56,
 * "1.250" / "1,250" → 1250, "2,5" → 2.5, "0.125" → 0.125.
 */
export function parseLocaleNumber(raw: string | undefined | null): number {
    if (!raw) return 0;
    const val = raw.trim();
    const lastComma = val.lastIndexOf(',');
    const lastDot = val.lastIndexOf('.');

    let normalized: string;
    if (lastComma !== -1 && lastDot !== -1) {
        // Both separators present: the one appearing last is the decimal separator
        const decimalPos = Math.max(lastComma, lastDot);
        const intPart = val.slice(0, decimalPos).replace(/[.,]/g, '');
        const fracPart = val.slice(decimalPos + 1).replace(/[.,]/g, '');
        normalized = `${intPart}.${fracPart}`;
    } else if (lastComma !== -1 || lastDot !== -1) {
        const sep = lastComma !== -1 ? ',' : '.';
        const parts = val.split(sep);
        if (parts.length > 2) {
            // Repeated separator can only be thousands grouping: "1.234.567"
            normalized = parts.join('');
        } else {
            const [intPart, fracPart] = parts;
            // A single separator followed by exactly 3 digits after a 1-3 digit
            // integer part reads as thousands grouping ("1.250" = 1250), not as
            // a 3-decimal value — except "0.125", which can only be a decimal.
            const isGrouping = fracPart.length === 3
                && intPart.length >= 1 && intPart.length <= 3
                && intPart !== '0';
            normalized = isGrouping ? intPart + fracPart : `${intPart}.${fracPart}`;
        }
    } else {
        normalized = val;
    }

    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : parsed;
}

export interface AsphaltTonnageParams {
    length: number;
    width: number;
    thickness: number; // cm
    density: number; // t/m³
    isLoose?: boolean;
    compactionFactor?: number; // e.g. 1.25 for 25% compaction
}

export const DEFAULT_COMPACTION_FACTOR = 1.25;

function computeLayerRaw(params: AsphaltTonnageParams) {
    const { length, width, thickness, density, isLoose, compactionFactor = DEFAULT_COMPACTION_FACTOR } = params;

    let effectiveCompactedThickness = thickness;
    if (isLoose) {
        effectiveCompactedThickness = thickness / compactionFactor;
    }

    const area = length * width;
    const volume = area * (effectiveCompactedThickness / 100);
    const tonnage = volume * density;

    return { area, tonnage };
}

export function calculateLayer(params: AsphaltTonnageParams) {
    const { area, tonnage } = computeLayerRaw(params);

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
        // Sum unrounded values; round only the final total to avoid drift
        totalTonnage += computeLayerRaw(layer).tonnage;
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
    thickness?: number; // compacted lift thickness in cm
}

export const MAX_COOLING_MINUTES = 240;
const REFERENCE_THICKNESS_CM = 4; // base cooling rate is calibrated for a 4 cm lift

/**
 * Heuristic model to predict time until asphalt reaches cessation temperature (80°C).
 * Cooling time scales with the square of lift thickness (heat diffusion).
 */
export function predictCoolingTime(params: CoolingPredictionParams): number {
    const { mixTemp, airTemp, windSpeed, thickness = REFERENCE_THICKNESS_CM } = params;
    const cessationTemp = 80;

    if (mixTemp <= cessationTemp) return 0;
    // The mat can never cool below air temperature
    if (airTemp >= cessationTemp) return MAX_COOLING_MINUTES;

    const deltaT = mixTemp - airTemp;
    const windFactor = 1 + (windSpeed / 30);
    const coolingRatePerMin = (deltaT * 0.02) * windFactor;

    const thicknessFactor = Math.pow(Math.max(thickness, 0.5) / REFERENCE_THICKNESS_CM, 2);

    const tempDiff = mixTemp - cessationTemp;
    const minutes = Math.floor((tempDiff / coolingRatePerMin) * thicknessFactor);
    return Math.min(MAX_COOLING_MINUTES, Math.max(0, minutes));
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
