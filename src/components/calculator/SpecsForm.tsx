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
    const {
        length, width, thickness, density, setSpecs,
        isLoose, setIsLoose, setCompactionFactor, compactionFactor
    } = useStore();

    // Default to Asphalt for backward compatibility, or empty
    const [selectedCategory, setSelectedCategory] = useState<MaterialCategory>("asphalt");
    const [selectedStandard, setSelectedStandard] = useState<string>("custom");
    const [selectedFrostZone, setSelectedFrostZone] = useState<string>("none");
    const [selectedTrafficClass, setSelectedTrafficClass] = useState<string>("none");

    // Filter standards based on category
    const filteredStandards = germanStandards.filter(s => s.category === selectedCategory || s.id === 'custom');

    const setLength = (val: string) => setSpecs({ length: val });
    const setWidth = (val: string) => setSpecs({ width: val });
    const setThickness = (val: string) => setSpecs({ thickness: val });
    const setDensity = (val: string) => setSpecs({ density: val });

    const handleCategoryChange = (cat: MaterialCategory) => {
        setSelectedCategory(cat);
        // Reset to custom or first available in category
        const firstInCat = germanStandards.find(s => s.category === cat);
        const newStd = firstInCat ? firstInCat.id : 'custom';
        setSelectedStandard(newStd);

        // Disable traffic class if not asphalt
        if (cat !== 'asphalt') {
            setSelectedTrafficClass('none');
        }
    };

    const handleTrafficClassChange = (tc: string) => {
        setSelectedTrafficClass(tc);
        if (tc !== "none") {
            const structure = RStO12_Standards[tc as TrafficClass];
            if (structure) {
                setSpecs({ thickness: structure.totalThickness.toString() });
            }
        }
    };

    // Update global store when standard changes
    useEffect(() => {
        const std = germanStandards.find(s => s.id === selectedStandard);
        if (std) {
            // Only update density if it's not custom (custom allows manual edit)
            if (selectedStandard !== 'custom') {
                setSpecs({ density: std.density.toString() });
            }
            // Update compaction factor logic
            const factor = 1 + (std.compactionOffset || 0);
            setCompactionFactor(factor);

            // If factor is 1, force isLoose to false as it makes no difference
            if (factor === 1 && isLoose) {
                setIsLoose(false);
            }
        }
    }, [selectedStandard, selectedCategory, isLoose, setCompactionFactor, setSpecs, setIsLoose]); // Re-run if category changes (though standard usually changes too)

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
                <div className="sm:col-span-2 space-y-1">
                    <Input
                        label={`${t('thickness')} (${t('units.thickness')})`}
                        icon={Ruler}
                        type="text"
                        inputMode="decimal"
                        value={thickness}
                        onChange={(e) => setThickness(e.target.value)}
                        placeholder={t('placeholders.thickness')}
                    />

                    {/* Only show compaction hints/toggle if factor > 1 (i.e. not concrete/paving) */}
                    {compactionFactor > 1 && (
                        <div className="flex items-center justify-between gap-2 px-1 pt-2">
                            <p className="text-[10px] text-muted-foreground italic">
                                {isLoose
                                    ? `${t('estCompacted')}: ${(parseFloat(thickness.replace(',', '.')) / compactionFactor).toFixed(1)} cm`
                                    : `${t('estLoose')}: ${(parseFloat(thickness.replace(',', '.')) * compactionFactor).toFixed(1)} cm`}
                            </p>
                            <div className="flex items-center gap-2">
                                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{t('compaction')}:</label>
                                <button
                                    onClick={() => setIsLoose(!isLoose)}
                                    className={`text-[10px] font-bold px-3 py-1 rounded-lg border transition-all ${isLoose
                                        ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30'
                                        : 'bg-secondary text-secondary-foreground border-border'}`}
                                >
                                    {isLoose ? t('loose') : t('compacted')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-6">
                {language === 'de' && (
                    <>
                        {/* Material Category Dropdown */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">{t('materialCategory')}</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => handleCategoryChange(e.target.value as MaterialCategory)}
                                className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm"
                            >
                                {materialCategories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{t(cat.labelKey)}</option>
                                ))}
                            </select>
                        </div>

                        {/* Specific Standard Dropdown */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">{t('materialType')}</label>
                            <select
                                value={selectedStandard}
                                onChange={(e) => setSelectedStandard(e.target.value)}
                                className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm"
                            >
                                {filteredStandards.map((std) => (
                                    <option key={std.id} value={std.id}>{std.name} {std.density > 0 ? `(${std.density} t/m³)` : ''}</option>
                                ))}
                            </select>
                        </div>

                        {/* Traffic Class (Only for Asphalt) */}
                        {selectedCategory === 'asphalt' && (
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">{t('trafficClass')}</label>
                                <select
                                    value={selectedTrafficClass}
                                    onChange={(e) => handleTrafficClassChange(e.target.value)}
                                    className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm"
                                >
                                    <option value="none">-- {t('none')} --</option>
                                    {Object.keys(RStO12_Standards).map((tc) => (
                                        <option key={tc} value={tc}>{tc}</option>
                                    ))}
                                </select>
                                {selectedTrafficClass !== 'none' && (
                                    <p className="text-[10px] text-primary font-medium pl-1">
                                        {t('recommendedStructure')}: {RStO12_Standards[selectedTrafficClass as TrafficClass].totalThickness}cm (ZTV Asphalt-StB)
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Frost Zone */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">{t('frostZone')}</label>
                            <select
                                value={selectedFrostZone}
                                onChange={(e) => setSelectedFrostZone(e.target.value)}
                                className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm"
                            >
                                {frostZones.map((zone) => (
                                    <option key={zone.id} value={zone.id}>{zone.name}</option>
                                ))}
                            </select>
                        </div>
                    </>
                )}

                <Input
                    label={`${t('density')} (${t('units.density')})`}
                    icon={Scale}
                    type="text"
                    inputMode="decimal"
                    value={density}
                    onChange={(e) => {
                        setDensity(e.target.value);
                        if (selectedStandard !== 'custom') setSelectedStandard('custom');
                    }}
                    placeholder={t('placeholders.density')}
                />
            </div>
        </div>
    );
}
