import { garmentAssetRepository, GarmentAssetRepository } from "../repositories/garmentAssetRepository";
import { AvatarGarmentRenderItem, GarmentSlot } from "@/types";

export class StudioRenderService {
  constructor(private readonly repo: GarmentAssetRepository = garmentAssetRepository) {}

  async resolve3DGarment(wardrobeItemId: string): Promise<AvatarGarmentRenderItem | null> {
    const mapping = await this.repo.findMappingForWardrobeItem(wardrobeItemId);
    if (!mapping) return null;

    return {
      slot: mapping.garmentAsset.slot as GarmentSlot,
      garmentAssetUrl: mapping.garmentAsset.modelFileUrl,
      color: mapping.primaryColorOverride || "#1e1e24",
      roughness: mapping.roughness ?? 0.7,
      metalness: mapping.metalness ?? 0.1,
    };
  }
}

export const studioRenderService = new StudioRenderService();
