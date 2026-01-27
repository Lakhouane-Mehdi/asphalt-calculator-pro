"use client";

import { useState } from "react";
import {
  Calculator, Truck, Leaf, Thermometer,
  Maximize, Layers
} from "lucide-react";
import AsphaltCalculator from "@/components/AsphaltCalculator";
import TruckLogistics from "@/components/TruckLogistics";
import SustainabilityTools from "@/components/SustainabilityTools";
import CoolingPredictor from "@/components/CoolingPredictor";
import VisionMeasurement from "@/components/VisionMeasurement";
import AROverlay from "@/components/AROverlay";
import Navbar from "@/components/Navbar";
import { useLanguage, LanguageProvider } from "@/contexts/LanguageContext";

type ToolId = 'calculator' | 'logistics' | 'sustainability' | 'cooling' | 'vision' | 'ar';

export default function Home() {
  return <HomeContent />;
}

function HomeContent() {
  const { t } = useLanguage();
  const [activeTool, setActiveTool] = useState<ToolId>('calculator');

  const tools = [
    { id: 'calculator', icon: Calculator, label: t('title'), component: AsphaltCalculator },
    { id: 'logistics', icon: Truck, label: t('logistics.title'), component: TruckLogistics },
    { id: 'sustainability', icon: Leaf, label: t('sustainability.title'), component: SustainabilityTools },
    { id: 'cooling', icon: Thermometer, label: t('cooling.title'), component: CoolingPredictor },
    { id: 'vision', icon: Maximize, label: t('vision.title'), component: VisionMeasurement },
    { id: 'ar', icon: Layers, label: t('ar.title'), component: AROverlay },
  ];

  const ActiveComponent = tools.find(t => t.id === activeTool)?.component || AsphaltCalculator;

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 pt-24 pb-32">
        {/* Dashboard Tabs - Desktop */}
        <div className="hidden lg:flex items-center justify-center gap-2 mb-12 p-1 bg-secondary/50 rounded-2xl w-fit mx-auto border border-border">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id as ToolId)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${activeTool === tool.id
                ? 'bg-background text-primary shadow-sm scale-105 border border-border'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
            >
              <tool.icon className={`h-5 w-5 ${activeTool === tool.id ? 'text-primary' : ''}`} />
              <span className="font-semibold text-sm whitespace-nowrap">{tool.label}</span>
            </button>
          ))}
        </div>

        {/* Active Tool View */}
        <div className="animate-in fade-in zoom-in-95 duration-500">
          <ActiveComponent />
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-6 left-4 right-4 z-50">
        <div className="bg-background/80 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl p-2 flex items-center justify-around">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id as ToolId)}
              className={`p-3 rounded-2xl transition-all duration-300 ${activeTool === tool.id
                ? 'bg-primary text-primary-foreground scale-110 shadow-lg'
                : 'text-muted-foreground'
                }`}
            >
              <tool.icon className="h-6 w-6" />
            </button>
          ))}
        </div>
      </nav>

      {/* Subtle Gradient Backgrounds */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent" />
    </main>
  );
}
