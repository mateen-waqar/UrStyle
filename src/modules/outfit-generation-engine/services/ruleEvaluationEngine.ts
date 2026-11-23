import type { WardrobeItemDto } from "@/types";
import { colorCompatibilityService } from "./colorCompatibilityService.ts";
import {
  type ScoringWeights,
  DEFAULT_SCORING_WEIGHTS,
  type OccasionInput,
  type StyleInput,
} from "../constants/scoringWeights.ts";

export interface DetailedOutfitScore {
  colorScore: number;
  styleScore: number;
  occasionScore: number;
  formalityScore: number;
  seasonScore: number;
  patternScore: number;
  compositeScore: number;
  breakdown: {
    colorMatch: string;
    styleBalance: string;
    occasionFit: string;
    formalityVariance: string;
    seasonality: string;
    patternBalance: string;
  };
}

export class RuleEvaluationEngine {
  private readonly weights: ScoringWeights;

  constructor(weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS) {
    this.weights = weights;
  }

  /**
   * Formality numeric values for variance computation
   */
  private readonly formalityScale: Record<string, number> = {
    CASUAL: 1,
    SMART_CASUAL: 2,
    BUSINESS_CASUAL: 3,
    BUSINESS_FORMAL: 4,
    BLACK_TIE: 5,
  };

  /**
   * Compatible style adjacency clusters
   */
  private readonly styleCompatibilityMatrix: Record<string, string[]> = {
    MINIMALIST: ["MINIMALIST", "QUIET_LUXURY", "SMART_CASUAL", "MONOCHROME", "OLD_MONEY"],
    QUIET_LUXURY: ["QUIET_LUXURY", "OLD_MONEY", "MINIMALIST", "CLASSIC_TAILORING", "SMART_CASUAL"],
    OLD_MONEY: ["OLD_MONEY", "QUIET_LUXURY", "CLASSIC_TAILORING", "SMART_CASUAL"],
    CLASSIC_TAILORING: ["CLASSIC_TAILORING", "OLD_MONEY", "QUIET_LUXURY", "SMART_CASUAL"],
    SMART_CASUAL: ["SMART_CASUAL", "MINIMALIST", "QUIET_LUXURY", "CLASSIC_TAILORING", "CASUAL"],
    STREETWEAR: ["STREETWEAR", "ATHLEISURE", "CASUAL", "AVANT_GARDE", "MINIMALIST"],
    ATHLEISURE: ["ATHLEISURE", "STREETWEAR", "CASUAL"],
    AVANT_GARDE: ["AVANT_GARDE", "STREETWEAR", "MINIMALIST", "MONOCHROME"],
    CASUAL: ["CASUAL", "SMART_CASUAL", "MINIMALIST", "STREETWEAR", "ATHLEISURE"],
  };

  /**
   * Evaluates pattern harmony
   * 1 pattern piece anchored by solids is considered optimal
   */
  evaluatePatternCompatibility(items: WardrobeItemDto[]): { score: number; note: string } {
    const patterns = items.map((i) => i.pattern || "SOLID");
    const nonSolids = patterns.filter((p) => p !== "SOLID");

    if (nonSolids.length === 0) {
      return { score: 1.0, note: "Clean all-solid minimalism" };
    }
    if (nonSolids.length === 1) {
      return { score: 0.96, note: `Balanced ${nonSolids[0].toLowerCase()} statement piece anchored with solids` };
    }
    if (nonSolids.length === 2) {
      // Check for subtle compatible patterns
      const p1 = nonSolids[0];
      const p2 = nonSolids[1];
      const subtlePatterns = ["TEXTURED", "HERRINGBONE", "STRIPED"];
      if (subtlePatterns.includes(p1) && subtlePatterns.includes(p2)) {
        return { score: 0.75, note: "Complementary micro-pattern layering" };
      }
      return { score: 0.50, note: "Competing multi-pattern tension" };
    }
    return { score: 0.30, note: "Excessive pattern discordance" };
  }

