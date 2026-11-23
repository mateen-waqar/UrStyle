"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { OutfitCard } from "@/components/common/OutfitCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Bookmark, Sparkles, Loader2 } from "lucide-react";

export default function SavedOutfitsPage() {
  const [savedOutfits, setSavedOutfits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSavedOutfits() {
      try {
        setLoading(true);
        const res = await fetch("/api/outfits");
        if (!res.ok) {
          throw new Error("Failed to load saved outfits");
        }
        const data = await res.json();
        setSavedOutfits(data.savedOutfits || []);
      } catch (err: any) {
        console.error("Error loading saved outfits:", err);
        setError(err.message || "Could not load saved outfits");
      } finally {
        setLoading(false);
      }
    }

    loadSavedOutfits();
  }, []);

  const handleRemoveBookmark = async (savedOutfitId: string) => {
    // Optimistic UI update
    const previous = [...savedOutfits];
    setSavedOutfits((prev) => prev.filter((o) => o.id !== savedOutfitId));

    try {
      const res = await fetch(`/api/saved-outfits/${savedOutfitId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to remove bookmark");
      }
    } catch (err) {
      console.error("Failed to delete saved outfit:", err);
      // Revert if failed
      setSavedOutfits(previous);
    }
  };

  return (
    <div className="space-y-8">
      <Header
        eyebrow="Personal Archive • Bookmarked Looks"
        title="Saved Outfits"
        description="Your personal archive of bookmarked ensembles and favorite combinations."
        actions={
          <Link href="/outfits">
            <Button size="sm" variant="default" className="gap-2 text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Explore Generator</span>
            </Button>
          </Link>
        }
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="h-6 w-6 animate-spin text-charcoal/60" />
          <p className="text-xs text-muted-foreground font-mono">Loading your saved archive...</p>
        </div>
      ) : savedOutfits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedOutfits.map((entry) => {
            const outfit = entry.outfit;
            const items = (outfit?.items || []).map((it: any) => ({
              slot: it.slot,
              name: it.wardrobeItem?.name || "Garment",
              category: it.wardrobeItem?.category || "TOP",
              colorPrimary: it.wardrobeItem?.colorPrimary || "#292624",
              imageUrl: it.wardrobeItem?.imageUrl || undefined,
            }));

            const stylingTip =
              outfit?.stylingInstructions?.[0]?.instruction ||
              outfit?.description ||
              "Designed for refined balance and natural proportion.";

            return (
              <OutfitCard
                key={entry.id}
                id={entry.id}
                title={outfit?.title || "Curated Ensemble"}
                occasion={outfit?.occasion || "CASUAL_OUTING"}
                formality={outfit?.formality || "SMART_CASUAL"}
                compatibilityScore={outfit?.compatibilityScore ?? 0.9}
                items={items}
                stylingTip={stylingTip}
                isSaved={true}
                onBookmarkToggle={() => handleRemoveBookmark(entry.id)}
              />
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No saved outfits yet"
          description="Save generated combinations or build your own looks to store them here for easy daily access."
          icon={Bookmark}
          actionLabel="Generate an Outfit"
          onAction={() => (window.location.href = "/outfits")}
        />
      )}
    </div>
  );
}
