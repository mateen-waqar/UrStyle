import { GarmentSlot } from "@/types";

export interface OutfitStylingAdvice {
  slot: GarmentSlot;
  instruction: string;
  tipType: "TUCK" | "ROLL" | "BUTTON" | "LAYER" | "ACCESSORIZE" | "PROPORTION";
  editorialReason: string;
}
