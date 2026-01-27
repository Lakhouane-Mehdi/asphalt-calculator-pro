"use client";

import { DollarSign } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStore } from "@/lib/store";

export default function PricingSection() {
    const { t, language } = useLanguage();
    const { totalCost, pricePerTon, setPricePerTon } = useStore();

    return (
        <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                    <DollarSign className="h-4 w-4" />
                </div>
                <label className="text-sm font-medium text-foreground">{t('calculateCost')}</label>
            </div>

            <div className="flex gap-4 items-center">
                <input
                    type="text"
                    inputMode="decimal"
                    value={pricePerTon}
                    onChange={(e) => setPricePerTon(e.target.value)}
                    placeholder={t('placeholders.price')}
                    className="flex-1 bg-secondary/50 border border-border rounded-xl px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all placeholder:text-muted/30"
                />
                <div className="flex-1 text-right">
                    <span className="block text-xs text-muted-foreground">{t('totalEstimate')}</span>
                    <span className="text-2xl font-bold text-green-500">
                        {language === 'en' ? '$' : '€'}{totalCost.toLocaleString(language === 'de' ? 'de-DE' : 'en-US')}
                    </span>
                </div>
            </div>
        </div>
    );
}
