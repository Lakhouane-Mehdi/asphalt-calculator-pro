"use client";

import { useState, useEffect } from "react";
import { Leaf, Recycle, Factory } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default function SustainabilityTools() {
    const [tonnage, setTonnage] = useState<string>("");
    const [rapPercentage, setRapPercentage] = useState<string>("0");

    const [co2Emission, setCo2Emission] = useState<number>(0);
    const [oilSaved, setOilSaved] = useState<number>(0);

    useEffect(() => {
        const t = parseFloat(tonnage) || 0;
        const rap = parseFloat(rapPercentage) || 0;

        // CO2 Calculation (Approx 25kg CO2 per ton of HMA)
        // RAP reduces virgin binder needed, reducing CO2
        const baseCo2Factor = 25; // kg/ton
        const reductionFactor = rap / 100;

        // Simple model: RAP reduces impact by its percentage roughly (simplified)
        const factor = baseCo2Factor * (1 - (reductionFactor * 0.5)); // Assume 50% efficiency in reduction

        const emission = t * factor;

        // Oil/Binder Saved
        // Assumes 5% binder content. RAP replaces virgin binder.
        const binderContent = 0.05;
        const binderSaved = t * binderContent * reductionFactor * 1000; // kg

        setCo2Emission(Math.round(emission));
        setOilSaved(Math.round(binderSaved));
    }, [tonnage, rapPercentage]);

    return (
        <Card className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <CardHeader>
                <div className="h-10 w-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-500">
                    <Leaf className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Green Asphalt</h2>
                    <p className="text-xs text-muted-foreground">Sustainability Metrics</p>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                        label="Total Tonnage (t)"
                        icon={Factory}
                        type="number"
                        value={tonnage}
                        onChange={(e) => setTonnage(e.target.value)}
                        placeholder="e.g. 500"
                    />
                    <Input
                        label="RAP Percentage (%)"
                        icon={Recycle}
                        type="number"
                        value={rapPercentage}
                        onChange={(e) => setRapPercentage(e.target.value)}
                        placeholder="e.g. 20"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-secondary/30 border border-border p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-xs font-medium text-muted-foreground mb-1">CO2 Footprint</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-foreground">{co2Emission}</span>
                            <span className="text-xs font-medium text-muted-foreground">kg</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                            Est. Emissions
                        </p>
                    </div>

                    <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-xs font-medium text-green-600 mb-1">Virgin Binder Saved</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-green-500">{oilSaved}</span>
                            <span className="text-xs font-medium text-green-600">kg</span>
                        </div>
                        <p className="text-[10px] text-green-600/60 mt-1 flex items-center gap-1">
                            Based on {rapPercentage}% RAP
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
