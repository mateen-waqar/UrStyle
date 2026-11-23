import { customOutfitRepository, CustomOutfitRepository } from "../repositories/customOutfitRepository";
import { SaveCustomOutfitInput } from "../validations";
import { ruleEvaluationEngine } from "@/modules/outfit-generation-engine/services/ruleEvaluationEngine";
import { wardrobeRepository } from "@/modules/digital-wardrobe/repositories/wardrobeRepository";

export class CustomOutfitService {
  constructor(private readonly repo: CustomOutfitRepository = customOutfitRepository) {}

  async saveCustomOutfit(userId: string, input: SaveCustomOutfitInput) {
    return this.repo.createOutfit(userId, input);
  }

  async analyzeDraftOutfit(userId: string, itemIds: string[], targetFormality: string, targetSeason: string) {
    const items = await Promise.all(
      itemIds.map((id) => wardrobeRepository.findById(id, userId))
    );
    const validItems = items.filter(Boolean) as any[];

    const slots = validItems.map((item, idx) => ({
      slot: item.category as any,
      item,
      layerIndex: idx,
    }));

    return ruleEvaluationEngine.scoreOutfitCombination(slots, targetFormality, targetSeason);
  }
}

export const customOutfitService = new CustomOutfitService();
