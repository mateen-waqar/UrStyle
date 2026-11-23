import { create } from "zustand";
import { StudioEnvironmentSettings } from "@/types";

interface StudioState {
  settings: StudioEnvironmentSettings;
  activeTab: "view" | "lighting" | "garments" | "pose";
  isCapturingScreenshot: boolean;

  // Actions
  updateSettings: (updates: Partial<StudioEnvironmentSettings>) => void;
  setActiveTab: (tab: StudioState["activeTab"]) => void;
  setIsCapturingScreenshot: (capturing: boolean) => void;
  resetCamera: () => void;
}

const defaultSettings: StudioEnvironmentSettings = {
  preset: "studio",
  lightingIntensity: 1.2,
  cameraFov: 45,
  cameraPosition: [0, 1.2, 3.5],
  showGrid: true,
  wireframe: false,
  autoRotate: false,
};

export const useStudioStore = create<StudioState>((set) => ({
  settings: defaultSettings,
  activeTab: "view",
  isCapturingScreenshot: false,

  updateSettings: (updates) =>
    set((state) => ({
      settings: { ...state.settings, ...updates },
    })),
  setActiveTab: (activeTab) => set({ activeTab }),
  setIsCapturingScreenshot: (isCapturingScreenshot) =>
    set({ isCapturingScreenshot }),
  resetCamera: () =>
    set((state) => ({
      settings: {
        ...state.settings,
        cameraPosition: [0, 1.2, 3.5],
        cameraFov: 45,
      },
    })),
}));
