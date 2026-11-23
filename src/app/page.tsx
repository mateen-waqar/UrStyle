import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Shirt,
  Box,
  Wand2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Compass,
  Palette,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-beige-300 selection:text-charcoal flex flex-col">
      {/* Editorial Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="font-serif text-2xl font-medium tracking-tight text-foreground">
              StyleOS
            </span>
            <span className="text-[9px] font-mono tracking-luxury uppercase px-2 py-0.5 rounded border border-border bg-atelier-200 text-muted-foreground">
              Atelier v1.0
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium tracking-wide text-muted-foreground">
            <Link href="#features" className="hover:text-charcoal transition-colors">
              Philosophy
            </Link>
            <Link href="#engine" className="hover:text-charcoal transition-colors">
              Deterministic Engine
            </Link>
            <Link href="#how-it-works" className="hover:text-charcoal transition-colors">
              How It Works
            </Link>
            <Link href="#virtual-studio" className="hover:text-charcoal transition-colors">
              3D Studio
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-xs">
                Sign In
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm" variant="default" className="text-xs">
                Open Atelier
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-20 pb-24 md:pt-28 md:pb-36 px-6 max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-atelier-200/90 text-charcoal text-[11px] font-mono tracking-wide shadow-subtle">
              <Sparkles className="h-3 w-3 text-beige-600" />
              <span>Fashion Technology • Deterministic Sartorial Intelligence</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-medium tracking-tight text-foreground leading-[1.08]">
              Your Wardrobe. <br />
              <span className="italic font-normal text-muted-foreground">Reimagined.</span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-muted-foreground font-normal max-w-2xl mx-auto leading-relaxed">
              A digital wardrobe and intelligent styling platform. Digitize your collection, generate mathematically harmonious outfit combinations through deterministic rule matrices, and visualize in 3D.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link href="/wardrobe" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto gap-2 bg-charcoal text-white hover:bg-black font-medium">
                  <span>Build Your Wardrobe</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/studio" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 border-border hover:border-charcoal/40 text-charcoal">
                  <Box className="h-4 w-4 text-beige-600" />
                  <span>Launch 3D Studio</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Visual Preview of Outfit Combinations (Editorial Layout) */}
          <div className="mt-16 md:mt-24 p-6 sm:p-8 rounded-2xl border border-border/90 bg-card shadow-elevated">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-border/60 gap-4">
              <div>
                <span className="text-[10px] font-mono tracking-luxury uppercase text-muted-foreground">
                  Editorial Outfit Preview
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-medium text-foreground">
                  Autumn Tailoring & Tactile Layering
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="beige" className="text-[10px]">
                  96% Harmony Index
                </Badge>
                <span className="text-xs font-mono text-muted-foreground">Smart Casual • Fall 2026</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
              {[
                {
                  slot: "Upper Garment",
                  name: "Cashmere Ribbed Turtleneck",
                  brand: "Loro Piana",
                  material: "100% Cashmere",
                  color: "#2C2926",
                  formality: "Smart Casual",
                },
                {
                  slot: "Trouser",
                  name: "Single-Pleat Flannel Pants",
                  brand: "Brunello Cucinelli",
                  material: "Virgin Wool",
                  color: "#46423D",
                  formality: "Smart Casual",
                },
                {
                  slot: "Footwear",
                  name: "Suede Chelsea Boots",
                  brand: "Common Projects",
                  material: "Calf Suede",
                  color: "#5A4B3E",
                  formality: "Smart Casual",
                },
                {
                  slot: "Outer Layer",
                  name: "Double-Breasted Wool Overcoat",
                  brand: "The Row",
                  material: "Melton Wool",
                  color: "#181716",
                  formality: "Business Casual",
                },
              ].map((garment, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-border/80 bg-atelier-200/50 p-4 space-y-3 hover:border-charcoal/30 transition-all"
                >
                  <div className="aspect-[4/3] rounded-lg bg-atelier-100 border border-border/60 flex items-center justify-center relative overflow-hidden">
                    <div
                      className="h-12 w-12 rounded-xl shadow-subtle flex items-center justify-center border border-border/60"
                      style={{ backgroundColor: garment.color }}
                    >
                      <Shirt className="h-5 w-5 text-white/80" />
                    </div>
                    <span className="absolute top-2 left-2 text-[9px] font-mono tracking-widest uppercase text-muted-foreground px-1.5 py-0.5 rounded bg-card/80">
                      {garment.slot}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-mono tracking-luxury uppercase text-muted-foreground">
                      {garment.brand}
                    </p>
                    <h5 className="text-xs font-medium text-foreground truncate">
                      {garment.name}
                    </h5>
                    <div className="flex items-center justify-between pt-1 text-[10px] text-muted-foreground border-t border-border/40">
                      <span>{garment.material}</span>
                      <span>{garment.formality}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-xl bg-atelier-100 border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-beige-500 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-medium text-charcoal">Deterministic Rule Fired: </span>
                  Neutral Color Anchor + Contrast Ratio 4.2:1 + Formality Alignment Delta ≤ 1.0.
                </p>
              </div>

              <Link href="/studio">
                <Button size="sm" variant="outline" className="gap-1.5 text-xs whitespace-nowrap">
                  <Box className="h-3.5 w-3.5 text-beige-600" />
                  <span>Preview Outfit on 3D Avatar</span>
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Sections */}
        <section id="features" className="py-24 border-t border-border/70 bg-atelier-100/60 px-6">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-[10px] font-mono tracking-luxury uppercase text-muted-foreground">
                Sartorial Philosophy
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-foreground">
                Precision engineering meets luxury fashion.
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                StyleOS treats personal style as an architectural system. Every piece in your closet has purpose, proportion, and compatibility.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="rounded-2xl border border-border/90 bg-card p-8 space-y-4 shadow-card hover:border-charcoal/30 transition-all">
                <div className="h-10 w-10 rounded-xl bg-atelier-200 border border-border/70 flex items-center justify-center text-charcoal">
                  <SlidersHorizontal className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-xl font-medium text-foreground">
                  Deterministic Rule Engine
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Zero LLM hallucinations or unpredictable advice. Outfit recommendations are calculated strictly through classical color wheels, silhouette proportions, formality delta scoring, and seasonality filters.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-2xl border border-border/90 bg-card p-8 space-y-4 shadow-card hover:border-charcoal/30 transition-all">
                <div className="h-10 w-10 rounded-xl bg-atelier-200 border border-border/70 flex items-center justify-center text-charcoal">
                  <Box className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-xl font-medium text-foreground">
                  3D Virtual Fitting Mannequin
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Interactive stylized-realistic 3D male and female avatars powered by Three.js & React Three Fiber. Inspect silhouette drape, lighting reflections, and layering in full 360-degree rotation.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-2xl border border-border/90 bg-card p-8 space-y-4 shadow-card hover:border-charcoal/30 transition-all">
                <div className="h-10 w-10 rounded-xl bg-atelier-200 border border-border/70 flex items-center justify-center text-charcoal">
                  <Calendar className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-xl font-medium text-foreground">
                  Capsule & Calendar Planning
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Schedule looks for upcoming travels, galas, meetings, and dates. Track garment wear counts, calculate cost-per-wear metrics, and curating private lookbook capsules.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 border-t border-border/70 px-6 max-w-7xl mx-auto">
          <div className="space-y-16">
            <div className="space-y-2 max-w-xl">
              <span className="text-[10px] font-mono tracking-luxury uppercase text-muted-foreground">
                Methodology
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-foreground">
                How StyleOS Works
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Three simple steps to transform your closet into an intelligent, effortless wardrobe system.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Digitize Your Closet",
                  desc: "Add your clothing, shoes, watches, and accessories. Tag primary & secondary colors, fabric textures, formality tiers, and seasonal readiness.",
                },
                {
                  step: "02",
                  title: "Deterministic Sartorial Math",
                  desc: "Select an occasion (Date Night, Business Casual, Weekend Travel). Our engine calculates color wheel harmonies and formality alignment with zero AI guesswork.",
                },
                {
                  step: "03",
                  title: "3D Visualization & Scheduling",
                  desc: "Preview your combination in the 3D Virtual Studio on customizable avatars. Receive editorial styling cues like French tucks and sleeve folds, then save to your calendar.",
                },
              ].map((item, idx) => (
                <div key={idx} className="relative pl-8 border-l border-border/80 space-y-2">
                  <span className="font-mono text-xs font-semibold text-charcoal block">
                    {item.step}
                  </span>
                  <h4 className="font-serif text-lg font-medium text-foreground">
                    {item.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3D Virtual Styling Preview Callout */}
        <section id="virtual-studio" className="py-24 border-t border-border/70 bg-charcoal text-white px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/10 text-[11px] font-mono text-beige-300">
                <Box className="h-3 w-3" />
                <span>Three.js / React Three Fiber Studio</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-white leading-tight">
                Inspect your silhouettes in 360-degree 3D.
              </h2>

              <p className="text-sm text-stone-300 leading-relaxed max-w-md">
                Adjust avatar proportions (shoulder width, height scale, waist), toggle female or male rigs, alter skin tones, and inspect your garments under editorial studio key and rim lights.
              </p>

              <div className="pt-2">
                <Link href="/studio">
                  <Button size="lg" className="bg-white text-charcoal hover:bg-beige-100 font-medium gap-2">
                    <span>Enter 3D Virtual Atelier</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Mannequin Viewport Teaser Card */}
            <div className="rounded-2xl border border-white/10 bg-stone-900/80 p-6 space-y-4 shadow-elevated">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-[10px] font-mono tracking-luxury uppercase text-stone-400">
                  Realtime WebGL Canvas
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/10 text-beige-300">
                  Ready
                </span>
              </div>
              <div className="aspect-[4/3] rounded-xl bg-stone-950 border border-white/10 flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="h-16 w-16 rounded-full bg-stone-800 border border-white/20 flex items-center justify-center text-beige-400">
                  <Box className="h-8 w-8 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-white">Interactive Stylized Avatar</p>
                  <p className="text-[11px] text-stone-400">
                    Orbit Controls • PBR Materials • Contact Shadows
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-24 border-t border-border/70 px-6 max-w-7xl mx-auto text-center space-y-6">
          <h2 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-foreground">
            Curate your digital wardrobe today.
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Eliminate decision fatigue and dress with architectural intentionality.
          </p>
          <div className="pt-2">
            <Link href="/wardrobe">
              <Button size="lg" className="bg-charcoal text-white hover:bg-black font-medium gap-2">
                <span>Start Building Your Wardrobe</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-border/80 bg-atelier-50 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-muted-foreground">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <span className="font-serif text-lg font-medium tracking-tight text-foreground">
              StyleOS
            </span>
            <span className="hidden sm:inline text-border">•</span>
            <span className="text-[11px] font-mono tracking-wider uppercase">
              The Digital Operating System for Personal Style
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/dashboard" className="hover:text-charcoal transition-colors">
              Dashboard
            </Link>
            <Link href="/wardrobe" className="hover:text-charcoal transition-colors">
              My Wardrobe
            </Link>
            <Link href="/outfits" className="hover:text-charcoal transition-colors">
              Outfit Engine
            </Link>
            <Link href="/studio" className="hover:text-charcoal transition-colors">
              3D Studio
            </Link>
            <Link href="/calendar" className="hover:text-charcoal transition-colors">
              Calendar
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
