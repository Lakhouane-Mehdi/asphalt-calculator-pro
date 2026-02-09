import { create } from 'zustand';
import { z } from 'zod';
import { calculateAsphalt } from './calculations';

// --- Validation Schemas ---

export const ProjectSchema = z.object({
    projectName: z.string().max(100).optional(),
    clientName: z.string().max(100).optional(),
});

export const SpecsSchema = z.object({
    length: z.string().regex(/^[\d,.]*$/).max(20),
    width: z.string().regex(/^[\d,.]*$/).max(20),
    thickness: z.string().regex(/^[\d,.]*$/).max(20),
    density: z.string().regex(/^[\d,.]*$/).max(20),
});

export const LogisticsSchema = z.object({
    plantRate: z.string().regex(/^[\d,.]*$/).max(20),
    truckCapacity: z.string().regex(/^[\d,.]*$/).max(20),
    cycleTime: z.string().regex(/^[\d,.]*$/).max(20),
});

export const CoolingSchema = z.object({
    mixTemp: z.string().regex(/^[\d,.]*$/).max(10),
    airTemp: z.string().regex(/^[\d,.]*$/).max(10),
    windSpeed: z.string().regex(/^[\d,.]*$/).max(10),
});

export const SustainabilitySchema = z.object({
    rapPercent: z.string().regex(/^[\d,.]*$/).max(5),
});

// --- Store Interface ---

interface AppState {
    // Project Info
    projectName: string;
    clientName: string;

    // Calculator Inputs
    length: string;
    width: string;
    thickness: string;
    density: string;
    isLoose: boolean;
    compactionFactor: number;

    // Calculator Results (Computed)
    tonnage: number;
    area: number;
    totalCost: number;
    pricePerTon: string;

    // Setters
    setProjectName: (name: string) => void;
    setClientName: (name: string) => void;
    setIsLoose: (loose: boolean) => void;
    setPricePerTon: (price: string) => void;
    setCompactionFactor: (factor: number) => void;
    setSpecs: (specs: Partial<Pick<AppState, 'length' | 'width' | 'thickness' | 'density'>>) => void;
}

// --- Store Implementation ---

export const useStore = create<AppState>((set, get) => {
    const runCalculations = (state: Partial<AppState>) => {
        const parseInput = (val: string) => {
            if (!val) return 0;
            const parsed = parseFloat(val.replace(',', '.'));
            return isNaN(parsed) ? 0 : parsed;
        };

        const s = { ...get(), ...state };

        const results = calculateAsphalt({
            length: parseInput(s.length),
            width: parseInput(s.width),
            thickness: parseInput(s.thickness),
            density: parseInput(s.density),
            isLoose: s.isLoose,
            compactionFactor: s.compactionFactor,
        });

        const p = parseInput(s.pricePerTon);
        const totalCost = parseFloat((results.tonnage * p).toFixed(2));

        return { ...results, totalCost };
    };

    return {
        projectName: '',
        clientName: '',
        length: '',
        width: '',
        thickness: '',
        density: '2.4',
        isLoose: false,
        compactionFactor: 1.25, // Default for Asphalt
        tonnage: 0,
        area: 0,
        totalCost: 0,
        pricePerTon: '',

        setProjectName: (name) => {
            const result = ProjectSchema.safeParse({ projectName: name });
            if (result.success) set({ projectName: name });
        },
        setClientName: (name) => {
            const result = ProjectSchema.safeParse({ clientName: name });
            if (result.success) set({ clientName: name });
        },
        setIsLoose: (isLoose) => set((state) => ({ ...state, isLoose, ...runCalculations({ isLoose }) })),
        setPricePerTon: (pricePerTon) => {
            if (/^[\d,.]*$/.test(pricePerTon)) {
                set((state) => ({ ...state, pricePerTon, ...runCalculations({ pricePerTon }) }));
            }
        },
        setCompactionFactor: (compactionFactor) => {
            set((state) => ({ ...state, compactionFactor, ...runCalculations({ compactionFactor }) }));
        },
        setSpecs: (specs) => {
            // Internal validation for numeric strings
            const valid = Object.values(specs).every(v => typeof v === 'string' && /^[\d,.]*$/.test(v));
            if (valid) {
                set((state) => ({ ...state, ...specs, ...runCalculations(specs) }));
            }
        },
    };
});
