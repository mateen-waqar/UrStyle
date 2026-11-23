"use client";

import React, { useState } from "react";
import {
  X,
  Edit3,
  Trash2,
  Sparkles,
  Shirt,
  Calendar,
  Layers,
  Tag,
  DollarSign,
  Check,
  AlertCircle,
  Loader2,
  RefreshCw,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ITEM_STATUS_CONFIG } from "@/modules/digital-wardrobe/constants";
import { cn } from "@/lib/utils";

export interface GarmentDetailsData {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  brand?: string | null;
  size?: string | null;
  colorPrimary: string;
  colorSecondary?: string | null;
  pattern: string;
  material: string;
  fit: string;
  style: string;
  formality: string;
  seasonality: string[];
  occasions: string[];
  status: "AVAILABLE" | "LAUNDRY" | "UNAVAILABLE" | "ARCHIVED";
  imageUrl?: string | null;
  storagePath?: string | null;
  purchasePrice?: number | null;
  wearCount: number;
  lastWornAt?: string | null;
  notes?: string | null;
  createdAt: string;
}

interface GarmentDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  garment: GarmentDetailsData | null;
  onEdit: (garment: GarmentDetailsData) => void;
  onDelete: (id: string) => void;
  onUpdate: (updated: GarmentDetailsData) => void;
}

