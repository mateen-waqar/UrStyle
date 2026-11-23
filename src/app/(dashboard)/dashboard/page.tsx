"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { StatCard } from "@/components/common/StatCard";
import { GarmentCard } from "@/components/common/GarmentCard";
import { OutfitCard } from "@/components/common/OutfitCard";
import { SectionHeader } from "@/components/common/SectionHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Shirt,
  Sparkles,
  Box,
  Calendar,
  Plus,
  ArrowRight,
  TrendingUp,
  Tag,
  Loader2,
} from "lucide-react";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("there");
  const [totalItems, setTotalItems] = useState<number>(0);
  const [recentGarments, setRecentGarments] = useState<any[]>([]);
  const [recentOutfits, setRecentOutfits] = useState<any[]>([]);
  const [totalSavedOutfits, setTotalSavedOutfits] = useState<number>(0);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [savedOutfitIds, setSavedOutfitIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);

        // Fetch onboarding / profile info
        const profilePromise = fetch("/api/onboarding")
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null);

        // Fetch wardrobe items
        const wardrobePromise = fetch("/api/wardrobe?limit=5&sortBy=recently_added")
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null);

        // Fetch saved outfits
        const outfitsPromise = fetch("/api/outfits")
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null);

        const [profileData, wardrobeData, outfitsData] = await Promise.all([
          profilePromise,
          wardrobePromise,
          outfitsPromise,
        ]);

        if (profileData?.profile?.displayName) {
          setUserName(profileData.profile.displayName);
        }

        if (wardrobeData) {
          setTotalItems(wardrobeData.total || 0);
          setRecentGarments(wardrobeData.items || []);
          const favs = (wardrobeData.items || [])
            .filter((i: any) => i.isFavorite)
            .map((i: any) => i.id);
          setFavoriteIds(favs);
        }

        if (outfitsData?.savedOutfits) {
          setTotalSavedOutfits(outfitsData.savedOutfits.length);
          setRecentOutfits(outfitsData.savedOutfits.slice(0, 4));
          setSavedOutfitIds(outfitsData.savedOutfits.map((o: any) => o.id));
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleBookmark = async (id: string) => {
    const isCurrentlySaved = savedOutfitIds.includes(id);
    if (isCurrentlySaved) {
      setSavedOutfitIds((prev) => prev.filter((item) => item !== id));
      try {
        await fetch(`/api/saved-outfits/${id}`, { method: "DELETE" });
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="space-y-10">
      {/* Welcome Editorial Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/70">
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono tracking-luxury uppercase text-muted-foreground block">
            Digital Wardrobe Operating System • StyleOS Studio
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-foreground">
            Welcome back, {userName}.
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
            {totalItems > 0
              ? `Your digital wardrobe has ${totalItems} cataloged item${totalItems === 1 ? "" : "s"} ready for deterministic outfit synthesis.`
              : "Begin cataloging your wardrobe pieces to generate balanced, editorial outfit combinations."}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/wardrobe?action=new">
            <Button size="sm" variant="default" className="gap-2 text-xs">
              <Plus className="h-3.5 w-3.5" />
              <span>Add Garment</span>
            </Button>
          </Link>
          <Link href="/outfits">
            <Button size="sm" variant="secondary" className="gap-2 text-xs">
              <Sparkles className="h-3.5 w-3.5 text-beige-600" />
              <span>Generate Fit</span>
            </Button>
          </Link>
          <Link href="/builder">
            <Button size="sm" variant="outline" className="gap-2 text-xs">
              <Sparkles className="h-3.5 w-3.5 text-stone-500" />
              <span>Custom Builder</span>
            </Button>
          </Link>
          <Link href="/studio">
            <Button size="sm" variant="outline" className="gap-2 text-xs">
              <Box className="h-3.5 w-3.5 text-beige-600" />
              <span>3D Studio</span>
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="h-6 w-6 animate-spin text-charcoal/60" />
          <p className="text-xs text-muted-foreground font-mono">Loading your wardrobe statistics...</p>
        </div>
      ) : (
        <>
          {/* Wardrobe Statistics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Clothing Items"
              value={String(totalItems)}
              subtitle="Digitally cataloged"
              trend={{ value: totalItems > 0 ? "Active Closet" : "Start cataloging", positive: totalItems > 0 }}
              icon={Shirt}
            />
            <StatCard
              title="Saved Outfits"
              value={String(totalSavedOutfits)}
              subtitle="Curated ensembles"
              trend={{ value: totalSavedOutfits > 0 ? "Bookmarked looks" : "None saved yet", positive: totalSavedOutfits > 0 }}
              icon={Sparkles}
            />
            <StatCard
              title="Harmonized Looks"
              value={totalItems >= 3 ? "Available" : "Requires 3+ items"}
              subtitle="Deterministic rules"
              trend={{ value: "100% deterministic", positive: true }}
              icon={Tag}
            />
            <StatCard
              title="Virtual Studio"
              value="Interactive 3D"
              subtitle="Male & Female rigs"
              trend={{ value: "WebGL ready", positive: true }}
              icon={TrendingUp}
            />
          </div>

          {/* Recently Added Items Reel */}
          <div className="space-y-4">
            <SectionHeader
              title="Recently Added to Wardrobe"
              subtitle="Your newest catalog additions with fabric, color, and formality attributes."
              eyebrow="Closet Catalog"
              action={
                <Link href="/wardrobe">
                  <Button variant="outline" size="sm" className="gap-1 text-xs">
                    <span>View Full Wardrobe ({totalItems})</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              }
            />

            {recentGarments.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {recentGarments.map((garment) => (
                  <GarmentCard
                    key={garment.id}
                    {...garment}
                    isFavorite={favoriteIds.includes(garment.id)}
                    onFavoriteToggle={toggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Your digital wardrobe is empty"
                description="Upload and catalog your tops, bottoms, shoes, and outerwear to unlock the outfit engine."
                icon={Shirt}
                actionLabel="Add Your First Garment"
                onAction={() => (window.location.href = "/wardrobe")}
              />
            )}
          </div>

          {/* Recently Generated / Saved Outfits */}
          <div className="space-y-4">
            <SectionHeader
              title="Curated Ensembles"
              subtitle="Combinations calculated through deterministic color harmony and silhouette tension rules."
              eyebrow="StyleOS Engine Output"
              action={
                <Link href="/outfits">
                  <Button variant="outline" size="sm" className="gap-1 text-xs">
                    <span>Open Styling Engine</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              }
            />

            {recentOutfits.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recentOutfits.map((entry) => {
                  const outfit = entry.outfit;
                  const items = (outfit?.items || []).map((it: any) => ({
                    slot: it.slot,
                    name: it.wardrobeItem?.name || "Garment",
                    category: it.wardrobeItem?.category || "TOP",
                    colorPrimary: it.wardrobeItem?.colorPrimary || "#292624",
                    imageUrl: it.wardrobeItem?.imageUrl || undefined,
                  }));

                  return (
                    <OutfitCard
                      key={entry.id}
                      id={entry.id}
                      title={outfit?.title || "Curated Ensemble"}
                      occasion={outfit?.occasion || "CASUAL_OUTING"}
                      formality={outfit?.formality || "SMART_CASUAL"}
                      compatibilityScore={outfit?.compatibilityScore ?? 0.9}
                      items={items}
                      stylingTip={
                        outfit?.stylingInstructions?.[0]?.instruction ||
                        outfit?.description ||
                        "Balanced silhouette."
                      }
                      isSaved={savedOutfitIds.includes(entry.id)}
                      onBookmarkToggle={() => toggleBookmark(entry.id)}
                    />
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="No saved outfits yet"
                description="Generate combinations using your wardrobe or craft custom looks in the Custom Outfit Builder."
                icon={Sparkles}
                actionLabel="Generate an Outfit"
                onAction={() => (window.location.href = "/outfits")}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
