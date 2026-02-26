import { describe, it, expect } from 'vitest';
import { calculateTotal, predictCoolingTime, calculateLogistics } from './calculations';

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
