import { describe, it, expect } from 'vitest';
import { calculateAsphalt, predictCoolingTime, calculateLogistics } from './calculations';

describe('Asphalt Calculations', () => {
    it('calculates correct tonnage for standard compacted layer', () => {
        const result = calculateAsphalt({
            length: 10,
            width: 10,
            thickness: 4,
            density: 2.4,
            isLoose: false
        });
        // 10 * 10 * 0.04 * 2.4 = 9.6
        expect(result.tonnage).toBe(9.6);
        expect(result.area).toBe(100);
    });

    it('handles loose laydown with compaction factor', () => {
        const result = calculateAsphalt({
            length: 10,
            width: 10,
            thickness: 5,
            density: 2.4,
            isLoose: true
        });
        // Thickness becomes 5 / 1.25 = 4cm
        // 10 * 10 * 0.04 * 2.4 = 9.6
        expect(result.tonnage).toBe(9.6);
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
