import { create } from "zustand";
import { GarmentCategory, FormalityLevel, Season, WardrobeItemDto } from "@/types";

interface WardrobeFilterState {
  category: GarmentCategory | "ALL";
  formality: FormalityLevel | "ALL";
  season: Season | "ALL";
  searchQuery: string;
  onlyFavorites: boolean;
}

interface WardrobeState {
  items: WardrobeItemDto[];
  selectedItem: WardrobeItemDto | null;
  isLoading: boolean;
  filters: WardrobeFilterState;
  
  // Actions
  setItems: (items: WardrobeItemDto[]) => void;
  addItem: (item: WardrobeItemDto) => void;
  updateItem: (id: string, updates: Partial<WardrobeItemDto>) => void;
  removeItem: (id: string) => void;
  setSelectedItem: (item: WardrobeItemDto | null) => void;
  setFilter: <K extends keyof WardrobeFilterState>(key: K, value: WardrobeFilterState[K]) => void;
  resetFilters: () => void;
  setIsLoading: (isLoading: boolean) => void;
}

const initialFilters: WardrobeFilterState = {
  category: "ALL",
  formality: "ALL",
  season: "ALL",
  searchQuery: "",
  onlyFavorites: false,
};

export const useWardrobeStore = create<WardrobeState>((set) => ({
  items: [],
  selectedItem: null,
  isLoading: false,
  filters: initialFilters,

  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({ items: [item, ...state.items] })),
  updateItem: (id, updates) =>
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, ...updates } : i)),
      selectedItem:
        state.selectedItem?.id === id
          ? { ...state.selectedItem, ...updates }
          : state.selectedItem,
    })),
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
      selectedItem: state.selectedItem?.id === id ? null : state.selectedItem,
    })),
  setSelectedItem: (item) => set({ selectedItem: item }),
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),
  resetFilters: () => set({ filters: initialFilters }),
  setIsLoading: (isLoading) => set({ isLoading }),
}));
