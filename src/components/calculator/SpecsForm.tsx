"use client";

import { useState, useEffect } from "react";
import { Ruler, Scale } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStore } from "@/lib/store";
import { germanStandards, frostZones, materialCategories, MaterialCategory } from "@/lib/standards";
import { RStO12_Standards, TrafficClass } from "@/lib/standards-rsto";

interface SpecsFormProps {
    step: 'dimensions' | 'material';
}

export default function SpecsForm({ step }: SpecsFormProps) {
    const { t, language } = useLanguage();
    // --- Multi-Layer Logic Refactor ---
    const {
        length, width, setSpecs,
        layers, addLayer, updateLayer, removeLayer,
        calculatorMode
    } = useStore();

    // Default to Asphalt for backward compatibility, or empty
    const [selectedCategory, setSelectedCategory] = useState<MaterialCategory>("asphalt");
    const [selectedStandard, setSelectedStandard] = useState<string>("custom");

    // Filter standards based on category
    const filteredStandards = germanStandards.filter(s => s.category === selectedCategory || s.id === 'custom');

    const setLength = (val: string) => setSpecs({ length: val });
    const setWidth = (val: string) => setSpecs({ width: val });

    const handleCategoryChange = (cat: MaterialCategory, layerId: string) => {
        setSelectedCategory(cat);
        const firstInCat = germanStandards.find(s => s.category === cat);
        const newStd = firstInCat ? firstInCat.id : 'custom';
        setSelectedStandard(newStd);

        const std = germanStandards.find(s => s.id === newStd);
        if (std) {
            updateLayer(layerId, { name: std.name, density: std.density.toString(), compactionFactor: 1 + (std.compactionOffset || 0) });
        }
    };

    const handleStandardChange = (stdId: string, layerId: string) => {
        setSelectedStandard(stdId);
        const std = germanStandards.find(s => s.id === stdId);
        if (std) {
            updateLayer(layerId, {
                name: std.name,
                density: std.id !== 'custom' ? std.density.toString() : '2.4',
                compactionFactor: 1 + (std.compactionOffset || 0)
            });
        }
    };


    if (step === 'dimensions') {
        return (
            <div className="grid gap-6 sm:grid-cols-2">
                <Input
                    label={`${t('length')} (${t('units.length')})`}
                    icon={Ruler}
                    type="text"
                    inputMode="decimal"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    placeholder={t('placeholders.length')}
                />
                <Input
                    label={`${t('width')} (${t('units.length')})`}
                    icon={Ruler}
                    type="text"
                    inputMode="decimal"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    placeholder={t('placeholders.width')}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {layers.map((layer, index) => (
                <div key={layer.id} className="relative p-5 rounded-2xl bg-card border shadow-sm">
                    {layers.length > 1 && (
                        <div className="absolute top-4 right-4 cursor-pointer text-destructive/80 hover:text-destructive" onClick={() => removeLayer(layer.id)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </div>
                    )}

                    <div className="mb-4">
                        <h4 className="text-sm font-semibold text-primary">Layer {index + 1}</h4>
                    </div>

                    <div className="grid gap-5">
                        {calculatorMode === 'engineer' && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{t('materialCategory')}</label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => handleCategoryChange(e.target.value as MaterialCategory, layer.id)}
                                        className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm"
                                    >
                                        {materialCategories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{t(cat.labelKey)}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{t('materialType')}</label>
                                    <select
                                        value={selectedStandard}
                                        onChange={(e) => handleStandardChange(e.target.value, layer.id)}
                                        className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm"
                                    >
                                        {filteredStandards.map((std) => (
                                            <option key={std.id} value={std.id}>{std.name} {std.density > 0 ? `(${std.density} t/m³)` : ''}</option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label={`${t('thickness')} (${t('units.thickness')})`}
                                icon={Ruler}
                                type="text"
                                inputMode="decimal"
                                value={layer.thickness}
                                onChange={(e) => updateLayer(layer.id, { thickness: e.target.value })}
                                placeholder={t('placeholders.thickness')}
                            />
                            <Input
                                label={`${t('density')} (${t('units.density')})`}
                                icon={Scale}
                                type="text"
                                inputMode="decimal"
                                value={layer.density}
                                onChange={(e) => updateLayer(layer.id, { density: e.target.value })}
                                placeholder={t('placeholders.density')}
                            />
                        </div>

                        {layer.compactionFactor > 1 && (
                            <div className="flex items-center justify-between gap-2 px-1">
                                <p className="text-[10px] text-muted-foreground italic">
                                    {layer.isLoose
                                        ? `${t('estCompacted')}: ${(parseFloat(layer.thickness.replace(',', '.')) / layer.compactionFactor).toFixed(1)} cm`
                                        : `${t('estLoose')}: ${(parseFloat(layer.thickness.replace(',', '.')) * layer.compactionFactor).toFixed(1)} cm`}
                                </p>
                                <div className="flex items-center gap-2">
                                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{t('compaction')}:</label>
                                    <button
                                        onClick={() => updateLayer(layer.id, { isLoose: !layer.isLoose })}
                                        className={`text-[10px] font-bold px-3 py-1 rounded-lg border transition-all ${layer.isLoose
                                            ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30'
                                            : 'bg-secondary text-secondary-foreground border-border'}`}
                                    >
                                        {layer.isLoose ? t('loose') : t('compacted')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}

            <button
                onClick={() => addLayer({ name: 'New Layer', thickness: '', density: '2.4', isLoose: false, compactionFactor: 1.25 })}
                className="w-full py-4 border-2 border-dashed border-primary/20 text-primary rounded-2xl text-sm font-semibold hover:bg-primary/5 transition-colors"
            >
                + Add Another Layer
            </button>

        </div>
    );
}
