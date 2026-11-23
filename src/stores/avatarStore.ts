import { create } from "zustand";
import { AvatarProfileDto, AvatarGarmentRenderItem, GarmentSlot } from "@/types";

interface AvatarState {
  currentProfile: AvatarProfileDto | null;
  activeGarments: Record<GarmentSlot, AvatarGarmentRenderItem | null>;
  currentPose: "A_POSE" | "RUNWAY_WALK" | "EDITORIAL_TURN" | "CASUAL_LEAN";
  showWireframe: boolean;

  // Actions
  setCurrentProfile: (profile: AvatarProfileDto | null) => void;
  updateAvatarDimensions: (dims: Partial<Pick<AvatarProfileDto, "heightScale" | "shoulderWidth" | "waistWidth" | "hipWidth" | "skinColor">>) => void;
  setGarmentForSlot: (slot: GarmentSlot, garment: AvatarGarmentRenderItem | null) => void;
  clearGarments: () => void;
  setCurrentPose: (pose: AvatarState["currentPose"]) => void;
  toggleWireframe: () => void;
}

const defaultProfile: AvatarProfileDto = {
  id: "default-avatar-01",
  userId: "local-user",
  name: "Atelier Mannequin",
  gender: "MALE",
  meshType: "stylized_v1",
  skinColor: "#e6c3a5",
  hairStyle: "classic_taper",
  hairColor: "#1e1e24",
  eyeColor: "#3d312a",
  heightScale: 1.0,
  shoulderWidth: 1.0,
  waistWidth: 1.0,
  hipWidth: 1.0,
  baseModelUrl: null,
  isDefault: true,
};

const initialGarmentSlots: Record<GarmentSlot, AvatarGarmentRenderItem | null> = {
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

export const useAvatarStore = create<AvatarState>((set) => ({
  currentProfile: defaultProfile,
  activeGarments: initialGarmentSlots,
  currentPose: "A_POSE",
  showWireframe: false,

  setCurrentProfile: (profile) => set({ currentProfile: profile }),
  updateAvatarDimensions: (dims) =>
    set((state) => ({
      currentProfile: state.currentProfile
        ? { ...state.currentProfile, ...dims }
        : null,
    })),
  setGarmentForSlot: (slot, garment) =>
    set((state) => ({
      activeGarments: { ...state.activeGarments, [slot]: garment },
    })),
  clearGarments: () => set({ activeGarments: initialGarmentSlots }),
  setCurrentPose: (pose) => set({ currentPose: pose }),
  toggleWireframe: () => set((state) => ({ showWireframe: !state.showWireframe })),
}));
