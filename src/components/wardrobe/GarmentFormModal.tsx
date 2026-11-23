"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Upload,
  Check,
  Loader2,
  Trash2,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  WARDROBE_CATEGORIES,
  COLOR_PALETTE_PRESETS,
  PATTERN_OPTIONS,
  FIT_OPTIONS,
  STYLE_OPTIONS,
  FORMALITY_OPTIONS,
  SEASON_OPTIONS,
  OCCASION_OPTIONS,
  ITEM_STATUS_CONFIG,
} from "@/modules/digital-wardrobe/constants";
import { cn } from "@/lib/utils";

export interface GarmentFormData {
  id?: string;
  name: string;
  category: "TOP" | "BOTTOM" | "OUTERWEAR" | "FOOTWEAR" | "ACCESSORY";
  subCategory: string;
  brand?: string;
  size?: string;
  colorPrimary: string;
  colorSecondary?: string;
  pattern: string;
  material: string;
  fit: string;
  style: string;
  formality: string;
  seasonality: string[];
  occasions: string[];
  status: "AVAILABLE" | "LAUNDRY" | "UNAVAILABLE" | "ARCHIVED";
  imageUrl?: string;
  storagePath?: string;
  purchasePrice?: number;
  notes?: string;
}

interface GarmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (item: any) => void;
  initialData?: GarmentFormData | null;
  mode?: "create" | "edit";
}

