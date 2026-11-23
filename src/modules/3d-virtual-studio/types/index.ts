import { AvatarGarmentRenderItem, GarmentSlot } from "@/types";

export interface VirtualStudioScenePayload {
  avatarId: string;
  garments: Record<GarmentSlot, AvatarGarmentRenderItem | null>;
  environmentPreset: string;
}
