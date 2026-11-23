import { prisma } from "@/lib/prisma";
import { GarmentCategory, GarmentSlot } from "@prisma/client";

export class GarmentAssetRepository {
  async findAssetsByCategoryAndSlot(category: GarmentCategory, slot: GarmentSlot) {
    return prisma.garmentAsset.findMany({
      where: { category, slot },
    });
  }

  async findMappingForWardrobeItem(wardrobeItemId: string) {
    return prisma.wardrobeGarmentMapping.findUnique({
      where: { wardrobeItemId },
      include: {
        garmentAsset: true,
      },
    });
  }

  async upsertMapping(
    wardrobeItemId: string,
    garmentAssetId: string,
    overrides?: {
      primaryColorOverride?: string;
      secondaryColorOverride?: string;
      textureOverrideUrl?: string;
      roughness?: number;
      metalness?: number;
    }
  ) {
    return prisma.wardrobeGarmentMapping.upsert({
      where: { wardrobeItemId },
      update: {
        garmentAssetId,
        ...overrides,
      },
      create: {
        wardrobeItemId,
        garmentAssetId,
        ...overrides,
      },
    });
  }
}

export const garmentAssetRepository = new GarmentAssetRepository();
