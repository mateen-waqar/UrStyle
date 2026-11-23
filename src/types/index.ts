// -----------------------------------------------------------------------------
// StyleOS Core Domain Types
// -----------------------------------------------------------------------------

export type GenderPreference = "MALE" | "FEMALE" | "UNISEX" | "NON_BINARY";

export type AestheticType =
  | "MINIMALIST"
  | "QUIET_LUXURY"
  | "STREETWEAR"
  | "CLASSIC_TAILORING"
  | "SMART_CASUAL"
  | "AVANT_GARDE"
  | "ATHLEISURE"
  | "OLD_MONEY"
  | "MONOCHROME"
  | "BOHEMIAN";

export type BodyShape =
  | "RECTANGLE"
  | "INVERTED_TRIANGLE"
  | "HOURGLASS"
  | "PEAR"
  | "ATHLETIC"
  | "OVAL";

export type PreferredFit = "SLIM" | "REGULAR" | "RELAXED" | "OVERSIZED";

export type GarmentCategory =
  | "TOP"
  | "BOTTOM"
  | "FOOTWEAR"
  | "OUTERWEAR"
  | "ACCESSORY"
  | "HEADWEAR"
  | "EYEWEAR"
  | "TIMEPIECE"
  | "BAG"
  | "JEWELRY";

export type GarmentSlot =
  | "HEAD"
  | "FACE"
  | "NECK"
  | "INNER_TOP"
  | "OUTER_TOP"
  | "BOTTOM"
  | "FOOTWEAR"
  | "WRIST"
  | "ACCESSORY_PRIMARY"
  | "ACCESSORY_SECONDARY";

export type GarmentPattern =
  | "SOLID"
  | "STRIPED"
  | "CHECKERED"
  | "FLORAL"
  | "GRAPHIC"
  | "TEXTURED"
  | "HERRINGBONE"
  | "HOUNDSTOOTH"
  | "PAISLEY";

export type GarmentMaterial =
  | "COTTON"
  | "LINEN"
  | "WOOL"
  | "CASHMERE"
  | "SILK"
  | "DENIM"
  | "LEATHER"
  | "SUEDE"
  | "SYNTHETIC"
  | "FLEECE"
  | "BLEND";

export type FormalityLevel =
  | "CASUAL"
  | "SMART_CASUAL"
  | "BUSINESS_CASUAL"
  | "BUSINESS_FORMAL"
  | "BLACK_TIE";

export type Season = "SPRING" | "SUMMER" | "FALL" | "WINTER" | "ALL_SEASON";

export type WeatherSuitability =
  | "COLD"
  | "MILD"
  | "WARM"
  | "HOT"
  | "RAIN"
  | "WIND";

export type OccasionType =
  | "WORK"
  | "DATE_NIGHT"
  | "CASUAL_OUTING"
  | "FORMAL_EVENT"
  | "TRAVEL"
  | "LOUNGE"
  | "ATHLETIC"
  | "GALA"
  | "PARTY";

export type AvatarGender = "MALE" | "FEMALE" | "ANDROGYNOUS";

// -----------------------------------------------------------------------------
// ENTITY INTERFACES
// -----------------------------------------------------------------------------

export interface UserProfileDto {
  id: string;
  userId: string;
  displayName?: string | null;
  bio?: string | null;
  genderPreference: GenderPreference;
  aesthetic: AestheticType;
  bodyShape?: BodyShape | null;
  skinTone?: string | null;
  heightCm?: number | null;
  weightKg?: number | null;
  preferredFit: PreferredFit;
  city?: string | null;
  country?: string | null;
}

export type ItemStatus = "AVAILABLE" | "LAUNDRY" | "UNAVAILABLE" | "ARCHIVED";

export interface WardrobeItemDto {
  id: string;
  userId: string;
  name: string;
  category: GarmentCategory;
  subCategory: string;
  brand?: string | null;
  size?: string | null;
  colorPrimary: string;
  colorSecondary?: string | null;
  pattern: GarmentPattern;
  material: GarmentMaterial;
  fit: PreferredFit;
  style: AestheticType;
  formality: FormalityLevel;
  seasonality: Season[];
  weatherSuitability: WeatherSuitability[];
  occasions: OccasionType[];
  status: ItemStatus;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  storagePath?: string | null;
  isArchived: boolean;
  isFavorite: boolean;
  wearCount: number;
  lastWornAt?: string | null;
  purchasePrice?: number | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OutfitItemDto {
  id: string;
  outfitId: string;
  wardrobeItemId: string;
  wardrobeItem: WardrobeItemDto;
  slot: GarmentSlot;
  layerIndex: number;
  isRequired: boolean;
}

export interface StylingInstructionDto {
  id: string;
  outfitId: string;
  garmentSlot: GarmentSlot;
  instruction: string;
  tipType: string;
}

export interface OutfitDto {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  occasion: OccasionType;
  formality: FormalityLevel;
  season: Season;
  generationSource: string;
  compatibilityScore?: number | null;
  colorHarmonyScore?: number | null;
  styleBalanceScore?: number | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  items: OutfitItemDto[];
  stylingInstructions?: StylingInstructionDto[];
}

export interface AvatarProfileDto {
  id: string;
  userId: string;
  name: string;
  gender: AvatarGender;
  meshType: string;
  skinColor: string;
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  heightScale: number;
  shoulderWidth: number;
  waistWidth: number;
  hipWidth: number;
  baseModelUrl?: string | null;
  isDefault: boolean;
}

// -----------------------------------------------------------------------------
// 3D VIRTUAL STUDIO TYPES
// -----------------------------------------------------------------------------

export interface GarmentTransform {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export interface AvatarGarmentRenderItem {
  slot: GarmentSlot;
  garmentAssetUrl: string;
  color: string;
  roughness: number;
  metalness: number;
  transform?: GarmentTransform;
}

export interface StudioEnvironmentSettings {
  preset: "studio" | "sunset" | "city" | "dawn" | "warehouse";
  lightingIntensity: number;
  cameraFov: number;
  cameraPosition: [number, number, number];
  showGrid: boolean;
  wireframe: boolean;
  autoRotate: boolean;
}
