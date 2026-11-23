import { savedOutfitRepository, SavedOutfitRepository } from "../repositories/savedOutfitRepository";
import { BookmarkOutfitInput, SaveOutfitEnsembleInput } from "../validations";

export class SavedOutfitService {
  private readonly repo: SavedOutfitRepository;

  constructor(repo: SavedOutfitRepository = savedOutfitRepository) {
    this.repo = repo;
  }

  async saveOutfit(userId: string, input: BookmarkOutfitInput) {
    return this.repo.bookmark(userId, input);
  }

  async saveOutfitEnsemble(userId: string, input: SaveOutfitEnsembleInput) {
    return this.repo.createOutfitEnsemble(userId, input);
  }

  async getSavedOutfits(userId: string, collectionId?: string) {
    return this.repo.listByUser(userId, collectionId);
  }

  async deleteSavedOutfit(id: string, userId: string) {
    return this.repo.removeBookmark(id, userId);
  }
}

export const savedOutfitService = new SavedOutfitService();
