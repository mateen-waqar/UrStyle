"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Box, Bookmark, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface OutfitCardProps {
  id: string;
  title: string;
  occasion: string;
  formality: string;
  season?: string;
  compatibilityScore: number;
  items: Array<{
    id?: string;
    wardrobeItemId?: string;
    slot: string;
    name: string;
    category: string;
    colorPrimary?: string;
    imageUrl?: string;
  }>;
  stylingTip?: string | null;
  isSaved?: boolean;
  onBookmarkToggle?: (id: string) => void;
  className?: string;
}

export function OutfitCard({
  id,
  title,
  occasion,
  formality,
  compatibilityScore,
  items,
  stylingTip,
  isSaved = false,
  onBookmarkToggle,
  className,
}: OutfitCardProps) {
  // Construct deep link query param for 3D studio
  const itemIds = items
    .map((i) => i.wardrobeItemId || i.id)
    .filter(Boolean)
    .join(",");

  const studioUrl = itemIds
    ? `/studio?items=${encodeURIComponent(itemIds)}&outfitId=${encodeURIComponent(id)}`
    : `/studio?outfitId=${encodeURIComponent(id)}`;

  const scorePct = Math.round(compatibilityScore * 100);

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border border-border/80 bg-card p-5 sm:p-6 shadow-subtle hover:shadow-card hover:border-charcoal/30 transition-all duration-300",
        className
      )}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-border/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
              {occasion.replace("_", " ")}
            </span>
            <span className="text-border">•</span>
            <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
              {formality.replace("_", " ")}
            </span>
          </div>
          <h4 className="font-serif text-lg font-medium text-foreground tracking-tight group-hover:text-charcoal transition-colors">
            {title}
          </h4>
        </div>

        {/* Harmony Score Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-beige-100 border border-beige-300 text-charcoal shrink-0 shadow-subtle">
          <Sparkles className="h-3 w-3 text-beige-600" />
          <span className="text-xs font-mono font-semibold">
            {scorePct}%
          </span>
        </div>
      </div>

      {/* Garments Visual Stack */}
      <div className="py-4 space-y-3 flex-1">
        <span className="text-[10px] font-mono uppercase tracking-luxury text-muted-foreground/80 block">
          Garment Architecture ({items.length} pieces)
        </span>
        <div className="flex flex-wrap gap-1.5">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-atelier-100/90 border border-border/70 text-xs text-charcoal font-medium transition-colors hover:border-border hover:bg-atelier-200/80"
            >
              {item.colorPrimary && (
                <span
                  className="h-2 w-2 rounded-full border border-border/60 shrink-0"
                  style={{ backgroundColor: item.colorPrimary }}
                />
              )}
              <span className="text-muted-foreground text-[10px] font-mono">
                {item.slot.replace("INNER_", "").replace("OUTER_", "")}:
              </span>
              <span className="truncate max-w-[120px]">{item.name}</span>
            </div>
          ))}
        </div>

        {stylingTip && (
          <div className="mt-3 p-3 rounded-lg bg-atelier-50/90 border border-border/60 text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-charcoal">Styling Note: </span>
            {stylingTip}
          </div>
        )}
      </div>

      {/* Actions Footer */}
      <div className="pt-4 border-t border-border/50 flex items-center justify-between gap-3">
        <button
          onClick={() => onBookmarkToggle?.(id)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-charcoal transition-colors py-1"
        >
          <Bookmark className={cn("h-3.5 w-3.5 transition-colors", isSaved ? "fill-charcoal text-charcoal" : "")} />
          <span>{isSaved ? "Saved" : "Save look"}</span>
        </button>

        <Link href={studioUrl}>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs font-medium border-border hover:border-charcoal/40 shadow-subtle">
            <Box className="h-3.5 w-3.5 text-beige-600" />
            <span>Virtual Studio</span>
            <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
