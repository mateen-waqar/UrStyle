import { z } from "zod";

export const CreateAvatarProfileSchema = z.object({
  name: z.string().min(2).max(50),
  gender: z.enum(["MALE", "FEMALE", "ANDROGYNOUS"]),
  meshType: z.string().default("stylized_v1"),
  skinColor: z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, "Invalid hex color code"),
  hairStyle: z.string().min(2),
  hairColor: z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i),
  eyeColor: z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i),
  heightScale: z.number().min(0.7).max(1.3).default(1.0),
  shoulderWidth: z.number().min(0.7).max(1.4).default(1.0),
  waistWidth: z.number().min(0.6).max(1.5).default(1.0),
  hipWidth: z.number().min(0.6).max(1.5).default(1.0),
  isDefault: z.boolean().default(true),
});

export const UpdateAvatarProfileSchema = CreateAvatarProfileSchema.partial();

export type CreateAvatarProfileInput = z.infer<typeof CreateAvatarProfileSchema>;
export type UpdateAvatarProfileInput = z.infer<typeof UpdateAvatarProfileSchema>;
