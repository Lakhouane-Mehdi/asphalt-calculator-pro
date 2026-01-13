"use client";

import { HardHat } from "lucide-react";
import AsphaltCalculator from "@/components/AsphaltCalculator";
import TruckLogistics from "@/components/TruckLogistics";
import SustainabilityTools from "@/components/SustainabilityTools";
import VisionMeasurement from "@/components/VisionMeasurement";
import AROverlay from "@/components/AROverlay";
import CoolingPredictor from "@/components/CoolingPredictor";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";

function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-1">
      <button
        onClick={() => setLanguage('en')}
        className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${language === 'en' ? 'bg-primary text-black' : 'text-muted-foreground hover:text-foreground'}`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('de')}
        className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${language === 'de' ? 'bg-primary text-black' : 'text-muted-foreground hover:text-foreground'}`}
      >
        DE
      </button>
    </div>
  );
}

function PageContent() {
  const { t } = useLanguage();

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 bg-background relative overflow-x-hidden">

      {/* Header / Nav */}
      <div className="z-10 w-full max-w-2xl mx-auto flex items-center justify-between py-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-amber-600 shadow-lg shadow-amber-500/20 flex items-center justify-center">
            <HardHat className="h-6 w-6 text-black" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight">Smart Field</h1>
            <p className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">Asphalt Calculator</p>
            <p className="text-[10px] text-primary/80 font-semibold tracking-tight">Made by Mehdi Lakhouane</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <button className="text-xs font-semibold px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
            {t('settings')}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="z-10 w-full mb-24 space-y-4">
        <AsphaltCalculator />
        <TruckLogistics />
        <CoolingPredictor />
        <SustainabilityTools />
        <VisionMeasurement />
        <AROverlay />
      </div>

      <p className="relative z-10 text-xs text-muted-foreground/50 mt-12 text-center pb-8 font-medium hover:text-primary transition-colors cursor-default">
        {t('madeBy')}
      </p>
    </main>
  );
}

export default function Home() {
  return (
    <LanguageProvider>
      <PageContent />
    </LanguageProvider>
  );
}
