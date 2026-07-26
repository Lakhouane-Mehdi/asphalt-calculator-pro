"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useStore } from "@/lib/store";
import { generateQuote } from "@/lib/quote-generator";
import { parseLocaleNumber } from "@/lib/calculations";
import { layerDisplayName } from "@/lib/layer-names";

export function useExportQuote() {
    const { language } = useLanguage();
    const {
        projectName, clientName, tonnage, netTonnage, area, totalCost,
        length, width, pricePerTon, layers,
        currency, wastePercent, documentType, company, consumeInvoiceNumber
    } = useStore();

    const handleExport = (signatureData: string | null) => {
        // Invoice numbers must be sequential and gap-free; only draw one when issuing an invoice
        const invoiceNumber = documentType === 'invoice' ? consumeInvoiceNumber() : undefined;

        generateQuote({
            projectName,
            clientName,
            date: new Date().toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US'),
            language,
            documentType,
            invoiceNumber,
            company,
            currency,
            wastePercent: parseLocaleNumber(wastePercent),
            signatureData: signatureData || undefined,
            specs: {
                length,
                width,
                // Resolve positional defaults (Deckschicht/Binderschicht/...) for the PDF
                layers: layers.map((l, idx) => ({
                    ...l,
                    name: layerDisplayName(l.name, idx, layers.length, language),
                })),
            },
            results: {
                area: area.toString(),
                tonnage,
                netTonnage,
                pricePerTon: parseLocaleNumber(pricePerTon),
                totalCost
            }
        });
    };

    return { handleExport };
}
