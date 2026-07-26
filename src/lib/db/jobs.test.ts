import { describe, it, expect } from 'vitest';
import { importJobs } from './jobs';

/**
 * importJobs is the only pure-ish entry point that can be exercised without a
 * real IndexedDB; the parsing/validation branches run before any DB write.
 */
describe('importJobs validation', () => {
    it('rejects malformed JSON', async () => {
        await expect(importJobs('not json at all')).rejects.toThrow();
    });

    it('rejects a payload without a jobs array', async () => {
        await expect(importJobs('{"version":1}')).rejects.toThrow('Unrecognised file format');
        await expect(importJobs('{"jobs":"nope"}')).rejects.toThrow('Unrecognised file format');
    });

    it('accepts an empty job list without touching the database', async () => {
        const result = await importJobs('{"version":1,"jobs":[]}');
        expect(result).toEqual({ imported: 0, skipped: 0 });
    });

    it('skips entries missing the required shape', async () => {
        // No DB write happens for invalid rows, so this runs without IndexedDB
        const payload = JSON.stringify({
            version: 1,
            jobs: [
                { projectName: 123 },        // wrong type
                { layers: [] },              // missing projectName
                null,                        // not an object
            ],
        });
        const result = await importJobs(payload);
        expect(result).toEqual({ imported: 0, skipped: 3 });
    });
});
