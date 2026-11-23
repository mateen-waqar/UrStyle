import { prisma } from "@/lib/prisma";
import { UpdateProfileInput, CompleteOnboardingInput } from "../validations";
import { GenderPreference, PreferredFit, AestheticType } from "@prisma/client";

export class UserProfileRepository {
  async getByUserId(userId: string) {
    return prisma.userProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            avatarProfiles: {
              where: { isDefault: true },
              take: 1,
            },
          },
        },
      },
    });
  }

  async upsertProfile(userId: string, data: UpdateProfileInput) {
    return prisma.userProfile.upsert({
      where: { userId },
      update: {
        ...data,
      },
      create: {
        userId,
        ...data,
      },
    });
  }

  async saveOnboardingStep(userId: string, step: number, partialData: Record<string, any>) {
    return prisma.userProfile.upsert({
      where: { userId },
      update: {
        ...partialData,
        onboardingStep: Math.max(step, 1),
      },
      create: {
        userId,
        ...partialData,
        onboardingStep: Math.max(step, 1),
      },
    });
  }

  async completeOnboarding(userId: string, input: CompleteOnboardingInput) {
    // Map aesthetic choice to AestheticType enum
    const aestheticMap: Record<string, AestheticType> = {
      MINIMAL: "MINIMALIST",
      QUIET_LUXURY: "QUIET_LUXURY",
      STREETWEAR: "STREETWEAR",
      FORMAL: "CLASSIC_TAILORING",
      SMART_CASUAL: "SMART_CASUAL",
      OLD_MONEY: "OLD_MONEY",
      SPORTY: "ATHLEISURE",
      CASUAL: "SMART_CASUAL",
    };

    const aestheticValue = aestheticMap[input.aesthetic] || "MINIMALIST";

    // Transaction: updates UserProfile & ensures AvatarProfile reflects chosen avatar gender
    return prisma.$transaction(async (tx) => {
      // 1. Update Profile
      const profile = await tx.userProfile.upsert({
        where: { userId },
        update: {
          displayName: input.displayName,
          genderPreference: input.genderPreference as GenderPreference,
          aesthetic: aestheticValue,
          favoriteColors: input.favoriteColors,
          lifestyle: input.lifestyle,
          heightCm: input.heightCm ?? null,
          preferredFit: input.preferredFit as PreferredFit,
          onboardingCompleted: true,
          onboardingStep: 7,
        },
        create: {
          userId,
          displayName: input.displayName,
          genderPreference: input.genderPreference as GenderPreference,
          aesthetic: aestheticValue,
          favoriteColors: input.favoriteColors,
          lifestyle: input.lifestyle,
          heightCm: input.heightCm ?? null,
          preferredFit: input.preferredFit as PreferredFit,
          onboardingCompleted: true,
          onboardingStep: 7,
        },
      });

      // 2. Ensure or update Default AvatarProfile matching avatar selection
      const existingAvatar = await tx.avatarProfile.findFirst({
        where: { userId, isDefault: true },
      });

      const isFemale = input.avatarGender === "FEMALE";

      if (existingAvatar) {
        await tx.avatarProfile.update({
          where: { id: existingAvatar.id },
          data: {
            name: `${input.displayName}'s Avatar`,
            gender: input.avatarGender,
            shoulderWidth: isFemale ? 0.88 : 1.0,
            waistWidth: isFemale ? 0.85 : 1.0,
            skinColor: isFemale ? "#f5d0b5" : "#e0bb95",
          },
        });
      } else {
        await tx.avatarProfile.create({
          data: {
            userId,
            name: `${input.displayName}'s Avatar`,
            gender: input.avatarGender,
            meshType: "stylized_v1",
            skinColor: isFemale ? "#f5d0b5" : "#e0bb95",
            hairStyle: isFemale ? "editorial_bob" : "classic_taper",
            hairColor: "#2c221e",
            eyeColor: "#4a3728",
            heightScale: 1.0,
            shoulderWidth: isFemale ? 0.88 : 1.0,
            waistWidth: isFemale ? 0.85 : 1.0,
            hipWidth: isFemale ? 1.05 : 1.0,
            isDefault: true,
          },
        });
      }

      return profile;
    });
  }
}

export const userProfileRepository = new UserProfileRepository();
