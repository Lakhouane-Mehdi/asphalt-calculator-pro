import Dexie, { type Table } from 'dexie';
import type { Layer, Currency } from '@/lib/store';

/**
 * A saved job. Stores the inputs plus the computed results at save time so a
 * historic quote still shows the figures the customer was given, even if the
 * calculation model changes later.
 */
export interface SavedJob {
    id?: number;
    projectName: string;
    clientName: string;
    createdAt: number;
    updatedAt: number;

    // Inputs
    length: string;
    width: string;
    layers: Layer[];
    pricePerTon: string;
    wastePercent: string;
    currency: Currency;
    calculatorMode: 'worker' | 'engineer';

    // Snapshot of results as quoted
    tonnage: number;
    netTonnage: number;
    area: number;
    totalCost: number;

    // Document trail
    documentType: 'quote' | 'invoice';
    invoiceNumber?: string;
    notes?: string;
}

class JobDatabase extends Dexie {
    jobs!: Table<SavedJob, number>;

    constructor() {
        super('SmartFieldJobs');
        this.version(1).stores({
            // Indexed: auto id, plus the fields we sort/search on
            jobs: '++id, projectName, clientName, updatedAt, createdAt',
        });
    }
}

export const jobDb = new JobDatabase();

export async function listJobs(): Promise<SavedJob[]> {
    return jobDb.jobs.orderBy('updatedAt').reverse().toArray();
}

export async function getJob(id: number): Promise<SavedJob | undefined> {
    return jobDb.jobs.get(id);
}

export async function saveJob(job: Omit<SavedJob, 'id' | 'createdAt' | 'updatedAt'>, existingId?: number): Promise<number> {
    const now = Date.now();

    if (existingId != null) {
        const existing = await jobDb.jobs.get(existingId);
        if (existing) {
            await jobDb.jobs.update(existingId, { ...job, updatedAt: now });
            return existingId;
        }
    }

    return jobDb.jobs.add({ ...job, createdAt: now, updatedAt: now });
}

export async function deleteJob(id: number): Promise<void> {
    await jobDb.jobs.delete(id);
}

export async function duplicateJob(id: number, newName: string): Promise<number | undefined> {
    const original = await jobDb.jobs.get(id);
    if (!original) return undefined;

    const now = Date.now();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _omit, ...rest } = original;
    return jobDb.jobs.add({
        ...rest,
        projectName: newName,
        // A copy is a fresh quote: never inherit the original's invoice number
        documentType: 'quote',
        invoiceNumber: undefined,
        createdAt: now,
        updatedAt: now,
    });
}

/** Export all jobs as JSON so a foreman can hand work to the office. */
export async function exportJobs(): Promise<string> {
    const jobs = await listJobs();
    return JSON.stringify({ version: 1, exportedAt: Date.now(), jobs }, null, 2);
}

export interface ImportResult {
    imported: number;
    skipped: number;
}

/** Import jobs from a previously exported file. Existing jobs are never overwritten. */
export async function importJobs(json: string): Promise<ImportResult> {
    const parsed = JSON.parse(json) as { version?: number; jobs?: unknown };

    if (!parsed || !Array.isArray(parsed.jobs)) {
        throw new Error('Unrecognised file format');
    }

    let imported = 0;
    let skipped = 0;

    for (const raw of parsed.jobs) {
        const job = raw as SavedJob;
        if (!job || typeof job.projectName !== 'string' || !Array.isArray(job.layers)) {
            skipped++;
            continue;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _omit, ...rest } = job;
        await jobDb.jobs.add({
            ...rest,
            createdAt: job.createdAt ?? Date.now(),
            updatedAt: Date.now(),
        });
        imported++;
    }

    return { imported, skipped };
}
