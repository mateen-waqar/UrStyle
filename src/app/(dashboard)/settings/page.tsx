"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sliders, Check, Loader2, AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const [aesthetic, setAesthetic] = useState("QUIET_LUXURY");
  const [fitPreference, setFitPreference] = useState("REGULAR");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [heightCm, setHeightCm] = useState<number | "">("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const aesthetics = [
    { key: "QUIET_LUXURY", label: "Quiet Luxury", desc: "Understated neutral palettes, premium natural fibres, discreet tailoring" },
    { key: "MINIMALIST", label: "Minimalist", desc: "Monochrome foundations, architectural lines, functional simplicity" },
    { key: "CLASSIC_TAILORING", label: "Classic Tailoring", desc: "Neapolitan & Savile Row heritage, double-breasted stances, pleats" },
    { key: "SMART_CASUAL", label: "Smart Casual", desc: "Elevated daily uniform pairing tailoring with casual textures" },
    { key: "OLD_MONEY", label: "Old Money", desc: "Traditional heritage sportswear, cable knits, linen shirts, horsebit loafers" },
    { key: "STREETWEAR", label: "Streetwear", desc: "Contemporary silhouettes, elevated proportions, boxy cuts, luxury sneakers" },
  ];

  // Fetch real profile from DB
  useEffect(() => {
    async function fetchProfile() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.user?.email) setEmail(data.user.email);
          if (data.profile) {
            setDisplayName(data.profile.displayName || "");
            if (data.profile.aesthetic) setAesthetic(data.profile.aesthetic);
            if (data.profile.preferredFit) setFitPreference(data.profile.preferredFit);
            setCity(data.profile.city || "");
            setCountry(data.profile.country || "");
            if (data.profile.heightCm) setHeightCm(data.profile.heightCm);
          }
        }
      } catch (err: any) {
        console.error("Failed to load profile:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim() || undefined,
          aesthetic,
          preferredFit: fitPreference,
          city: city.trim() || null,
          country: country.trim() || null,
          heightCm: heightCm ? Number(heightCm) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save preferences");
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error("Save profile error:", err);
      setErrorMessage(err.message || "Failed to persist changes");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <Header
        eyebrow="Preferences • Account & Atelier Tailoring"
        title="Settings"
        description="Personalize your sartorial profile, styling preferences, and digital wardrobe defaults."
        actions={
          <Button
            size="sm"
            variant="default"
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="gap-2 text-xs bg-charcoal text-cream hover:bg-charcoal/90"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-300" />
                <span>Saved to Database</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </Button>
        }
      />

      {errorMessage && (
        <div className="p-3.5 rounded-xl border border-red-200 bg-red-50 text-red-800 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-2">
          <Loader2 className="h-6 w-6 animate-spin text-charcoal/60" />
          <p className="text-xs font-mono text-muted-foreground">Loading preferences...</p>
        </div>
      ) : (
        <>
          {/* Aesthetic Profile Section */}
          <div className="rounded-xl border border-border/80 bg-card p-6 shadow-subtle space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-border/50">
              <Sliders className="h-4 w-4 text-beige-600" />
              <h3 className="font-serif text-lg font-medium text-foreground">
                Aesthetic Foundation
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {aesthetics.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setAesthetic(item.key)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    aesthetic === item.key
                      ? "border-charcoal bg-atelier-200/90 shadow-subtle"
                      : "border-border/80 bg-atelier-100/40 hover:border-charcoal/30 hover:bg-atelier-100"
                  }`}
                >
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-medium text-foreground">{item.label}</span>
                    {aesthetic === item.key && (
                      <span className="h-2 w-2 rounded-full bg-charcoal" />
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Fit Preferences */}
          <div className="rounded-xl border border-border/80 bg-card p-6 shadow-subtle space-y-4">
            <h4 className="font-serif text-base font-medium text-foreground">
              Preferred Silhouette Fit
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {["SLIM", "REGULAR", "RELAXED", "OVERSIZED"].map((fit) => (
                <button
                  key={fit}
                  type="button"
                  onClick={() => setFitPreference(fit)}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium tracking-wide transition-all ${
                    fitPreference === fit
                      ? "border-charcoal bg-charcoal text-white"
                      : "border-border/80 bg-atelier-100/60 text-muted-foreground hover:bg-atelier-200 hover:text-charcoal"
                  }`}
                >
                  {fit.toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* User Information */}
          <div className="rounded-xl border border-border/80 bg-card p-6 shadow-subtle space-y-4">
            <h4 className="font-serif text-base font-medium text-foreground">
              Profile Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Display Name</label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Julian Laurent"
                  className="border-border bg-card text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Account Email</label>
                <Input
                  value={email}
                  disabled
                  className="border-border bg-atelier-100/60 text-xs text-muted-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">City</label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Geneva, Paris, Tokyo"
                  className="border-border bg-card text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Country</label>
                <Input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. Switzerland"
                  className="border-border bg-card text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Height (cm)</label>
                <Input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 180"
                  className="border-border bg-card text-xs"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
