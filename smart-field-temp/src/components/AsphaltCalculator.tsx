"use client";

import { useState, useEffect } from "react";
import { Calculator, DollarSign, Scale, Ruler, Download, FileText } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { generateQuote } from "@/lib/quote-generator";

export default function AsphaltCalculator() {
    // Project Info
    const [projectName, setProjectName] = useState<string>("");
    const [clientName, setClientName] = useState<string>("");

    // Specs
    const [length, setLength] = useState<string>("");
    const [width, setWidth] = useState<string>("");
    const [thickness, setThickness] = useState<string>("");
    const [density, setDensity] = useState<string>("2.4");
    const [pricePerTon, setPricePerTon] = useState<string>("");

    // Results
    const [tonnage, setTonnage] = useState<number>(0);
    const [totalCost, setTotalCost] = useState<number>(0);
    const [area, setArea] = useState<number>(0);

    useEffect(() => {
        const l = parseFloat(length) || 0;
        const w = parseFloat(width) || 0;
        const t = parseFloat(thickness) || 0;
        const d = parseFloat(density) || 0;
        const p = parseFloat(pricePerTon) || 0;

        // Calculation: Volume (m3) = L * W * (T / 100)  [Assuming T is in cm]
        const calculatedArea = l * w;
        const volume = calculatedArea * (t / 100);
        const calculatedTonnage = volume * d;
        const calculatedCost = calculatedTonnage * p;

        setArea(parseFloat(calculatedArea.toFixed(1)));
        setTonnage(parseFloat(calculatedTonnage.toFixed(2)));
        setTotalCost(parseFloat(calculatedCost.toFixed(2)));
    }, [length, width, thickness, density, pricePerTon]);

    const handleExport = () => {
        generateQuote({
            projectName,
            clientName,
            date: new Date().toLocaleDateString(),
            specs: {
                length: length || "0",
                width: width || "0",
                thickness: thickness || "0",
                density: density || "0",
            },
            results: {
                area: area.toString(),
                tonnage: tonnage,
                pricePerTon: pricePerTon || "0",
                totalCost: totalCost.toLocaleString()
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
                        <h2 className="text-xl font-bold">Quick Estimate</h2>
                        <p className="text-xs text-muted-foreground">Standard Volume & Tonnage</p>
                    </div>
                    {/* Export Button - Desktop */}
                    <Button
                        onClick={handleExport}
                        variant="outline"
                        size="sm"
                        className="gap-2 hidden sm:flex"
                        disabled={tonnage <= 0}
                    >
                        <Download className="h-4 w-4" /> Export Quote
                    </Button>
                </CardHeader>

                <CardContent className="space-y-6">

                    {/* Project Details Section */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">Project Name</label>
                            <input
                                type="text"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                placeholder="e.g. Main Street Overlay"
                                className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">Client Name</label>
                            <input
                                type="text"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                placeholder="e.g. City Council"
                                className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                            />
                        </div>
                    </div>

                    <div className="h-px bg-border/50" />

                    {/* Calculator Inputs */}
                    {/* Inputs */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        <Input
                            label="Length (m)"
                            icon={Ruler}
                            type="number"
                            value={length}
                            onChange={(e) => setLength(e.target.value)}
                            placeholder="0.0"
                            enableVoice
                        />

                        <Input
                            label="Width (m)"
                            icon={Ruler}
                            type="number"
                            value={width}
                            onChange={(e) => setWidth(e.target.value)}
                            placeholder="0.0"
                            enableVoice
                        />

                        <Input
                            label="Thickness (cm)"
                            icon={Ruler}
                            type="number"
                            value={thickness}
                            onChange={(e) => setThickness(e.target.value)}
                            placeholder="0.0"
                            enableVoice
                        />

                        <Input
                            label="Density (t/m³)"
                            icon={Scale}
                            type="number"
                            value={density}
                            onChange={(e) => setDensity(e.target.value)}
                            placeholder="2.4"
                            enableVoice
                        />
                    </div>

                    <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mx-6" />

                    {/* Results */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl bg-card border border-border p-4 flex flex-col items-center text-center space-y-1">
                            <span className="text-xs font-medium text-muted-foreground">Required Tonnage</span>
                            <span className="text-3xl font-bold text-foreground tracking-tight">
                                {tonnage}
                                <span className="text-sm font-normal text-muted-foreground ml-1">t</span>
                            </span>
                        </div>

                        <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 flex flex-col items-center text-center space-y-1">
                            <span className="text-xs font-medium text-primary">Est. Coverage</span>
                            <span className="text-3xl font-bold text-primary tracking-tight">
                                {area}
                                <span className="text-sm font-normal opacity-70 ml-1">m²</span>
                            </span>
                        </div>
                    </div>

                    {/* Pricing Section */}
                    <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                                <DollarSign className="h-4 w-4" />
                            </div>
                            <label className="text-sm font-medium text-foreground">Calculate Cost</label>
                        </div>

                        <div className="flex gap-4 items-center">
                            <input
                                type="number"
                                value={pricePerTon}
                                onChange={(e) => setPricePerTon(e.target.value)}
                                placeholder="Price / Ton"
                                className="flex-1 bg-secondary/50 border border-border rounded-xl px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all placeholder:text-muted/30"
                            />
                            <div className="flex-1 text-right">
                                <span className="block text-xs text-muted-foreground">Total Estimate</span>
                                <span className="text-2xl font-bold text-green-500">
                                    ${totalCost.toLocaleString()}
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
                        <Download className="h-4 w-4" /> Export Quote PDF
                    </Button>

                </CardContent>
            </Card>
        </div>
    );
}
