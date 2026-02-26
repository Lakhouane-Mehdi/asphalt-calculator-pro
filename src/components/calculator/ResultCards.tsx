"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useStore } from "@/lib/store";

export default function ResultCards() {
    const { t, language } = useLanguage();
    const { tonnage, area, layers } = useStore();

    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-card border border-border p-4 flex flex-col items-center text-center space-y-1">
                <span className="text-xs font-medium text-muted-foreground">{t('requiredTonnage')}</span>
                <span className="text-3xl font-bold text-foreground tracking-tight">
                    {tonnage.toLocaleString(language === 'de' ? 'de-DE' : 'en-US')}
                    <span className="text-sm font-normal text-muted-foreground ml-1">{t('units.tonnage')}</span>
                </span>
            </div>

            <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 flex flex-col items-center text-center space-y-1">
                <span className="text-xs font-medium text-primary">{t('estCoverage')}</span>
                <span className="text-3xl font-bold text-primary tracking-tight">
                    {area.toLocaleString(language === 'de' ? 'de-DE' : 'en-US')}
                    <span className="text-sm font-normal opacity-70 ml-1">{t('units.area')}</span>
                </span>
            </div>

            {/* Individual Layer Breakdown */}
            {layers.length > 1 && (
                <div className="col-span-2 mt-4 space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t('layerBreakdown') || 'Layer Breakdown'}</h4>
                    <div className="space-y-2">
                        {layers.map((layer, idx) => (
                            <div key={layer.id} className="flex justify-between items-center p-3 rounded-xl bg-secondary/50 border border-border text-sm">
                                <span className="font-medium">{layer.name || `Layer ${idx + 1}`}</span>
                                <div className="text-right">
                                    <span className="font-bold">{layer.tonnage ? layer.tonnage.toLocaleString(language === 'de' ? 'de-DE' : 'en-US') : '0'}</span>
                                    <span className="text-muted-foreground ml-1 text-xs">{t('units.tonnage')}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
