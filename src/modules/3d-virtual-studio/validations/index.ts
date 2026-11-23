import { z } from "zod";

export const StudioEnvironmentSchema = z.object({
  preset: z.enum(["studio", "sunset", "city", "dawn", "warehouse"]),
  lightingIntensity: z.number().min(0.1).max(5.0).default(1.2),
  cameraFov: z.number().min(20).max(90).default(45),
  showGrid: z.boolean().default(true),
  wireframe: z.boolean().default(false),
  autoRotate: z.boolean().default(false),
});

export const MapGarmentAssetSchema = z.object({
  wardrobeItemId: z.string().uuid(),
  garmentAssetId: z.string().uuid(),
  primaryColorOverride: z.string().optional(),
  secondaryColorOverride: z.string().optional(),
  textureOverrideUrl: z.string().url().optional(),
  roughness: z.number().min(0).max(1).optional(),
  metalness: z.number().min(0).max(1).optional(),
});

export type StudioEnvironmentInput = z.infer<typeof StudioEnvironmentSchema>;
export type MapGarmentAssetInput = z.infer<typeof MapGarmentAssetSchema>;
