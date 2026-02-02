"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Hammer, Globe, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Navbar() {
    const { language, setLanguage, t } = useLanguage();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/50 backdrop-blur-xl border-b border-border/50">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo & Branding */}
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                        <Hammer className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight leading-none">Smart Field</h1>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Asphalt Pro</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 mr-2 sm:mr-4 text-[9px] sm:text-[10px] text-muted-foreground font-medium uppercase tracking-widest bg-secondary/50 px-2 sm:px-3 py-1.5 rounded-full border border-border/50">
                        <Info className="h-3 w-3" />
                        {t('madeBy')}
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLanguage(language === 'en' ? 'de' : 'en')}
                        className="gap-2 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                    >
                        <Globe className="h-4 w-4" />
                        <span className="font-bold text-xs uppercase">{language}</span>
                    </Button>
                </div>
            </div>
        </nav>
    );
}
