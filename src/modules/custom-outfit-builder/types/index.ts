import { GarmentSlot, WardrobeItemDto } from "@/types";

export interface BuilderSlotState {
  slot: GarmentSlot;
  item: WardrobeItemDto | null;
  layerIndex: number;
}
