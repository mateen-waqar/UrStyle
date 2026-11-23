"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Heart, Shirt, Eye, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GarmentCardProps {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  brand?: string | null;
  colorPrimary: string;
  colorSecondary?: string | null;
  material?: string | null;
  formality: string;
  wearCount?: number;
  imageUrl?: string | null;
  isFavorite?: boolean;
  status?: string | null;
  size?: string | null;
  purchasePrice?: number | null;
  onFavoriteToggle?: (id: string) => void;
  onClick?: () => void;
  className?: string;
}

export function GarmentCard({
  id,
  name,
  category,
  subCategory,
  brand,
  colorPrimary,
  colorSecondary,
  material,
  formality,
  wearCount = 0,
  imageUrl,
  isFavorite = false,
  status = "AVAILABLE",
  size,
  purchasePrice,
  onFavoriteToggle,
  onClick,
  className,
}: GarmentCardProps) {
  const isLaundry = status === "LAUNDRY";
  const isArchived = status === "ARCHIVED";
  const isUnavailable = status === "UNAVAILABLE";

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex flex-col rounded-xl border border-border/80 bg-card overflow-hidden shadow-subtle hover:shadow-card hover:border-charcoal/30 transition-all duration-300 cursor-pointer select-none",
        className
      )}
    >
      {/* Product Image Stage */}
      <div className="relative aspect-[3/4] w-full bg-atelier-100/80 overflow-hidden flex items-center justify-center border-b border-border/60">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-2.5">
            <div
              className="h-14 w-14 rounded-2xl border border-border/80 shadow-subtle flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
              style={{
                backgroundColor: colorPrimary.startsWith("#") ? colorPrimary : "#292624",
              }}
            >
              <Shirt className="h-6 w-6 text-white/90" />
            </div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
              {subCategory}
            </span>
          </div>
        )}

        {/* Top Status Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5 z-10">
          {isLaundry && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono tracking-wider uppercase font-semibold bg-amber-500/90 text-white backdrop-blur-sm shadow-subtle">
              Laundry
            </span>
          )}
          {isUnavailable && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono tracking-wider uppercase font-semibold bg-stone-700/90 text-white backdrop-blur-sm shadow-subtle">
              Unavailable
            </span>
          )}
          {isArchived && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono tracking-wider uppercase font-semibold bg-stone-400/90 text-white backdrop-blur-sm shadow-subtle">
              Archived
            </span>
          )}
          {material && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono tracking-wider uppercase bg-card/90 text-charcoal border border-border/80 backdrop-blur-sm shadow-subtle hidden sm:inline-block">
              {material.toLowerCase()}
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle?.(id);
          }}
          className="absolute top-2.5 right-2.5 h-7 w-7 rounded-full bg-card/90 backdrop-blur-sm border border-border/80 flex items-center justify-center text-charcoal/70 transition-all hover:text-charcoal hover:scale-110 hover:border-charcoal/40 shadow-subtle z-10"
          title="Save garment"
        >
          <Heart
            className={cn(
              "h-3.5 w-3.5 transition-colors",
              isFavorite ? "fill-charcoal text-charcoal" : "hover:text-charcoal"
            )}
          />
        </button>

        {/* Bottom Swatches & Category */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 z-10">
          <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm text-[9px] shadow-subtle font-mono uppercase tracking-wider">
            {category}
          </Badge>
          <div className="flex -space-x-1 items-center">
            <div
              className="h-3.5 w-3.5 rounded-full border border-border/80 shadow-subtle"
              style={{ backgroundColor: colorPrimary }}
              title={colorPrimary}
            />
            {colorSecondary && (
              <div
                className="h-3.5 w-3.5 rounded-full border border-border/80 shadow-subtle ring-1 ring-background"
                style={{ backgroundColor: colorSecondary }}
                title={colorSecondary}
              />
            )}
          </div>
        </div>

        {/* Hover Quick Action Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-charcoal/80 via-charcoal/40 to-transparent flex items-center justify-center translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-card/95 text-charcoal text-[11px] font-medium shadow-elevated">
            <Eye className="h-3 w-3 text-stone-500" />
            <span>Inspect Piece</span>
          </span>
        </div>
      </div>

      {/* Metadata Section */}
      <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
        <div className="space-y-0.5">
          {brand && (
            <p className="text-[10px] font-mono tracking-luxury uppercase text-muted-foreground line-clamp-1">
              {brand}
            </p>
          )}
          <h4 className="text-xs sm:text-sm font-medium text-foreground tracking-tight line-clamp-1 group-hover:text-charcoal transition-colors">
            {name}
          </h4>
        </div>

        <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="capitalize">{formality.toLowerCase().replace("_", " ")}</span>
          <span className="font-mono text-[10px] text-muted-foreground/80">
            {wearCount} {wearCount === 1 ? "wear" : "wears"}
          </span>
        </div>
      </div>
    </div>
  );
}
