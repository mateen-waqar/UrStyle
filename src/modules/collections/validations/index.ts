import { z } from "zod";

export const CreateCollectionSchema = z.object({
  name: z.string().min(2, "Collection name must be at least 2 characters").max(80),
  description: z.string().max(300).nullable().optional(),
  isPrivate: z.boolean().default(true),
  coverImageUrl: z.string().nullable().optional(),
});

export const UpdateCollectionSchema = CreateCollectionSchema.partial();

export type CreateCollectionInput = z.infer<typeof CreateCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof UpdateCollectionSchema>;
