import { prisma } from "@/lib/prisma";
import { SaveCustomOutfitInput } from "../validations";

export class CustomOutfitRepository {
  async createOutfit(userId: string, input: SaveCustomOutfitInput) {
    return prisma.outfit.create({
      data: {
        userId,
        title: input.title,
        description: input.description,
        occasion: input.occasion,
        formality: input.formality,
        season: input.season,
        generationSource: "MANUAL_BUILDER",
        items: {
          create: input.items.map((item) => ({
            wardrobeItemId: item.wardrobeItemId,
            slot: item.slot,
            layerIndex: item.layerIndex,
          })),
        },
      },
      include: {
        items: {
          include: {
            wardrobeItem: true,
          },
        },
      },
    });
  }
}

export const customOutfitRepository = new CustomOutfitRepository();
