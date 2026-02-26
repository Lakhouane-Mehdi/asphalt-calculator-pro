"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useStore } from "@/lib/store";
import { generateQuote } from "@/lib/quote-generator";

export function useExportQuote() {
    const { language } = useLanguage();
    const {
        projectName, clientName, tonnage, area, totalCost,
        length, width, pricePerTon, layers
    } = useStore();

    const handleExport = (signatureData: string | null) => {
        generateQuote({
            projectName,
            clientName,
            date: new Date().toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US'),
            language,
            signatureData: signatureData || undefined,
            specs: {
                length,
                width,
                layers,
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
