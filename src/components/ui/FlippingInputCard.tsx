"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Edit2, Check } from "lucide-react";

interface FlippingInputCardProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export default function FlippingInputCard({
    label,
    value,
    onChange,
    placeholder,
    className,
}: FlippingInputCardProps) {
    const [isFlipped, setIsFlipped] = useState(false);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    return (
        <div className={cn("relative w-full h-24 group perspective-1000", className)}>
            <div
                className={cn(
                    "relative w-full h-full transition-all duration-700 transform-style-3d cursor-pointer",
                    isFlipped ? "rotate-y-180" : ""
                )}
                onClick={!isFlipped ? handleFlip : undefined}
            >
                {/* Front Side */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-xl flex flex-col justify-between backface-hidden z-10 hover:scale-[1.02] transition-transform">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {label}
                        </span>
                        <Edit2 className="w-3 h-3 text-primary/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="font-bold text-lg text-foreground truncate">
                        {value || <span className="text-muted-foreground/40 italic">{placeholder}</span>}
                    </div>
                </div>

                {/* Back Side */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/10 to-transparent backdrop-blur-xl border border-primary/30 rounded-xl p-3 shadow-inner flex flex-col justify-center gap-2 rotate-y-180 backface-hidden z-20">
                    <label className="text-[10px] font-bold text-primary pl-1">{label}</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder={placeholder}
                            className="flex-1 bg-background/50 border border-primary/20 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            autoFocus={isFlipped}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") setIsFlipped(false);
                            }}
                            onClick={(e) => e.stopPropagation()} // Prevent flip when clicking input
                        />
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsFlipped(false);
                            }}
                            className="p-1.5 bg-primary rounded-lg text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                            <Check className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
