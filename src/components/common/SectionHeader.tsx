import React from "react";
import { cn } from "@/lib/utils";

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  eyebrow,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border/60",
        className
      )}
    >
      <div className="space-y-1">
        {eyebrow && (
          <span className="text-[10px] font-mono tracking-luxury uppercase text-muted-foreground block">
            {eyebrow}
          </span>
        )}
        <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-foreground">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </div>
  );
}
