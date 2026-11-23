import type { GenerateOutfitsInput } from "../validations/index.ts";
import type {
  GeneratedOutfitCandidate,
  OutfitCandidateSlot,
  OutfitGenerationResult,
} from "../types/index.ts";
import { ruleEvaluationEngine, RuleEvaluationEngine } from "./ruleEvaluationEngine.ts";
import { stylingInstructionService, StylingInstructionService } from "../../outfit-styling-engine/services/stylingInstructionService.ts";
import type { WardrobeItemDto, GarmentSlot } from "@/types";
import type { WardrobeRepository } from "@/modules/digital-wardrobe/repositories/wardrobeRepository";
import type { OccasionInput, StyleInput } from "../constants/scoringWeights.ts";

export class OutfitGenerationService {
  private readonly evaluator: RuleEvaluationEngine;
  private readonly stylingService: StylingInstructionService;
  private wardrobeRepo?: WardrobeRepository;

  constructor(
    evaluator: RuleEvaluationEngine = ruleEvaluationEngine,
    stylingService: StylingInstructionService = stylingInstructionService,
    wardrobeRepo?: WardrobeRepository
  ) {
    this.evaluator = evaluator;
    this.stylingService = stylingService;
    this.wardrobeRepo = wardrobeRepo;
  }

  private async getWardrobeRepo(): Promise<WardrobeRepository> {
    if (!this.wardrobeRepo) {
      const mod = await import("@/modules/digital-wardrobe/repositories/wardrobeRepository");
      this.wardrobeRepo = mod.wardrobeRepository;
    }
    return this.wardrobeRepo;
  }

