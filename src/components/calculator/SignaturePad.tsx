"use client";

import { useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useLanguage } from "@/contexts/LanguageContext";

interface SignaturePadProps {
    onSave: (signatureDataUrl: string | null) => void;
}

export default function SignaturePad({ onSave }: SignaturePadProps) {
    const { t } = useLanguage();
    const sigCanvas = useRef<SignatureCanvas>(null);

    // Provide a way to lift the state back up when drawn
    const handleEnd = () => {
        if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
            onSave(sigCanvas.current.getTrimmedCanvas().toDataURL('image/png'));
        } else {
            onSave(null);
        }
    };

    const clearSignature = () => {
        if (sigCanvas.current) {
            sigCanvas.current.clear();
            onSave(null);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t('signature') || 'Signature (Optional)'}
                </label>
                <button
                    onClick={clearSignature}
                    className="text-[10px] text-muted-foreground hover:text-destructive underline"
                >
                    {t('clear') || 'Clear'}
                </button>
            </div>

            <div className="border-2 border-dashed border-border rounded-xl bg-card overflow-hidden">
                <SignatureCanvas
                    ref={sigCanvas}
                    onEnd={handleEnd}
                    penColor="black"
                    canvasProps={{
                        className: 'w-full h-32 cursor-crosshair touch-none',
                    }}
                />
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
                {t('signatureHint') || 'Draw above to sign the Einbauprotokoll'}
            </p>
        </div>
    );
}
