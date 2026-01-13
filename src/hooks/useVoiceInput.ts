"use client";

import { useState, useCallback, useEffect } from "react";

export function useVoiceInput(onResult: (val: string) => void) {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined" && (window.webkitSpeechRecognition || window.SpeechRecognition)) {
            setIsSupported(true);
        }
    }, []);

    const startListening = useCallback(() => {
        if (!isSupported) return;

        // Type definition hack for TypeScript
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            console.log("Heard:", transcript);

            // Simple number parsing strategy
            // 1. Try direct float parse
            // 2. Try handling "one", "two" etc if needed (basic support here)
            // 3. Remove non-numeric chars except dot

            const cleaned = transcript.replace(/[^0-9.]/g, "");
            const number = parseFloat(cleaned);

            if (!isNaN(number)) {
                onResult(number.toString());
            } else {
                // Fallback: If utterance was just "five", "ten" - simplistic map could go here
                // For now, assume user says numbers like "Fifty", "Two Point Five"
            }
        };

        recognition.start();
    }, [isSupported, onResult]);

    return { isListening, isSupported, startListening };
}
