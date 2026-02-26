"use client";

import React, { createContext, useContext, useState } from 'react';
import { Language } from '@/lib/translations';
import { getTranslation } from '@/lib/i18n';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('de');

    // Load from localStorage on mount
    React.useEffect(() => {
        const savedLang = localStorage.getItem('preferred-language') as Language;
        if (savedLang === 'en' || savedLang === 'de') {
            setLanguage(savedLang);
        }
    }, []);

    // Save to localStorage on change
    React.useEffect(() => {
        localStorage.setItem('preferred-language', language);
    }, [language]);

    // Enhanced translation function with interpolation
    const t = (key: string, params?: Record<string, string | number>) => {
        return getTranslation(language, key, params);
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
