"use client";

import { useState, useEffect } from "react";
import { Thermometer, Wind, Clock, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/contexts/LanguageContext";
import { predictCoolingTime } from "@/lib/calculations";

export default function CoolingPredictor() {
    const { t, language } = useLanguage();

    // Inputs
    const [mixTemp, setMixTemp] = useState<string>("160");
    const [airTemp, setAirTemp] = useState<string>("20");
    const [windSpeed, setWindSpeed] = useState<string>("5");

    // Results
    const [timeAvailable, setTimeAvailable] = useState<number>(0);

    useEffect(() => {
        const time = predictCoolingTime({
            mixTemp: parseFloat(mixTemp) || 0,
            airTemp: parseFloat(airTemp) || 0,
            windSpeed: parseFloat(windSpeed) || 0,
        });
        setTimeAvailable(time);
    }, [mixTemp, airTemp, windSpeed]);

    return (
        <Card className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <CardHeader>
                <div className="h-10 w-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-600">
                    <Thermometer className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">{language === 'de' ? 'Einbaufenster' : 'Cooling Predictor'}</h2>
                    <p className="text-xs text-muted-foreground">{language === 'de' ? 'Zeit bis Verdichtungsende (80°C)' : 'Time until cessation (80°C)'}</p>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                    <Input
                        label={language === 'de' ? 'Mischgut (°C)' : 'Mix Temp (°C)'}
                        icon={Thermometer}
                        type="number"
                        value={mixTemp}
                        onChange={(e) => setMixTemp(e.target.value)}
                        placeholder="160"
                    />
                    <Input
                        label={language === 'de' ? 'Luft (°C)' : 'Air Temp (°C)'}
                        icon={Wind} // Using Wind for air temp generically or cloud
                        type="number"
                        value={airTemp}
                        onChange={(e) => setAirTemp(e.target.value)}
                        placeholder="20"
                    />
                    <Input
                        label={language === 'de' ? 'Wind (km/h)' : 'Wind (km/h)'}
                        icon={Wind}
                        type="number"
                        value={windSpeed}
                        onChange={(e) => setWindSpeed(e.target.value)}
                        placeholder="10"
                    />
                </div>

                <div className="rounded-xl bg-orange-500/10 border border-orange-500/20 p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-medium text-orange-600 mb-1">{language === 'de' ? 'Verfügbare Zeit' : 'Time Available'}</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-orange-600">{timeAvailable}</span>
                        <span className="text-sm font-medium text-orange-600">min</span>
                    </div>
                    <p className="text-[10px] text-orange-600/60 mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {language === 'de' ? 'Bis Kerntemperatur < 80°C' : 'Until core temp < 80°C'}
                    </p>
                </div>

                {timeAvailable < 15 && timeAvailable > 0 && (
                    <div className="flex items-center gap-2 text-xs text-red-500 font-medium bg-red-50 p-2 rounded border border-red-100 dark:bg-red-900/10 dark:border-red-900/30">
                        <AlertTriangle className="h-4 w-4" />
                        {language === 'de' ? 'Achtung: Schnelle Verdichtung nötig!' : 'Warning: Rapid compaction required!'}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
