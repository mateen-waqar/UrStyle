import { avatarRepository, AvatarRepository } from "../repositories/avatarRepository";
import { CreateAvatarProfileInput, UpdateAvatarProfileInput } from "../validations";

export class AvatarService {
  constructor(private readonly repo: AvatarRepository = avatarRepository) {}

  async getUserAvatar(userId: string) {
    let profile = await this.repo.getDefaultProfile(userId);
    if (!profile) {
      // Create initial base avatar profile if none exists
      profile = await this.repo.createProfile(userId, {
        name: "My Avatar",
        gender: "MALE",
        meshType: "stylized_v1",
        skinColor: "#e0bb95",
        hairStyle: "classic_taper",
        hairColor: "#2b1e1a",
        eyeColor: "#3a2a22",
        heightScale: 1.0,
        shoulderWidth: 1.0,
        waistWidth: 1.0,
        hipWidth: 1.0,
        isDefault: true,
      });
    }
    return profile;
  }

  async updateAvatar(id: string, userId: string, input: UpdateAvatarProfileInput) {
    await this.repo.updateProfile(id, userId, input);
    return this.getUserAvatar(userId);
  }
}

export const avatarService = new AvatarService();
