"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useStore } from "@/lib/store";
import { generateQuote } from "@/lib/quote-generator";

export function useExportQuote() {
    const { language } = useLanguage();
    const {
        projectName, clientName, tonnage, area, totalCost,
        length, width, thickness, density, pricePerTon
    } = useStore();

    const handleExport = () => {
        generateQuote({
            projectName,
            clientName,
            date: new Date().toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US'),
            language,
            specs: {
                length,
                width,
                thickness,
                density,
                materialType: undefined // Can be refined if needed
            },
            results: {
                area: area.toString(),
                tonnage: tonnage,
                pricePerTon: pricePerTon || "0",
                totalCost: totalCost.toLocaleString(language === 'de' ? 'de-DE' : 'en-US')
            }
        });
    };

    return { handleExport };
}
