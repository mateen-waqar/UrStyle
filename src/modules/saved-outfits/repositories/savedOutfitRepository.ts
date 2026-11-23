import { prisma } from "@/lib/prisma";
import { BookmarkOutfitInput, SaveOutfitEnsembleInput } from "../validations";
import {
  GarmentSlot,
  OccasionType,
  FormalityLevel,
  Season,
  StylingTipType,
  GenerationSource,
} from "@prisma/client";

function parseOccasion(occStr?: string): OccasionType {
  const normalized = (occStr || "").toUpperCase();
  switch (normalized) {
    case "WORK":
    case "OFFICE":
      return OccasionType.WORK;
    case "DATE":
    case "DATE_NIGHT":
      return OccasionType.DATE_NIGHT;
    case "GYM":
    case "ATHLETIC":
      return OccasionType.ATHLETIC;
    case "WEDDING":
    case "GALA":
      return OccasionType.GALA;
    case "FORMAL_EVENT":
      return OccasionType.FORMAL_EVENT;
    case "TRAVEL":
      return OccasionType.TRAVEL;
    case "PARTY":
      return OccasionType.PARTY;
    case "LOUNGE":
      return OccasionType.LOUNGE;
    default:
      return OccasionType.CASUAL_OUTING;
  }
}

function parseFormality(formStr?: string): FormalityLevel {
  const normalized = (formStr || "").toUpperCase();
  switch (normalized) {
    case "CASUAL":
      return FormalityLevel.CASUAL;
    case "SMART_CASUAL":
      return FormalityLevel.SMART_CASUAL;
    case "BUSINESS_CASUAL":
      return FormalityLevel.BUSINESS_CASUAL;
    case "BUSINESS_FORMAL":
      return FormalityLevel.BUSINESS_FORMAL;
    case "BLACK_TIE":
      return FormalityLevel.BLACK_TIE;
    default:
      return FormalityLevel.SMART_CASUAL;
  }
}

function parseSeason(seasonStr?: string): Season {
  const normalized = (seasonStr || "").toUpperCase();
  switch (normalized) {
    case "SPRING":
      return Season.SPRING;
    case "SUMMER":
      return Season.SUMMER;
    case "FALL":
      return Season.FALL;
    case "WINTER":
      return Season.WINTER;
    default:
      return Season.ALL_SEASON;
  }
}

export class SavedOutfitRepository {
  async bookmark(userId: string, input: BookmarkOutfitInput) {
    return prisma.savedOutfit.create({
      data: {
        userId,
        outfitId: input.outfitId,
        collectionId: input.collectionId,
        notes: input.notes,
      },
      include: {
        outfit: {
          include: {
            items: {
              include: {
                wardrobeItem: true,
              },
            },
          },
        },
      },
    });
  }

  async listByUser(userId: string, collectionId?: string) {
    return prisma.savedOutfit.findMany({
      where: {
        userId,
        ...(collectionId ? { collectionId } : {}),
      },
      include: {
        outfit: {
          include: {
            items: {
              include: {
                wardrobeItem: true,
              },
            },
            stylingInstructions: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async removeBookmark(id: string, userId: string) {
    return prisma.savedOutfit.deleteMany({
      where: { id, userId },
    });
  }

  /**
   * Securely saves an outfit ensemble verifying item ownership and creating all relations in a single transaction.
   */
  async createOutfitEnsemble(userId: string, input: SaveOutfitEnsembleInput) {
    const itemIds = input.items.map((it) => it.wardrobeItemId);

    // SECURITY: Verify all wardrobe items belong to the requesting user
    const ownedItems = await prisma.wardrobeItem.findMany({
      where: {
        id: { in: itemIds },
        userId,
      },
      select: { id: true },
    });

    const ownedSet = new Set(ownedItems.map((i) => i.id));
    const unownedIds = itemIds.filter((id) => !ownedSet.has(id));

    if (unownedIds.length > 0) {
      throw new Error(
        `Security exception: Wardrobe item(s) [${unownedIds.join(", ")}] not found or not owned by user.`
      );
    }

    const prismaOccasion = parseOccasion(input.occasion);
    const prismaFormality = parseFormality(input.formality);
    const prismaSeason = parseSeason(input.season);

    return prisma.$transaction(async (tx) => {
      const outfit = await tx.outfit.create({
        data: {
          userId,
          title: input.title,
          description: input.description || null,
          occasion: prismaOccasion,
          formality: prismaFormality,
          season: prismaSeason,
          generationSource: input.generationSource as GenerationSource,
          compatibilityScore: input.compatibilityScore ?? null,
          colorHarmonyScore: input.colorHarmonyScore ?? null,
          styleBalanceScore: input.styleBalanceScore ?? null,
          isFavorite: true,
          items: {
            create: input.items.map((it) => ({
              wardrobeItemId: it.wardrobeItemId,
              slot: it.slot as GarmentSlot,
              layerIndex: it.layerIndex,
            })),
          },
        },
      });

      if (input.stylingInstructions && input.stylingInstructions.length > 0) {
        await tx.stylingInstruction.createMany({
          data: input.stylingInstructions.map((si) => ({
            outfitId: outfit.id,
            garmentSlot: si.slot as GarmentSlot,
            instruction: si.instruction,
            tipType: si.tipType as StylingTipType,
          })),
        });
      }

      const savedOutfit = await tx.savedOutfit.create({
        data: {
          userId,
          outfitId: outfit.id,
          notes: input.notes || null,
        },
        include: {
          outfit: {
            include: {
              items: {
                include: {
                  wardrobeItem: true,
                },
              },
              stylingInstructions: true,
            },
          },
        },
      });

      return savedOutfit;
    });
  }
}

export const savedOutfitRepository = new SavedOutfitRepository();
