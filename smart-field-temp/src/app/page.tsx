import { HardHat } from "lucide-react";
import AsphaltCalculator from "@/components/AsphaltCalculator";
import TruckLogistics from "@/components/TruckLogistics";
import SustainabilityTools from "@/components/SustainabilityTools";
import VisionMeasurement from "@/components/VisionMeasurement";
import AROverlay from "@/components/AROverlay";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 bg-background relative overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

      {/* Header / Nav */}
      <div className="z-10 w-full max-w-2xl mx-auto flex items-center justify-between py-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-amber-600 shadow-lg shadow-amber-500/20 flex items-center justify-center">
            <HardHat className="h-6 w-6 text-black" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight">Smart Field</h1>
            <p className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">Asphalt Calculator</p>
          </div>
        </div>
        <button className="text-xs font-semibold px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
          Settings
        </button>
      </div>

      {/* Main Content */}
      <div className="z-10 w-full mb-24 space-y-4">
        <AsphaltCalculator />
        <TruckLogistics />
        <SustainabilityTools />
        <VisionMeasurement />
        <AROverlay />
      </div>

      <p className="relative z-10 text-[10px] text-muted-foreground/30 mt-12 text-center pb-4">
        v0.1.0 • Built for Professionals • Offline Ready
      </p>
    </main>
  );
}
