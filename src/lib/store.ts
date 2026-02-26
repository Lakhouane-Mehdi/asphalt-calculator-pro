import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { z } from 'zod';
import { calculateTotal, AsphaltTonnageParams } from './calculations';

// --- Validation Schemas ---

export const ProjectSchema = z.object({
    projectName: z.string().max(100).optional(),
    clientName: z.string().max(100).optional(),
});

export const SpecsSchema = z.object({
    length: z.string().regex(/^[\d,.]*$/).max(20),
    width: z.string().regex(/^[\d,.]*$/).max(20),
});

export const LayerSchema = z.object({
    id: z.string(),
    name: z.string().max(100),
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

export interface Layer {
    id: string;
    name: string;
    thickness: string;
    density: string;
    isLoose: boolean;
    compactionFactor: number;
    // computed
    tonnage: number;
}

// --- Store Interface ---

interface AppState {
    // Project Info
    projectName: string;
    clientName: string;

    // Mode
    calculatorMode: 'worker' | 'engineer';

    // Global Dimensions
    length: string;
    width: string;

    // Layers (Multi-Layer Calc)
    layers: Layer[];

    // Calculator Results (Computed)
    tonnage: number;
    area: number;
    totalCost: number;
    pricePerTon: string;

    // Setters
    setProjectName: (name: string) => void;
    setClientName: (name: string) => void;
    setCalculatorMode: (mode: 'worker' | 'engineer') => void;

    // Global Specs
    setSpecs: (specs: Partial<Pick<AppState, 'length' | 'width'>>) => void;
    setPricePerTon: (price: string) => void;

    // Layer Management
    addLayer: (layer: Omit<Layer, 'id' | 'tonnage'>) => void;
    updateLayer: (id: string, updates: Partial<Layer>) => void;
    removeLayer: (id: string) => void;
}

// --- Store Implementation ---

export const useStore = create<AppState>()(persist((set, get) => {
    const runCalculations = (state: Partial<AppState>) => {
        const parseInput = (val: string) => {
            if (!val) return 0;
            const parsed = parseFloat(val.replace(',', '.'));
            return isNaN(parsed) ? 0 : parsed;
        };

        const s = { ...get(), ...state };

        const parsedLength = parseInput(s.length);
        const parsedWidth = parseInput(s.width);

        // Map UI layers to mathematical Layer inputs
        const computationLayers: AsphaltTonnageParams[] = s.layers.map(l => ({
            length: parsedLength,
            width: parsedWidth,
            thickness: parseInput(l.thickness),
            density: parseInput(l.density),
            isLoose: l.isLoose,
            compactionFactor: l.compactionFactor
        }));

        const results = calculateTotal(computationLayers);

        // Update individual layer tonnages
        const updatedLayers = s.layers.map(l => {
            const singleResult = calculateTotal([{
                length: parsedLength, width: parsedWidth,
                thickness: parseInput(l.thickness), density: parseInput(l.density),
                isLoose: l.isLoose, compactionFactor: l.compactionFactor
            }]);
            return { ...l, tonnage: singleResult.tonnage };
        });

        const p = parseInput(s.pricePerTon);
        const totalCost = parseFloat((results.tonnage * p).toFixed(2));

        return { ...results, totalCost, layers: updatedLayers };
    };

    return {
        projectName: '',
        clientName: '',
        calculatorMode: 'worker',
        length: '',
        width: '',
        layers: [{
            id: 'layer-1', name: 'Layer 1', thickness: '', density: '2.4', isLoose: false, compactionFactor: 1.25, tonnage: 0
        }],
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
        setCalculatorMode: (calculatorMode) => set({ calculatorMode }),

        setSpecs: (specs) => {
            const valid = Object.values(specs).every(v => typeof v === 'string' && /^[\d,.]*$/.test(v));
            if (valid) {
                set((state) => ({ ...state, ...specs, ...runCalculations(specs) }));
            }
        },
        setPricePerTon: (pricePerTon) => {
            if (/^[\d,.]*$/.test(pricePerTon)) {
                set((state) => ({ ...state, pricePerTon, ...runCalculations({ pricePerTon }) }));
            }
        },

        // --- Layer Actions ---
        addLayer: (layerArgs) => {
            set((state) => {
                const newLayer: Layer = {
                    ...layerArgs,
                    id: Math.random().toString(36).substring(7),
                    tonnage: 0
                };
                const newLayers = [...state.layers, newLayer];
                return { ...state, ...runCalculations({ layers: newLayers }) };
            });
        },
        updateLayer: (id, updates) => {
            set((state) => {
                const newLayers = state.layers.map(l => l.id === id ? { ...l, ...updates } : l);
                return { ...state, ...runCalculations({ layers: newLayers }) };
            });
        },
        removeLayer: (id) => {
            set((state) => {
                const newLayers = state.layers.filter(l => l.id !== id);
                return { ...state, ...runCalculations({ layers: newLayers }) };
            });
        }
    };
}, { name: 'asphalt-calculator-store' }));
