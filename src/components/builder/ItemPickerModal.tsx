"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Search,
  Check,
  Shirt,
  Sparkles,
  Loader2,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WardrobeItemDto } from "@/types";
import { cn } from "@/lib/utils";

interface ItemPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: WardrobeItemDto) => void;
  categoryFilter?: string; // TOP, BOTTOM, FOOTWEAR, OUTERWEAR, ACCESSORY, EYEWEAR
  currentSelectedId?: string | null;
  slotTitle: string;
}

export function ItemPickerModal({
  isOpen,
  onClose,
  onSelect,
  categoryFilter,
  currentSelectedId,
  slotTitle,
}: ItemPickerModalProps) {
  const [items, setItems] = useState<WardrobeItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const fetchWardrobe = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (categoryFilter && categoryFilter !== "ALL") {
          // If accessory, also include timepiece and eyewear
          if (categoryFilter === "ACCESSORY") {
            params.append("category", "ACCESSORY");
          } else {
            params.append("category", categoryFilter);
          }
        }
        params.append("status", "AVAILABLE");
        params.append("limit", "100");

        const res = await fetch(`/api/wardrobe?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setItems(data.items || []);
        }
      } catch (err) {
        console.error("Failed to load items for picker:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWardrobe();
  }, [isOpen, categoryFilter]);

  if (!isOpen) return null;

  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      item.subCategory.toLowerCase().includes(q) ||
      (item.brand && item.brand.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-charcoal/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-card border border-border shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/95">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                Wardrobe Selector
              </span>
              <span className="text-border">•</span>
              <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                {slotTitle}
              </span>
            </div>
            <h3 className="font-serif text-lg font-semibold text-foreground tracking-tight">
              Select {slotTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-charcoal hover:bg-atelier-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-border/60 bg-atelier-100/40">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder={`Search available ${slotTitle.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-border/80 bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-charcoal/40 transition-colors shadow-subtle"
            />
          </div>
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader2 className="h-6 w-6 animate-spin text-charcoal" />
              <p className="text-xs text-muted-foreground font-mono">
                Accessing wardrobe inventory...
              </p>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredItems.map((item) => {
                const isSelected = currentSelectedId === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelect(item);
                      onClose();
                    }}
                    className={cn(
                      "group relative p-3 rounded-xl border bg-card flex flex-col justify-between cursor-pointer transition-all hover:border-charcoal/50 hover:shadow-subtle select-none",
                      isSelected
                        ? "border-charcoal ring-2 ring-charcoal/20 bg-atelier-100/70"
                        : "border-border"
                    )}
                  >
                    {/* Visual */}
                    <div className="relative aspect-square w-full rounded-lg bg-atelier-200/50 border border-border/60 overflow-hidden flex items-center justify-center mb-2.5">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div
                          className="h-10 w-10 rounded-xl flex items-center justify-center shadow-sm"
                          style={{ backgroundColor: item.colorPrimary }}
                        >
                          <Shirt className="h-5 w-5 text-white/90" />
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-charcoal text-cream flex items-center justify-center shadow-sm">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="space-y-0.5">
                      {item.brand && (
                        <p className="text-[9px] font-mono tracking-luxury uppercase text-muted-foreground truncate">
                          {item.brand}
                        </p>
                      )}
                      <p className="text-xs font-medium text-foreground line-clamp-1 group-hover:text-charcoal transition-colors">
                        {item.name}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                        <span>{item.subCategory}</span>
                        <div
                          className="h-2.5 w-2.5 rounded-full border border-border"
                          style={{ backgroundColor: item.colorPrimary }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
              <Shirt className="h-8 w-8 text-muted-foreground/60" />
              <p className="text-xs font-medium text-foreground">
                No available pieces in this category
              </p>
              <p className="text-[11px] text-muted-foreground max-w-xs">
                Make sure you have added garments to your digital wardrobe and marked them as available.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
