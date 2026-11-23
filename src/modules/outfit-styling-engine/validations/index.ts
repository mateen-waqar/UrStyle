import { z } from "zod";

export const GenerateStylingInstructionsSchema = z.object({
  outfitId: z.string().uuid().optional(),
  occasion: z.string(),
  formality: z.string(),
  slots: z.array(
    z.object({
      slot: z.string(),
      category: z.string(),
      subCategory: z.string(),
      formality: z.string(),
    })
  ),
});

export type GenerateStylingInstructionsInput = z.infer<
  typeof GenerateStylingInstructionsSchema
>;
