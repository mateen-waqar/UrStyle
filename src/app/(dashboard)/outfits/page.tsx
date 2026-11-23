"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import { OutfitCardSkeleton } from "@/components/common/LoadingSkeleton";
import { GeneratedOutfitCard } from "@/components/outfits/GeneratedOutfitCard";
import { OutfitDetailsModal } from "@/components/outfits/OutfitDetailsModal";
import { GeneratedOutfitCandidate } from "@/modules/outfit-generation-engine/types";
import { COLOR_PALETTE_PRESETS } from "@/modules/digital-wardrobe/constants";
import {
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  Shirt,
  Box,
  Layers,
  AlertCircle,
  Plus,
  Check,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

const OCCASIONS = [
  { key: "CASUAL_OUTING", label: "Casual Outing" },
  { key: "OFFICE", label: "Office" },
  { key: "DATE", label: "Date" },
  { key: "UNIVERSITY", label: "University" },
  { key: "PARTY", label: "Party" },
  { key: "WEDDING", label: "Wedding" },
  { key: "FORMAL_EVENT", label: "Formal Event" },
  { key: "GYM", label: "Gym" },
  { key: "TRAVEL", label: "Travel" },
];

const STYLE_TYPES = [
  { key: "SMART_CASUAL", label: "Smart Casual" },
  { key: "CASUAL", label: "Casual" },
  { key: "MINIMAL", label: "Minimal" },
  { key: "OLD_MONEY", label: "Old Money" },
  { key: "STREETWEAR", label: "Streetwear" },
  { key: "FORMAL", label: "Formal" },
  { key: "SPORTY", label: "Sporty" },
  { key: "BUSINESS_CASUAL", label: "Business Casual" },
];

const SEASONS = [
  { key: "ALL_SEASON", label: "All Season" },
  { key: "SPRING", label: "Spring" },
  { key: "SUMMER", label: "Summer" },
  { key: "FALL", label: "Fall" },
  { key: "WINTER", label: "Winter" },
];

export default function OutfitsPage() {
  // Generator Inputs
  const [occasion, setOccasion] = useState<string>("CASUAL_OUTING");
  const [preferredStyle, setPreferredStyle] = useState<string>("SMART_CASUAL");
  const [season, setSeason] = useState<string>("ALL_SEASON");
  const [optionalColorPreference, setOptionalColorPreference] = useState<string>("");
  const [numberOfOutfits, setNumberOfOutfits] = useState<number>(4);
  const [excludeRecentlyGenerated, setExcludeRecentlyGenerated] = useState<boolean>(true);

  // UI & Data State
  const [outfits, setOutfits] = useState<GeneratedOutfitCandidate[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [missingCategories, setMissingCategories] = useState<string[]>([]);
  const [savedOutfitIds, setSavedOutfitIds] = useState<Set<string>>(new Set());

  // Modal State
  const [selectedOutfit, setSelectedOutfit] = useState<GeneratedOutfitCandidate | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [isControlsExpanded, setIsControlsExpanded] = useState<boolean>(true);

  // Generate Outfits Function
  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    setMissingCategories([]);

    try {
      const payload = {
        occasion,
        preferredStyle,
        season,
        optionalColorPreference: optionalColorPreference || undefined,
        numberOfOutfits,
        excludeRecentlyGeneratedOutfits: excludeRecentlyGenerated,
      };

      const res = await fetch("/api/outfits/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate outfits");
      }

      if (data.missingCategories && data.missingCategories.length > 0) {
        setMissingCategories(data.missingCategories);
        setOutfits([]);
      } else {
        setOutfits(data.outfits || []);
      }
    } catch (err: any) {
      console.error("Generate error:", err);
      setErrorMessage(err.message || "An unexpected error occurred during generation");
    } finally {
      setIsGenerating(false);
    }
  }, [
    occasion,
    preferredStyle,
    season,
    optionalColorPreference,
    numberOfOutfits,
    excludeRecentlyGenerated,
  ]);

  // Initial generation on mount
  useEffect(() => {
    handleGenerate();
  }, [handleGenerate]);

  // Save outfit handler
  const handleSaveOutfit = async (outfit: GeneratedOutfitCandidate) => {
    try {
      const payload = {
        title: outfit.title,
        description: outfit.description,
        occasion: outfit.occasion,
        formality: outfit.items[0]?.item.formality || "SMART_CASUAL",
        season: outfit.season,
        compatibilityScore: outfit.score.compositeScore,
        colorHarmonyScore: outfit.score.colorScore,
        styleBalanceScore: outfit.score.styleScore,
        items: outfit.items.map((slotItem) => ({
          wardrobeItemId: slotItem.item.id,
          slot: slotItem.slot,
          layerIndex: slotItem.layerIndex,
        })),
        stylingInstructions: [
          { slot: "INNER_TOP", instruction: outfit.stylingAdvice.shirtTuck },
          { slot: "FOOTWEAR", instruction: outfit.stylingAdvice.footwearPairing },
          { slot: "WRIST", instruction: outfit.stylingAdvice.beltRecommendation },
        ],
      };

      const res = await fetch("/api/outfits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to save outfit");
      }

      setSavedOutfitIds((prev) => {
        const next = new Set(prev);
        next.add(outfit.id);
        return next;
      });
    } catch (err: any) {
      console.error("Save outfit error:", err);
    }
  };

  const handleOpenDetails = (outfit: GeneratedOutfitCandidate) => {
    setSelectedOutfit(outfit);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <Header
        eyebrow="Deterministic Engine • 100% Rule Harmony"
        title="Intelligent Outfit Engine"
        description="Deterministic sartorial synthesis. Combinatorial compatibility rules, color theory, and controlled diversity with zero external AI calls."
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsControlsExpanded((p) => !p)}
              className="gap-2 text-xs border-border hover:bg-atelier-100"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{isControlsExpanded ? "Hide Controls" : "Adjust Parameters"}</span>
            </Button>

            <Button
              size="sm"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="gap-2 text-xs bg-charcoal text-cream hover:bg-charcoal/90 shadow-subtle"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isGenerating ? "animate-spin" : "")} />
              <span>{isGenerating ? "Synthesizing..." : "Regenerate Outfits"}</span>
            </Button>
          </div>
        }
      />

      {/* Generator Control Panel */}
      {isControlsExpanded && (
        <div className="p-5 sm:p-6 rounded-2xl border border-border bg-card shadow-subtle space-y-5 animate-fade-in">
          {/* Occasion Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Occasion Setting
              </span>
              <span className="text-[11px] font-mono text-muted-foreground capitalize">
                {occasion.toLowerCase().replace("_", " ")}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {OCCASIONS.map((occ) => {
                const active = occasion === occ.key;
                return (
                  <button
                    key={occ.key}
                    type="button"
                    onClick={() => setOccasion(occ.key)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                      active
                        ? "border-charcoal bg-charcoal text-cream shadow-subtle font-semibold"
                        : "border-border bg-card text-muted-foreground hover:bg-atelier-100 hover:text-charcoal"
                    )}
                  >
                    {occ.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Style Aesthetic & Season */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-border/60">
            {/* Preferred Style */}
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-2">
                Preferred Aesthetic
              </span>
              <div className="flex flex-wrap gap-1.5">
                {STYLE_TYPES.map((sty) => {
                  const active = preferredStyle === sty.key;
                  return (
                    <button
                      key={sty.key}
                      type="button"
                      onClick={() => setPreferredStyle(sty.key)}
                      className={cn(
                        "px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all",
                        active
                          ? "border-charcoal bg-atelier-300 text-charcoal font-semibold shadow-subtle"
                          : "border-border bg-card text-muted-foreground hover:bg-atelier-100 hover:text-charcoal"
                      )}
                    >
                      {sty.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Climate & Season */}
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-2">
                Seasonality & Climate
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SEASONS.map((s) => {
                  const active = season === s.key;
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setSeason(s.key)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                        active
                          ? "border-charcoal bg-charcoal text-cream font-semibold shadow-subtle"
                          : "border-border bg-card text-muted-foreground hover:bg-atelier-100 hover:text-charcoal"
                      )}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Color Preference & Number of Outfits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-border/60 items-center">
            {/* Color Preference */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Optional Hero Color Focus
                </span>
                {optionalColorPreference && (
                  <button
                    type="button"
                    onClick={() => setOptionalColorPreference("")}
                    className="text-[10px] text-muted-foreground hover:text-charcoal underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOptionalColorPreference("")}
                  className={cn(
                    "px-2 py-1 rounded text-[11px] font-medium border transition-all",
                    !optionalColorPreference
                      ? "border-charcoal bg-atelier-200 text-charcoal font-semibold"
                      : "border-border text-muted-foreground"
                  )}
                >
                  Any Tone
                </button>
                {COLOR_PALETTE_PRESETS.slice(0, 8).map((col) => {
                  const active = optionalColorPreference === col.hex;
                  return (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => setOptionalColorPreference(col.hex)}
                      title={col.label}
                      className={cn(
                        "h-6 w-6 rounded-full border border-border shadow-subtle flex items-center justify-center transition-transform hover:scale-110",
                        active ? "ring-2 ring-charcoal ring-offset-1" : ""
                      )}
                      style={{ backgroundColor: col.hex }}
                    >
                      {active && (
                        <Check
                          className={cn(
                            "h-3 w-3",
                            col.hex === "#FFFFFF" || col.hex === "#F5F2EB"
                              ? "text-charcoal"
                              : "text-white"
                          )}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Outfits Count & Controlled Variety */}
            <div className="flex items-center justify-between sm:justify-end gap-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">
                  Candidates: {numberOfOutfits}
                </span>
                <input
                  type="range"
                  min="2"
                  max="8"
                  value={numberOfOutfits}
                  onChange={(e) => setNumberOfOutfits(Number(e.target.value))}
                  className="w-28 accent-charcoal cursor-pointer"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-muted-foreground hover:text-foreground">
                <input
                  type="checkbox"
                  checked={excludeRecentlyGenerated}
                  onChange={(e) => setExcludeRecentlyGenerated(e.target.checked)}
                  className="rounded border-border text-charcoal focus:ring-charcoal"
                />
                <span>Diverse Rotation</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Error / Missing Categories Alert */}
      {missingCategories.length > 0 && (
        <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/70 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold tracking-tight">
                Wardrobe Inventory Required
              </h4>
              <p className="text-xs text-amber-800/90 mt-0.5">
                The outfit engine requires available garments in{" "}
                <span className="font-semibold underline">
                  {missingCategories.join(" and ")}
                </span>{" "}
                to generate complete ensembles. Make sure your pieces are marked as{" "}
                <span className="font-mono uppercase font-bold text-[11px]">Available</span> in your closet.
              </p>
            </div>
          </div>
          <Link href="/wardrobe" className="shrink-0">
            <Button size="sm" className="bg-amber-900 text-white hover:bg-amber-950 text-xs gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              <span>Add to Wardrobe</span>
            </Button>
          </Link>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Outfits Display Grid */}
      {isGenerating ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {Array.from({ length: numberOfOutfits }).map((_, idx) => (
            <OutfitCardSkeleton key={idx} />
          ))}
        </div>
      ) : outfits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {outfits.map((outfit) => (
            <GeneratedOutfitCard
              key={outfit.id}
              outfit={outfit}
              onViewDetails={handleOpenDetails}
              onSave={handleSaveOutfit}
              isSaved={savedOutfitIds.has(outfit.id)}
            />
          ))}
        </div>
      ) : missingCategories.length === 0 ? (
        <EmptyState
          title="No outfits generated yet"
          description="Adjust your occasion, preferred aesthetic, or climate settings and click Generate Outfits to synthesize combinations."
          icon={Shirt}
          actionLabel="Generate Now"
          onAction={handleGenerate}
        />
      ) : null}

      {/* Outfit Details & Styling Advice Modal */}
      <OutfitDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        outfit={selectedOutfit}
        onSave={handleSaveOutfit}
        isSaved={selectedOutfit ? savedOutfitIds.has(selectedOutfit.id) : false}
      />
    </div>
  );
}