  /**
   * Deterministic combinatorial outfit generation algorithm
   * Follows strict fashion rules, multi-attribute scoring, controlled variety
   * and ZERO external AI calls.
   */
  async generateOutfits(
    userId: string,
    input: GenerateOutfitsInput
  ): Promise<OutfitGenerationResult> {
    const repo = await this.getWardrobeRepo();
    // 1. Fetch user's available wardrobe items
    // Exclude LAUNDRY, UNAVAILABLE, and ARCHIVED items
    const { items: allItems } = await repo.findMany(userId, {
      status: "AVAILABLE",
      limit: 100,
      offset: 0,
      sortBy: "recently_added",
    });

    // 2. Check essential categories
    const availableTops = allItems.filter(
      (i) => i.category === "TOP" && !input.excludedItemIds?.includes(i.id)
    );
    const availableBottoms = allItems.filter(
      (i) => i.category === "BOTTOM" && !input.excludedItemIds?.includes(i.id)
    );
    const availableFootwear = allItems.filter(
      (i) => i.category === "FOOTWEAR" && !input.excludedItemIds?.includes(i.id)
    );
    const availableOuterwear = allItems.filter(
      (i) => i.category === "OUTERWEAR" && !input.excludedItemIds?.includes(i.id)
    );
    const availableAccessories = allItems.filter(
      (i) =>
        ["ACCESSORY", "TIMEPIECE", "EYEWEAR", "BAG", "JEWELRY"].includes(i.category) &&
        !input.excludedItemIds?.includes(i.id)
    );

    if (allItems.length === 0) {
      return {
        outfits: [],
        totalGenerated: 0,
        missingCategories: ["Tops", "Bottoms", "Footwear"],
        message: "Your wardrobe is currently empty. Please add clothing items (Tops, Bottoms, Footwear) to construct complete outfits.",
      };
    }

    const missingCategories: string[] = [];
    if (availableTops.length === 0) missingCategories.push("Tops");
    if (availableBottoms.length === 0) missingCategories.push("Bottoms");
    if (availableFootwear.length === 0) missingCategories.push("Footwear");

    if (missingCategories.length > 0) {
      return {
        outfits: [],
        totalGenerated: 0,
        missingCategories,
        message: `Your wardrobe requires available pieces in: ${missingCategories.join(", ")} to construct complete outfits.`,
      };
    }

    // 3. Map Occasion and Style inputs to internal keys
    const occasionKey = this.normalizeOccasion(input.occasion);
    const styleKey = this.normalizeStyle(input.preferredStyle);

    // 4. Generate candidate combinations
    const candidatePool: Array<{
      items: OutfitCandidateSlot[];
      signature: string;
      score: ReturnType<RuleEvaluationEngine["scoreOutfit"]>;
    }> = [];

    const isWarmSeason = input.season === "SUMMER";
    const isColdSeason = input.season === "WINTER" || input.season === "FALL";

    // Loop through Tops, Bottoms, and Footwear
    for (const top of availableTops) {
      for (const bottom of availableBottoms) {
        for (const shoes of availableFootwear) {
          // Template A: Base Trio
          const baseSlots: OutfitCandidateSlot[] = [
            { slot: "INNER_TOP" as GarmentSlot, item: top as any, layerIndex: 0 },
            { slot: "BOTTOM" as GarmentSlot, item: bottom as any, layerIndex: 0 },
            { slot: "FOOTWEAR" as GarmentSlot, item: shoes as any, layerIndex: 0 },
          ];

          // Score base trio
          const baseScore = this.evaluator.scoreOutfit(
            baseSlots.map((s) => s.item),
            occasionKey,
            styleKey,
            input.season,
            input.optionalColorPreference
          );

          if (baseScore.compositeScore >= 0.65) {
            candidatePool.push({
              items: baseSlots,
              signature: [top.id, bottom.id, shoes.id].sort().join("-"),
              score: baseScore,
            });
          }

          // Template B: Layered with Outerwear (if available and climate permits)
          if (availableOuterwear.length > 0 && !isWarmSeason) {
            for (const outer of availableOuterwear.slice(0, 3)) {
              const layeredSlots: OutfitCandidateSlot[] = [
                ...baseSlots,
                { slot: "OUTER_TOP" as GarmentSlot, item: outer as any, layerIndex: 1 },
              ];

              const layeredScore = this.evaluator.scoreOutfit(
                layeredSlots.map((s) => s.item),
                occasionKey,
                styleKey,
                input.season,
                input.optionalColorPreference
              );

              if (layeredScore.compositeScore >= 0.68) {
                candidatePool.push({
                  items: layeredSlots,
                  signature: [top.id, bottom.id, shoes.id, outer.id].sort().join("-"),
                  score: layeredScore,
                });
              }
            }
          }

          // Template C: Accessorized (Watches, Eyewear, Belts)
          if (availableAccessories.length > 0) {
            for (const acc of availableAccessories.slice(0, 2)) {
              let slotName: GarmentSlot = "WRIST";
              if (acc.category === "EYEWEAR" || acc.subCategory.toLowerCase().includes("glasses")) {
                slotName = "FACE";
              } else if (acc.subCategory.toLowerCase().includes("hat") || acc.subCategory.toLowerCase().includes("cap")) {
                slotName = "HEAD";
              } else if (acc.subCategory.toLowerCase().includes("belt")) {
                slotName = "ACCESSORY_PRIMARY";
              }

              const accessorizedSlots: OutfitCandidateSlot[] = [
                ...baseSlots,
                { slot: slotName, item: acc as any, layerIndex: 0 },
              ];

              const accScore = this.evaluator.scoreOutfit(
                accessorizedSlots.map((s) => s.item),
                occasionKey,
                styleKey,
                input.season,
                input.optionalColorPreference
              );

              if (accScore.compositeScore >= 0.68) {
                candidatePool.push({
                  items: accessorizedSlots,
                  signature: [top.id, bottom.id, shoes.id, acc.id].sort().join("-"),
                  score: accScore,
                });
              }
            }
          }
        }
      }
    }

    if (candidatePool.length === 0) {
      return {
        outfits: [],
        totalGenerated: 0,
        message: "No compatible outfit combinations met the harmony threshold. Try adding more versatile neutral pieces or adjusting the occasion/season.",
      };
    }

    // 5. Deduplicate by unique garment signature
    const uniqueMap = new Map<string, typeof candidatePool[0]>();
    for (const c of candidatePool) {
      if (!uniqueMap.has(c.signature)) {
        uniqueMap.set(c.signature, c);
      } else {
        const existing = uniqueMap.get(c.signature)!;
        if (c.score.compositeScore > existing.score.compositeScore) {
          uniqueMap.set(c.signature, c);
        }
      }
    }

    const uniqueCandidates = Array.from(uniqueMap.values());

    // 6. Controlled Diversity & Weighted Selection
    // Sort descending by score
    uniqueCandidates.sort((a, b) => b.score.compositeScore - a.score.compositeScore);

    // Apply item frequency suppression so diverse tops/bottoms are highlighted
    const selected: typeof uniqueCandidates = [];
    const usedItemCounts: Record<string, number> = {};

    for (const cand of uniqueCandidates) {
      if (selected.length >= input.numberOfOutfits) break;

      const candItemIds = cand.items.map((s) => s.item.id);
      const maxFrequency = Math.max(...candItemIds.map((id) => usedItemCounts[id] || 0), 0);

      // Penalize heavily repeated items if alternative combinations exist
      if (maxFrequency < 2 || uniqueCandidates.length <= input.numberOfOutfits * 2) {
        selected.push(cand);
        candItemIds.forEach((id) => {
          usedItemCounts[id] = (usedItemCounts[id] || 0) + 1;
        });
      }
    }

    // Fill remaining if needed
    for (const cand of uniqueCandidates) {
      if (selected.length >= input.numberOfOutfits) break;
      if (!selected.includes(cand)) {
        selected.push(cand);
      }
    }

    // 7. Attach Styling Advice and Construct Full Outfits
    const finalOutfits: GeneratedOutfitCandidate[] = selected.map((cand, idx) => {
      const itemsList = cand.items.map((s) => s.item);
      const stylingAdvice = this.stylingService.generateDetailedStyling(
        itemsList,
        cand.items[0]?.item.formality || "SMART_CASUAL",
        input.occasion
      );

      const colorPalette = Array.from(new Set(itemsList.map((i) => i.colorPrimary)));
      const topName = cand.items.find((s) => s.slot === "INNER_TOP")?.item.name || "Top";
      const bottomName = cand.items.find((s) => s.slot === "BOTTOM")?.item.name || "Bottom";

      const title = this.generateOutfitTitle(input.occasion, input.preferredStyle, topName, bottomName, idx);
      const description = `Curated for ${input.occasion.toLowerCase().replace("_", " ")}: ${topName} paired with ${bottomName}.`;

      return {
        id: `gen-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        title,
        description,
        occasion: input.occasion,
        styleLabel: input.preferredStyle.replace("_", " "),
        season: input.season,
        items: cand.items,
        colorPalette,
        score: cand.score,
        stylingAdvice,
        ruleTags: [
          cand.score.breakdown.colorMatch,
          cand.score.breakdown.styleBalance,
          cand.score.breakdown.formalityVariance,
        ],
      };
    });

    return {
      outfits: finalOutfits,
      totalGenerated: finalOutfits.length,
      message: `Successfully synthesized ${finalOutfits.length} tailored outfit combination${finalOutfits.length > 1 ? "s" : ""}.`,
    };
  }

  private normalizeOccasion(occ: string): OccasionInput {
    const o = occ.toUpperCase();
    if (o === "WORK" || o === "OFFICE") return "OFFICE";
    if (o === "DATE_NIGHT" || o === "DATE") return "DATE";
    if (o === "ATHLETIC" || o === "GYM") return "GYM";
    if (o === "WEDDING") return "WEDDING";
    if (o === "FORMAL_EVENT" || o === "GALA") return "FORMAL_EVENT";
    if (o === "UNIVERSITY") return "UNIVERSITY";
    if (o === "PARTY") return "PARTY";
    if (o === "TRAVEL") return "TRAVEL";
    return "CASUAL_OUTING";
  }

  private normalizeStyle(sty: string): StyleInput {
    const s = sty.toUpperCase();
    if (s === "MINIMAL" || s === "MINIMALIST") return "MINIMAL";
    if (s === "OLD_MONEY" || s === "QUIET_LUXURY") return "OLD_MONEY";
    if (s === "STREETWEAR") return "STREETWEAR";
    if (s === "SPORTY" || s === "ATHLEISURE") return "SPORTY";
    if (s === "FORMAL" || s === "CLASSIC_TAILORING") return "FORMAL";
    if (s === "BUSINESS_CASUAL") return "BUSINESS_CASUAL";
    if (s === "SMART_CASUAL") return "SMART_CASUAL";
    return "CASUAL";
  }

  private generateOutfitTitle(
    occasion: string,
    style: string,
    topName: string,
    bottomName: string,
    index: number
  ): string {
    const cleanOccasion = occasion.replace("_", " ");
    const cleanStyle = style.replace("_", " ");

    const formats = [
      `${cleanStyle} ${cleanOccasion} Ensemble`,
      `Tailored ${cleanOccasion} Pairing`,
      `${cleanStyle} Architecture`,
      `Refined ${topName} Look`,
    ];

    return formats[index % formats.length];
  }
}

export const outfitGenerationService = new OutfitGenerationService();
