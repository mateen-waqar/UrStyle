import { prisma } from "@/lib/prisma";
import { CreateAvatarProfileInput, UpdateAvatarProfileInput } from "../validations";

export class AvatarRepository {
  async getDefaultProfile(userId: string) {
    return prisma.avatarProfile.findFirst({
      where: { userId, isDefault: true },
    });
  }

  async listProfiles(userId: string) {
    return prisma.avatarProfile.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async createProfile(userId: string, input: CreateAvatarProfileInput) {
    if (input.isDefault) {
      await prisma.avatarProfile.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return prisma.avatarProfile.create({
      data: {
        userId,
        ...input,
      },
    });
  }

  async updateProfile(id: string, userId: string, input: UpdateAvatarProfileInput) {
    if (input.isDefault) {
      await prisma.avatarProfile.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return prisma.avatarProfile.updateMany({
      where: { id, userId },
      data: input,
    });
  }
}

export const avatarRepository = new AvatarRepository();
