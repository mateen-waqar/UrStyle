import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An error occurred while loading your sartorial data. Please refresh or try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-12 sm:p-16 rounded-xl border border-destructive/20 bg-destructive/5 space-y-4 my-6",
        className
      )}
    >
      <div className="h-12 w-12 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive shadow-subtle">
        <AlertCircle className="h-6 w-6 stroke-[1.5]" />
      </div>

      <div className="space-y-1.5 max-w-sm">
        <h4 className="font-serif text-lg font-medium text-foreground tracking-tight">
          {title}
        </h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {message}
        </p>
      </div>

      {onRetry && (
        <Button onClick={onRetry} size="sm" variant="outline" className="gap-2 mt-2">
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Try again</span>
        </Button>
      )}
    </div>
  );
}
