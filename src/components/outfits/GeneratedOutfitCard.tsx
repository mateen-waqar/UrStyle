"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Box,
  Bookmark,
  ArrowUpRight,
  Eye,
  Check,
  Loader2,
  Shirt,
} from "lucide-react";
import { GeneratedOutfitCandidate } from "@/modules/outfit-generation-engine/types";
import { cn } from "@/lib/utils";

export interface GeneratedOutfitCardProps {
  outfit: GeneratedOutfitCandidate;
  onViewDetails: (outfit: GeneratedOutfitCandidate) => void;
  onSave?: (outfit: GeneratedOutfitCandidate) => Promise<void>;
  isSaved?: boolean;
}

export function GeneratedOutfitCard({
  outfit,
  onViewDetails,
  onSave,
  isSaved = false,
}: GeneratedOutfitCardProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [savedLocal, setSavedLocal] = useState(isSaved);

  const scorePct = Math.round(outfit.score.compositeScore * 100);

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onSave || savedLocal) return;
    setIsSaving(true);
    try {
      await onSave(outfit);
      setSavedLocal(true);
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="group relative flex flex-col rounded-2xl border border-border/90 bg-card overflow-hidden shadow-card transition-all duration-300 hover:border-charcoal/40 hover:shadow-elevated select-none">
      {/* Top Header: Occasion, Style, and Score */}
      <div className="p-4 sm:p-5 border-b border-border/50 bg-card flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
              {outfit.occasion.replace("_", " ")}
            </span>
            <span className="text-border">•</span>
            <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
              {outfit.styleLabel}
            </span>
          </div>
          <h3 className="font-serif text-base sm:text-lg font-medium text-foreground tracking-tight line-clamp-1 group-hover:text-charcoal transition-colors">
            {outfit.title}
          </h3>
        </div>

        {/* Harmony Score Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-beige-100 border border-beige-300 text-charcoal shrink-0 shadow-subtle">
          <Sparkles className="h-3 w-3 text-beige-600" />
          <span className="text-xs font-mono font-semibold">
            {scorePct}%
          </span>
        </div>
      </div>

      {/* Outfit Clothing Collage */}
      <div className="p-4 sm:p-5 bg-atelier-100/50 flex-1 space-y-4">
        {/* Collage Grid Stage */}
        <div className="grid grid-cols-3 gap-2">
          {outfit.items.slice(0, 3).map((slotItem, idx) => {
            const item = slotItem.item;
            return (
              <div
                key={idx}
                className="relative aspect-[4/5] rounded-xl bg-card border border-border/70 overflow-hidden flex items-center justify-center shadow-subtle group-hover:border-charcoal/30 transition-all"
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: item.colorPrimary }}
                  >
                    <Shirt className="h-5 w-5 text-white/90" />
                  </div>
                )}
                <div className="absolute bottom-1.5 left-1.5 right-1.5">
                  <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded bg-card/90 border border-border/60 text-muted-foreground truncate block text-center backdrop-blur-xs">
                    {slotItem.slot.replace("INNER_", "").replace("OUTER_", "")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Garment Tags */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap gap-1.5">
            {outfit.items.map((slotItem, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-card border border-border/80 text-[11px] text-foreground font-medium"
              >
                <span
                  className="h-2 w-2 rounded-full border border-border/60 shrink-0"
                  style={{ backgroundColor: slotItem.item.colorPrimary }}
                />
                <span className="truncate max-w-[110px]">{slotItem.item.name}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Color Palette Swatches */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Palette Harmony
          </span>
          <div className="flex items-center gap-1.5">
            {outfit.colorPalette.map((color, i) => (
              <div
                key={i}
                className="h-3.5 w-3.5 rounded-full border border-border/80 shadow-subtle"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Quick Styling Tip Snippet */}
        <div className="p-3 rounded-lg bg-card border border-border/70 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          <span className="font-medium text-foreground">Styling: </span>
          {outfit.stylingAdvice.summary}
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="p-3 sm:p-4 border-t border-border/50 bg-card flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(outfit)}
          className="text-xs h-9 border-border hover:bg-atelier-100 flex items-center gap-1.5"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Details</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={isSaving || savedLocal}
          className={cn(
            "text-xs h-9 border-border hover:bg-atelier-100 flex items-center gap-1.5",
            savedLocal ? "bg-emerald-50 text-emerald-800 border-emerald-300" : ""
          )}
        >
          {isSaving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : savedLocal ? (
            <Check className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <Bookmark className="h-3.5 w-3.5" />
          )}
          <span>{savedLocal ? "Saved" : "Save Look"}</span>
        </Button>

        <Link
          href={`/studio?items=${outfit.items.map((i) => i.item.id).join(",")}`}
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            size="sm"
            className="bg-charcoal text-cream hover:bg-charcoal/90 text-xs h-9 shadow-subtle flex items-center gap-1.5"
          >
            <Box className="h-3.5 w-3.5 text-beige-300" />
            <span className="hidden sm:inline">Virtual Studio</span>
            <span className="sm:hidden">Studio</span>
            <ArrowUpRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
