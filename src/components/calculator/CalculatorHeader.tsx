"use client";

import { Calculator, Download, RotateCcw } from "lucide-react";
import { CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStore } from "@/lib/store";

interface CalculatorHeaderProps {
    onExport: () => void;
    onReset?: () => void;
}

export default function CalculatorHeader({ onExport, onReset }: CalculatorHeaderProps) {
    const { t } = useLanguage();
    const { tonnage, projectName, clientName, length, width } = useStore();

    const hasProjectData = Boolean(projectName || clientName || length || width || tonnage > 0);

    return (
        <CardHeader>
            <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <Calculator className="h-6 w-6" />
            </div>
            <div className="flex-1">
                <h2 className="text-xl font-bold">{t('title')}</h2>
                <p className="text-xs text-muted-foreground">{t('subtitle')}</p>
            </div>
            {/* New Project - clears the current job, keeps company settings */}
            {onReset && hasProjectData && (
                <Button
                    onClick={onReset}
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    title={t('newProject')}
                >
                    <RotateCcw className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('newProject')}</span>
                </Button>
            )}

            {/* Export Button - Desktop */}
            <Button
                onClick={onExport}
                variant="outline"
                size="sm"
                className="gap-2 hidden sm:flex"
                disabled={tonnage <= 0}
            >
                <Download className="h-4 w-4" /> {t('exportQuote')}
            </Button>
        </CardHeader>
    );
}
