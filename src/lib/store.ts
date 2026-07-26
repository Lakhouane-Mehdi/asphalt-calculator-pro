import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { z } from 'zod';
import { calculateTotal, parseLocaleNumber, AsphaltTonnageParams } from './calc/calculations';

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

export type Currency = 'EUR' | 'USD' | 'GBP' | 'CHF';

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
    EUR: '€',
    USD: '$',
    GBP: '£',
    CHF: 'CHF',
};

/** Company details used to turn a quote into a legally compliant invoice (§14 UStG). */
export interface CompanyProfile {
    name: string;
    address: string;
    taxId: string;        // Steuernummer / USt-IdNr.
    contact: string;      // phone / email
    paymentTerms: string;
    invoicePrefix: string;
    nextInvoiceNumber: number;
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

    // Commercial settings
    currency: Currency;
    wastePercent: string;
    documentType: 'quote' | 'invoice';
    company: CompanyProfile;

    // Id of the saved job currently open, if any
    currentJobId: number | null;

    // Calculator Results (Computed)
    tonnage: number;      // includes waste allowance
    netTonnage: number;   // theoretical, before waste
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
    setCurrency: (currency: Currency) => void;
    setWastePercent: (percent: string) => void;
    setDocumentType: (type: 'quote' | 'invoice') => void;
    updateCompany: (updates: Partial<CompanyProfile>) => void;
    consumeInvoiceNumber: () => string;

    // Layer Management
    addLayer: (layer: Omit<Layer, 'id' | 'tonnage'>) => void;
    updateLayer: (id: string, updates: Partial<Layer>) => void;
    removeLayer: (id: string) => void;

    // Project lifecycle
    resetProject: () => void;
    setCurrentJobId: (id: number | null) => void;
    loadJob: (job: LoadableJob) => void;
}

/** The subset of a saved job that restores into the calculator. */
export interface LoadableJob {
    id?: number;
    projectName: string;
    clientName: string;
    length: string;
    width: string;
    layers: Layer[];
    pricePerTon: string;
    wastePercent: string;
    currency: Currency;
    calculatorMode: 'worker' | 'engineer';
    documentType: 'quote' | 'invoice';
}

// --- Store Implementation ---

export const useStore = create<AppState>()(persist((set, get) => {
    const runCalculations = (state: Partial<AppState>) => {
        const parseInput = parseLocaleNumber;

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

        // Waste / overage allowance for spillage, cold joints and truck bed residue
        const wasteFactor = 1 + (parseInput(s.wastePercent) / 100);
        const netTonnage = results.tonnage;
        const grossTonnage = parseFloat((netTonnage * wasteFactor).toFixed(2));

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
        const totalCost = parseFloat((grossTonnage * p).toFixed(2));

        return { ...results, tonnage: grossTonnage, netTonnage, totalCost, layers: updatedLayers };
    };

    const initialProject = {
        projectName: '',
        clientName: '',
        length: '',
        width: '',
        layers: [{
            id: 'layer-1', name: '', thickness: '', density: '2.4', isLoose: false, compactionFactor: 1.25, tonnage: 0
        }] as Layer[],
        tonnage: 0,
        netTonnage: 0,
        area: 0,
        totalCost: 0,
        pricePerTon: '',
        currentJobId: null as number | null,
    };

    return {
        ...initialProject,
        calculatorMode: 'worker' as const,
        currency: 'EUR' as Currency,
        wastePercent: '3',
        documentType: 'quote' as const,
        company: {
            name: '',
            address: '',
            taxId: '',
            contact: '',
            paymentTerms: '',
            invoicePrefix: 'RE-',
            nextInvoiceNumber: 1,
        },

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
        setCurrency: (currency) => set({ currency }),
        setWastePercent: (wastePercent) => {
            if (/^[\d,.]*$/.test(wastePercent)) {
                set((state) => ({ ...state, wastePercent, ...runCalculations({ wastePercent }) }));
            }
        },
        setDocumentType: (documentType) => set({ documentType }),
        updateCompany: (updates) => set((state) => ({ company: { ...state.company, ...updates } })),
        consumeInvoiceNumber: () => {
            const { company } = get();
            const number = `${company.invoicePrefix}${new Date().getFullYear()}-${String(company.nextInvoiceNumber).padStart(4, '0')}`;
            set({ company: { ...company, nextInvoiceNumber: company.nextInvoiceNumber + 1 } });
            return number;
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
        },

        // Clears the current job but keeps company profile, currency and preferences
        resetProject: () => {
            set({
                ...initialProject,
                layers: initialProject.layers.map(l => ({ ...l })),
            });
        },

        setCurrentJobId: (currentJobId) => set({ currentJobId }),

        // Restore a saved job and recompute results from its inputs
        loadJob: (job) => {
            set((state) => ({
                ...state,
                projectName: job.projectName,
                clientName: job.clientName,
                length: job.length,
                width: job.width,
                pricePerTon: job.pricePerTon,
                wastePercent: job.wastePercent,
                currency: job.currency,
                calculatorMode: job.calculatorMode,
                documentType: job.documentType,
                currentJobId: job.id ?? null,
                // Returns `layers` with per-layer tonnages recomputed, plus the totals
                ...runCalculations({
                    length: job.length,
                    width: job.width,
                    layers: job.layers.map(l => ({ ...l })),
                    pricePerTon: job.pricePerTon,
                    wastePercent: job.wastePercent,
                }),
            }));
        }
    };
}, { name: 'asphalt-calculator-store' }));
