"use client";

import { useState } from "react";
import { FileText, Receipt, Building2, ChevronDown, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStore, CURRENCY_SYMBOLS, type Currency } from "@/lib/store";

const CURRENCIES = Object.keys(CURRENCY_SYMBOLS) as Currency[];

export default function DocumentOptions() {
    const { t } = useLanguage();
    const {
        currency, setCurrency,
        wastePercent, setWastePercent,
        documentType, setDocumentType,
        company, updateCompany,
    } = useStore();

    const [showCompany, setShowCompany] = useState(false);

    const invoiceReady = Boolean(company.name && company.address && company.taxId);

    return (
        <div className="space-y-4 rounded-xl border border-border bg-secondary/20 p-4">
            {/* Document type */}
            <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t('documentType')}
                </label>
                <div className="flex p-1 bg-secondary/50 rounded-xl border border-border">
                    <button
                        type="button"
                        onClick={() => setDocumentType('quote')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${documentType === 'quote'
                            ? 'bg-background shadow-sm text-primary border border-border/50'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <FileText className="h-4 w-4" /> {t('docQuote')}
                    </button>
                    <button
                        type="button"
                        onClick={() => setDocumentType('invoice')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${documentType === 'invoice'
                            ? 'bg-background shadow-sm text-primary border border-border/50'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Receipt className="h-4 w-4" /> {t('docInvoice')}
                    </button>
                </div>
            </div>

            {documentType === 'invoice' && !invoiceReady && (
                <div className="flex items-start gap-2 text-[11px] text-amber-600 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-px" />
                    <span>{t('invoiceMissingDetails')}</span>
                </div>
            )}

            {/* Currency + waste */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <label htmlFor="currency-select" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {t('currency')}
                    </label>
                    <select
                        id="currency-select"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as Currency)}
                        className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                        {CURRENCIES.map((code) => (
                            <option key={code} value={code}>
                                {code} ({CURRENCY_SYMBOLS[code]})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="waste-input" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {t('wastePercent')}
                    </label>
                    <input
                        id="waste-input"
                        type="text"
                        inputMode="decimal"
                        value={wastePercent}
                        onChange={(e) => setWastePercent(e.target.value)}
                        placeholder="3"
                        className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
            </div>
            <p className="text-[10px] text-muted-foreground -mt-2">{t('wasteHint')}</p>

            {/* Company profile */}
            <div className="border-t border-border pt-3">
                <button
                    type="button"
                    onClick={() => setShowCompany(!showCompany)}
                    className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                >
                    <span className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" /> {t('companyProfile')}
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showCompany ? 'rotate-180' : ''}`} />
                </button>

                {showCompany && (
                    <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <p className="text-[10px] text-muted-foreground">{t('companyHint')}</p>

                        {([
                            ['name', t('companyName')],
                            ['address', t('companyAddress')],
                            ['taxId', t('companyTaxId')],
                            ['contact', t('companyContact')],
                            ['paymentTerms', t('paymentTerms')],
                        ] as const).map(([field, label]) => (
                            <div key={field} className="space-y-1">
                                <label htmlFor={`company-${field}`} className="text-[10px] font-medium text-muted-foreground">
                                    {label}
                                </label>
                                <input
                                    id={`company-${field}`}
                                    type="text"
                                    value={company[field]}
                                    onChange={(e) => updateCompany({ [field]: e.target.value })}
                                    className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                        ))}

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label htmlFor="company-prefix" className="text-[10px] font-medium text-muted-foreground">
                                    {t('invoicePrefix')}
                                </label>
                                <input
                                    id="company-prefix"
                                    type="text"
                                    value={company.invoicePrefix}
                                    onChange={(e) => updateCompany({ invoicePrefix: e.target.value })}
                                    className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="company-next-no" className="text-[10px] font-medium text-muted-foreground">
                                    {t('nextInvoiceNumber')}
                                </label>
                                <input
                                    id="company-next-no"
                                    type="number"
                                    min={1}
                                    value={company.nextInvoiceNumber}
                                    onChange={(e) => updateCompany({ nextInvoiceNumber: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                                    className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
