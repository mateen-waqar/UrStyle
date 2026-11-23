import { userProfileRepository, UserProfileRepository } from "../repositories/userProfileRepository";
import { UpdateProfileInput, CompleteOnboardingInput } from "../validations";

export class UserProfileService {
  constructor(private readonly repo: UserProfileRepository = userProfileRepository) {}

  async getProfile(userId: string) {
    return this.repo.getByUserId(userId);
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    return this.repo.upsertProfile(userId, input);
  }

  async saveOnboardingStep(userId: string, step: number, data: Record<string, any>) {
    return this.repo.saveOnboardingStep(userId, step, data);
  }

  async completeOnboarding(userId: string, input: CompleteOnboardingInput) {
    return this.repo.completeOnboarding(userId, input);
  }
}

export const userProfileService = new UserProfileService();
