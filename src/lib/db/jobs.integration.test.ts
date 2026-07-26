/**
 * Exercises the real Dexie code paths against an in-memory IndexedDB so the
 * save / load / duplicate / export round trip is verified, not assumed.
 */
import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import {
    jobDb, listJobs, getJob, saveJob, deleteJob,
    duplicateJob, exportJobs, importJobs, type SavedJob
} from './jobs';

type NewJob = Omit<SavedJob, 'id' | 'createdAt' | 'updatedAt'>;

const makeJob = (overrides: Partial<NewJob> = {}): NewJob => ({
    projectName: 'Hauptstraße Overlay',
    clientName: 'Stadt Musterstadt',
    length: '100',
    width: '6',
    layers: [{
        id: 'layer-1', name: '', thickness: '4', density: '2.4',
        isLoose: false, compactionFactor: 1.25, tonnage: 57.6,
    }],
    pricePerTon: '95',
    wastePercent: '3',
    currency: 'EUR',
    calculatorMode: 'worker',
    tonnage: 59.33,
    netTonnage: 57.6,
    area: 600,
    totalCost: 5636.35,
    documentType: 'quote',
    ...overrides,
});

beforeEach(async () => {
    await jobDb.jobs.clear();
});

describe('job persistence', () => {
    it('saves a job and reads it back intact', async () => {
        const id = await saveJob(makeJob());
        const loaded = await getJob(id);

        expect(loaded).toBeDefined();
        expect(loaded!.projectName).toBe('Hauptstraße Overlay');
        expect(loaded!.tonnage).toBe(59.33);
        expect(loaded!.layers).toHaveLength(1);
        expect(loaded!.createdAt).toBeGreaterThan(0);
    });

    it('updates in place when given an existing id instead of duplicating', async () => {
        const id = await saveJob(makeJob());
        const again = await saveJob(makeJob({ projectName: 'Renamed' }), id);

        expect(again).toBe(id);
        expect(await jobDb.jobs.count()).toBe(1);
        expect((await getJob(id))!.projectName).toBe('Renamed');
    });

    it('falls back to inserting when the given id no longer exists', async () => {
        const id = await saveJob(makeJob(), 9999);
        expect(await getJob(id)).toBeDefined();
        expect(await jobDb.jobs.count()).toBe(1);
    });

    it('lists newest first', async () => {
        const first = await saveJob(makeJob({ projectName: 'Older' }));
        await jobDb.jobs.update(first, { updatedAt: Date.now() - 60_000 });
        await saveJob(makeJob({ projectName: 'Newer' }));

        const jobs = await listJobs();
        expect(jobs.map(j => j.projectName)).toEqual(['Newer', 'Older']);
    });

    it('deletes a job', async () => {
        const id = await saveJob(makeJob());
        await deleteJob(id);
        expect(await getJob(id)).toBeUndefined();
    });
});

describe('duplicate', () => {
    it('copies the inputs under a new name', async () => {
        const id = await saveJob(makeJob());
        const copyId = await duplicateJob(id, 'Hauptstraße Overlay (Kopie)');

        const copy = await getJob(copyId!);
        expect(copy!.projectName).toBe('Hauptstraße Overlay (Kopie)');
        expect(copy!.length).toBe('100');
        expect(copy!.tonnage).toBe(59.33);
        expect(await jobDb.jobs.count()).toBe(2);
    });

    it('never inherits the original invoice number', async () => {
        const id = await saveJob(makeJob({ documentType: 'invoice', invoiceNumber: 'RE-2026-0001' }));
        const copy = await getJob((await duplicateJob(id, 'Copy'))!);

        expect(copy!.invoiceNumber).toBeUndefined();
        expect(copy!.documentType).toBe('quote');
    });

    it('returns undefined for a missing job', async () => {
        expect(await duplicateJob(4242, 'Nope')).toBeUndefined();
    });
});

describe('export / import round trip', () => {
    it('restores exported jobs', async () => {
        await saveJob(makeJob({ projectName: 'A' }));
        await saveJob(makeJob({ projectName: 'B' }));

        const json = await exportJobs();
        await jobDb.jobs.clear();

        const result = await importJobs(json);
        expect(result.imported).toBe(2);
        expect(result.skipped).toBe(0);

        const names = (await listJobs()).map(j => j.projectName).sort();
        expect(names).toEqual(['A', 'B']);
    });

    it('adds to existing jobs rather than overwriting them', async () => {
        await saveJob(makeJob({ projectName: 'Existing' }));
        const json = await exportJobs();

        await importJobs(json);
        expect(await jobDb.jobs.count()).toBe(2);
    });

    it('imports valid rows and skips broken ones in the same file', async () => {
        await saveJob(makeJob({ projectName: 'Good' }));
        const parsed = JSON.parse(await exportJobs());
        parsed.jobs.push({ projectName: 42 });

        const result = await importJobs(JSON.stringify(parsed));
        expect(result).toEqual({ imported: 1, skipped: 1 });
    });
});
