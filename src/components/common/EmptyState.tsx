import React from "react";
import { Button } from "@/components/ui/button";
import { LucideIcon, Shirt } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon = Shirt,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-12 sm:p-16 rounded-xl border border-dashed border-border/90 bg-card/40 space-y-4 my-6",
        className
      )}
    >
      <div className="h-14 w-14 rounded-2xl bg-atelier-200 border border-border/80 flex items-center justify-center text-charcoal shadow-subtle">
        <Icon className="h-6 w-6 stroke-[1.5]" />
      </div>

      <div className="space-y-1.5 max-w-sm">
        <h4 className="font-serif text-lg font-medium text-foreground tracking-tight">
          {title}
        </h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      {actionLabel && (
        <Button onClick={onAction} size="sm" variant="default" className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
