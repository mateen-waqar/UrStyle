import { collectionRepository, CollectionRepository } from "../repositories/collectionRepository";
import { CreateCollectionInput, UpdateCollectionInput } from "../validations";

export class CollectionService {
  constructor(private readonly repo: CollectionRepository = collectionRepository) {}

  async getCollections(userId: string) {
    return this.repo.listByUser(userId);
  }

  async getCollectionDetails(id: string, userId: string) {
    const coll = await this.repo.findById(id, userId);
    if (!coll) throw new Error("Collection not found");
    return coll;
  }

  async addCollection(userId: string, input: CreateCollectionInput) {
    return this.repo.create(userId, input);
  }

  async editCollection(id: string, userId: string, input: UpdateCollectionInput) {
    await this.repo.update(id, userId, input);
    return this.getCollectionDetails(id, userId);
  }

  async removeCollection(id: string, userId: string) {
    return this.repo.delete(id, userId);
  }
}

export const collectionService = new CollectionService();
