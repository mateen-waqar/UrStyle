import { WardrobeItemDto } from "@/types";

export interface WardrobeListResult {
  items: WardrobeItemDto[];
  total: number;
}

export interface WardrobeStats {
  totalItems: number;
  totalValue: number;
  categoryCounts: Record<string, number>;
  mostWornItem: WardrobeItemDto | null;
}
