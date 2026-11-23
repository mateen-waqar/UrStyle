"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Box,
  Shirt,
  Palette,
  Briefcase,
  Sliders,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
} from "lucide-react";

const TOTAL_STEPS = 7;

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [displayName, setDisplayName] = useState("");
  const [genderPreference, setGenderPreference] = useState<"MALE" | "FEMALE" | "UNISEX" | "NON_BINARY">("UNISEX");
  const [avatarGender, setAvatarGender] = useState<"MALE" | "FEMALE">("MALE");
  const [aesthetic, setAesthetic] = useState<string>("SMART_CASUAL");
  const [favoriteColors, setFavoriteColors] = useState<string[]>([
    "#181716",
    "#292624",
    "#B08968",
    "#F5F2EB",
  ]);
  const [lifestyle, setLifestyle] = useState<string>("DAILY_CASUAL");
  const [heightCm, setHeightCm] = useState<string>("");
  const [preferredFit, setPreferredFit] = useState<"SLIM" | "REGULAR" | "OVERSIZED">("REGULAR");

  // Fetch initial resumable state from server
  useEffect(() => {
    async function fetchOnboardingState() {
      try {
        const res = await fetch("/api/onboarding");
        if (res.status === 401) {
          router.push("/login?next=/onboarding");
          return;
        }

        const data = await res.json();
        if (data.onboardingCompleted) {
          router.push("/dashboard");
          return;
        }

        if (data.profile) {
          if (data.profile.displayName) setDisplayName(data.profile.displayName);
          if (data.profile.genderPreference) setGenderPreference(data.profile.genderPreference);
          if (data.profile.aesthetic) setAesthetic(data.profile.aesthetic);
          if (data.profile.favoriteColors?.length > 0) setFavoriteColors(data.profile.favoriteColors);
          if (data.profile.lifestyle) setLifestyle(data.profile.lifestyle);
          if (data.profile.heightCm) setHeightCm(String(data.profile.heightCm));
          if (data.profile.preferredFit) setPreferredFit(data.profile.preferredFit);
        }

        if (data.onboardingStep && data.onboardingStep >= 1 && data.onboardingStep <= 7) {
          setCurrentStep(data.onboardingStep);
        }
      } catch (err) {
        // Fallback to step 1
      } finally {
        setIsLoadingInitial(false);
      }
    }

    fetchOnboardingState();
  }, [router]);

  // Color Swatches definition
  const colorSwatches = [
    { label: "Noir", hex: "#181716" },
    { label: "Charcoal", hex: "#292624" },
    { label: "Flannel Grey", hex: "#4A4642" },
    { label: "Warm Ivory", hex: "#F5F2EB" },
    { label: "Camel", hex: "#B08968" },
    { label: "Oatmeal Sand", hex: "#D4C5B0" },
    { label: "Midnight Navy", hex: "#1E2A38" },
    { label: "Forest Olive", hex: "#3B4A3F" },
    { label: "Deep Burgundy", hex: "#4A2027" },
    { label: "Terracotta", hex: "#8C4F3B" },
    { label: "Warm Espresso", hex: "#332219" },
    { label: "Alabaster White", hex: "#FAFAF8" },
  ];

  const toggleColor = (hex: string) => {
    setFavoriteColors((prev) =>
      prev.includes(hex) ? prev.filter((c) => c !== hex) : [...prev, hex]
    );
  };

  // Step Saver (Resumable)
  const handleSaveStepAndAdvance = async () => {
    setErrorMsg(null);
    setIsSaving(true);

    try {
      let stepPayload: Record<string, any> = {};

      switch (currentStep) {
        case 1:
          if (!displayName.trim() || displayName.trim().length < 2) {
            setErrorMsg("Please enter a name of at least 2 characters.");
            setIsSaving(false);
            return;
          }
          stepPayload = { displayName: displayName.trim(), genderPreference };
          break;
        case 2:
          stepPayload = { avatarGender };
          break;
        case 3:
          stepPayload = { aesthetic };
          break;
        case 4:
          if (favoriteColors.length === 0) {
            setErrorMsg("Please select at least one favorite color swatch.");
            setIsSaving(false);
            return;
          }
          stepPayload = { favoriteColors };
          break;
        case 5:
          stepPayload = { lifestyle };
          break;
        case 6:
          stepPayload = {
            heightCm: heightCm ? parseFloat(heightCm) : null,
            preferredFit,
          };
          break;
        default:
          break;
      }

      // Persist step data to database via authenticated Supabase session
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_step",
          step: currentStep + 1,
          data: stepPayload,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to persist step");
      }

      setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save step progress.");
    } finally {
      setIsSaving(false);
    }
  };

  // Complete Onboarding
  const handleCompleteOnboarding = async () => {
    setIsSaving(true);
    setErrorMsg(null);

    try {
      const payload = {
        displayName: displayName.trim() || "Atelier Member",
        genderPreference,
        avatarGender,
        aesthetic,
        favoriteColors,
        lifestyle,
        heightCm: heightCm ? parseFloat(heightCm) : null,
        preferredFit,
      };

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete",
          data: payload,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to finalize onboarding");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to complete onboarding.");
      setIsSaving(false);
    }
  };

  if (isLoadingInitial) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-charcoal" />
        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Loading Atelier Profile...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-6 sm:p-10">
      {/* Header */}
      <header className="max-w-3xl mx-auto w-full flex items-center justify-between pb-6 border-b border-border/60">
        <div className="flex items-center gap-2">
          <span className="font-serif text-xl font-medium tracking-tight text-foreground">
            StyleOS
          </span>
          <span className="text-[9px] font-mono tracking-luxury uppercase px-1.5 py-0.5 rounded border border-border bg-atelier-200 text-muted-foreground">
            Onboarding
          </span>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono text-muted-foreground">
            Step {currentStep} of {TOTAL_STEPS}
          </span>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="max-w-3xl mx-auto w-full pt-4">
        <div className="h-1 w-full bg-atelier-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-charcoal transition-all duration-300"
            style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-2xl mx-auto w-full my-auto py-10">
        {errorMsg && (
          <div className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive">
            {errorMsg}
          </div>
        )}

        {/* ================= STEP 1: Personal Information ================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-[10px] font-mono tracking-luxury uppercase text-muted-foreground block">
                Step 01 • Identity
              </span>
              <h2 className="font-serif text-3xl font-medium text-foreground tracking-tight">
                Personal Information
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tell us how you would like your atelier profile to be addressed.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Display Name</label>
                <Input
                  type="text"
                  placeholder="Julian Laurent"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="h-11 border-border bg-card text-sm text-foreground focus:border-charcoal shadow-subtle"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs font-medium text-foreground block">
                  Gender Preference (for tailored cuts & sizing)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { key: "MALE", label: "Men's Tailoring" },
                    { key: "FEMALE", label: "Women's Cuts" },
                    { key: "UNISEX", label: "Unisex / Fluid" },
                    { key: "NON_BINARY", label: "Non-Binary" },
                  ].map((g) => (
                    <button
                      key={g.key}
                      type="button"
                      onClick={() => setGenderPreference(g.key as any)}
                      className={`p-3 rounded-xl border text-xs font-medium text-center transition-all ${
                        genderPreference === g.key
                          ? "border-charcoal bg-charcoal text-white shadow-subtle"
                          : "border-border/80 bg-card hover:border-charcoal/40 text-muted-foreground hover:text-charcoal"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: Avatar Selection ================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-[10px] font-mono tracking-luxury uppercase text-muted-foreground block">
                Step 02 • 3D Mannequin
              </span>
              <h2 className="font-serif text-3xl font-medium text-foreground tracking-tight">
                Select Your 3D Avatar
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Choose the primary stylized-realistic mannequin rig for your 3D Virtual Fitting Studio. You can customize proportions at any time.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {[
                {
                  gender: "MALE" as const,
                  title: "Male Atelier Rig",
                  desc: "Structured shoulders, tapered waist, tailored trousers drape.",
                  height: "185 cm base scale",
                },
                {
                  gender: "FEMALE" as const,
                  title: "Female Atelier Rig",
                  desc: "Soft contour shoulders, cinched waist, graceful garment drape.",
                  height: "175 cm base scale",
                },
              ].map((av) => (
                <div
                  key={av.gender}
                  onClick={() => setAvatarGender(av.gender)}
                  className={`p-6 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
                    avatarGender === av.gender
                      ? "border-charcoal bg-atelier-200/90 shadow-elevated"
                      : "border-border/90 bg-card hover:border-charcoal/30 shadow-card"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-xl bg-card border border-border flex items-center justify-center text-charcoal">
                      <Box className="h-5 w-5" />
                    </div>
                    {avatarGender === av.gender && (
                      <span className="h-3 w-3 rounded-full bg-charcoal" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-serif text-lg font-medium text-foreground">
                      {av.title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {av.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border/50 text-[10px] font-mono text-muted-foreground">
                    {av.height}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= STEP 3: Fashion Preferences ================= */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-[10px] font-mono tracking-luxury uppercase text-muted-foreground block">
                Step 03 • Aesthetic
              </span>
              <h2 className="font-serif text-3xl font-medium text-foreground tracking-tight">
                Fashion Preferences
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Select the stylistic aesthetic that best represents your sartorial philosophy.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                { key: "CASUAL", label: "Casual", desc: "Relaxed essentials, denim, soft knits, effortless layers" },
                { key: "SMART_CASUAL", label: "Smart Casual", desc: "Tailoring paired with knits, loafers, versatile elegance" },
                { key: "FORMAL", label: "Formal", desc: "Structured suiting, dress shirts, oxfords, black-tie precision" },
                { key: "STREETWEAR", label: "Streetwear", desc: "Architectural silhouettes, raw denim, statement outerwear" },
                { key: "MINIMAL", label: "Minimal", desc: "Monochrome, clean geometric cuts, zero excess branding" },
                { key: "OLD_MONEY", label: "Old Money", desc: "Heritage fabrics, cashmere, loafers, muted neutral palettes" },
                { key: "SPORTY", label: "Sporty", desc: "Athletic luxury, technical fabrics, clean functional sneakers" },
              ].map((style) => (
                <button
                  key={style.key}
                  type="button"
                  onClick={() => setAesthetic(style.key)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    aesthetic === style.key
                      ? "border-charcoal bg-atelier-200/90 shadow-subtle"
                      : "border-border/80 bg-card hover:border-charcoal/30 shadow-card"
                  }`}
                >
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-medium text-foreground">{style.label}</span>
                    {aesthetic === style.key && (
                      <span className="h-2 w-2 rounded-full bg-charcoal" />
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {style.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ================= STEP 4: Favorite Colors ================= */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-[10px] font-mono tracking-luxury uppercase text-muted-foreground block">
                Step 04 • Color Palette
              </span>
              <h2 className="font-serif text-3xl font-medium text-foreground tracking-tight">
                Favorite Colors
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Choose the foundation colors that dominate your wardrobe. Multi-selection allowed.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {colorSwatches.map((swatch) => {
                const isSelected = favoriteColors.includes(swatch.hex);
                return (
                  <button
                    key={swatch.hex}
                    type="button"
                    onClick={() => toggleColor(swatch.hex)}
                    className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                      isSelected
                        ? "border-charcoal bg-atelier-200/90 shadow-subtle scale-[1.02]"
                        : "border-border/80 bg-card hover:border-charcoal/30 shadow-card"
                    }`}
                  >
                    <span
                      className="h-5 w-5 rounded-full border border-border/80 shadow-subtle shrink-0"
                      style={{ backgroundColor: swatch.hex }}
                    />
                    <div className="text-left overflow-hidden">
                      <p className="text-xs font-medium text-foreground truncate">
                        {swatch.label}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="text-xs text-muted-foreground font-mono">
              Selected: {favoriteColors.length} color{favoriteColors.length === 1 ? "" : "s"}
            </div>
          </div>
        )}

        {/* ================= STEP 5: Lifestyle ================= */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-[10px] font-mono tracking-luxury uppercase text-muted-foreground block">
                Step 05 • Context
              </span>
              <h2 className="font-serif text-3xl font-medium text-foreground tracking-tight">
                Your Primary Lifestyle
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This primes the deterministic engine to weight outfits suited to your daily routine.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {[
                { key: "OFFICE", label: "Office & Corporate", desc: "Corporate environments, client presentations, daily desk elegance" },
                { key: "BUSINESS", label: "Executive Business", desc: "Formal boardrooms, high-stakes negotiations, black-tie events" },
                { key: "DAILY_CASUAL", label: "Daily Casual", desc: "Remote work, neighborhood strolls, gallery visits, cafe mornings" },
                { key: "UNIVERSITY", label: "University & Academia", desc: "Campus commutes, lectures, library sessions, relaxed social events" },
                { key: "SPECIAL_OCCASIONS", label: "Special Occasions & Travel", desc: "Fashion weeks, resort getaways, galas, frequent international flights" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setLifestyle(item.key)}
                  className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                    lifestyle === item.key
                      ? "border-charcoal bg-atelier-200/90 shadow-subtle"
                      : "border-border/80 bg-card hover:border-charcoal/30 shadow-card"
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-medium text-foreground">{item.label}</span>
                    <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                  </div>
                  {lifestyle === item.key && (
                    <span className="h-2.5 w-2.5 rounded-full bg-charcoal shrink-0 ml-4" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ================= STEP 6: Body and Fit Preferences ================= */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-[10px] font-mono tracking-luxury uppercase text-muted-foreground block">
                Step 06 • Fit Architecture
              </span>
              <h2 className="font-serif text-3xl font-medium text-foreground tracking-tight">
                Body & Fit Preferences
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Configure your preferred silhouette drape and optional height for proportional accuracy.
              </p>
            </div>

            <div className="space-y-6 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Height in Centimeters <span className="text-muted-foreground">(Optional)</span>
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 182"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="h-11 border-border bg-card text-sm text-foreground focus:border-charcoal shadow-subtle max-w-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground block">
                  Preferred Silhouette Fit
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { key: "SLIM" as const, label: "Slim Fit", desc: "Closer to body, sharp lines, tailored taper" },
                    { key: "REGULAR" as const, label: "Regular Fit", desc: "Classical proportions, balanced comfort and drape" },
                    { key: "OVERSIZED" as const, label: "Oversized Fit", desc: "Relaxed drop shoulders, wide trousers, volume" },
                  ].map((fit) => (
                    <button
                      key={fit.key}
                      type="button"
                      onClick={() => setPreferredFit(fit.key)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        preferredFit === fit.key
                          ? "border-charcoal bg-atelier-200/90 shadow-subtle"
                          : "border-border/80 bg-card hover:border-charcoal/30 shadow-card"
                      }`}
                    >
                      <div className="flex items-center justify-between pb-1">
                        <span className="text-xs font-medium text-foreground">{fit.label}</span>
                        {preferredFit === fit.key && (
                          <span className="h-2 w-2 rounded-full bg-charcoal" />
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">{fit.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 7: Completion ================= */}
        {currentStep === 7 && (
          <div className="space-y-8 text-center animate-in fade-in duration-300">
            <div className="h-16 w-16 rounded-full bg-atelier-200 border border-border flex items-center justify-center mx-auto text-charcoal shadow-elevated">
              <Sparkles className="h-8 w-8 stroke-[1.5]" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-luxury uppercase text-muted-foreground block">
                Atelier Profile Ready
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-medium text-foreground tracking-tight">
                Welcome to StyleOS, {displayName || "Julian"}.
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Your sartorial preferences, 3D avatar rig, and color palette have been calibrated.
              </p>
            </div>

            {/* Profile Summary Card */}
            <div className="p-6 rounded-2xl border border-border/90 bg-card shadow-card text-left max-w-md mx-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <span className="text-xs font-medium text-foreground">Avatar Rig</span>
                <span className="text-xs font-mono text-muted-foreground capitalize">
                  {avatarGender.toLowerCase()} Mannequin
                </span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <span className="text-xs font-medium text-foreground">Aesthetic Base</span>
                <span className="text-xs font-mono text-muted-foreground capitalize">
                  {aesthetic.toLowerCase().replace("_", " ")}
                </span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <span className="text-xs font-medium text-foreground">Lifestyle</span>
                <span className="text-xs font-mono text-muted-foreground capitalize">
                  {lifestyle.toLowerCase().replace("_", " ")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">Color Palette</span>
                <div className="flex items-center gap-1.5">
                  {favoriteColors.slice(0, 5).map((color, idx) => (
                    <span
                      key={idx}
                      className="h-3.5 w-3.5 rounded-full border border-border/80"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 max-w-md mx-auto">
              <Button
                onClick={handleCompleteOnboarding}
                disabled={isSaving}
                className="w-full bg-charcoal text-white hover:bg-black font-medium text-xs tracking-wider uppercase h-11 shadow-subtle gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Entering Atelier...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Your Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Navigation Footer Controls (Steps 1 to 6) */}
      {currentStep < TOTAL_STEPS && (
        <footer className="max-w-2xl mx-auto w-full flex items-center justify-between pt-6 border-t border-border/60">
          {currentStep > 1 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
              disabled={isSaving}
              className="gap-2 text-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </Button>
          ) : (
            <div />
          )}

          <Button
            variant="default"
            size="sm"
            onClick={handleSaveStepAndAdvance}
            disabled={isSaving}
            className="gap-2 text-xs bg-charcoal text-white hover:bg-black px-6"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Saving Step...</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </footer>
      )}
    </div>
  );
}
