"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Settings2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";

type ConsentType = {
    essential: boolean;
    analytics: boolean;
};

export default function CookieBanner() {
    const { t } = useLanguage();
    const [isVisible, setIsVisible] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [consent, setConsent] = useState<ConsentType>({ essential: true, analytics: false });

    useEffect(() => {
        const storedConsent = localStorage.getItem("cookie-consent");
        if (!storedConsent) {
            setIsVisible(true);
        }
    }, []);

    const handleAcceptAll = () => {
        const fullConsent = { essential: true, analytics: true };
        saveConsent(fullConsent);
    };

    const handleRejectAll = () => {
        const minimalConsent = { essential: true, analytics: false };
        saveConsent(minimalConsent);
    };

    const saveConsent = (newConsent: ConsentType) => {
        localStorage.setItem("cookie-consent", JSON.stringify(newConsent));
        setConsent(newConsent);
        setIsVisible(false);

        if (newConsent.analytics) {
            fetch('/api/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ consent: newConsent })
            }).catch(err => console.error('Analytics failed:', err));
        }

        window.dispatchEvent(new CustomEvent("consent-updated", { detail: newConsent }));
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 left-6 right-6 z-[100] animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="max-w-4xl mx-auto bg-background/80 backdrop-blur-2xl border border-primary/20 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] rounded-[2.5rem] p-6 lg:p-8 overflow-hidden relative">
                {/* Background Glow */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                {!showSettings ? (
                    <div className="flex flex-col lg:flex-row items-center gap-8">
                        <div className="flex-1 space-y-3 text-center lg:text-left">
                            <div className="flex items-center justify-center lg:justify-start gap-3">
                                <div className="p-2 bg-primary/10 rounded-xl">
                                    <ShieldCheck className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold tracking-tight">{t('privacyTitle')}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                                {t('privacyDescription')}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                            <Button
                                variant="outline"
                                onClick={() => setShowSettings(true)}
                                className="w-full sm:w-auto gap-2 rounded-2xl hover:bg-secondary/80 border-border/50"
                            >
                                <Settings2 className="h-4 w-4" />
                                {t('custom')}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleRejectAll}
                                className="w-full sm:w-auto rounded-2xl border-primary/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50"
                            >
                                {t('rejectAll')}
                            </Button>
                            <Button
                                onClick={handleAcceptAll}
                                className="w-full sm:w-auto rounded-2xl shadow-lg shadow-primary/20 px-8"
                            >
                                {t('acceptAll')}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold">{t('settingsTitle')}</h3>
                            <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-secondary rounded-full transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-border/50">
                                <div>
                                    <p className="font-bold text-sm">{t('essentialCookies')}</p>
                                    <p className="text-xs text-muted-foreground">{t('essentialCookiesDesc')}</p>
                                </div>
                                <div className="h-6 w-10 bg-primary/20 rounded-full flex items-center px-1">
                                    <div className="h-4 w-4 bg-primary rounded-full translate-x-4" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-border/50">
                                <div>
                                    <p className="font-bold text-sm">{t('analyticsCookies')}</p>
                                    <p className="text-xs text-muted-foreground">{t('analyticsCookiesDesc')}</p>
                                </div>
                                <button
                                    onClick={() => setConsent(prev => ({ ...prev, analytics: !prev.analytics }))}
                                    className={`h-6 w-10 rounded-full flex items-center px-1 transition-colors ${consent.analytics ? 'bg-primary' : 'bg-muted'}`}
                                >
                                    <div className={`h-4 w-4 bg-white rounded-full transition-transform ${consent.analytics ? 'translate-x-4' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>

                        <Button onClick={() => saveConsent(consent)} className="w-full rounded-2xl mt-4">
                            {t('apply')}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
