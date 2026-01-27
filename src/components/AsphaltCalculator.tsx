"use client";

import { useState } from "react";
import { Download, ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import FlippingInputCard from "@/components/ui/FlippingInputCard";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { useLanguage } from "@/contexts/LanguageContext";
import { useExportQuote } from "@/hooks/useExportQuote";

// Sub-components
import CalculatorHeader from "./calculator/CalculatorHeader";
import SpecsForm from "./calculator/SpecsForm";
import ResultCards from "./calculator/ResultCards";
import PricingSection from "./calculator/PricingSection";
import PDFReportButton from "./calculator/PDFReportButton";

export default function AsphaltCalculator() {
    const { t } = useLanguage();
    const {
        projectName, setProjectName,
        clientName, setClientName,
        isLoose, setIsLoose,
        tonnage
    } = useStore();

    const [currentStep, setCurrentStep] = useState<number>(1);
    const totalSteps = 4;

    const { handleExport } = useExportQuote();

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Card className="overflow-hidden border-none shadow-2xl bg-background/50 backdrop-blur-xl">
                <CalculatorHeader onExport={handleExport} />

                {/* Wizard Progress Bar */}
                <div className="px-6 pb-2 pt-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{t('step')} {currentStep} {t('of')} {totalSteps}</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            {currentStep === 1 && t('projectDetails')}
                            {currentStep === 2 && t('dimensions')}
                            {currentStep === 3 && t('material')}
                            {currentStep === 4 && t('summary')}
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500 ease-out"
                            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                        />
                    </div>
                </div>

                <CardContent className="space-y-6 pt-6 min-h-[400px] flex flex-col">

                    <div className="flex-1">
                        {currentStep === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <FlippingInputCard
                                        label={t('projectName')}
                                        value={projectName}
                                        onChange={setProjectName}
                                        placeholder={t('placeholders.project')}
                                    />
                                    <FlippingInputCard
                                        label={t('clientName')}
                                        value={clientName}
                                        onChange={setClientName}
                                        placeholder={t('placeholders.client')}
                                    />
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <SpecsForm step="dimensions" />
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <SpecsForm step="material" />
                            </div>
                        )}

                        {currentStep === 4 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                <ResultCards />
                                <PricingSection />
                                <div className="flex justify-center pt-4">
                                    <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20">
                                        <CheckCircle2 className="h-5 w-5" />
                                        <span className="text-sm font-semibold">{t('calculationsVerified')}</span>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <PDFReportButton />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex gap-3 pt-6">
                        {currentStep > 1 && (
                            <Button
                                onClick={prevStep}
                                variant="secondary"
                                className="px-6 rounded-xl"
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" /> {t('back')}
                            </Button>
                        )}

                        {currentStep < totalSteps ? (
                            <Button
                                onClick={nextStep}
                                className="flex-1 bg-primary text-primary-foreground shadow-lg shadow-primary/20 rounded-xl"
                            >
                                {t('next')} <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleExport}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 rounded-xl"
                                disabled={tonnage <= 0}
                            >
                                <Download className="h-4 w-4 mr-2" /> {t('exportQuotePdf')}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div >
    );
}
