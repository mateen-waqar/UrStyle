import type { WardrobeItemDto, AvatarGarmentRenderItem, GarmentSlot } from "@/types";
import { GARMENT_ASSET_CATALOG, type GarmentAssetDefinition } from "../constants/garmentCatalog.ts";

export class WardrobeMappingService {
  /**
   * Maps a user's 2D wardrobe item to a compatible 3D garment asset definition
   * with material, color, and fit overrides.
   */
  mapWardrobeItemTo3D(
    item: WardrobeItemDto,
    gender: "MALE" | "FEMALE" | "ANDROGYNOUS" = "MALE"
  ): AvatarGarmentRenderItem {
    const matchedAsset = this.findMatchingAsset(item, gender);

    // Compute fabric physics parameters
    const { roughness, metalness } = this.deriveMaterialProperties(item.material, matchedAsset);

    return {
      slot: matchedAsset.slot as GarmentSlot,
      garmentAssetUrl: matchedAsset.modelFileUrl,
      color: item.colorPrimary || "#181716",
      roughness,
      metalness,
      transform: {
        position: matchedAsset.positionOffset,
        rotation: [0, 0, 0],
        scale: matchedAsset.scaleOffset,
      },
      // Extended metadata for UI & layers tracking
      wardrobeItemId: item.id,
      name: item.name,
      category: item.category,
      subCategory: item.subCategory,
      fit: item.fit,
      secondaryColor: item.colorSecondary,
      imageUrl: item.imageUrl,
      material: item.material,
    } as any;
  }

  /**
   * Template matching algorithm: selects the best matching 3D asset from the catalog
   */
  findMatchingAsset(
    item: WardrobeItemDto,
    gender: "MALE" | "FEMALE" | "ANDROGYNOUS" = "MALE"
  ): GarmentAssetDefinition {
    const itemSub = (item.subCategory || "").toLowerCase();
    const itemFit = (item.fit || "REGULAR").toUpperCase();
    const itemCategory = item.category.toUpperCase();

    // 1. Direct subcategory + category match
    const candidates = GARMENT_ASSET_CATALOG.filter((asset) => {
      const catMatch = asset.category.toUpperCase() === itemCategory;
      const subMatch = asset.subCategory.toLowerCase() === itemSub || itemSub.includes(asset.subCategory.toLowerCase());
      return catMatch && subMatch;
    });

    if (candidates.length > 0) {
      // Find candidate matching fit if possible
      const fitMatch = candidates.find((c) => c.supportedFits.includes(itemFit as any));
      if (fitMatch) return fitMatch;
      return candidates[0];
    }

    // 2. Fallback to broad category match
    const categoryFallback = GARMENT_ASSET_CATALOG.find((asset) => asset.category.toUpperCase() === itemCategory);
    if (categoryFallback) {
      return categoryFallback;
    }

    // 3. Ultimate safe fallback: Classic Crewneck T-shirt
    return GARMENT_ASSET_CATALOG[0];
  }

  /**
   * Derives PBR material properties based on fabric type
   */
  deriveMaterialProperties(
    materialName?: string,
    asset?: GarmentAssetDefinition
  ): { roughness: number; metalness: number } {
    const defaultRoughness = asset?.materialSlots[0]?.defaultRoughness ?? 0.75;
    const defaultMetalness = asset?.materialSlots[0]?.defaultMetalness ?? 0.05;

    if (!materialName) {
      return { roughness: defaultRoughness, metalness: defaultMetalness };
    }

    const mat = materialName.toUpperCase();
    switch (mat) {
      case "SILK":
        return { roughness: 0.35, metalness: 0.15 };
      case "LEATHER":
        return { roughness: 0.42, metalness: 0.2 };
      case "SUEDE":
        return { roughness: 0.95, metalness: 0.01 };
      case "WOOL":
        return { roughness: 0.88, metalness: 0.02 };
      case "CASHMERE":
        return { roughness: 0.92, metalness: 0.01 };
      case "DENIM":
        return { roughness: 0.8, metalness: 0.05 };
      case "LINEN":
        return { roughness: 0.82, metalness: 0.02 };
      case "SYNTHETIC":
        return { roughness: 0.48, metalness: 0.1 };
      case "FLEECE":
        return { roughness: 0.92, metalness: 0.01 };
      case "COTTON":
      default:
        return { roughness: defaultRoughness, metalness: defaultMetalness };
    }
  }
}

export const wardrobeMappingService = new WardrobeMappingService();
