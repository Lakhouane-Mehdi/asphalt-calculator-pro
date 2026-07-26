import { describe, it, expect } from 'vitest';
import { calculateTotal, predictCoolingTime, calculateLogistics, parseLocaleNumber, MAX_COOLING_MINUTES } from './calculations';

describe('parseLocaleNumber', () => {
    it('handles empty and invalid input', () => {
        expect(parseLocaleNumber('')).toBe(0);
        expect(parseLocaleNumber(undefined)).toBe(0);
        expect(parseLocaleNumber(null)).toBe(0);
        expect(parseLocaleNumber('.')).toBe(0);
    });

    it('parses plain numbers', () => {
        expect(parseLocaleNumber('4')).toBe(4);
        expect(parseLocaleNumber('1250')).toBe(1250);
    });

    it('parses German decimal comma', () => {
        expect(parseLocaleNumber('2,5')).toBe(2.5);
        expect(parseLocaleNumber('0,5')).toBe(0.5);
        expect(parseLocaleNumber('12,50')).toBe(12.5);
    });

    it('parses English decimal point', () => {
        expect(parseLocaleNumber('2.5')).toBe(2.5);
        expect(parseLocaleNumber('0.125')).toBe(0.125);
        expect(parseLocaleNumber('.5')).toBe(0.5);
    });

    it('parses German thousands notation', () => {
        expect(parseLocaleNumber('1.250')).toBe(1250);
        expect(parseLocaleNumber('1.234,56')).toBe(1234.56);
        expect(parseLocaleNumber('1.234.567')).toBe(1234567);
    });

    it('parses English thousands notation', () => {
        expect(parseLocaleNumber('1,250')).toBe(1250);
        expect(parseLocaleNumber('1,234.56')).toBe(1234.56);
        expect(parseLocaleNumber('1,234,567')).toBe(1234567);
    });

    it('treats a separator after a >3 digit integer part as decimal', () => {
        expect(parseLocaleNumber('1234.567')).toBe(1234.567);
        expect(parseLocaleNumber('1234,567')).toBe(1234.567);
    });
});

describe('Asphalt Calculations', () => {
    it('calculates correct tonnage for standard compacted layer', () => {
        const result = calculateTotal([{
            length: 10,
            width: 10,
            thickness: 4,
            density: 2.4,
            isLoose: false
        }]);
        // 10 * 10 * 0.04 * 2.4 = 9.6
        expect(result.tonnage).toBe(9.6);
        expect(result.area).toBe(100);
    });

    it('handles zero values appropriately', () => {
        const result = calculateTotal([{
            length: 0,
            width: 0,
            thickness: 0,
            density: 2.4
        }]);
        expect(result.tonnage).toBe(0);
        expect(result.area).toBe(0);
    });

    it('handles loose laydown with compaction factor', () => {
        const result = calculateTotal([{
            length: 10,
            width: 10,
            thickness: 5,
            density: 2.4,
            isLoose: true
        }]);
        // Thickness becomes 5 / 1.25 = 4cm
        // 10 * 10 * 0.04 * 2.4 = 9.6
        expect(result.tonnage).toBe(9.6);
    });

    it('handles custom compaction factor (e.g. Concrete/Paving)', () => {
        const result = calculateTotal([{
            length: 10,
            width: 10,
            thickness: 5, // loose/screed input
            density: 2.4,
            isLoose: true,
            compactionFactor: 1.0 // No compaction
        }]);
        // Thickness stays 5
        // 10 * 10 * 0.05 * 2.4 = 12.0
        expect(result.tonnage).toBe(12.0);
    });

    it('rounds the total, not the per-layer values', () => {
        // Raw per layer: 1 * 1 * 0.01 * 0.417 = 0.00417 t (rounds to 0.00 individually)
        // Sum of 3 raw values: 0.01251 -> 0.01 t
        const layer = { length: 1, width: 1, thickness: 1, density: 0.417 };
        expect(calculateTotal([layer, layer, layer]).tonnage).toBe(0.01);
    });
});

describe('Cooling Prediction', () => {
    it('returns 0 if mix temp is below cessation', () => {
        expect(predictCoolingTime({ mixTemp: 70, airTemp: 20, windSpeed: 5 })).toBe(0);
    });

    it('predicts reasonable time for hot mix', () => {
        const time = predictCoolingTime({ mixTemp: 160, airTemp: 20, windSpeed: 0 });
        expect(time).toBeGreaterThan(20);
        expect(time).toBeLessThan(120);
    });

    it('handles extreme weather conditions', () => {
        // Very cold and windy -> fast cooling
        const fastCooling = predictCoolingTime({ mixTemp: 160, airTemp: -10, windSpeed: 50 });
        // Warm and calm -> slow cooling
        const slowCooling = predictCoolingTime({ mixTemp: 160, airTemp: 30, windSpeed: 0 });

        expect(fastCooling).toBeLessThan(slowCooling);
    });

    it('scales cooling time with lift thickness (thicker cools slower)', () => {
        const base = { mixTemp: 160, airTemp: 20, windSpeed: 0 };
        const thin = predictCoolingTime({ ...base, thickness: 3 });
        const reference = predictCoolingTime({ ...base, thickness: 4 });
        const thick = predictCoolingTime({ ...base, thickness: 6 });

        expect(thin).toBeLessThan(reference);
        expect(thick).toBeGreaterThan(reference);
        // Quadratic scaling: 6 cm ≈ (6/4)² = 2.25× the 4 cm time
        expect(thick).toBeGreaterThanOrEqual(reference * 2);
        // Default thickness matches the 4 cm reference
        expect(predictCoolingTime(base)).toBe(reference);
    });

    it('caps the prediction when air temp prevents cooling below cessation', () => {
        // Air at/above 80°C: mat can never reach cessation temperature
        expect(predictCoolingTime({ mixTemp: 160, airTemp: 80, windSpeed: 0 })).toBe(MAX_COOLING_MINUTES);
        expect(predictCoolingTime({ mixTemp: 100, airTemp: 100, windSpeed: 0 })).toBe(MAX_COOLING_MINUTES);
        expect(Number.isFinite(predictCoolingTime({ mixTemp: 100, airTemp: 100, windSpeed: 0 }))).toBe(true);
    });

    it('handles invalid inputs gracefully', () => {
        const result = calculateLogistics({
            plantRate: 0,
            truckCapacity: 20,
            cycleTime: 60
        });
        expect(result.trucksRequired).toBe(0);
        expect(result.loadInterval).toBe(0);
    });

    it('calculates correct trucks for uneven splits', () => {
        const result = calculateLogistics({
            plantRate: 150,
            truckCapacity: 20,
            cycleTime: 60
        });
        // 150 TPH / 20t = 7.5 trucks/hr -> 8 min interval
        // 60 min cycle / 8 min = 7.5 -> 8 trucks required
        expect(result.trucksRequired).toBe(8);
        expect(result.loadInterval).toBe(8.0);
    });
});

describe('Truck Logistics', () => {
    it('calculates correct fleet size', () => {
        const result = calculateLogistics({
            plantRate: 100,
            truckCapacity: 20,
            cycleTime: 60
        });
        // 100/20 = 5 trucks per hour
        // 12 mins interval
        // 60 / 12 = 5 trucks required
        expect(result.trucksRequired).toBe(5);
        expect(result.loadInterval).toBe(12);
    });
});
