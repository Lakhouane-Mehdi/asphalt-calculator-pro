import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
    return (
        <div
            className={cn(
                "rounded-2xl border border-border bg-card/50 backdrop-blur-xl shadow-2xl overflow-hidden",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ className, children, ...props }: CardProps) {
    return (
        <div
            className={cn("p-6 border-b border-border/50 bg-secondary/20 flex items-center gap-3", className)}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardContent({ className, children, ...props }: CardProps) {
    return (
        <div className={cn("p-6", className)} {...props}>
            {children}
        </div>
    );
}