  /**
   * Evaluates style consistency across garments
   */
  evaluateStyleConsistency(items: WardrobeItemDto[], preferredStyle?: StyleInput): { score: number; note: string } {
    if (items.length <= 1) return { score: 1.0, note: "Singular style" };

    const itemStyles = items.map((i) => (i.style || "SMART_CASUAL").toUpperCase());
    
    // Check hard negative clashes
    const hasAthleticBottom = items.some((i) => i.category === "BOTTOM" && ["Shorts", "Joggers"].includes(i.subCategory));
    const hasFormalShoe = items.some((i) => i.category === "FOOTWEAR" && ["Formal shoes", "Oxfords", "Derbies"].includes(i.subCategory));
    if (hasAthleticBottom && hasFormalShoe) {
      return { score: 0.15, note: "Severe clash: formal footwear paired with athletic bottoms" };
    }

    const hasBlazer = items.some((i) => i.category === "OUTERWEAR" && i.subCategory === "Blazers");
    const hasJoggers = items.some((i) => i.category === "BOTTOM" && i.subCategory === "Joggers");
    if (hasBlazer && hasJoggers) {
      return { score: 0.20, note: "Severe clash: formal blazer with lounge joggers" };
    }

    // Check style matrix cohesion
    let compatiblePairs = 0;
    let totalPairs = 0;

    for (let i = 0; i < itemStyles.length; i++) {
      for (let j = i + 1; j < itemStyles.length; j++) {
        totalPairs++;
        const s1 = itemStyles[i];
        const s2 = itemStyles[j];
        if (s1 === s2) {
          compatiblePairs += 1;
        } else if (this.styleCompatibilityMatrix[s1]?.includes(s2)) {
          compatiblePairs += 0.85;
        } else {
          compatiblePairs += 0.35;
        }
      }
    }

    let baseScore = totalPairs > 0 ? compatiblePairs / totalPairs : 0.85;

    // Bonus for alignment with user's preferred style
    if (preferredStyle) {
      const targetStyle = preferredStyle.toUpperCase();
      const matchingCount = itemStyles.filter(
        (s) => s === targetStyle || this.styleCompatibilityMatrix[targetStyle]?.includes(s)
      ).length;
      const prefRatio = matchingCount / itemStyles.length;
      baseScore = baseScore * 0.7 + prefRatio * 0.3;
    }

    return {
      score: Number(Math.min(1.0, Math.max(0.1, baseScore)).toFixed(2)),
      note: baseScore > 0.85 ? "Cohesive aesthetic alignment" : "Eclectic styling pairing",
    };
  }

  /**
   * Evaluates occasion suitability
   */
  evaluateOccasionSuitability(items: WardrobeItemDto[], occasion: OccasionInput): { score: number; note: string } {
    const occKey = occasion.toUpperCase();

    // Occasion strict requirements
    if (occKey === "GYM") {
      const nonAthletic = items.filter(
        (i) => i.style !== "ATHLEISURE" && i.category !== "FOOTWEAR"
      );
      if (items.some((i) => ["Blazers", "Formal shoes", "Ties"].includes(i.subCategory))) {
        return { score: 0.1, note: "Formal garments unsuitable for gym/workout" };
      }
      return { score: 0.95, note: "Athletic performance match" };
    }

    if (occKey === "WEDDING" || occKey === "FORMAL_EVENT") {
      if (items.some((i) => ["Joggers", "Shorts", "Sandals", "Hoodies"].includes(i.subCategory))) {
        return { score: 0.2, note: "Casual/lounge pieces unsuitable for formal occasion" };
      }
    }

    // Occasion tag matching bonus
    let taggedCount = 0;
    for (const item of items) {
      const occasionsList = (item.occasions || []).map((o) => o.toUpperCase());
      if (
        occasionsList.includes(occKey) ||
        occasionsList.includes("CASUAL_OUTING") ||
        occasionsList.length === 0
      ) {
        taggedCount++;
      }
    }

    const ratio = taggedCount / items.length;
    const score = Math.max(0.4, Number((0.6 + ratio * 0.4).toFixed(2)));

    return {
      score,
      note: `Tailored for ${occasion.toLowerCase().replace("_", " ")} setting`,
    };
  }

  /**
   * Evaluates formality compatibility across garments
   */
  evaluateFormalityCompatibility(items: WardrobeItemDto[]): { score: number; note: string } {
    if (items.length <= 1) return { score: 1.0, note: "Uniform formality" };

    const vals = items.map((i) => this.formalityScale[i.formality] || 2);
    const minVal = Math.min(...vals);
    const maxVal = Math.max(...vals);
    const spread = maxVal - minVal;

    // Spread of 0 or 1 is excellent
    if (spread <= 1) {
      return { score: 0.98, note: "Harmonious formality level" };
    }
    // Spread of 2 is acceptable smart-casual hi-lo
    if (spread === 2) {
      return { score: 0.85, note: "Deliberate high-low sartorial tension" };
    }
    // Spread of 3 is risky (e.g. tuxedo jacket + distressed denim)
    if (spread === 3) {
      return { score: 0.50, note: "Conflicting formality variance" };
    }
    // Spread of 4+ is severe dissonance
    return { score: 0.20, note: "Extreme formality clash" };
  }

