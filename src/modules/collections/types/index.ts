export interface CollectionSummary {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  isPrivate: boolean;
  coverImageUrl: string | null;
  outfitCount: number;
  createdAt: string;
}
