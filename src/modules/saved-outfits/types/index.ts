import { OutfitDto } from "@/types";

export interface SavedOutfitEntry {
  id: string;
  userId: string;
  outfitId: string;
  collectionId: string | null;
  notes: string | null;
  createdAt: string;
  outfit: OutfitDto;
}
