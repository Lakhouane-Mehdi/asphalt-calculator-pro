import { cn } from "@/lib/utils";
import { LucideIcon, Mic } from "lucide-react";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { ChangeEvent } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon?: LucideIcon;
    enableVoice?: boolean;
}

export function Input({ label, icon: Icon, enableVoice, className, onChange, ...props }: InputProps) {
    const handleVoiceResult = (val: string) => {
        // Artificial event creator to match the native input onChange signature
        const event = {
            target: { value: val }
        } as ChangeEvent<HTMLInputElement>;

        if (onChange) onChange(event);
    };

    const { isListening, isSupported, startListening } = useVoiceInput(handleVoiceResult);

    return (
        <div className={cn("space-y-2", className)}>
            <label className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                <span className="flex items-center gap-2">
                    {Icon && <Icon className="h-3 w-3" />} {label}
                </span>
                {enableVoice && isSupported && (
                    <button
                        onClick={startListening}
                        type="button"
                        className={cn(
                            "p-1 rounded-full transition-colors",
                            isListening ? "bg-red-500/20 text-red-500 animate-pulse" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        )}
                        title="Tap to Speak"
                    >
                        <Mic className="h-3 w-3" />
                    </button>
                )}
            </label>
            <input
                onChange={onChange}
                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted/20"
                {...props}
            />
        </div>
    );
}
