import { translations, type Language } from "./translations";

/**
 * Default display name for a layer based on its position in the pavement structure.
 * Asphalt is built top-down: surface course, binder course, then base course(s).
 * A user-supplied name always wins.
 */
export function layerDisplayName(
    name: string | undefined,
    index: number,
    total: number,
    language: Language
): string {
    if (name) return name;

    const L = translations[language].layerNames;

    // Single layer: no structural role to infer
    if (total === 1) return `${L.generic} 1`;

    if (index === 0) return L.surface;
    if (index === 1 && total >= 3) return L.binder;
    if (index === total - 1) return L.base;

    return `${L.generic} ${index + 1}`;
}
