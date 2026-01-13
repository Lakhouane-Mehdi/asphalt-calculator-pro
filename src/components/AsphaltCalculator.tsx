"use client";

import { useState, useEffect } from "react";
import { Calculator, DollarSign, Scale, Ruler, Download } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { generateQuote } from "@/lib/quote-generator";
import { useLanguage } from "@/contexts/LanguageContext";
import { germanStandards, frostZones } from "@/lib/standards";

export default function AsphaltCalculator() {
    const { t, language } = useLanguage();

    // Project Info
    const [projectName, setProjectName] = useState<string>("");
    const [clientName, setClientName] = useState<string>("");

    // Specs
    const [length, setLength] = useState<string>("");
    const [width, setWidth] = useState<string>("");
    const [thickness, setThickness] = useState<string>("");
    const [density, setDensity] = useState<string>("2.4");
    const [pricePerTon, setPricePerTon] = useState<string>("");
    const [isLoose, setIsLoose] = useState<boolean>(false); // false = Compacted (default), true = Loose

    // Standards (German)
    const [selectedStandard, setSelectedStandard] = useState<string>("custom");
    const [selectedFrostZone, setSelectedFrostZone] = useState<string>("none");

    // Results
    const [tonnage, setTonnage] = useState<number>(0);
    const [totalCost, setTotalCost] = useState<number>(0);
    const [area, setArea] = useState<number>(0);

    // Auto-update density when standard changes
    useEffect(() => {
        if (selectedStandard !== "custom") {
            const std = germanStandards.find(s => s.id === selectedStandard);
            if (std) {
                // Use localized decimal separator for display if needed, but keeping internal state as dot-decimal for simple calculation
                setDensity(std.density.toString());
            }
        }
    }, [selectedStandard]);

    useEffect(() => {
        // Replace commas with dots for calculation
        const parseInput = (val: string) => parseFloat(val.replace(',', '.')) || 0;

        const l = parseInput(length);
        const w = parseInput(width);
        const t = parseInput(thickness);
        const d = parseInput(density);
        const p = parseInput(pricePerTon);

        // Compaction Factor (Standard ~1.25)
        const COMPACTION_FACTOR = 1.25;

        // Effective Compacted Thickness (for Tonnage Calc)
        let effectiveCompactedThickness = t;
        if (isLoose) {
            effectiveCompactedThickness = t / COMPACTION_FACTOR;
        }

        // Calculation: Area * Thickness * Density
        const calculatedArea = l * w;
        // Volume implies Compacted Volume for specific density
        const volume = calculatedArea * (effectiveCompactedThickness / 100);
        const calculatedTonnage = volume * d;
        const calculatedCost = calculatedTonnage * p;

        setArea(parseFloat(calculatedArea.toFixed(1)));
        setTonnage(parseFloat(calculatedTonnage.toFixed(2)));
        setTotalCost(parseFloat(calculatedCost.toFixed(2)));
    }, [length, width, thickness, density, pricePerTon, isLoose]);

    const handleExport = () => {
        generateQuote({
            projectName,
            clientName,
            date: new Date().toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US'),
            language,
            specs: {
                length: length || "0",
                width: width || "0",
                thickness: thickness || "0",
                density: density || "0",
                materialType: language === 'de' && selectedStandard !== 'custom'
                    ? germanStandards.find(s => s.id === selectedStandard)?.name
                    : undefined
            },
            results: {
                area: area.toString(),
                tonnage: tonnage,
                pricePerTon: pricePerTon || "0",
                totalCost: totalCost.toLocaleString(language === 'de' ? 'de-DE' : 'en-US')
            }
        });
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

            <Card>
                <CardHeader>
                    <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                        <Calculator className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold">{t('title')}</h2>
                        <p className="text-xs text-muted-foreground">{t('subtitle')}</p>
                    </div>
                    {/* Export Button - Desktop */}
                    <Button
                        onClick={handleExport}
                        variant="outline"
                        size="sm"
                        className="gap-2 hidden sm:flex"
                        disabled={tonnage <= 0}
                    >
                        <Download className="h-4 w-4" /> {t('exportQuote')}
                    </Button>
                </CardHeader>

                <CardContent className="space-y-6">

                    {/* Project Details Section */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">{t('projectName')}</label>
                            <input
                                type="text"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                placeholder={t('placeholders.project')}
                                className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">{t('clientName')}</label>
                            <input
                                type="text"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                placeholder={t('placeholders.client')}
                                className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                            />
                        </div>
                    </div>

                    <div className="h-px bg-border/50" />

                    {/* Calculator Inputs */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        <Input
                            label={`${t('length')} (${t('units.length')})`}
                            icon={Ruler}
                            type="text"
                            inputMode="decimal"
                            value={length}
                            onChange={(e) => setLength(e.target.value)}
                            placeholder={t('placeholders.length')}
                            enableVoice
                        />

                        <Input
                            label={`${t('width')} (${t('units.length')})`}
                            icon={Ruler}
                            type="text"
                            inputMode="decimal"
                            value={width}
                            onChange={(e) => setWidth(e.target.value)}
                            placeholder={t('placeholders.width')}
                            enableVoice
                        />

                        <div className="space-y-1">
                            <Input
                                label={`${t('thickness')} (${t('units.thickness')})`}
                                icon={Ruler}
                                type="text"
                                inputMode="decimal"
                                value={thickness}
                                onChange={(e) => setThickness(e.target.value)}
                                placeholder={t('placeholders.thickness')}
                                enableVoice
                            />
                            <div className="flex items-center justify-end gap-2 px-1">
                                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{t('compaction')}:</label>
                                <button
                                    onClick={() => setIsLoose(!isLoose)}
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${isLoose
                                        ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
                                        : 'bg-secondary text-secondary-foreground border-border'}`}
                                >
                                    {isLoose ? t('loose') : t('compacted')}
                                </button>
                            </div>
                            {thickness && (
                                <p className="text-[10px] text-right text-muted-foreground px-1">
                                    {isLoose
                                        ? `${t('estCompacted')}: ${(parseFloat(thickness.replace(',', '.')) / 1.25).toFixed(1)} cm`
                                        : `${t('estLoose')}: ${(parseFloat(thickness.replace(',', '.')) * 1.25).toFixed(1)} cm`}
                                </p>
                            )}
                        </div>

                        {language === 'de' && (
                            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                                        {t('materialType')}
                                    </label>
                                    <select
                                        value={selectedStandard}
                                        onChange={(e) => setSelectedStandard(e.target.value)}
                                        className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                                    >
                                        {germanStandards.map((std) => (
                                            <option key={std.id} value={std.id}>
                                                {std.name} {std.density > 0 ? `(${std.density} t/m³)` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {language === 'de' && selectedStandard !== 'custom' && (
                                        (() => {
                                            const std = germanStandards.find(s => s.id === selectedStandard);
                                            const thick = parseFloat(thickness.replace(',', '.')) || 0;
                                            if (std?.minThick && std?.maxThick) {
                                                const isOutOfSpec = thick > 0 && (thick < std.minThick || thick > std.maxThick);
                                                if (isOutOfSpec) {
                                                    return (
                                                        <p className="text-[10px] text-amber-500 font-medium animate-pulse mt-1">
                                                            ⚠️ Norm: {std.minThick}-{std.maxThick} cm
                                                        </p>
                                                    )
                                                }
                                            }
                                            return null;
                                        })()
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                                        {t('frostZone')}
                                    </label>
                                    <select
                                        value={selectedFrostZone}
                                        onChange={(e) => setSelectedFrostZone(e.target.value)}
                                        className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                                    >
                                        {frostZones.map((zone) => (
                                            <option key={zone.id} value={zone.id}>
                                                {zone.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
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
                            enableVoice
                        />
                    </div>

                    <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mx-6" />

                    {/* Results */}
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
                    </div>

                    {/* Pricing Section */}
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

                    {/* Mobile Export Button (Visible only on small screens) */}
                    <Button
                        onClick={handleExport}
                        variant="outline"
                        className="w-full gap-2 sm:hidden"
                        disabled={tonnage <= 0}
                    >
                        <Download className="h-4 w-4" /> {t('exportQuotePdf')}
                    </Button>

                </CardContent>
            </Card>
        </div >
    );
}
