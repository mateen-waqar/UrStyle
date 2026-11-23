"use client";

import React from "react";
import {
  X,
  Sparkles,
  Compass,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  ShieldCheck,
  Shirt,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StylingAnalysisResult, StylingRecommendation } from "@/modules/outfit-styling-engine/services/styleRuleEvaluator";
import { DetailedOutfitScore } from "@/modules/outfit-generation-engine/services/ruleEvaluationEngine";
import { cn } from "@/lib/utils";

interface StyleAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  stylingResult: StylingAnalysisResult | null;
  scoreResult?: DetailedOutfitScore | null;
  outfitTitle?: string;
  occasion?: string;
}

export function StyleAssistantDrawer({
  isOpen,
  onClose,
  stylingResult,
  scoreResult,
  outfitTitle = "Outfit Styling Analysis",
  occasion = "Casual Outing",
}: StyleAssistantDrawerProps) {
  if (!isOpen || !stylingResult) return null;

  const scorePct = scoreResult ? Math.round(scoreResult.compositeScore * 100) : null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-charcoal/50 backdrop-blur-sm animate-fade-in flex justify-end">
      <div
        className="w-full max-w-xl h-full bg-card border-l border-border shadow-2xl flex flex-col justify-between overflow-hidden animate-slide-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/95">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-charcoal text-cream flex items-center justify-center shadow-subtle">
              <Compass className="h-4 w-4 text-beige-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                  Style My Fit
                </span>
                <span className="text-border">•</span>
                <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                  Rule Assistant
                </span>
              </div>
              <h2 className="text-base font-serif font-semibold text-foreground tracking-tight">
                {outfitTitle}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-charcoal hover:bg-atelier-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Recommendations Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Harmony Score Banner */}
          {scoreResult && (
            <div className="p-4 rounded-xl border border-border bg-atelier-100/60 shadow-subtle flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Rule Harmony Score
                </p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-serif font-bold text-foreground">
                    {scorePct}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {scorePct! >= 85 ? "Optimal Symmetry" : "Balanced Pairing"}
                  </span>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs font-mono capitalize">
                {stylingResult.silhouetteBalance.toLowerCase().replace("_", " ")}
              </Badge>
            </div>
          )}

          {/* Assistant Overview */}
          <div className="p-4 rounded-xl border border-border bg-card shadow-subtle space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
              <Lightbulb className="h-3.5 w-3.5 text-charcoal" />
              <span>Editorial Directive</span>
            </div>
            <p className="text-xs text-foreground leading-relaxed">
              {stylingResult.overallSummary}
            </p>
          </div>

          {/* Recommendations List */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-charcoal" />
              Sartorial Rules & Adjustments ({stylingResult.recommendations.length})
            </h3>

            <div className="space-y-3.5">
              {stylingResult.recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-xl border border-border bg-card hover:border-charcoal/40 transition-all shadow-subtle space-y-2.5"
                >
                  {/* Category Pill + Title */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground tracking-tight flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-charcoal" />
                      {rec.title}
                    </span>
                    <Badge variant="outline" className="text-[9px] font-mono uppercase">
                      {rec.category}
                    </Badge>
                  </div>

                  {/* 1. Action */}
                  <div className="p-2.5 rounded-lg bg-atelier-100/70 border border-border/60">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-charcoal font-bold block mb-0.5">
                      Action
                    </span>
                    <p className="text-xs font-medium text-foreground">
                      {rec.action}
                    </p>
                  </div>

                  {/* 2. Explanation */}
                  <div className="pl-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block mb-0.5">
                      Explanation
                    </span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {rec.explanation}
                    </p>
                  </div>

                  {/* 3. Styling Reason */}
                  <div className="pl-1 pt-1 border-t border-border/40">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block mb-0.5">
                      Styling Reason
                    </span>
                    <p className="text-xs text-foreground/80 leading-relaxed italic">
                      "{rec.stylingReason}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-atelier-100/60 flex items-center justify-end">
          <Button
            onClick={onClose}
            className="bg-charcoal text-cream hover:bg-charcoal/90 text-xs px-6 h-10 shadow-subtle"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
