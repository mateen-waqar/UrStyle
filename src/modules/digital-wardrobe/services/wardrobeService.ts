import { wardrobeRepository, WardrobeRepository } from "../repositories/wardrobeRepository";
import { CreateWardrobeItemInput, UpdateWardrobeItemInput, WardrobeQueryFilter } from "../validations";
import { ItemStatus } from "@prisma/client";

export class WardrobeService {
  constructor(private readonly repo: WardrobeRepository = wardrobeRepository) {}

  async getItem(id: string, userId: string) {
    const item = await this.repo.findById(id, userId);
    if (!item) throw new Error("Wardrobe item not found");
    return item;
  }

  async listItems(userId: string, filter: WardrobeQueryFilter) {
    return this.repo.findMany(userId, filter);
  }

  async addItem(userId: string, input: CreateWardrobeItemInput) {
    return this.repo.create(userId, input);
  }

  async editItem(id: string, userId: string, input: UpdateWardrobeItemInput) {
    return this.repo.update(id, userId, input);
  }

  async removeItem(id: string, userId: string) {
    return this.repo.delete(id, userId);
  }

  async logWear(id: string, userId: string) {
    return this.repo.recordWear(id, userId);
  }

  async setStatus(id: string, userId: string, status: ItemStatus) {
    return this.repo.updateStatus(id, userId, status);
  }
}

export const wardrobeService = new WardrobeService();