export function GarmentFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  mode = "create",
}: GarmentFormModalProps) {
  const [formData, setFormData] = useState<GarmentFormData>({
    name: "",
    category: "TOP",
    subCategory: "T-shirts",
    brand: "",
    size: "",
    colorPrimary: "#181716",
    colorSecondary: "",
    pattern: "SOLID",
    material: "COTTON",
    fit: "REGULAR",
    style: "MINIMALIST",
    formality: "CASUAL",
    seasonality: ["ALL_SEASON"],
    occasions: ["CASUAL_OUTING"],
    status: "AVAILABLE",
    imageUrl: "",
    storagePath: "",
    purchasePrice: undefined,
    notes: "",
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when editing or opening
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        seasonality: initialData.seasonality?.length ? initialData.seasonality : ["ALL_SEASON"],
        occasions: initialData.occasions?.length ? initialData.occasions : ["CASUAL_OUTING"],
        colorPrimary: initialData.colorPrimary || "#181716",
        colorSecondary: initialData.colorSecondary || "",
        status: initialData.status || "AVAILABLE",
      });
    } else {
      setFormData({
        name: "",
        category: "TOP",
        subCategory: "T-shirts",
        brand: "",
        size: "",
        colorPrimary: "#181716",
        colorSecondary: "",
        pattern: "SOLID",
        material: "COTTON",
        fit: "REGULAR",
        style: "MINIMALIST",
        formality: "CASUAL",
        seasonality: ["ALL_SEASON"],
        occasions: ["CASUAL_OUTING"],
        status: "AVAILABLE",
        imageUrl: "",
        storagePath: "",
        purchasePrice: undefined,
        notes: "",
      });
    }
    setSubmitError(null);
    setUploadError(null);
  }, [initialData, isOpen]);

  // Active category subcategories
  const currentCategoryConfig = WARDROBE_CATEGORIES.find(
    (c) => c.id === formData.category
  ) || WARDROBE_CATEGORIES[0];

  const handleCategoryChange = (catId: "TOP" | "BOTTOM" | "OUTERWEAR" | "FOOTWEAR" | "ACCESSORY") => {
    const config = WARDROBE_CATEGORIES.find((c) => c.id === catId);
    setFormData((prev) => ({
      ...prev,
      category: catId,
      subCategory: config ? config.subcategories[0] : "",
    }));
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const res = await fetch("/api/wardrobe/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload file");
      }

      setFormData((prev) => ({
        ...prev,
        imageUrl: data.imageUrl,
        storagePath: data.storagePath,
      }));
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const toggleSeason = (season: string) => {
    setFormData((prev) => {
      const exists = prev.seasonality.includes(season);
      if (exists) {
        if (prev.seasonality.length <= 1) return prev; // keep at least one
        return { ...prev, seasonality: prev.seasonality.filter((s) => s !== season) };
      }
      return { ...prev, seasonality: [...prev.seasonality, season] };
    });
  };

  const toggleOccasion = (occ: string) => {
    setFormData((prev) => {
      const exists = prev.occasions.includes(occ);
      if (exists) {
        if (prev.occasions.length <= 1) return prev;
        return { ...prev, occasions: prev.occasions.filter((o) => o !== occ) };
      }
      return { ...prev, occasions: [...prev.occasions, occ] };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setSubmitError("Garment name is required");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        ...formData,
        purchasePrice: formData.purchasePrice ? Number(formData.purchasePrice) : undefined,
        brand: formData.brand?.trim() || undefined,
        size: formData.size?.trim() || undefined,
        colorSecondary: formData.colorSecondary?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
      };

      const url = mode === "edit" && initialData?.id ? `/api/wardrobe/${initialData.id}` : "/api/wardrobe";
      const method = mode === "edit" ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to save garment");
      }

      onSuccess(result);
      onClose();
    } catch (err: any) {
      setSubmitError(err.message || "Failed to save garment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-charcoal/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-card border border-border shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/95">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-charcoal text-cream flex items-center justify-center text-xs font-serif font-bold">
              {mode === "edit" ? "E" : "+"}
            </div>
            <div>
              <h2 className="text-lg font-serif font-semibold text-foreground tracking-tight">
                {mode === "edit" ? "Edit Garment" : "Add to Digital Wardrobe"}
              </h2>
              <p className="text-xs text-muted-foreground font-sans">
                {mode === "edit"
                  ? "Update tailoring, aesthetic, and care status"
                  : "Catalogue your clothing piece with editorial precision"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-charcoal hover:bg-atelier-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
          {submitError && (
            <div className="p-3.5 rounded-xl border border-red-200 bg-red-50 text-red-800 text-xs">
              {submitError}
            </div>
          )}

          {/* Section 1: Visual & Identification */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Image Upload Zone */}
            <div className="md:col-span-5 flex flex-col space-y-3">
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Garment Visual
              </Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative aspect-[4/5] w-full rounded-2xl border-2 border-dashed border-border bg-atelier-100/60 overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-all hover:border-charcoal/40 hover:bg-atelier-200/50 group select-none",
                  formData.imageUrl ? "border-solid border-border/80" : ""
                )}
              >
                {formData.imageUrl ? (
                  <>
                    <img
                      src={formData.imageUrl}
                      alt="Garment preview"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium backdrop-blur-xs">
                      Change Photo
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <div className="h-12 w-12 rounded-full bg-card border border-border flex items-center justify-center shadow-subtle group-hover:scale-105 transition-transform">
                      {isUploading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-charcoal" />
                      ) : (
                        <Upload className="h-5 w-5 text-muted-foreground group-hover:text-charcoal transition-colors" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">
                        {isUploading ? "Uploading Image..." : "Upload Garment Image"}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Drop photo or browse (JPG, PNG, WEBP)
                      </p>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
              </div>

              {uploadError && (
                <p className="text-[11px] text-red-600 font-sans">{uploadError}</p>
              )}

              {/* Status Selector */}
              <div className="pt-2">
                <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Wardrobe Care Status
                </Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {(Object.keys(ITEM_STATUS_CONFIG) as Array<keyof typeof ITEM_STATUS_CONFIG>).map(
                    (st) => {
                      const cfg = ITEM_STATUS_CONFIG[st];
                      const active = formData.status === st;
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setFormData((p) => ({ ...p, status: st }))}
                          className={cn(
                            "px-3 py-2 rounded-lg text-xs font-medium border text-left transition-all",
                            active
                              ? "border-charcoal bg-charcoal text-cream shadow-subtle"
                              : "border-border bg-card hover:bg-atelier-100 text-muted-foreground"
                          )}
                        >
                          {cfg.label}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            </div>

            {/* Core Info */}
            <div className="md:col-span-7 space-y-4">
              {/* Item Name */}
              <div>
                <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Piece Name *
                </Label>
                <Input
                  required
                  placeholder="e.g. Double-Breasted Wool Blazer"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className="mt-1.5 h-11 bg-card border-border text-sm"
                />
              </div>

              {/* Category Pills */}
              <div>
                <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Category *
                </Label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-1.5">
                  {WARDROBE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryChange(cat.id)}
                      className={cn(
                        "py-2 px-2.5 rounded-lg text-xs font-medium border text-center transition-all",
                        formData.category === cat.id
                          ? "border-charcoal bg-charcoal text-cream shadow-subtle"
                          : "border-border bg-card hover:bg-atelier-100 text-foreground"
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Subcategory */}
              <div>
                <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Subcategory *
                </Label>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {currentCategoryConfig.subcategories.map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, subCategory: sub }))}
                      className={cn(
                        "py-1.5 px-3 rounded-full text-xs font-medium border transition-all",
                        formData.subCategory === sub
                          ? "border-charcoal bg-atelier-200 text-charcoal font-semibold shadow-subtle"
                          : "border-border bg-card text-muted-foreground hover:bg-atelier-100"
                      )}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand and Size */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Designer / Brand
                  </Label>
                  <Input
                    placeholder="e.g. Loro Piana, Acne Studios"
                    value={formData.brand || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, brand: e.target.value }))}
                    className="mt-1 h-10 bg-card border-border text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Size / Dimension
                  </Label>
                  <Input
                    placeholder="e.g. M, 48 EU, 32/30"
                    value={formData.size || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, size: e.target.value }))}
                    className="mt-1 h-10 bg-card border-border text-xs"
                  />
                </div>
              </div>

              {/* Primary & Secondary Color */}
              <div className="pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Primary Color Swatch *
                  </Label>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {formData.colorPrimary}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {COLOR_PALETTE_PRESETS.map((color) => {
                    const selected = formData.colorPrimary === color.hex;
                    return (
                      <button
                        key={color.hex}
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, colorPrimary: color.hex }))}
                        title={color.label}
                        className={cn(
                          "h-7 w-7 rounded-full border border-border shadow-subtle flex items-center justify-center transition-transform hover:scale-110",
                          selected ? "ring-2 ring-charcoal ring-offset-2 ring-offset-card" : ""
                        )}
                        style={{ backgroundColor: color.hex }}
                      >
                        {selected && (
                          <Check
                            className={cn(
                              "h-3.5 w-3.5",
                              color.hex === "#FFFFFF" || color.hex === "#F5F2EB" || color.hex === "#D4C5B0"
                                ? "text-charcoal"
                                : "text-white"
                            )}
                          />
                        )}
                      </button>
                    );
                  })}
                  {/* Custom Hex input */}
                  <div className="flex items-center gap-1.5 ml-2">
                    <input
                      type="color"
                      value={formData.colorPrimary}
                      onChange={(e) => setFormData((p) => ({ ...p, colorPrimary: e.target.value }))}
                      className="h-7 w-7 rounded-full cursor-pointer border border-border bg-transparent p-0"
                      title="Custom color picker"
                    />
                  </div>
                </div>
              </div>

              {/* Secondary Color (Optional) */}
              <div className="pt-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Secondary Accent Color (Optional)
                  </Label>
                  {formData.colorSecondary && (
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, colorSecondary: "" }))}
                      className="text-[10px] text-muted-foreground hover:text-red-600 underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {COLOR_PALETTE_PRESETS.slice(0, 8).map((color) => {
                    const selected = formData.colorSecondary === color.hex;
                    return (
                      <button
                        key={color.hex}
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, colorSecondary: color.hex }))}
                        title={color.label}
                        className={cn(
                          "h-6 w-6 rounded-full border border-border flex items-center justify-center transition-transform hover:scale-110",
                          selected ? "ring-2 ring-charcoal ring-offset-1" : ""
                        )}
                        style={{ backgroundColor: color.hex }}
                      >
                        {selected && (
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
            </div>
          </div>

          {/* Section 2: Tailoring, Fit, Style & Formality */}
          <div className="pt-4 border-t border-border space-y-5">
            <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-charcoal" />
              Tailoring & Styling Attributes
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Pattern */}
              <div>
                <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Pattern
                </Label>
                <select
                  value={formData.pattern}
                  onChange={(e) => setFormData((p) => ({ ...p, pattern: e.target.value }))}
                  className="mt-1.5 w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium focus:outline-none focus:ring-1 focus:ring-charcoal"
                >
                  {PATTERN_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fit */}
              <div>
                <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Fit Profile
                </Label>
                <select
                  value={formData.fit}
                  onChange={(e) => setFormData((p) => ({ ...p, fit: e.target.value }))}
                  className="mt-1.5 w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium focus:outline-none focus:ring-1 focus:ring-charcoal"
                >
                  {FIT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Style Aesthetic */}
              <div>
                <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Style Aesthetic
                </Label>
                <select
                  value={formData.style}
                  onChange={(e) => setFormData((p) => ({ ...p, style: e.target.value }))}
                  className="mt-1.5 w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium focus:outline-none focus:ring-1 focus:ring-charcoal"
                >
                  {STYLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Formality Level */}
              <div>
                <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Formality Level
                </Label>
                <select
                  value={formData.formality}
                  onChange={(e) => setFormData((p) => ({ ...p, formality: e.target.value }))}
                  className="mt-1.5 w-full h-10 px-3 rounded-lg border border-border bg-card text-xs font-medium focus:outline-none focus:ring-1 focus:ring-charcoal"
                >
                  {FORMALITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Season Multi-select */}
            <div>
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Seasonality (Select multiple)
              </Label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {SEASON_OPTIONS.map((season) => {
                  const active = formData.seasonality.includes(season.value);
                  return (
                    <button
                      key={season.value}
                      type="button"
                      onClick={() => toggleSeason(season.value)}
                      className={cn(
                        "py-1.5 px-3 rounded-lg text-xs font-medium border transition-all",
                        active
                          ? "border-charcoal bg-charcoal text-cream shadow-subtle"
                          : "border-border bg-card text-muted-foreground hover:bg-atelier-100"
                      )}
                    >
                      {season.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Occasions Multi-select */}
            <div>
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Suitable Occasions (Select multiple)
              </Label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {OCCASION_OPTIONS.map((occ) => {
                  const active = formData.occasions.includes(occ.value);
                  return (
                    <button
                      key={occ.value}
                      type="button"
                      onClick={() => toggleOccasion(occ.value)}
                      className={cn(
                        "py-1 px-2.5 rounded-full text-xs font-medium border transition-all",
                        active
                          ? "border-charcoal bg-atelier-200 text-charcoal font-semibold"
                          : "border-border bg-card text-muted-foreground hover:bg-atelier-100"
                      )}
                    >
                      {occ.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Acquisition & Notes */}
          <div className="pt-4 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Purchase Price ($ USD, optional)
              </Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 280"
                value={formData.purchasePrice !== undefined ? formData.purchasePrice : ""}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    purchasePrice: e.target.value ? parseFloat(e.target.value) : undefined,
                  }))
                }
                className="mt-1.5 h-10 bg-card border-border text-xs"
              />
            </div>
            <div>
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Styling Notes / Tailoring Details (optional)
              </Label>
              <Input
                placeholder="e.g. Dry clean only, fits slightly cropped"
                value={formData.notes || ""}
                onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                className="mt-1.5 h-10 bg-card border-border text-xs"
              />
            </div>
          </div>
        </form>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-border bg-atelier-100/60 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs"
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isUploading}
            className="bg-charcoal text-cream hover:bg-charcoal/90 text-xs px-6 h-10 font-medium shadow-subtle flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Garment...</span>
              </>
            ) : (
              <span>{mode === "edit" ? "Update Garment" : "Save to Wardrobe"}</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
