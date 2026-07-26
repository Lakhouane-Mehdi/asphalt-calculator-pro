/**
 * RStO 12 (Richtlinien für die Standardisierung des Oberbaus von Verkehrsflächen)
 * Standard construction structures for German roads.
 */

export type TrafficClass = 'Bk100' | 'Bk32' | 'Bk10' | 'Bk3.2' | 'Bk1.8' | 'Bk1.0' | 'Bk0.3';

interface PavementStructure {
    surfaceLayer: number; // thickness in cm
    binderLayer: number;  // thickness in cm
    baseLayer: number;    // thickness in cm
    totalThickness: number;
}

export const RStO12_Standards: Record<TrafficClass, PavementStructure> = {
    'Bk100': { surfaceLayer: 4, binderLayer: 8, baseLayer: 22, totalThickness: 34 },
    'Bk32': { surfaceLayer: 4, binderLayer: 6, baseLayer: 16, totalThickness: 26 },
    'Bk10': { surfaceLayer: 4, binderLayer: 5, baseLayer: 11, totalThickness: 20 },
    'Bk3.2': { surfaceLayer: 4, binderLayer: 0, baseLayer: 10, totalThickness: 14 },
    'Bk1.8': { surfaceLayer: 4, binderLayer: 0, baseLayer: 10, totalThickness: 14 },
    'Bk1.0': { surfaceLayer: 4, binderLayer: 0, baseLayer: 6, totalThickness: 10 },
    'Bk0.3': { surfaceLayer: 4, binderLayer: 0, baseLayer: 4, totalThickness: 8 },
};

export const getRecommendedStructure = (trafficClass: TrafficClass): PavementStructure => {
    return RStO12_Standards[trafficClass];
};
