export type MaterialCategory = 'asphalt' | 'concrete' | 'paving' | 'base' | 'custom';

export interface MaterialStandard {
    id: string;
    name: string;
    category: MaterialCategory;
    density: number; // t/m³
    description?: string;
    minThick?: number; // cm
    maxThick?: number; // cm
    compactionOffset?: number; // 0.25 = 25% extra needed (Loose -> Compacted)
}

export const germanStandards: MaterialStandard[] = [
    { id: 'custom', name: 'Benutzerdefiniert', category: 'custom', density: 0, description: 'Manuelle Eingabe', compactionOffset: 0 },

    // --- Asphalt (Offset ~1.25) ---
    { id: 'ac_td', name: 'Asphalttragdeckschicht (AC TD)', category: 'asphalt', density: 2.35, description: 'Für ländlichen Wegebau', minThick: 5, maxThick: 10, compactionOffset: 0.25 },
    { id: 'ac_b', name: 'Asphaltbinder (AC B)', category: 'asphalt', density: 2.40, description: 'Binderschicht', minThick: 4, maxThick: 8, compactionOffset: 0.25 },
    { id: 'ac_d', name: 'Asphaltbeton (AC D)', category: 'asphalt', density: 2.45, description: 'Deckschicht', minThick: 3, maxThick: 5, compactionOffset: 0.25 },
    { id: 'sma', name: 'Splittmastixasphalt (SMA)', category: 'asphalt', density: 2.50, description: 'Hohe Standfestigkeit', minThick: 2, maxThick: 4, compactionOffset: 0.25 },
    { id: 'ma', name: 'Gussasphalt (MA)', category: 'asphalt', density: 2.50, description: 'Ohne Verdichtung', minThick: 2, maxThick: 4, compactionOffset: 0 }, // Gussasphalt doesn't compact significantly like AC

    // --- Base Layers (Tragschichten) ---
    { id: 'fss', name: 'Frostschutzschicht (FSS 0/45)', category: 'base', density: 2.10, description: 'Verdichtet', compactionOffset: 0.30 }, // High compaction needed for gravel
    { id: 'sts', name: 'Schottertragschicht (STS 0/45)', category: 'base', density: 2.20, description: 'Verdichtet', compactionOffset: 0.30 },
    { id: 'splitt', name: 'Pflasterbettung (Splitt 2/5)', category: 'base', density: 1.60, description: 'Lose Abziehschicht', compactionOffset: 0.15 },

    // --- Concrete ---
    { id: 'concrete_normal', name: 'Beton C20/25', category: 'concrete', density: 2.45, description: 'Standardbeton', compactionOffset: 0 },
    { id: 'concrete_fast', name: 'Schnellbeton', category: 'concrete', density: 2.40, description: 'GaLaBau Setzbeton', compactionOffset: 0 },

    // --- Paving (Pflaster) ---
    { id: 'paving_concrete', name: 'Betonpflaster', category: 'paving', density: 2.35, description: 'Standardpflaster', compactionOffset: 0 }, // Often calculated by area, but if tonnage needed
    { id: 'paving_natural', name: 'Naturstein (Granit)', category: 'paving', density: 2.70, description: 'Schwerer Naturstein', compactionOffset: 0 },
];

export const frostZones = [
    { id: 'none', name: 'Keine Auswahl', description: '' },
    { id: 'I', name: 'Frostzone I', description: 'Geringe Beanspruchung' },
    { id: 'II', name: 'Frostzone II', description: 'Mittlere Beanspruchung' },
    { id: 'III', name: 'Frostzone III', description: 'Hohe Beanspruchung' }
];

export const materialCategories: { id: MaterialCategory; labelKey: string }[] = [
    { id: 'asphalt', labelKey: 'catAsphalt' },
    { id: 'base', labelKey: 'catBase' },
    { id: 'concrete', labelKey: 'catConcrete' },
    { id: 'paving', labelKey: 'catPaving' },
];
