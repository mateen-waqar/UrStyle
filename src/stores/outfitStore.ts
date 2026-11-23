import { create } from "zustand";
import { OutfitDto, WardrobeItemDto, GarmentSlot } from "@/types";

export interface CustomBuilderSlotSelection {
  slot: GarmentSlot;
  item: WardrobeItemDto | null;
  layerIndex: number;
}

interface OutfitState {
  generatedOutfits: OutfitDto[];
  activeOutfit: OutfitDto | null;
  builderSlots: Record<GarmentSlot, WardrobeItemDto | null>;
  isGenerating: boolean;
  scoreBreakdown: {
    colorHarmony: number;
    silhouetteProportion: number;
    formalityMatch: number;
    weatherAppropriateness: number;
    overall: number;
  } | null;

  // Actions
  setGeneratedOutfits: (outfits: OutfitDto[]) => void;
  setActiveOutfit: (outfit: OutfitDto | null) => void;
  assignBuilderSlot: (slot: GarmentSlot, item: WardrobeItemDto | null) => void;
  clearBuilderSlots: () => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setScoreBreakdown: (score: OutfitState["scoreBreakdown"]) => void;
}

const defaultBuilderSlots: Record<GarmentSlot, WardrobeItemDto | null> = {
  HEAD: null,
  FACE: null,
  NECK: null,
  INNER_TOP: null,
  OUTER_TOP: null,
  BOTTOM: null,
  FOOTWEAR: null,
  WRIST: null,
  ACCESSORY_PRIMARY: null,
  ACCESSORY_SECONDARY: null,
};

export const useOutfitStore = create<OutfitState>((set) => ({
  generatedOutfits: [],
  activeOutfit: null,
  builderSlots: defaultBuilderSlots,
  isGenerating: false,
  scoreBreakdown: null,

  setGeneratedOutfits: (outfits) => set({ generatedOutfits: outfits }),
  setActiveOutfit: (outfit) => set({ activeOutfit: outfit }),
  assignBuilderSlot: (slot, item) =>
    set((state) => ({
      builderSlots: { ...state.builderSlots, [slot]: item },
    })),
  clearBuilderSlots: () => set({ builderSlots: defaultBuilderSlots }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setScoreBreakdown: (scoreBreakdown) => set({ scoreBreakdown }),
}));
