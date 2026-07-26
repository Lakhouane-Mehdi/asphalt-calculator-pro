"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
    FolderOpen, Save, Copy, Trash2, Download, Upload,
    ChevronDown, Check, Search
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStore, CURRENCY_SYMBOLS } from "@/lib/store";
import {
    listJobs, saveJob, deleteJob, duplicateJob,
    exportJobs, importJobs, type SavedJob
} from "@/lib/db/jobs";

export default function JobHistory() {
    const { t, language } = useLanguage();
    const store = useStore();
    const {
        projectName, clientName, length, width, layers, pricePerTon,
        wastePercent, currency, calculatorMode, documentType,
        tonnage, netTonnage, area, totalCost, currentJobId,
        loadJob, setCurrentJobId,
    } = store;

    const [jobs, setJobs] = useState<SavedJob[]>([]);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const refresh = useCallback(async () => {
        try {
            setJobs(await listJobs());
        } catch {
            // IndexedDB unavailable (private mode / old browser) - degrade quietly
            setJobs([]);
        }
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    // Clear the transient status line after a moment
    useEffect(() => {
        if (!status) return;
        const timer = setTimeout(() => setStatus(null), 2500);
        return () => clearTimeout(timer);
    }, [status]);

    const locale = language === 'de' ? 'de-DE' : 'en-US';
    const formatDate = (ts: number) =>
        new Date(ts).toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' });
    const formatMoney = (amount: number, code: SavedJob['currency']) => {
        const symbol = CURRENCY_SYMBOLS[code] ?? '';
        const formatted = amount.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return language === 'de' ? `${formatted} ${symbol}` : `${symbol}${formatted}`;
    };

    const handleSave = async () => {
        if (!projectName.trim()) {
            setStatus(t('jobs.nameRequired'));
            return;
        }
        const id = await saveJob({
            projectName, clientName, length, width, layers,
            pricePerTon, wastePercent, currency, calculatorMode,
            tonnage, netTonnage, area, totalCost, documentType,
        }, currentJobId ?? undefined);
        setCurrentJobId(id);
        await refresh();
        setStatus(t('jobs.saved'));
    };

    const handleOpen = async (job: SavedJob) => {
        loadJob({
            id: job.id,
            projectName: job.projectName,
            clientName: job.clientName,
            length: job.length,
            width: job.width,
            layers: job.layers,
            pricePerTon: job.pricePerTon,
            wastePercent: job.wastePercent,
            currency: job.currency,
            calculatorMode: job.calculatorMode,
            documentType: job.documentType,
        });
        setOpen(false);
    };

    const handleDuplicate = async (job: SavedJob) => {
        if (job.id == null) return;
        await duplicateJob(job.id, `${job.projectName} ${t('jobs.copySuffix')}`);
        await refresh();
    };

    const handleDelete = async (job: SavedJob) => {
        if (job.id == null) return;
        if (!window.confirm(t('jobs.deleteConfirm'))) return;
        await deleteJob(job.id);
        if (currentJobId === job.id) setCurrentJobId(null);
        await refresh();
    };

    const handleExport = async () => {
        const json = await exportJobs();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `smart-field-jobs-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const result = await importJobs(await file.text());
            await refresh();
            setStatus(t('jobs.importDone', { n: result.imported }));
        } catch {
            setStatus(t('jobs.importFailed'));
        } finally {
            // Allow re-importing the same filename
            e.target.value = '';
        }
    };

    const needle = query.trim().toLowerCase();
    const visible = needle
        ? jobs.filter(j =>
            j.projectName.toLowerCase().includes(needle) ||
            j.clientName.toLowerCase().includes(needle))
        : jobs;

    return (
        <div className="space-y-3 rounded-xl border border-border bg-secondary/20 p-4">
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={handleSave}
                    className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                    <Save className="h-4 w-4" />
                    {currentJobId ? t('jobs.update') : t('jobs.save')}
                </button>

                <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    className="flex flex-1 items-center justify-between rounded-lg border border-border bg-secondary/50 px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
                >
                    <span className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4" />
                        {t('jobs.title')}
                        {jobs.length > 0 && (
                            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                                {jobs.length}
                            </span>
                        )}
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {status && (
                <p className="flex items-center gap-1.5 text-[11px] font-medium text-primary">
                    <Check className="h-3.5 w-3.5" /> {status}
                </p>
            )}

            {open && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    {jobs.length > 3 && (
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={t('jobs.search')}
                                className="w-full rounded-lg border border-border bg-secondary/50 py-1.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                    )}

                    {visible.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-border p-4 text-center">
                            <p className="text-xs text-muted-foreground">{t('jobs.empty')}</p>
                            <p className="mt-1 text-[10px] text-muted-foreground/70">{t('jobs.emptyHint')}</p>
                        </div>
                    ) : (
                        <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
                            {visible.map((job) => (
                                <li
                                    key={job.id}
                                    className={`rounded-lg border p-3 transition-colors ${currentJobId === job.id
                                        ? 'border-primary/40 bg-primary/5'
                                        : 'border-border bg-card'}`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold">
                                                {job.projectName || t('jobs.unnamed')}
                                            </p>
                                            <p className="truncate text-[11px] text-muted-foreground">
                                                {job.clientName || t('jobs.noClient')}
                                            </p>
                                            <p className="mt-1 text-[10px] text-muted-foreground">
                                                {t('jobs.updated')}: {formatDate(job.updatedAt)}
                                                {' · '}
                                                {job.tonnage.toLocaleString(locale)} t
                                                {job.totalCost > 0 && ` · ${formatMoney(job.totalCost, job.currency)}`}
                                            </p>
                                        </div>

                                        <div className="flex shrink-0 items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => handleOpen(job)}
                                                title={t('jobs.open')}
                                                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                                            >
                                                <FolderOpen className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDuplicate(job)}
                                                title={t('jobs.duplicate')}
                                                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                                            >
                                                <Copy className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(job)}
                                                title={t('jobs.delete')}
                                                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="flex items-center gap-2 border-t border-border pt-3">
                        <button
                            type="button"
                            onClick={handleExport}
                            disabled={jobs.length === 0}
                            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                        >
                            <Download className="h-3.5 w-3.5" /> {t('jobs.exportAll')}
                        </button>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <Upload className="h-3.5 w-3.5" /> {t('jobs.importFile')}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="application/json,.json"
                            onChange={handleImport}
                            className="hidden"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
