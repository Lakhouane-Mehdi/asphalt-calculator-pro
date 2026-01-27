import { translations, Language } from './translations';

export type TranslationKeys = keyof typeof translations['en'];

/**
 * Powerful, lightweight i18n helper.
 * Supports:
 * - Nested keys (e.g., 'placeholders.project')
 * - String interpolation (e.g., 'Hello {{name}}')
 */
export function getTranslation(language: Language, key: string, params?: Record<string, string | number>) {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            return key; // Fallback to key itself
        }
    }

    if (typeof value !== 'string') return key;

    if (params) {
        Object.entries(params).forEach(([k, v]) => {
            value = value.replace(`{{${k}}}`, String(v));
        });
    }

    return value;
}
