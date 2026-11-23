"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ItemPickerModal } from "@/components/builder/ItemPickerModal";
import { StyleAssistantDrawer } from "@/components/styling/StyleAssistantDrawer";
import { ruleEvaluationEngine, DetailedOutfitScore } from "@/modules/outfit-generation-engine/services/ruleEvaluationEngine";
import { styleRuleEvaluator, StylingAnalysisResult } from "@/modules/outfit-styling-engine/services/styleRuleEvaluator";
import { WardrobeItemDto } from "@/types";
import {
  Plus,
  Box,
  Save,
  Sparkles,
  X,
  Check,
  Lock,
  Unlock,
  Trash2,
  Shirt,
  RefreshCw,
  Compass,
  AlertCircle,
  Layers,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SlotConfig {
  key: "TOP" | "BOTTOM" | "FOOTWEAR" | "OUTERWEAR" | "ACCESSORY" | "EYEWEAR";
  label: string;
  category: string;
  isEssential: boolean;
  desc: string;
}

const SLOTS: SlotConfig[] = [
  { key: "TOP", label: "Top Garment", category: "TOP", isEssential: true, desc: "Shirts, knits, polos, t-shirts" },
  { key: "BOTTOM", label: "Trousers & Bottoms", category: "BOTTOM", isEssential: true, desc: "Pants, chinos, denim, trousers" },
  { key: "FOOTWEAR", label: "Footwear", category: "FOOTWEAR", isEssential: true, desc: "Loafers, sneakers, boots, formal shoes" },
  { key: "OUTERWEAR", label: "Outerwear (Optional)", category: "OUTERWEAR", isEssential: false, desc: "Blazers, coats, jackets, overcoats" },
  { key: "ACCESSORY", label: "Accessories (Optional)", category: "ACCESSORY", isEssential: false, desc: "Watches, belts, hats, bags, scarves" },
  { key: "EYEWEAR", label: "Eyewear (Optional)", category: "ACCESSORY", isEssential: false, desc: "Sunglasses, optical frames" },
];

export default function CustomOutfitBuilderPage() {
  // Slots state: maps slot key to selected wardrobe item
  const [selectedItems, setSelectedItems] = useState<Partial<Record<SlotConfig["key"], WardrobeItemDto>>>({});
  // Locked slots state: prevents items from being cleared or changed during random fills
  const [lockedSlots, setLockedSlots] = useState<Set<string>>(new Set());

  // Settings
  const [outfitTitle, setOutfitTitle] = useState("My Curated Ensemble");
  const [occasion, setOccasion] = useState("CASUAL_OUTING");
  const [formality, setFormality] = useState("SMART_CASUAL");
  const [season, setSeason] = useState("ALL_SEASON");

  // Active Picker Modal state
  const [activePickerSlot, setActivePickerSlot] = useState<SlotConfig | null>(null);

  // Style Assistant Drawer state
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantResult, setAssistantResult] = useState<StylingAnalysisResult | null>(null);

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Real wardrobe initial loader
  const [availableItems, setAvailableItems] = useState<WardrobeItemDto[]>([]);

  useEffect(() => {
    const fetchWardrobe = async () => {
      try {
        const res = await fetch("/api/wardrobe?status=AVAILABLE&limit=100");
        if (res.ok) {
          const data = await res.json();
          setAvailableItems(data.items || []);

          // Pre-populate initial top, bottom, footwear if available and nothing is selected
          const top = data.items.find((i: WardrobeItemDto) => i.category === "TOP");
          const bottom = data.items.find((i: WardrobeItemDto) => i.category === "BOTTOM");
          const shoes = data.items.find((i: WardrobeItemDto) => i.category === "FOOTWEAR");

          setSelectedItems({
            ...(top ? { TOP: top } : {}),
            ...(bottom ? { BOTTOM: bottom } : {}),
            ...(shoes ? { FOOTWEAR: shoes } : {}),
          });
        }
      } catch (err) {
        console.error("Wardrobe initial load error:", err);
      }
    };
    fetchWardrobe();
  }, []);

  // Compute active items array
  const activeItemsList = useMemo(() => {
    return Object.values(selectedItems).filter(Boolean) as WardrobeItemDto[];
  }, [selectedItems]);

  // Live Deterministic Score Calculation
  const liveScore = useMemo<DetailedOutfitScore | null>(() => {
    if (activeItemsList.length === 0) return null;
    return ruleEvaluationEngine.scoreOutfit(
      activeItemsList,
      occasion as any,
      formality as any,
      season
    );
  }, [activeItemsList, occasion, formality, season]);

  // Essential Categories Validation
  const validationStatus = useMemo(() => {
    const missing: string[] = [];
    if (!selectedItems.TOP) missing.push("Top");
    if (!selectedItems.BOTTOM) missing.push("Bottom");
    if (!selectedItems.FOOTWEAR) missing.push("Footwear");

    const isComplete = missing.length === 0;

    // Sartorial warnings
    const warnings: string[] = [];
    if (selectedItems.FOOTWEAR && selectedItems.BOTTOM) {
      const isFormalShoe = ["Formal shoes", "Oxfords", "Derbies"].includes(selectedItems.FOOTWEAR.subCategory);
      const isAthleticBottom = ["Joggers", "Shorts"].includes(selectedItems.BOTTOM.subCategory);
      if (isFormalShoe && isAthleticBottom) {
        warnings.push("Formality clash: Formal dress shoes paired with athletic bottoms.");
      }
    }
    if (selectedItems.OUTERWEAR && season === "SUMMER") {
      if (["Coats", "Overcoats"].includes(selectedItems.OUTERWEAR.subCategory)) {
        warnings.push("Seasonal clash: Heavy outerwear in summer climate.");
      }
    }

    return {
      isComplete,
      missing,
      warnings,
    };
  }, [selectedItems, season]);

  // Slot handlers
  const handleSelectItem = (item: WardrobeItemDto) => {
    if (!activePickerSlot) return;
    setSelectedItems((prev) => ({
      ...prev,
      [activePickerSlot.key]: item,
    }));
  };

  const handleClearSlot = (key: SlotConfig["key"]) => {
    if (lockedSlots.has(key)) return;
    setSelectedItems((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const toggleLock = (key: SlotConfig["key"]) => {
    setLockedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Smart Random Fill / Suggest remaining unlocked pieces
  const handleSmartFill = () => {
    const newSelections = { ...selectedItems };

    SLOTS.forEach((slot) => {
      if (!lockedSlots.has(slot.key)) {
        const matchingCategoryItems = availableItems.filter((i) => {
          if (slot.key === "ACCESSORY") {
            return ["ACCESSORY", "TIMEPIECE", "BAG"].includes(i.category);
          }
          if (slot.key === "EYEWEAR") {
            return i.category === "EYEWEAR" || i.subCategory.toLowerCase().includes("glasses");
          }
          return i.category === slot.category;
        });

        if (matchingCategoryItems.length > 0) {
          const randomIndex = Math.floor(Math.random() * matchingCategoryItems.length);
          newSelections[slot.key] = matchingCategoryItems[randomIndex];
        }
      }
    });

    setSelectedItems(newSelections);
  };

  // Open Style My Fit Assistant
  const handleOpenStyleAssistant = () => {
    if (activeItemsList.length === 0) return;
    const result = styleRuleEvaluator.evaluateOutfit(activeItemsList, occasion, formality);
    setAssistantResult(result);
    setIsAssistantOpen(true);
  };

  // Save Custom Outfit to Database
  const handleSaveOutfit = async () => {
    if (!validationStatus.isComplete) return;
    setIsSaving(true);
    setSaveError(null);

    try {
      const itemsPayload = Object.entries(selectedItems)
        .filter(([_, item]) => Boolean(item))
        .map(([slotKey, item]) => {
          let slotName = "INNER_TOP";
          if (slotKey === "BOTTOM") slotName = "BOTTOM";
          else if (slotKey === "FOOTWEAR") slotName = "FOOTWEAR";
          else if (slotKey === "OUTERWEAR") slotName = "OUTER_TOP";
          else if (slotKey === "ACCESSORY") slotName = "WRIST";
          else if (slotKey === "EYEWEAR") slotName = "FACE";

          return {
            wardrobeItemId: item!.id,
            slot: slotName,
            layerIndex: slotKey === "OUTERWEAR" ? 1 : 0,
          };
        });

      const res = await fetch("/api/custom-outfits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: outfitTitle.trim() || "Custom Wardrobe Ensemble",
          occasion,
          formality,
          season,
          compatibilityScore: liveScore?.compositeScore || 0.85,
          items: itemsPayload,
          stylingInstructions: assistantResult?.recommendations || [],
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save outfit");
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || "Failed to save outfit");
    } finally {
      setIsSaving(false);
    }
  };

  const virtualStudioUrl = useMemo(() => {
    const ids = activeItemsList.map((i) => i.id).join(",");
    return `/studio?items=${ids}`;
  }, [activeItemsList]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <Header
        eyebrow="Custom Outfit Builder • Live Silhouette Synthesis"
        title="Custom Outfit Builder"
        description="Select garments, lock core anchors, analyze live rule compatibility, and test in the 3D Virtual Studio."
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSmartFill}
              className="gap-2 text-xs border-border hover:bg-atelier-100"
              title="Suggest matching garments for unlocked slots"
            >
              <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Smart Fill</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenStyleAssistant}
              disabled={activeItemsList.length === 0}
              className="gap-2 text-xs border-border hover:bg-atelier-100"
            >
              <Compass className="h-3.5 w-3.5 text-charcoal" />
              <span>Style My Fit</span>
            </Button>

            <Link href={virtualStudioUrl}>
              <Button
                variant="outline"
                size="sm"
                disabled={activeItemsList.length === 0}
                className="gap-2 text-xs border-border hover:bg-atelier-100"
              >
                <Box className="h-3.5 w-3.5 text-beige-600" />
                <span>Virtual Studio</span>
                <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
              </Button>
            </Link>

            <Button
              size="sm"
              onClick={handleSaveOutfit}
              disabled={isSaving || !validationStatus.isComplete}
              className="gap-2 text-xs bg-charcoal text-cream hover:bg-charcoal/90 shadow-subtle"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Outfit</span>
                </>
              )}
            </Button>
          </div>
        }
      />

      {/* Main Builder Grid: Left = Interactive Slots, Right = Live Outfit Summary Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Garment Architecture Slots */}
        <div className="lg:col-span-7 space-y-4">
          {/* Metadata Bar */}
          <div className="p-4 rounded-xl border border-border bg-card shadow-subtle flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={outfitTitle}
                onChange={(e) => setOutfitTitle(e.target.value)}
                placeholder="Give your look a title..."
                className="w-full bg-transparent font-serif text-base font-medium text-foreground focus:outline-none focus:border-b focus:border-charcoal pb-0.5"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="h-8 px-2.5 rounded-lg border border-border bg-atelier-100/60 text-xs font-medium text-foreground focus:outline-none"
              >
                <option value="CASUAL_OUTING">Casual Outing</option>
                <option value="OFFICE">Office</option>
                <option value="DATE">Date</option>
                <option value="UNIVERSITY">University</option>
                <option value="PARTY">Party</option>
                <option value="WEDDING">Wedding</option>
                <option value="FORMAL_EVENT">Formal Event</option>
                <option value="GYM">Gym</option>
                <option value="TRAVEL">Travel</option>
              </select>

              <select
                value={formality}
                onChange={(e) => setFormality(e.target.value)}
                className="h-8 px-2.5 rounded-lg border border-border bg-atelier-100/60 text-xs font-medium text-foreground focus:outline-none"
              >
                <option value="CASUAL">Casual</option>
                <option value="SMART_CASUAL">Smart Casual</option>
                <option value="BUSINESS_CASUAL">Business Casual</option>
                <option value="BUSINESS_FORMAL">Business Formal</option>
              </select>
            </div>
          </div>

          {/* Validation Banner if missing essential pieces */}
          {!validationStatus.isComplete && (
            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-xs flex items-center justify-between gap-2 animate-fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-700 shrink-0" />
                <span>
                  Please select essential garments:{" "}
                  <strong>{validationStatus.missing.join(", ")}</strong> to complete the outfit.
                </span>
              </div>
            </div>
          )}

          {/* Warning Banner if sartorial clash detected */}
          {validationStatus.warnings.length > 0 && (
            <div className="p-3.5 rounded-xl border border-red-200 bg-red-50 text-red-900 text-xs space-y-1 animate-fade-in">
              {validationStatus.warnings.map((w, i) => (
                <div key={i} className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}

          {saveError && (
            <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-800 text-xs">
              {saveError}
            </div>
          )}

          {/* Slot Cards List */}
          <div className="space-y-3">
            {SLOTS.map((slot) => {
              const item = selectedItems[slot.key];
              const isLocked = lockedSlots.has(slot.key);

              return (
                <div
                  key={slot.key}
                  className={cn(
                    "p-4 rounded-xl border bg-card shadow-subtle transition-all flex items-center justify-between gap-4",
                    item ? "border-border/90" : "border-dashed border-border/80 bg-card/60"
                  )}
                >
                  {/* Slot Visual & Info */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div
                      onClick={() => setActivePickerSlot(slot)}
                      className={cn(
                        "relative h-16 w-16 rounded-xl border overflow-hidden flex items-center justify-center shrink-0 cursor-pointer group transition-all",
                        item
                          ? "border-border/80 bg-atelier-200/50 hover:border-charcoal"
                          : "border-dashed border-border bg-atelier-100/50 hover:bg-atelier-200/60"
                      )}
                    >
                      {item ? (
                        item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div
                            className="h-8 w-8 rounded-lg flex items-center justify-center shadow-sm"
                            style={{ backgroundColor: item.colorPrimary }}
                          >
                            <Shirt className="h-4 w-4 text-white/90" />
                          </div>
                        )
                      ) : (
                        <Plus className="h-5 w-5 text-muted-foreground group-hover:text-charcoal transition-colors" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                          {slot.label}
                        </span>
                        {slot.isEssential && (
                          <span className="text-[9px] font-mono text-charcoal/70 bg-atelier-200 px-1.5 py-0.2 rounded">
                            Required
                          </span>
                        )}
                      </div>

                      {item ? (
                        <div>
                          {item.brand && (
                            <p className="text-[10px] font-mono tracking-luxury uppercase text-muted-foreground truncate">
                              {item.brand}
                            </p>
                          )}
                          <p className="text-sm font-medium text-foreground truncate">
                            {item.name}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                            <span className="capitalize">{item.subCategory}</span>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <span
                                className="h-2 w-2 rounded-full border border-border"
                                style={{ backgroundColor: item.colorPrimary }}
                              />
                              <span className="font-mono text-[10px] uppercase">
                                {item.colorPrimary}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground/70 mt-0.5">
                          {slot.desc}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Slot Controls: Replace, Lock, Remove */}
                  <div className="flex items-center gap-2 shrink-0">
                    {item ? (
                      <>
                        <button
                          type="button"
                          onClick={() => toggleLock(slot.key)}
                          className={cn(
                            "h-8 w-8 rounded-lg border flex items-center justify-center transition-colors",
                            isLocked
                              ? "border-charcoal bg-charcoal text-cream shadow-subtle"
                              : "border-border text-muted-foreground hover:text-charcoal hover:bg-atelier-100"
                          )}
                          title={isLocked ? "Slot locked (preserved during smart fill)" : "Lock slot"}
                        >
                          {isLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                        </button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActivePickerSlot(slot)}
                          className="text-xs h-8 px-2.5 border-border hover:bg-atelier-100"
                        >
                          Replace
                        </Button>

                        <button
                          type="button"
                          disabled={isLocked}
                          onClick={() => handleClearSlot(slot.key)}
                          className={cn(
                            "h-8 w-8 rounded-lg border flex items-center justify-center transition-colors",
                            isLocked
                              ? "opacity-30 cursor-not-allowed border-border text-muted-foreground"
                              : "border-border text-muted-foreground hover:text-red-600 hover:bg-red-50 hover:border-red-200"
                          )}
                          title="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => setActivePickerSlot(slot)}
                        className="bg-charcoal text-cream hover:bg-charcoal/90 text-xs h-8 px-3 shadow-subtle flex items-center gap-1.5"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Select</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Outfit Summary Stage */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-6">
          <div className="p-5 rounded-2xl border border-border bg-card shadow-card space-y-5">
            {/* Live Header & Harmony Metric */}
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground block">
                  Live Outfit Synthesis
                </span>
                <h3 className="font-serif text-lg font-semibold text-foreground tracking-tight mt-0.5">
                  {outfitTitle || "Custom Outfit"}
                </h3>
              </div>

              {liveScore ? (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-beige-100 border border-beige-300 text-charcoal shadow-subtle">
                  <Sparkles className="h-3.5 w-3.5 text-beige-600" />
                  <span className="text-xs font-mono font-bold">
                    {Math.round(liveScore.compositeScore * 100)}%
                  </span>
                </div>
              ) : null}
            </div>

            {/* Visual Collage Stage */}
            <div className="relative aspect-[4/3] rounded-xl bg-atelier-100/60 border border-border overflow-hidden flex items-center justify-center p-4">
              {activeItemsList.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 w-full h-full">
                  {activeItemsList.slice(0, 6).map((item, i) => (
                    <div
                      key={item.id}
                      className="relative rounded-lg bg-card border border-border/80 overflow-hidden flex items-center justify-center shadow-subtle"
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div
                          className="h-8 w-8 rounded-lg flex items-center justify-center shadow-sm"
                          style={{ backgroundColor: item.colorPrimary }}
                        >
                          <Shirt className="h-4 w-4 text-white/90" />
                        </div>
                      )}
                      <div className="absolute bottom-1 left-1 right-1">
                        <span className="text-[8px] font-mono uppercase px-1 py-0.5 rounded bg-card/90 border border-border/60 text-muted-foreground truncate block text-center">
                          {item.subCategory}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center space-y-2 p-6">
                  <Shirt className="h-8 w-8 text-muted-foreground/60" />
                  <p className="text-xs font-medium text-foreground">
                    No garments selected yet
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Select garments from the left or click Smart Fill to begin.
                  </p>
                </div>
              )}
            </div>

            {/* Color Palette Harmonization Bar */}
            {liveScore && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    Palette Distribution
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {liveScore.breakdown.colorMatch}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {Array.from(new Set(activeItemsList.map((i) => i.colorPrimary))).map((color, i) => (
                    <div
                      key={i}
                      className="h-5 w-5 rounded-full border border-border shadow-subtle"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 6-Dimension Score Breakdown */}
            {liveScore && (
              <div className="pt-2 border-t border-border/60 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block">
                  Rule Evaluation Matrix
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-atelier-100/60 border border-border/50">
                    <span className="text-[9px] font-mono uppercase text-muted-foreground block">
                      Color (25%)
                    </span>
                    <span className="font-semibold text-foreground">
                      {Math.round(liveScore.colorScore * 100)}%
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-atelier-100/60 border border-border/50">
                    <span className="text-[9px] font-mono uppercase text-muted-foreground block">
                      Style (25%)
                    </span>
                    <span className="font-semibold text-foreground">
                      {Math.round(liveScore.styleScore * 100)}%
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-atelier-100/60 border border-border/50">
                    <span className="text-[9px] font-mono uppercase text-muted-foreground block">
                      Occasion (20%)
                    </span>
                    <span className="font-semibold text-foreground">
                      {Math.round(liveScore.occasionScore * 100)}%
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-atelier-100/60 border border-border/50">
                    <span className="text-[9px] font-mono uppercase text-muted-foreground block">
                      Formality (15%)
                    </span>
                    <span className="font-semibold text-foreground">
                      {Math.round(liveScore.formalityScore * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-3 border-t border-border/60 flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={handleOpenStyleAssistant}
                disabled={activeItemsList.length === 0}
                className="w-full text-xs h-10 border-border hover:bg-atelier-100 flex items-center justify-center gap-2"
              >
                <Compass className="h-4 w-4 text-charcoal" />
                <span>Analyze with Style My Fit</span>
              </Button>

              <Link href={virtualStudioUrl} className="w-full">
                <Button
                  className="w-full bg-charcoal text-cream hover:bg-charcoal/90 text-xs h-10 shadow-subtle flex items-center justify-center gap-2"
                  disabled={activeItemsList.length === 0}
                >
                  <Box className="h-4 w-4 text-beige-300" />
                  <span>Send to 3D Virtual Studio</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Item Picker Modal */}
      {activePickerSlot && (
        <ItemPickerModal
          isOpen={Boolean(activePickerSlot)}
          onClose={() => setActivePickerSlot(null)}
          onSelect={handleSelectItem}
          categoryFilter={activePickerSlot.category}
          currentSelectedId={selectedItems[activePickerSlot.key]?.id}
          slotTitle={activePickerSlot.label}
        />
      )}

      {/* Style My Fit Assistant Drawer */}
      <StyleAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        stylingResult={assistantResult}
        scoreResult={liveScore}
        outfitTitle={outfitTitle}
        occasion={occasion}
      />
    </div>
  );
}
