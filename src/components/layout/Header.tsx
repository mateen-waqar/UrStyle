import React from "react";

interface HeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
}

export function Header({ title, description, eyebrow, actions }: HeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-6 border-b border-border/70">
      <div className="space-y-1">
        {eyebrow && (
          <span className="text-[10px] font-mono tracking-luxury uppercase text-muted-foreground block">
            {eyebrow}
          </span>
        )}
        <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-foreground font-serif">
          {title}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  );
}
