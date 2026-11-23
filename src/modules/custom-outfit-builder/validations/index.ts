import { z } from "zod";

export const SaveCustomOutfitSchema = z.object({
  title: z.string().min(2, "Outfit title is required").max(100),
  description: z.string().max(500).optional(),
  occasion: z.enum([
    "WORK",
    "DATE_NIGHT",
    "CASUAL_OUTING",
    "FORMAL_EVENT",
    "TRAVEL",
    "LOUNGE",
    "ATHLETIC",
    "GALA",
    "PARTY",
  ]),
  formality: z.enum([
    "CASUAL",
    "SMART_CASUAL",
    "BUSINESS_CASUAL",
    "BUSINESS_FORMAL",
    "BLACK_TIE",
  ]),
  season: z.enum(["SPRING", "SUMMER", "FALL", "WINTER", "ALL_SEASON"]),
  items: z.array(
    z.object({
      wardrobeItemId: z.string().uuid(),
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
      ]),
      layerIndex: z.number().int().min(0).max(5).default(0),
    })
  ).min(1, "An outfit must have at least one garment"),
});

export type SaveCustomOutfitInput = z.infer<typeof SaveCustomOutfitSchema>;
