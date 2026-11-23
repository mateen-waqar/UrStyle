import { prisma } from "@/lib/prisma";
import { CreateCollectionInput, UpdateCollectionInput } from "../validations";

export class CollectionRepository {
  async listByUser(userId: string) {
    return prisma.savedCollection.findMany({
      where: { userId },
      include: {
        _count: {
          select: { savedOutfits: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string, userId: string) {
    return prisma.savedCollection.findFirst({
      where: { id, userId },
      include: {
        savedOutfits: {
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
        },
      },
    });
  }

  async create(userId: string, input: CreateCollectionInput) {
    return prisma.savedCollection.create({
      data: {
        userId,
        ...input,
      },
    });
  }

  async update(id: string, userId: string, input: UpdateCollectionInput) {
    return prisma.savedCollection.updateMany({
      where: { id, userId },
      data: input,
    });
  }

  async delete(id: string, userId: string) {
    return prisma.savedCollection.deleteMany({
      where: { id, userId },
    });
  }
}

export const collectionRepository = new CollectionRepository();
