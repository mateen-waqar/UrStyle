import { z } from "zod";

export const BookmarkOutfitSchema = z.object({
  outfitId: z.string().uuid(),
  collectionId: z.string().uuid().optional(),
  notes: z.string().max(300).optional(),
});

export const OutfitItemInputSchema = z.object({
  wardrobeItemId: z.string().min(1, "Wardrobe item ID is required"),
  slot: z.enum([
    "HEAD",
    "FACE",
    "NECK",
    "INNER_TOP",
    "OUTER_TOP",
    "BOTTOM",
    "FOOTWEAR",
    "WRIST",
    "ACCESSORY_PRIMARY",
    "ACCESSORY_SECONDARY",
  ]).default("INNER_TOP"),
  layerIndex: z.number().int().min(0).max(5).default(0),
});

export const StylingInstructionInputSchema = z.object({
  slot: z.enum([
    "HEAD",
    "FACE",
    "NECK",
    "INNER_TOP",
    "OUTER_TOP",
    "BOTTOM",
    "FOOTWEAR",
    "WRIST",
    "ACCESSORY_PRIMARY",
    "ACCESSORY_SECONDARY",
  ]).default("INNER_TOP"),
  instruction: z.string().min(1),
  tipType: z.enum([
    "TUCK",
    "ROLL",
    "BUTTON",
    "LAYER",
    "ACCESSORIZE",
    "PROPORTION",
    "COLOR_ACCENT",
  ]).default("LAYER"),
});

export const SaveOutfitEnsembleSchema = z.object({
  title: z.string().min(1).max(120).default("Curated Ensemble"),
  description: z.string().max(500).nullable().optional(),
  occasion: z.string().default("CASUAL_OUTING"),
  formality: z.string().default("SMART_CASUAL"),
  season: z.string().default("ALL_SEASON"),
  generationSource: z.enum([
    "DETERMINISTIC_ENGINE",
    "MANUAL_BUILDER",
    "STYLING_RULE",
    "CUSTOM_TEMPLATE",
  ]).default("DETERMINISTIC_ENGINE"),
  compatibilityScore: z.number().min(0).max(1).nullable().optional(),
  colorHarmonyScore: z.number().min(0).max(1).nullable().optional(),
  styleBalanceScore: z.number().min(0).max(1).nullable().optional(),
  items: z.array(OutfitItemInputSchema).min(1, "Outfit must contain at least 1 item"),
  stylingInstructions: z.array(StylingInstructionInputSchema).optional(),
  notes: z.string().max(500).nullable().optional(),
});

export type BookmarkOutfitInput = z.infer<typeof BookmarkOutfitSchema>;
export type SaveOutfitEnsembleInput = z.infer<typeof SaveOutfitEnsembleSchema>;
