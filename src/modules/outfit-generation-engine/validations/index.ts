import { z } from "zod";

export const GenerateOutfitsInputSchema = z.object({
  occasion: z
    .enum([
      "UNIVERSITY",
      "OFFICE",
      "CASUAL_OUTING",
      "DATE",
      "PARTY",
      "WEDDING",
      "FORMAL_EVENT",
      "GYM",
      "TRAVEL",
      // Backwards compatibility with internal Prisma OccasionType
      "WORK",
      "DATE_NIGHT",
      "LOUNGE",
      "ATHLETIC",
      "GALA",
    ])
    .default("CASUAL_OUTING"),
  preferredStyle: z
    .enum([
      "CASUAL",
      "SMART_CASUAL",
      "FORMAL",
      "STREETWEAR",
      "MINIMAL",
      "OLD_MONEY",
      "SPORTY",
      "BUSINESS_CASUAL",
      // Backwards compatibility
      "MINIMALIST",
      "QUIET_LUXURY",
      "CLASSIC_TAILORING",
      "ATHLEISURE",
      "AVANT_GARDE",
    ])
    .default("SMART_CASUAL"),
  season: z
    .enum(["SPRING", "SUMMER", "FALL", "WINTER", "ALL_SEASON"])
    .default("ALL_SEASON"),
  optionalColorPreference: z.string().optional(),
  numberOfOutfits: z.number().min(1).max(10).default(4),
  excludeRecentlyGeneratedOutfits: z.boolean().default(true),
  requiredItemIds: z.array(z.string()).optional(),
  excludedItemIds: z.array(z.string()).optional(),
});

export type GenerateOutfitsInput = z.infer<typeof GenerateOutfitsInputSchema>;
