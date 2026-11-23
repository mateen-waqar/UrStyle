"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Box, Check, CloudDrizzle, Calendar, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface OutfitOfTheDayCardProps {
  className?: string;
}

export function OutfitOfTheDayCard({ className }: OutfitOfTheDayCardProps) {
  const [isLoggedAsWorn, setIsLoggedAsWorn] = useState(false);

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-border/90 bg-card p-6 sm:p-8 shadow-card overflow-hidden",
        className
      )}
    >
      {/* Editorial Watermark / Tag */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="beige" className="text-[10px]">
              Today's Curation
            </Badge>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              <CloudDrizzle className="h-3.5 w-3.5 text-muted-foreground" />
              <span>16°C • Autumn Crisp</span>
            </div>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-foreground pt-1">
            Monochrome Minimalist Tailoring
          </h3>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-beige-100 border border-beige-300 text-charcoal">
            <Sparkles className="h-3.5 w-3.5 text-beige-600" />
            <span className="text-xs font-mono font-medium">96% Harmony Match</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
        {/* Left: Garment Pieces */}
        <div className="md:col-span-2 space-y-4">
          <span className="text-[10px] font-mono tracking-luxury uppercase text-muted-foreground block">
            Selected Wardrobe Elements
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { slot: "Base Knit", item: "Cashmere Turtleneck", color: "#2B2825", brand: "Loro Piana" },
              { slot: "Trousers", item: "Pleated Flannel Pants", color: "#423E3A", brand: "Brunello Cucinelli" },
              { slot: "Footwear", item: "Suede Chelsea Boots", color: "#54463A", brand: "Common Projects" },
              { slot: "Timepiece", item: "Automatic Chrono", color: "#C0B8AD", brand: "IWC" },
            ].map((piece, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-atelier-200/80 border border-border/70 space-y-1.5 hover:border-charcoal/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono tracking-widest uppercase text-muted-foreground">
                    {piece.slot}
                  </span>
                  <span
                    className="h-2.5 w-2.5 rounded-full border border-border/80"
                    style={{ backgroundColor: piece.color }}
                  />
                </div>
                <h5 className="text-xs font-medium text-foreground truncate">
                  {piece.item}
                </h5>
                <p className="text-[10px] text-muted-foreground font-mono truncate">
                  {piece.brand}
                </p>
              </div>
            ))}
          </div>

          {/* Micro-Styling Tip */}
          <div className="p-4 rounded-xl bg-atelier-100 border border-border/70 flex items-start gap-3">
            <div className="h-2 w-2 rounded-full bg-beige-500 mt-1.5 shrink-0" />
            <div className="space-y-0.5 text-xs">
              <span className="font-medium text-charcoal">Editorial Styling Heuristic:</span>
              <p className="text-muted-foreground leading-relaxed">
                French tuck the front hem into the pleated waistband to accentuate vertical leg proportion while allowing relaxed drape at the sides.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Actions & 3D Teaser */}
        <div className="flex flex-col justify-between p-5 rounded-xl bg-atelier-200/50 border border-border/70 space-y-4">
          <div className="space-y-2">
            <span className="text-[10px] font-mono tracking-luxury uppercase text-muted-foreground">
              Virtual Fitting Room
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Visualize this complete combination on your interactive 3D mannequin with 360° lighting inspection.
            </p>
          </div>

          <div className="space-y-2">
            <Link href="/studio" className="w-full">
              <Button variant="default" className="w-full gap-2 text-xs">
                <Box className="h-3.5 w-3.5 text-beige-400" />
                <span>Launch in 3D Studio</span>
                <ArrowRight className="h-3.5 w-3.5 ml-auto" />
              </Button>
            </Link>

            <Button
              onClick={() => setIsLoggedAsWorn(!isLoggedAsWorn)}
              variant={isLoggedAsWorn ? "secondary" : "outline"}
              className="w-full gap-2 text-xs"
            >
              <Check className={cn("h-3.5 w-3.5", isLoggedAsWorn ? "text-emerald-700" : "")} />
              <span>{isLoggedAsWorn ? "Logged as Worn Today" : "Mark as Worn"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
