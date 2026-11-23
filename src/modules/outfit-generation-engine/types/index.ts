import type { WardrobeItemDto, GarmentSlot } from "@/types";
import type { DetailedOutfitScore } from "../services/ruleEvaluationEngine";
import type { CompleteStylingAdvice } from "@/modules/outfit-styling-engine/services/stylingInstructionService";

export interface OutfitCandidateSlot {
  slot: GarmentSlot;
  item: WardrobeItemDto;
  layerIndex: number;
}

export interface GeneratedOutfitCandidate {
  id: string;
  title: string;
  description: string;
  occasion: string;
  styleLabel: string;
  season: string;
  items: OutfitCandidateSlot[];
  colorPalette: string[];
  score: DetailedOutfitScore;
  stylingAdvice: CompleteStylingAdvice;
  ruleTags: string[];
  isSaved?: boolean;
}

export interface OutfitGenerationResult {
  outfits: GeneratedOutfitCandidate[];
  totalGenerated: number;
  missingCategories?: string[];
  message?: string;
}
