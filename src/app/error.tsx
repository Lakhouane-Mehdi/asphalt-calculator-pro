"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Application error:", error);
    }, [error]);

    return (
        <main className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
            <div className="w-full max-w-md space-y-5 rounded-2xl border border-border bg-card p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                    <AlertTriangle className="h-7 w-7" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-xl font-bold">Etwas ist schiefgelaufen</h1>
                    <p className="text-sm text-muted-foreground">
                        Something went wrong. Your saved projects and settings are safe on this device.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={reset}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                    <RotateCcw className="h-4 w-4" />
                    Erneut versuchen / Try again
                </button>

                {error.digest && (
                    <p className="text-[10px] text-muted-foreground/60">
                        Ref: {error.digest}
                    </p>
                )}
            </div>
        </main>
    );
}