  /**
   * Evaluates seasonal suitability
   */
  evaluateSeasonSuitability(items: WardrobeItemDto[], targetSeason: string): { score: number; note: string } {
    const seasonUpper = targetSeason.toUpperCase();

    // Check severe season clashes
    const isSummer = seasonUpper === "SUMMER";
    const isWinter = seasonUpper === "WINTER";

    for (const item of items) {
      const sub = item.subCategory;
      const mat = item.material;

      if (isSummer) {
        if (["Coats", "Overcoats", "Heavy Jackets"].includes(sub) || mat === "WOOL" && sub === "Jackets") {
          return { score: 0.25, note: "Heavy outerwear incompatible with summer climate" };
        }
      }
      if (isWinter) {
        if (["Sandals", "Shorts"].includes(sub) || (mat === "LINEN" && sub === "Shirts")) {
          return { score: 0.30, note: "Lightweight summer fabrics incompatible with winter" };
        }
      }
    }

    // Check season tags
    let matchingItems = 0;
    for (const item of items) {
      const itemSeasons = (item.seasonality || []).map((s) => s.toUpperCase());
      if (itemSeasons.includes(seasonUpper) || itemSeasons.includes("ALL_SEASON") || itemSeasons.length === 0) {
        matchingItems++;
      }
    }

    const ratio = matchingItems / items.length;
    const score = Math.max(0.4, Number((0.5 + ratio * 0.5).toFixed(2)));

    return {
      score,
      note: `Appropriate for ${targetSeason.toLowerCase()} weather`,
    };
  }

  /**
   * Master scoring method combining all dimensions with configurable weights
   */
  scoreOutfit(
    items: WardrobeItemDto[],
    occasion: OccasionInput,
    preferredStyle?: StyleInput,
    season: string = "ALL_SEASON",
    preferredColor?: string
  ): DetailedOutfitScore {
    const colorHexes = items.map((i) => i.colorPrimary);
    const colorScore = colorCompatibilityService.evaluateColors(colorHexes, preferredColor);

    const patternRes = this.evaluatePatternCompatibility(items);
    const styleRes = this.evaluateStyleConsistency(items, preferredStyle);
    const occasionRes = this.evaluateOccasionSuitability(items, occasion);
    const formalityRes = this.evaluateFormalityCompatibility(items);
    const seasonRes = this.evaluateSeasonSuitability(items, season);

    // Apply configurable weights
    const compositeScore =
      colorScore * this.weights.colorCompatibility +
      styleRes.score * this.weights.styleConsistency +
      occasionRes.score * this.weights.occasionSuitability +
      formalityRes.score * this.weights.formalityCompatibility +
      seasonRes.score * this.weights.seasonSuitability +
      patternRes.score * this.weights.patternCompatibility;

    return {
      colorScore,
      styleScore: styleRes.score,
      occasionScore: occasionRes.score,
      formalityScore: formalityRes.score,
      seasonScore: seasonRes.score,
      patternScore: patternRes.score,
      compositeScore: Number(compositeScore.toFixed(2)),
      breakdown: {
        colorMatch: colorScore >= 0.88 ? "Harmonious palette" : "Contrasting tones",
        styleBalance: styleRes.note,
        occasionFit: occasionRes.note,
        formalityVariance: formalityRes.note,
        seasonality: seasonRes.note,
        patternBalance: patternRes.note,
      },
    };
  }

  /**
   * Compatibility adapter for legacy and custom outfit builder analyzers
   */
  scoreOutfitCombination(
    slots: Array<{ slot: any; item: WardrobeItemDto; layerIndex: number }>,
    targetFormality: string = "SMART_CASUAL",
    targetSeason: string = "ALL_SEASON"
  ) {
    const items = slots.map((s) => s.item);
    const score = this.scoreOutfit(
      items,
      "CASUAL_OUTING",
      "SMART_CASUAL",
      targetSeason
    );
    return {
      colorHarmonyScore: score.colorScore,
      formalityScore: score.formalityScore,
      textureBalanceScore: score.styleScore,
      silhouetteScore: 0.90,
      seasonalityScore: score.seasonScore,
      compositeScore: score.compositeScore,
    };
  }
}

export const ruleEvaluationEngine = new RuleEvaluationEngine();
