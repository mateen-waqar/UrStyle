import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    positive?: boolean;
  };
  icon?: LucideIcon;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-xl border border-border/80 bg-card p-5 sm:p-6 shadow-subtle transition-all duration-300 hover:border-charcoal/30 hover:shadow-card",
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <span className="text-[10px] font-mono tracking-luxury uppercase text-muted-foreground">
          {title}
        </span>
        {Icon && (
          <div className="h-8 w-8 rounded-lg bg-atelier-100 border border-border/70 flex items-center justify-center text-charcoal shadow-subtle shrink-0">
            <Icon className="h-3.5 w-3.5" />
          </div>
        )}
      </div>

      <div className="mt-4 space-y-1">
        <div className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-foreground">
          {value}
        </div>
        {(subtitle || trend) && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {trend && (
              <span
                className={cn(
                  "font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded",
                  trend.positive
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-amber-50 text-amber-800 border border-amber-200"
                )}
              >
                {trend.value}
              </span>
            )}
            {subtitle && <span className="text-muted-foreground/90">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
