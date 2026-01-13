"use client";

import { useState, useEffect } from "react";
import { Truck, Timer, Activity, RotateCw } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default function TruckLogistics() {
    const [plantRate, setPlantRate] = useState<string>(""); // TPH
    const [truckCapacity, setTruckCapacity] = useState<string>(""); // Tons
    const [cycleTime, setCycleTime] = useState<string>(""); // Minutes (Round Trip)

    const [trucksRequired, setTrucksRequired] = useState<number>(0);
    const [loadInterval, setLoadInterval] = useState<number>(0);

    useEffect(() => {
        const rate = parseFloat(plantRate) || 0;
        const capacity = parseFloat(truckCapacity) || 0;
        const time = parseFloat(cycleTime) || 0;

        if (rate > 0 && capacity > 0 && time > 0) {
            // Logic:
            // Trucks per hour needed = Rate / Capacity
            // Interval (min) = 60 / Trucks per hour
            // Total Trucks = Cycle Time / Interval

            const trucksPerHour = rate / capacity;
            const interval = 60 / trucksPerHour;
            const trucks = Math.ceil(time / interval);

            setLoadInterval(parseFloat(interval.toFixed(1)));
            setTrucksRequired(trucks);
        } else {
            setTrucksRequired(0);
            setLoadInterval(0);
        }
    }, [plantRate, truckCapacity, cycleTime]);

    return (
        <Card className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            <CardHeader>
                <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500">
                    <Truck className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Logistics Planner</h2>
                    <p className="text-xs text-muted-foreground">Fleet Optimization</p>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                    <Input
                        label="Plant Rate (TPH)"
                        icon={Activity}
                        type="number"
                        value={plantRate}
                        onChange={(e) => setPlantRate(e.target.value)}
                        placeholder="e.g. 150"
                    />
                    <Input
                        label="Truck Capacity (t)"
                        icon={Truck}
                        type="number"
                        value={truckCapacity}
                        onChange={(e) => setTruckCapacity(e.target.value)}
                        placeholder="e.g. 20"
                    />
                    <Input
                        label="Cycle Time (min)"
                        icon={Timer}
                        type="number"
                        value={cycleTime}
                        onChange={(e) => setCycleTime(e.target.value)}
                        placeholder="e.g. 60"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-secondary/30 border border-border p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-xs font-medium text-muted-foreground mb-1">Fleet Required</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-foreground">{trucksRequired}</span>
                            <span className="text-sm font-medium text-muted-foreground">Trucks</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                            To match plant speed
                        </p>
                    </div>

                    <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-xs font-medium text-blue-400 mb-1">Spacing Interval</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-blue-500">{loadInterval}</span>
                            <span className="text-sm font-medium text-blue-400">mins</span>
                        </div>
                        <p className="text-[10px] text-blue-400/60 mt-1 flex items-center gap-1">
                            <RotateCw className="h-3 w-3" /> Between arrivals
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
