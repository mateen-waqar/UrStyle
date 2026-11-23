import { prisma } from "@/lib/prisma";
import { CreateWardrobeItemInput, UpdateWardrobeItemInput, WardrobeQueryFilter } from "../validations";
import {
  GarmentCategory,
  FormalityLevel,
  Season,
  ItemStatus,
  AestheticType,
  Prisma,
} from "@prisma/client";

export class WardrobeRepository {
  async findById(id: string, userId: string) {
    return prisma.wardrobeItem.findFirst({
      where: { id, userId },
      include: {
        garmentMapping: {
          include: {
            garmentAsset: true,
          },
        },
      },
    });
  }

  async findMany(userId: string, filter: WardrobeQueryFilter) {
    const where: Prisma.WardrobeItemWhereInput = {
      userId,
    };

    if (filter.status && filter.status !== "ALL") {
      where.status = filter.status as ItemStatus;
    } else {
      // By default show all non-archived items unless explicitly asked
      where.status = { not: ItemStatus.ARCHIVED };
    }

    if (filter.category && filter.category !== "ALL") {
      where.category = filter.category as GarmentCategory;
    }

    if (filter.subCategory && filter.subCategory !== "ALL") {
      where.subCategory = filter.subCategory;
    }

    if (filter.formality && filter.formality !== "ALL") {
      where.formality = filter.formality as FormalityLevel;
    }

    if (filter.style && filter.style !== "ALL") {
      where.style = filter.style as AestheticType;
    }

    if (filter.color && filter.color !== "ALL") {
      where.colorPrimary = {
        contains: filter.color,
        mode: "insensitive",
      };
    }

    if (filter.season && filter.season !== "ALL") {
      where.seasonality = {
        has: filter.season as Season,
      };
    }

    if (filter.isFavorite !== undefined) {
      where.isFavorite = filter.isFavorite;
    }

    if (filter.search && filter.search.trim()) {
      const q = filter.search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { brand: { contains: q, mode: "insensitive" } },
        { subCategory: { contains: q, mode: "insensitive" } },
        { notes: { contains: q, mode: "insensitive" } },
      ];
    }

    let orderBy: Prisma.WardrobeItemOrderByWithRelationInput = { createdAt: "desc" };
    if (filter.sortBy === "most_worn") {
      orderBy = { wearCount: "desc" };
    } else if (filter.sortBy === "name") {
      orderBy = { name: "asc" };
    } else if (filter.sortBy === "brand") {
      orderBy = { brand: "asc" };
    }

    const [items, total] = await Promise.all([
      prisma.wardrobeItem.findMany({
        where,
        take: filter.limit,
        skip: filter.offset,
        orderBy,
        include: {
          garmentMapping: true,
        },
      }),
      prisma.wardrobeItem.count({ where }),
    ]);

    return { items, total };
  }

  async create(userId: string, input: CreateWardrobeItemInput) {
    return prisma.wardrobeItem.create({
      data: {
        userId,
        ...input,
        purchasePrice: input.purchasePrice ? input.purchasePrice : null,
      },
    });
  }

  async update(id: string, userId: string, input: UpdateWardrobeItemInput) {
    // Ensure item belongs to user
    const existing = await prisma.wardrobeItem.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error("Item not found or access denied.");
    }

    return prisma.wardrobeItem.update({
      where: { id },
      data: {
        ...input,
        purchasePrice: input.purchasePrice !== undefined ? input.purchasePrice : undefined,
      },
    });
  }

  async delete(id: string, userId: string) {
    // Ensure item belongs to user
    const existing = await prisma.wardrobeItem.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error("Item not found or access denied.");
    }

    return prisma.wardrobeItem.delete({
      where: { id },
    });
  }

  async recordWear(id: string, userId: string) {
    return prisma.wardrobeItem.updateMany({
      where: { id, userId },
      data: {
        wearCount: { increment: 1 },
        lastWornAt: new Date(),
      },
    });
  }

  async updateStatus(id: string, userId: string, status: ItemStatus) {
    return prisma.wardrobeItem.updateMany({
      where: { id, userId },
      data: {
        status,
        isArchived: status === ItemStatus.ARCHIVED,
      },
    });
  }
}

export const wardrobeRepository = new WardrobeRepository();
