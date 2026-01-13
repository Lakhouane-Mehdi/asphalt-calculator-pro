export interface AsphaltStandard {
    id: string;
    name: string;
    density: number; // t/m³
    description?: string;
    minThick?: number; // cm
    maxThick?: number; // cm
}

export const germanStandards: AsphaltStandard[] = [
    { id: 'custom', name: 'Benutzerdefiniert', density: 0, description: 'Manuelle Eingabe' },
    // Tragdeckschicht: 5-10 cm typically
    { id: 'ac_td', name: 'Asphalttragdeckschicht (AC TD)', density: 2.35, description: 'Für ländlichen Wegebau (5-10cm)', minThick: 5, maxThick: 10 },
    // Binder: 4-8 cm
    { id: 'ac_b', name: 'Asphaltbinder (AC B)', density: 2.40, description: 'Binderschicht (4-8cm)', minThick: 4, maxThick: 8 },
    // Deckschicht: 3-5 cm
    { id: 'ac_d', name: 'Asphaltbeton (AC D)', density: 2.45, description: 'Deckschicht (3-5cm)', minThick: 3, maxThick: 5 },
    // SMA: 2-4 cm
    { id: 'sma', name: 'Splittmastixasphalt (SMA)', density: 2.50, description: 'Hohe Standfestigkeit (2-4cm)', minThick: 2, maxThick: 4 },
    // Gussasphalt: 2-4 cm
    { id: 'ma', name: 'Gussasphalt (MA)', density: 2.50, description: 'Ohne Verdichtung (2-4cm)', minThick: 2, maxThick: 4 }
];

export const frostZones = [
    { id: 'none', name: 'Keine Auswahl', description: '' },
    { id: 'I', name: 'Frostzone I', description: 'Geringe Beanspruchung' },
    { id: 'II', name: 'Frostzone II', description: 'Mittlere Beanspruchung' },
    { id: 'III', name: 'Frostzone III', description: 'Hohe Beanspruchung' }
];