export function GarmentDetailsDrawer({
  isOpen,
  onClose,
  garment,
  onEdit,
  onDelete,
  onUpdate,
}: GarmentDetailsDrawerProps) {
  const [isLoggingWear, setIsLoggingWear] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !garment) return null;

  const currentStatusConfig = ITEM_STATUS_CONFIG[garment.status] || ITEM_STATUS_CONFIG.AVAILABLE;

  // Calculate cost per wear if purchase price is present
  const costPerWear =
    garment.purchasePrice && garment.wearCount > 0
      ? (garment.purchasePrice / garment.wearCount).toFixed(2)
      : garment.purchasePrice
      ? garment.purchasePrice.toFixed(2)
      : null;

  const handleLogWear = async () => {
    setIsLoggingWear(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/wardrobe/${garment.id}/wear`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to record wear");
      onUpdate({
        ...garment,
        wearCount: data.wearCount,
        lastWornAt: data.lastWornAt,
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Could not log wear");
    } finally {
      setIsLoggingWear(false);
    }
  };

  const handleStatusChange = async (newStatus: "AVAILABLE" | "LAUNDRY" | "UNAVAILABLE" | "ARCHIVED") => {
    if (newStatus === garment.status) return;
    setIsUpdatingStatus(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/wardrobe/${garment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change status");
      onUpdate({
        ...garment,
        status: newStatus,
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Could not update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/wardrobe/${garment.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete garment");
      onDelete(garment.id);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to delete garment");
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-charcoal/50 backdrop-blur-sm animate-fade-in flex justify-end">
      <div
        className="w-full max-w-xl h-full bg-card border-l border-border shadow-2xl flex flex-col justify-between overflow-hidden animate-slide-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/95">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn("text-[10px] font-mono tracking-wider uppercase font-semibold", currentStatusConfig.color)}
            >
              {currentStatusConfig.label}
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              ID: {garment.id.substring(0, 8)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(garment)}
              className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-charcoal hover:bg-atelier-100 transition-colors"
              title="Edit Garment"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-charcoal hover:bg-atelier-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Garment Hero View */}
          <div className="relative aspect-[4/3] w-full rounded-2xl bg-atelier-200/60 border border-border overflow-hidden flex items-center justify-center">
            {garment.imageUrl ? (
              <img
                src={garment.imageUrl}
                alt={garment.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
                <div
                  className="h-20 w-20 rounded-2xl border border-border shadow-md flex items-center justify-center"
                  style={{ backgroundColor: garment.colorPrimary }}
                >
                  <Shirt className="h-9 w-9 text-white/90" />
                </div>
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  {garment.subCategory}
                </p>
              </div>
            )}
          </div>

          {/* Title & Core Details */}
          <div>
            {garment.brand && (
              <p className="text-xs font-mono tracking-luxury uppercase text-muted-foreground">
                {garment.brand}
              </p>
            )}
            <h1 className="text-2xl font-serif font-semibold text-foreground tracking-tight mt-0.5">
              {garment.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {garment.category}
              </Badge>
              <span className="text-muted-foreground text-xs">•</span>
              <span className="text-xs font-medium text-foreground">
                {garment.subCategory}
              </span>
              {garment.size && (
                <>
                  <span className="text-muted-foreground text-xs">•</span>
                  <span className="text-xs font-mono text-muted-foreground">
                    Size: {garment.size}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Wear & Cost Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl border border-border bg-atelier-100/50">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Times Worn
              </p>
              <p className="text-lg font-serif font-bold text-foreground mt-0.5">
                {garment.wearCount} {garment.wearCount === 1 ? "wear" : "wears"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Cost Per Wear
              </p>
              <p className="text-lg font-serif font-bold text-foreground mt-0.5">
                {costPerWear ? `$${costPerWear}` : "N/A"}
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Original Price
              </p>
              <p className="text-lg font-serif font-bold text-foreground mt-0.5">
                {garment.purchasePrice ? `$${garment.purchasePrice.toFixed(2)}` : "—"}
              </p>
            </div>
          </div>

          {/* Quick Care Status Switcher */}
          <div>
            <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Update Care Status
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
              {(["AVAILABLE", "LAUNDRY", "UNAVAILABLE", "ARCHIVED"] as const).map((st) => (
                <button
                  key={st}
                  disabled={isUpdatingStatus}
                  onClick={() => handleStatusChange(st)}
                  className={cn(
                    "py-2 px-2.5 rounded-lg text-xs font-medium border text-center transition-all",
                    garment.status === st
                      ? "border-charcoal bg-charcoal text-cream shadow-subtle font-semibold"
                      : "border-border bg-card text-muted-foreground hover:bg-atelier-100"
                  )}
                >
                  {ITEM_STATUS_CONFIG[st].label}
                </button>
              ))}
            </div>
          </div>

          {/* Color & Material Attributes */}
          <div className="space-y-3 pt-3 border-t border-border">
            <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Color & Fabric Attributes
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] text-muted-foreground">Primary Palette</p>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className="h-5 w-5 rounded-full border border-border shadow-sm"
                    style={{ backgroundColor: garment.colorPrimary }}
                  />
                  <span className="text-xs font-mono uppercase text-foreground">
                    {garment.colorPrimary}
                  </span>
                </div>
              </div>

              {garment.colorSecondary && (
                <div>
                  <p className="text-[11px] text-muted-foreground">Accent Color</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className="h-5 w-5 rounded-full border border-border shadow-sm"
                      style={{ backgroundColor: garment.colorSecondary }}
                    />
                    <span className="text-xs font-mono uppercase text-foreground">
                      {garment.colorSecondary}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <p className="text-[11px] text-muted-foreground">Pattern</p>
                <p className="text-xs font-medium text-foreground mt-0.5 capitalize">
                  {garment.pattern.toLowerCase().replace("_", " ")}
                </p>
              </div>

              <div>
                <p className="text-[11px] text-muted-foreground">Material</p>
                <p className="text-xs font-medium text-foreground mt-0.5 capitalize">
                  {garment.material.toLowerCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Styling & Tailoring */}
          <div className="space-y-3 pt-3 border-t border-border">
            <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Styling & Tailoring
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-lg border border-border bg-card">
                <p className="text-[10px] font-mono text-muted-foreground uppercase">Fit</p>
                <p className="text-xs font-semibold text-foreground mt-0.5 capitalize">
                  {garment.fit.toLowerCase()}
                </p>
              </div>
              <div className="p-3 rounded-lg border border-border bg-card">
                <p className="text-[10px] font-mono text-muted-foreground uppercase">Style</p>
                <p className="text-xs font-semibold text-foreground mt-0.5 capitalize">
                  {garment.style.toLowerCase().replace("_", " ")}
                </p>
              </div>
              <div className="p-3 rounded-lg border border-border bg-card">
                <p className="text-[10px] font-mono text-muted-foreground uppercase">Formality</p>
                <p className="text-xs font-semibold text-foreground mt-0.5 capitalize">
                  {garment.formality.toLowerCase().replace("_", " ")}
                </p>
              </div>
            </div>
          </div>

          {/* Seasonality & Occasions */}
          <div className="space-y-3 pt-3 border-t border-border">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                Seasonality
              </p>
              <div className="flex flex-wrap gap-1.5">
                {garment.seasonality.map((s) => (
                  <Badge key={s} variant="outline" className="text-[11px] font-normal">
                    {s.toLowerCase().replace("_", " ")}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                Suitable Occasions
              </p>
              <div className="flex flex-wrap gap-1.5">
                {garment.occasions.map((o) => (
                  <Badge key={o} variant="secondary" className="text-[11px] font-normal">
                    {o.toLowerCase().replace("_", " ")}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          {garment.notes && (
            <div className="pt-3 border-t border-border">
              <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                Stylist Notes
              </p>
              <p className="text-xs text-foreground bg-atelier-100/70 p-3 rounded-lg border border-border/80">
                {garment.notes}
              </p>
            </div>
          )}

          {/* Delete Section */}
          <div className="pt-4 border-t border-border">
            {confirmDelete ? (
              <div className="p-4 rounded-xl border border-red-200 bg-red-50 space-y-3">
                <p className="text-xs font-medium text-red-900">
                  Are you sure you want to delete this garment? This will permanently remove it and its outfit links.
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={isDeleting}
                    onClick={handleDelete}
                    className="text-xs h-8"
                  >
                    {isDeleting ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                    Confirm Delete
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setConfirmDelete(false)}
                    className="text-xs h-8"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 transition-colors font-medium"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Remove garment from wardrobe</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border bg-atelier-100/60 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => onEdit(garment)}
            className="flex-1 text-xs h-10 border-border hover:bg-card"
          >
            <Edit3 className="h-3.5 w-3.5 mr-1.5" />
            Edit Attributes
          </Button>

          <Button
            onClick={handleLogWear}
            disabled={isLoggingWear}
            className="flex-1 bg-charcoal text-cream hover:bg-charcoal/90 text-xs h-10 shadow-subtle"
          >
            {isLoggingWear ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
            ) : (
              <Check className="h-3.5 w-3.5 mr-1.5" />
            )}
            Log Outfit Wear (+1)
          </Button>
        </div>
      </div>
    </div>
  );
}

function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return <label className={className}>{children}</label>;
}
