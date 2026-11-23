"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { GarmentCard } from "@/components/common/GarmentCard";
import { EmptyState } from "@/components/common/EmptyState";
import { GarmentCardSkeleton } from "@/components/common/LoadingSkeleton";
import {
  GarmentFormModal,
  GarmentFormData,
} from "@/components/wardrobe/GarmentFormModal";
import {
  GarmentDetailsDrawer,
  GarmentDetailsData,
} from "@/components/wardrobe/GarmentDetailsDrawer";
import {
  WARDROBE_CATEGORIES,
  COLOR_PALETTE_PRESETS,
  STYLE_OPTIONS,
  ITEM_STATUS_CONFIG,
} from "@/modules/digital-wardrobe/constants";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Shirt,
  RefreshCw,
  Sparkles,
  Filter,
  Check,
  ChevronDown,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function WardrobePage() {
  // State for filters
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [activeSubcategory, setActiveSubcategory] = useState<string>("ALL");
  const [activeStatus, setActiveStatus] = useState<string>("ALL");
  const [activeColor, setActiveColor] = useState<string>("ALL");
  const [activeStyle, setActiveStyle] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"recently_added" | "most_worn" | "brand" | "name">("recently_added");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Data state
  const [items, setItems] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals & Drawers state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingItem, setEditingItem] = useState<GarmentFormData | null>(null);

  const [selectedGarment, setSelectedGarment] = useState<GarmentDetailsData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fetch items from backend
  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== "ALL") params.append("category", activeCategory);
      if (activeSubcategory !== "ALL") params.append("subCategory", activeSubcategory);
      if (activeStatus !== "ALL") params.append("status", activeStatus);
      if (activeColor !== "ALL") params.append("color", activeColor);
      if (activeStyle !== "ALL") params.append("style", activeStyle);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());
      params.append("sortBy", sortBy);
      params.append("limit", "100");

      const res = await fetch(`/api/wardrobe?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to load wardrobe pieces");
      }
      const data = await res.json();
      setItems(data.items || []);
      setTotalCount(data.total || 0);
    } catch (err: any) {
      console.error("Wardrobe fetch error:", err);
      setError(err.message || "Failed to load wardrobe");
    } finally {
      setIsLoading(false);
    }
  }, [
    activeCategory,
    activeSubcategory,
    activeStatus,
    activeColor,
    activeStyle,
    searchQuery,
    sortBy,
  ]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // When active category changes, reset subcategory to ALL
  const handleCategoryChange = (catKey: string) => {
    setActiveCategory(catKey);
    setActiveSubcategory("ALL");
  };

  // Subcategories available for active category
  const activeCategoryConfig = WARDROBE_CATEGORIES.find((c) => c.id === activeCategory);
  const currentSubcategories = activeCategoryConfig ? activeCategoryConfig.subcategories : [];

  // Toggle favorite status on garment
  const handleToggleFavorite = async (id: string) => {
    const target = items.find((item) => item.id === id);
    if (!target) return;
    const nextFavorite = !target.isFavorite;

    // Optimistic UI update
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFavorite: nextFavorite } : item
      )
    );
    if (selectedGarment && selectedGarment.id === id) {
      setSelectedGarment({ ...selectedGarment, isFavorite: nextFavorite } as any);
    }

    try {
      await fetch(`/api/wardrobe/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: nextFavorite }),
      });
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
      // Revert on error
      fetchItems();
    }
  };

  // Open garment details drawer
  const handleCardClick = (garment: any) => {
    setSelectedGarment(garment);
    setIsDrawerOpen(true);
  };

  // Open edit modal
  const handleEditItem = (garment: any) => {
    setIsDrawerOpen(false);
    setFormMode("edit");
    setEditingItem({
      id: garment.id,
      name: garment.name,
      category: garment.category,
      subCategory: garment.subCategory,
      brand: garment.brand || "",
      size: garment.size || "",
      colorPrimary: garment.colorPrimary,
      colorSecondary: garment.colorSecondary || "",
      pattern: garment.pattern,
      material: garment.material,
      fit: garment.fit,
      style: garment.style,
      formality: garment.formality,
      seasonality: garment.seasonality,
      occasions: garment.occasions,
      status: garment.status,
      imageUrl: garment.imageUrl || "",
      storagePath: garment.storagePath || "",
      purchasePrice: garment.purchasePrice || undefined,
      notes: garment.notes || "",
    });
    setIsFormModalOpen(true);
  };

  // Delete item handler
  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setTotalCount((prev) => Math.max(0, prev - 1));
  };

  // Item updated handler
  const handleItemUpdated = (updated: any) => {
    setItems((prev) =>
      prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item))
    );
    setSelectedGarment(updated);
  };

  // Success handler after add or edit
  const handleFormSuccess = () => {
    fetchItems();
  };

  // Reset all active filters
  const resetFilters = () => {
    setActiveCategory("ALL");
    setActiveSubcategory("ALL");
    setActiveStatus("ALL");
    setActiveColor("ALL");
    setActiveStyle("ALL");
    setSearchQuery("");
  };

  const hasActiveFilters =
    activeCategory !== "ALL" ||
    activeSubcategory !== "ALL" ||
    activeStatus !== "ALL" ||
    activeColor !== "ALL" ||
    activeStyle !== "ALL" ||
    searchQuery.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <Header
        eyebrow="Digital Wardrobe • Closet Architecture"
        title="Digital Wardrobe"
        description="Curate and manage your clothing, footwear, timepieces, and accessories with editorial precision."
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchItems}
              disabled={isLoading}
              className="gap-2 text-xs border-border hover:bg-atelier-100"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isLoading ? "animate-spin" : "")} />
              <span>Sync</span>
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={() => {
                setFormMode("create");
                setEditingItem(null);
                setIsFormModalOpen(true);
              }}
              className="gap-2 text-xs bg-charcoal text-cream hover:bg-charcoal/90 shadow-subtle"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Garment</span>
            </Button>
          </div>
        }
      />

      {/* Main Filter and Controls Section */}
      <div className="space-y-4">
        {/* Status Tabs + Search & Sort */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {[
              { key: "ALL", label: "All Active" },
              { key: "AVAILABLE", label: "Available" },
              { key: "LAUNDRY", label: "In Laundry" },
              { key: "UNAVAILABLE", label: "Unavailable" },
              { key: "ARCHIVED", label: "Archived" },
            ].map((tab) => {
              const active = activeStatus === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveStatus(tab.key)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide whitespace-nowrap transition-all",
                    active
                      ? "bg-charcoal text-cream shadow-subtle font-semibold"
                      : "bg-atelier-100/90 text-muted-foreground hover:bg-atelier-200 hover:text-charcoal border border-border/40"
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search, Filter Toggle, Sort Controls */}
          <div className="flex items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search piece, brand, notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-border/80 bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-charcoal/40 transition-colors shadow-subtle"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-8 px-2.5 rounded-lg border border-border/80 bg-card text-xs font-medium text-foreground focus:outline-none focus:border-charcoal/40 shadow-subtle"
            >
              <option value="recently_added">Recently Added</option>
              <option value="most_worn">Most Worn</option>
              <option value="brand">Brand A-Z</option>
              <option value="name">Name A-Z</option>
            </select>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setIsFilterPanelOpen((prev) => !prev)}
              className={cn(
                "h-8 px-3 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all shadow-subtle",
                isFilterPanelOpen || hasActiveFilters
                  ? "border-charcoal bg-charcoal text-cream"
                  : "border-border bg-card text-muted-foreground hover:text-charcoal hover:bg-atelier-100"
              )}
            >
              <Filter className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>

        {/* Primary Categories Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-border/40 pt-3">
          <button
            onClick={() => handleCategoryChange("ALL")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide whitespace-nowrap transition-all",
              activeCategory === "ALL"
                ? "bg-charcoal text-cream shadow-subtle"
                : "bg-card text-muted-foreground hover:bg-atelier-100 hover:text-charcoal border border-border/80"
            )}
          >
            All Categories ({totalCount})
          </button>
          {WARDROBE_CATEGORIES.map((cat) => {
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide whitespace-nowrap transition-all",
                  active
                    ? "bg-charcoal text-cream shadow-subtle"
                    : "bg-card text-muted-foreground hover:bg-atelier-100 hover:text-charcoal border border-border/80"
                )}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Subcategories (if a category is active) */}
        {currentSubcategories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pl-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mr-1">
              Subcategory:
            </span>
            <button
              onClick={() => setActiveSubcategory("ALL")}
              className={cn(
                "px-2.5 py-1 rounded-md text-[11px] font-medium transition-all",
                activeSubcategory === "ALL"
                  ? "bg-atelier-300 text-charcoal font-semibold"
                  : "text-muted-foreground hover:text-charcoal hover:bg-atelier-100"
              )}
            >
              All
            </button>
            {currentSubcategories.map((sub) => {
              const active = activeSubcategory === sub;
              return (
                <button
                  key={sub}
                  onClick={() => setActiveSubcategory(sub)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-[11px] font-medium transition-all",
                    active
                      ? "bg-atelier-300 text-charcoal font-semibold"
                      : "text-muted-foreground hover:text-charcoal hover:bg-atelier-100"
                  )}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        )}

        {/* Expandable Advanced Filters Drawer (Color swatches & Style) */}
        {isFilterPanelOpen && (
          <div className="p-4 rounded-xl border border-border bg-card shadow-subtle space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Refine by Palette & Aesthetic
              </span>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-muted-foreground hover:text-charcoal underline"
                >
                  Reset all filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Color Swatch Filter */}
              <div>
                <p className="text-xs font-medium text-foreground mb-2">Primary Color Swatch</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveColor("ALL")}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all",
                      activeColor === "ALL"
                        ? "border-charcoal bg-charcoal text-cream"
                        : "border-border text-muted-foreground bg-card hover:bg-atelier-100"
                    )}
                  >
                    Any Color
                  </button>
                  {COLOR_PALETTE_PRESETS.map((color) => {
                    const active = activeColor === color.hex;
                    return (
                      <button
                        key={color.hex}
                        onClick={() => setActiveColor(color.hex)}
                        title={color.label}
                        className={cn(
                          "h-6 w-6 rounded-full border border-border shadow-subtle flex items-center justify-center transition-transform hover:scale-110",
                          active ? "ring-2 ring-charcoal ring-offset-1" : ""
                        )}
                        style={{ backgroundColor: color.hex }}
                      >
                        {active && (
                          <Check
                            className={cn(
                              "h-3 w-3",
                              color.hex === "#FFFFFF" || color.hex === "#F5F2EB"
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

              {/* Style Aesthetic Filter */}
              <div>
                <p className="text-xs font-medium text-foreground mb-2">Style Aesthetic</p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setActiveStyle("ALL")}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all",
                      activeStyle === "ALL"
                        ? "border-charcoal bg-charcoal text-cream font-semibold"
                        : "border-border text-muted-foreground bg-card hover:bg-atelier-100"
                    )}
                  >
                    All Styles
                  </button>
                  {STYLE_OPTIONS.map((style) => {
                    const active = activeStyle === style.value;
                    return (
                      <button
                        key={style.value}
                        onClick={() => setActiveStyle(style.value)}
                        className={cn(
                          "px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all",
                          active
                            ? "border-charcoal bg-atelier-300 text-charcoal font-semibold"
                            : "border-border text-muted-foreground bg-card hover:bg-atelier-100"
                        )}
                      >
                        {style.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Wardrobe Grid Content */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <GarmentCardSkeleton key={idx} />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((garment) => (
            <GarmentCard
              key={garment.id}
              id={garment.id}
              name={garment.name}
              category={garment.category}
              subCategory={garment.subCategory}
              brand={garment.brand}
              size={garment.size}
              colorPrimary={garment.colorPrimary}
              colorSecondary={garment.colorSecondary}
              formality={garment.formality}
              wearCount={garment.wearCount}
              imageUrl={garment.imageUrl}
              status={garment.status}
              isFavorite={garment.isFavorite}
              onFavoriteToggle={handleToggleFavorite}
              onClick={() => handleCardClick(garment)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={hasActiveFilters ? "No matching garments" : "Your wardrobe is empty"}
          description={
            hasActiveFilters
              ? "No garments match your active filters. Try clearing your filters or adding a new piece."
              : "Start curating your digital closet by uploading your garments with tailored fabric and formality attributes."
          }
          icon={Shirt}
          actionLabel={hasActiveFilters ? "Clear Filters" : "Add Your First Garment"}
          onAction={
            hasActiveFilters
              ? resetFilters
              : () => {
                  setFormMode("create");
                  setEditingItem(null);
                  setIsFormModalOpen(true);
                }
          }
        />
      )}

      {/* Add / Edit Garment Modal */}
      <GarmentFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={handleFormSuccess}
        initialData={editingItem}
        mode={formMode}
      />

      {/* Garment Details Drawer */}
      <GarmentDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        garment={selectedGarment}
        onEdit={handleEditItem}
        onDelete={handleDeleteItem}
        onUpdate={handleItemUpdated}
      />
    </div>
  );
}
