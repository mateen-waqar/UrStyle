"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  Sparkles,
  Bookmark,
  Box,
  Shirt,
  Check,
  Layers,
  Clock,
  Compass,
  ArrowUpRight,
  Loader2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GeneratedOutfitCandidate } from "@/modules/outfit-generation-engine/types";
import { cn } from "@/lib/utils";

interface OutfitDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  outfit: GeneratedOutfitCandidate | null;
  onSave?: (outfit: GeneratedOutfitCandidate) => Promise<void>;
  isSaved?: boolean;
}

export function OutfitDetailsModal({
  isOpen,
  onClose,
  outfit,
  onSave,
  isSaved = false,
}: OutfitDetailsModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(isSaved);

  if (!isOpen || !outfit) return null;

  const scorePct = Math.round(outfit.score.compositeScore * 100);

  const handleSave = async () => {
    if (!onSave || saveSuccess) return;
    setIsSaving(true);
    try {
      await onSave(outfit);
      setSaveSuccess(true);
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-charcoal/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl bg-card border border-border shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/95">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-charcoal text-cream flex items-center justify-center shadow-subtle">
              <Sparkles className="h-4 w-4 text-beige-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                  {outfit.occasion.replace("_", " ")}
                </span>
                <span className="text-border">•</span>
                <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                  {outfit.styleLabel}
                </span>
              </div>
              <h2 className="text-lg font-serif font-semibold text-foreground tracking-tight">
                {outfit.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-charcoal hover:bg-atelier-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Garments Visual Stack */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-charcoal" />
              Sartorial Architecture
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {outfit.items.map((slotItem, idx) => {
                const item = slotItem.item;
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-border bg-atelier-100/50 flex flex-col space-y-2 hover:border-charcoal/30 transition-colors"
                  >
                    <div className="relative aspect-square w-full rounded-lg bg-card border border-border/80 overflow-hidden flex items-center justify-center">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div
                          className="h-10 w-10 rounded-xl flex items-center justify-center shadow-sm"
                          style={{ backgroundColor: item.colorPrimary }}
                        >
                          <Shirt className="h-5 w-5 text-white/90" />
                        </div>
                      )}
                      <div className="absolute top-1.5 left-1.5">
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-card/90 border border-border/60 text-muted-foreground">
                          {slotItem.slot.replace("INNER_", "").replace("OUTER_", "")}
                        </span>
                      </div>
                    </div>
                    <div>
                      {item.brand && (
                        <p className="text-[9px] font-mono tracking-wider uppercase text-muted-foreground truncate">
                          {item.brand}
                        </p>
                      )}
                      <p className="text-xs font-medium text-foreground line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground capitalize">
                        {item.subCategory}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Compatibility Breakdown (6 Dimensions) */}
          <div className="p-4 rounded-xl border border-border bg-card shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Total Compatibility Score
                </p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-serif font-bold text-foreground">
                    {scorePct}%
                  </span>
                  <span className="text-xs text-muted-foreground font-sans">
                    Deterministic Rule Evaluation
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {outfit.colorPalette.map((color, i) => (
                  <div
                    key={i}
                    className="h-4 w-4 rounded-full border border-border/80 shadow-subtle"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-border/60 text-xs">
              <div className="p-2 rounded-lg bg-atelier-100/60 border border-border/50">
                <span className="text-[10px] font-mono text-muted-foreground block uppercase">
                  Color Harmony (25%)
                </span>
                <span className="font-semibold text-foreground">
                  {Math.round(outfit.score.colorScore * 100)}%
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  {outfit.score.breakdown.colorMatch}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-atelier-100/60 border border-border/50">
                <span className="text-[10px] font-mono text-muted-foreground block uppercase">
                  Style Consistency (25%)
                </span>
                <span className="font-semibold text-foreground">
                  {Math.round(outfit.score.styleScore * 100)}%
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5 truncate">
                  {outfit.score.breakdown.styleBalance}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-atelier-100/60 border border-border/50">
                <span className="text-[10px] font-mono text-muted-foreground block uppercase">
                  Occasion Fit (20%)
                </span>
                <span className="font-semibold text-foreground">
                  {Math.round(outfit.score.occasionScore * 100)}%
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5 truncate">
                  {outfit.score.breakdown.occasionFit}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-atelier-100/60 border border-border/50">
                <span className="text-[10px] font-mono text-muted-foreground block uppercase">
                  Formality Sync (15%)
                </span>
                <span className="font-semibold text-foreground">
                  {Math.round(outfit.score.formalityScore * 100)}%
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5 truncate">
                  {outfit.score.breakdown.formalityVariance}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-atelier-100/60 border border-border/50">
                <span className="text-[10px] font-mono text-muted-foreground block uppercase">
                  Seasonality (10%)
                </span>
                <span className="font-semibold text-foreground">
                  {Math.round(outfit.score.seasonScore * 100)}%
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5 truncate">
                  {outfit.score.breakdown.seasonality}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-atelier-100/60 border border-border/50">
                <span className="text-[10px] font-mono text-muted-foreground block uppercase">
                  Pattern Balance (5%)
                </span>
                <span className="font-semibold text-foreground">
                  {Math.round(outfit.score.patternScore * 100)}%
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5 truncate">
                  {outfit.score.breakdown.patternBalance}
                </span>
              </div>
            </div>
          </div>

          {/* Editorial Styling Instructions */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Compass className="h-3.5 w-3.5 text-charcoal" />
              Tailoring & Styling Instructions
            </h3>

            <div className="space-y-3">
              {/* Shirt Tuck */}
              <div className="p-3.5 rounded-xl border border-border bg-card space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-atelier-200 text-charcoal flex items-center justify-center text-xs font-mono font-bold">
                    1
                  </div>
                  <span className="text-xs font-semibold text-foreground">
                    Waistline & Shirt Tuck
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-atelier-100/70 text-xs">
                  <span className="font-mono text-[10px] uppercase font-bold text-charcoal block mb-0.5">Action</span>
                  <p className="font-medium text-foreground">{outfit.stylingAdvice.shirtTuck}</p>
                </div>
                <div className="text-xs text-muted-foreground pl-1 space-y-1">
                  <p><strong className="text-foreground/80 font-mono text-[10px] uppercase">Reason:</strong> Balances torso-to-leg proportions and maintains intended waistline drape for {outfit.occasion.toLowerCase().replace("_", " ")} dress codes.</p>
                </div>
              </div>

              {/* Sleeve Styling */}
              <div className="p-3.5 rounded-xl border border-border bg-card space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-atelier-200 text-charcoal flex items-center justify-center text-xs font-mono font-bold">
                    2
                  </div>
                  <span className="text-xs font-semibold text-foreground">
                    Sleeve & Cuff Drape
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-atelier-100/70 text-xs">
                  <span className="font-mono text-[10px] uppercase font-bold text-charcoal block mb-0.5">Action</span>
                  <p className="font-medium text-foreground">{outfit.stylingAdvice.sleeveStyling}</p>
                </div>
                <div className="text-xs text-muted-foreground pl-1 space-y-1">
                  <p><strong className="text-foreground/80 font-mono text-[10px] uppercase">Reason:</strong> Signals active, relaxed confidence while exposing wrist anatomy and personal timepiece.</p>
                </div>
              </div>

              {/* Footwear Pairing */}
              <div className="p-3.5 rounded-xl border border-border bg-card space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-atelier-200 text-charcoal flex items-center justify-center text-xs font-mono font-bold">
                    3
                  </div>
                  <span className="text-xs font-semibold text-foreground">
                    Footwear & Trouser Break
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-atelier-100/70 text-xs">
                  <span className="font-mono text-[10px] uppercase font-bold text-charcoal block mb-0.5">Action</span>
                  <p className="font-medium text-foreground">{outfit.stylingAdvice.footwearPairing}</p>
                </div>
                <div className="text-xs text-muted-foreground pl-1 space-y-1">
                  <p><strong className="text-foreground/80 font-mono text-[10px] uppercase">Reason:</strong> Prevents awkward fabric stacking at the ankle and anchors the formality of the outfit.</p>
                </div>
              </div>

              {/* Belt & Leather Alignment */}
              <div className="p-3.5 rounded-xl border border-border bg-card space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-atelier-200 text-charcoal flex items-center justify-center text-xs font-mono font-bold">
                    4
                  </div>
                  <span className="text-xs font-semibold text-foreground">
                    Belt & Leather Alignment
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-atelier-100/70 text-xs">
                  <span className="font-mono text-[10px] uppercase font-bold text-charcoal block mb-0.5">Action</span>
                  <p className="font-medium text-foreground">{outfit.stylingAdvice.beltRecommendation}</p>
                </div>
                <div className="text-xs text-muted-foreground pl-1 space-y-1">
                  <p><strong className="text-foreground/80 font-mono text-[10px] uppercase">Reason:</strong> Maintains sartorial continuity between upper and lower leather goods.</p>
                </div>
              </div>

              {/* Accessories */}
              <div className="p-3.5 rounded-xl border border-border bg-card space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-atelier-200 text-charcoal flex items-center justify-center text-xs font-mono font-bold">
                    5
                  </div>
                  <span className="text-xs font-semibold text-foreground">
                    Accessories & Accents
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-atelier-100/70 text-xs">
                  <span className="font-mono text-[10px] uppercase font-bold text-charcoal block mb-0.5">Action</span>
                  <ul className="space-y-1 font-medium text-foreground list-disc list-inside">
                    {outfit.stylingAdvice.accessoryRecommendations.map((acc, i) => (
                      <li key={i}>{acc}</li>
                    ))}
                  </ul>
                </div>
                <div className="text-xs text-muted-foreground pl-1 space-y-1">
                  <p><strong className="text-foreground/80 font-mono text-[10px] uppercase">Reason:</strong> Introduces intentional micro-details that complete the overall look without sensory overload.</p>
                </div>
              </div>

              {/* Layering Suggestions */}
              {outfit.stylingAdvice.layeringSuggestions && (
                <div className="p-3.5 rounded-xl border border-border bg-card space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded bg-atelier-200 text-charcoal flex items-center justify-center text-xs font-mono font-bold">
                      6
                    </div>
                    <span className="text-xs font-semibold text-foreground">
                      Layering & Silhouette
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-atelier-100/70 text-xs">
                    <span className="font-mono text-[10px] uppercase font-bold text-charcoal block mb-0.5">Action</span>
                    <p className="font-medium text-foreground">{outfit.stylingAdvice.layeringSuggestions}</p>
                  </div>
                  <div className="text-xs text-muted-foreground pl-1 space-y-1">
                    <p><strong className="text-foreground/80 font-mono text-[10px] uppercase">Reason:</strong> Enhances visual depth and allows dynamic fluidity during movement.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border bg-atelier-100/60 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={isSaving || saveSuccess}
            className={cn(
              "text-xs h-10 border-border hover:bg-card flex items-center gap-1.5",
              saveSuccess ? "bg-emerald-50 text-emerald-800 border-emerald-300" : ""
            )}
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : saveSuccess ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Bookmark className="h-3.5 w-3.5" />
            )}
            <span>{saveSuccess ? "Saved to Outfits" : "Save Outfit"}</span>
          </Button>

          <Link
            href={`/studio?items=${outfit.items.map((i) => i.item.id).join(",")}`}
            className="flex-1"
          >
            <Button className="w-full bg-charcoal text-cream hover:bg-charcoal/90 text-xs h-10 shadow-subtle flex items-center justify-center gap-1.5">
              <Box className="h-3.5 w-3.5 text-beige-300" />
              <span>Try in 3D Virtual Studio</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
