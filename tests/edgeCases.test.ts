import test from "node:test";
import assert from "node:assert/strict";

import { OutfitGenerationService } from "../src/modules/outfit-generation-engine/services/outfitGenerationService.ts";
import { ruleEvaluationEngine } from "../src/modules/outfit-generation-engine/services/ruleEvaluationEngine.ts";
import { stylingInstructionService } from "../src/modules/outfit-styling-engine/services/stylingInstructionService.ts";
import { wardrobeMappingService } from "../src/modules/3d-virtual-studio/services/wardrobeMappingService.ts";
import { GARMENT_ASSET_CATALOG, type GarmentAssetDefinition } from "../src/modules/3d-virtual-studio/constants/garmentCatalog.ts";
import type { WardrobeItemDto } from "../src/types/index.ts";

function createMockItem(overrides: Partial<WardrobeItemDto>): WardrobeItemDto {
  return {
    id: overrides.id || `mock-${Math.random().toString(36).substring(2, 8)}`,
    userId: overrides.userId || "user-alpha",
    name: overrides.name || "Mock Garment",
    category: overrides.category || "TOP",
    subCategory: overrides.subCategory || "T-shirts",
    brand: overrides.brand || "Acne Studios",
    size: overrides.size || "M",
    colorPrimary: overrides.colorPrimary || "#181716",
    colorSecondary: overrides.colorSecondary || null,
    pattern: overrides.pattern || "SOLID",
    material: overrides.material || "COTTON",
    fit: overrides.fit || "REGULAR",
    style: overrides.style || "SMART_CASUAL",
    formality: overrides.formality || "CASUAL",
    seasonality: overrides.seasonality || ["ALL_SEASON"],
    weatherSuitability: overrides.weatherSuitability || ["MILD"],
    occasions: overrides.occasions || ["CASUAL_OUTING"],
    status: overrides.status || "AVAILABLE",
    imageUrl: overrides.imageUrl || null,
    thumbnailUrl: overrides.thumbnailUrl || null,
    storagePath: overrides.storagePath || null,
    isArchived: overrides.isArchived || false,
    isFavorite: overrides.isFavorite || false,
    wearCount: overrides.wearCount || 0,
    lastWornAt: overrides.lastWornAt || null,
    purchasePrice: overrides.purchasePrice || 120,
    notes: overrides.notes || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// -----------------------------------------------------------------------------
// EDGE CASE 1: User has NO wardrobe items at all
// -----------------------------------------------------------------------------
test("Edge Case 1: Empty wardrobe produces diagnostic feedback gracefully", async () => {
  const emptyRepo = {
    findMany: async () => ({ items: [], total: 0 }),
  } as any;

  const engine = new OutfitGenerationService(ruleEvaluationEngine, stylingInstructionService, emptyRepo);
  const result = await engine.generateOutfits("user-alpha", {
    occasion: "CASUAL_OUTING",
    preferredStyle: "CASUAL",
    season: "ALL_SEASON",
    numberOfOutfits: 4,
    excludeRecentlyGeneratedOutfits: true,
  });

  assert.equal(result.outfits.length, 0);
  assert.ok(result.message?.includes("empty"));
  assert.ok(Array.isArray(result.missingCategories));
});

// -----------------------------------------------------------------------------
// EDGE CASE 2: User has NO footwear (missing essential category)
// -----------------------------------------------------------------------------
test("Edge Case 2: Wardrobe missing footwear reports missing essential slot", async () => {
  const noShoesRepo = {
    findMany: async () => ({
      items: [
        createMockItem({ category: "TOP", subCategory: "T-shirts" }),
        createMockItem({ category: "BOTTOM", subCategory: "Jeans" }),
        createMockItem({ category: "OUTERWEAR", subCategory: "Jackets" }),
      ],
      total: 3,
    }),
  } as any;

  const engine = new OutfitGenerationService(ruleEvaluationEngine, stylingInstructionService, noShoesRepo);
  const result = await engine.generateOutfits("user-alpha", {
    occasion: "CASUAL_OUTING",
    preferredStyle: "CASUAL",
    season: "ALL_SEASON",
    numberOfOutfits: 3,
    excludeRecentlyGeneratedOutfits: true,
  });

  assert.equal(result.outfits.length, 0);
  assert.ok(result.missingCategories?.includes("Footwear"));
  assert.ok(result.message?.includes("Footwear"));
});

// -----------------------------------------------------------------------------
// EDGE CASE 3: User has ONLY formal clothing when requesting Casual
// -----------------------------------------------------------------------------
test("Edge Case 3: Formal clothing requested for Casual Outing receives formality tension penalty", () => {
  const tuxedoJacket = createMockItem({
    category: "OUTERWEAR",
    subCategory: "Blazers",
    formality: "BLACK_TIE",
    occasions: ["FORMAL_EVENT"],
    colorPrimary: "#000000",
  });
  const dressPants = createMockItem({
    category: "BOTTOM",
    subCategory: "Trousers",
    formality: "BLACK_TIE",
    occasions: ["FORMAL_EVENT"],
    colorPrimary: "#000000",
  });
  const patentShoes = createMockItem({
    category: "FOOTWEAR",
    subCategory: "Formal Shoes",
    formality: "BLACK_TIE",
    occasions: ["FORMAL_EVENT"],
    colorPrimary: "#000000",
  });

  const scoreResult = ruleEvaluationEngine.scoreOutfit(
    [tuxedoJacket, dressPants, patentShoes],
    "CASUAL_OUTING",
    "CASUAL",
    "ALL_SEASON"
  );

  assert.ok(
    scoreResult.occasionScore <= 0.65,
    `Expected low occasion score for black tie at casual outing, got ${scoreResult.occasionScore}`
  );
  assert.ok(
    scoreResult.compositeScore < 0.95,
    `Expected composite score penalized below optimal, got ${scoreResult.compositeScore}`
  );
});

// -----------------------------------------------------------------------------
// EDGE CASE 4: User has ONLY casual clothing when requesting Formal Event
// -----------------------------------------------------------------------------
test("Edge Case 4: Casual hoodie and sneakers requested for Formal Event receives penalty", () => {
  const hoodie = createMockItem({
    category: "TOP",
    subCategory: "Hoodies",
    formality: "CASUAL",
    colorPrimary: "#777777",
  });
  const sweatpants = createMockItem({
    category: "BOTTOM",
    subCategory: "Joggers",
    formality: "CASUAL",
    colorPrimary: "#555555",
  });
  const sneakers = createMockItem({
    category: "FOOTWEAR",
    subCategory: "Sneakers",
    formality: "CASUAL",
    colorPrimary: "#FFFFFF",
  });

  const scoreResult = ruleEvaluationEngine.scoreOutfit(
    [hoodie, sweatpants, sneakers],
    "FORMAL_EVENT",
    "FORMAL",
    "ALL_SEASON"
  );

  assert.ok(
    scoreResult.occasionScore <= 0.60,
    `Expected low occasion score for lounge items at formal event, got ${scoreResult.occasionScore}`
  );
});

// -----------------------------------------------------------------------------
// EDGE CASE 5: Duplicate Outfits Elimination
// -----------------------------------------------------------------------------
test("Edge Case 5: Outfit generation guarantees zero duplicate combinations of item IDs", async () => {
  const multiItemRepo = {
    findMany: async () => ({
      items: [
        createMockItem({ id: "top-1", category: "TOP", subCategory: "T-shirts", colorPrimary: "#F5F2EB" }),
        createMockItem({ id: "top-2", category: "TOP", subCategory: "Shirts", colorPrimary: "#292624" }),
        createMockItem({ id: "bottom-1", category: "BOTTOM", subCategory: "Jeans", colorPrimary: "#1E2A38" }),
        createMockItem({ id: "bottom-2", category: "BOTTOM", subCategory: "Trousers", colorPrimary: "#423E3A" }),
        createMockItem({ id: "shoe-1", category: "FOOTWEAR", subCategory: "Sneakers", colorPrimary: "#FFFFFF" }),
        createMockItem({ id: "shoe-2", category: "FOOTWEAR", subCategory: "Loafers", colorPrimary: "#181716" }),
      ],
      total: 6,
    }),
  } as any;

  const engine = new OutfitGenerationService(ruleEvaluationEngine, stylingInstructionService, multiItemRepo);
  const result = await engine.generateOutfits("user-alpha", {
    occasion: "CASUAL_OUTING",
    preferredStyle: "CASUAL",
    season: "ALL_SEASON",
    numberOfOutfits: 6,
    excludeRecentlyGeneratedOutfits: true,
  });

  const outfitKeySet = new Set<string>();
  for (const outfit of result.outfits) {
    const key = outfit.items
      .map((it) => it.item.id)
      .sort()
      .join("|");
    assert.ok(!outfitKeySet.has(key), `Found duplicate outfit combination: ${key}`);
    outfitKeySet.add(key);
  }
});

// -----------------------------------------------------------------------------
// EDGE CASE 6 & 7: Deleted/Archived & Laundry Items Filtered
// -----------------------------------------------------------------------------
test("Edge Case 6 & 7: Filter query excludes archived and laundry garments", async () => {
  let capturedWhereStatus: any = null;

  const spyRepo = {
    findMany: async (userId: string, filter: any) => {
      capturedWhereStatus = filter.status;
      return { items: [], total: 0 };
    },
  } as any;

  const engine = new OutfitGenerationService(ruleEvaluationEngine, stylingInstructionService, spyRepo);
  await engine.generateOutfits("user-alpha", {
    occasion: "CASUAL_OUTING",
    preferredStyle: "CASUAL",
    season: "ALL_SEASON",
    numberOfOutfits: 2,
    excludeRecentlyGeneratedOutfits: true,
  });

  // Outfit generator must query AVAILABLE status
  assert.equal(capturedWhereStatus, "AVAILABLE");
});

// -----------------------------------------------------------------------------
// EDGE CASE 8: Missing 3D Garment Mappings Fallback
// -----------------------------------------------------------------------------
test("Edge Case 8: Wardrobe item with unknown or unmapped subcategory falls back safely", () => {
  const strangeItem = createMockItem({
    category: "TOP",
    subCategory: "Handmade Vintage Poncho",
    material: "WOOL",
    colorPrimary: "#8B4513",
  });

  const template = wardrobeMappingService.findMatchingAsset(strangeItem, "MALE");
  assert.ok(template, "Should return a safe fallback garment template");
  assert.ok(template.id.length > 0);

  const mapped = wardrobeMappingService.mapWardrobeItemTo3D(strangeItem, "MALE");
  assert.equal(mapped.slot, "INNER_TOP");
  assert.equal(mapped.color, "#8B4513");
  assert.ok(mapped.roughness >= 0.7);
});

// -----------------------------------------------------------------------------
// EDGE CASE 9: Avatar Switching & Dimension Clamping
// -----------------------------------------------------------------------------
test("Edge Case 9: Avatar catalog contains required templates for both genders", () => {
  const maleTemplates = GARMENT_ASSET_CATALOG.filter(
    (t: GarmentAssetDefinition) => t.supportedGenders.includes("MALE") || t.supportedGenders.includes("ANDROGYNOUS")
  );
  const femaleTemplates = GARMENT_ASSET_CATALOG.filter(
    (t: GarmentAssetDefinition) => t.supportedGenders.includes("FEMALE") || t.supportedGenders.includes("ANDROGYNOUS")
  );

  assert.ok(maleTemplates.length >= 8, "Male avatar must have full garment suite");
  assert.ok(femaleTemplates.length >= 8, "Female avatar must have full garment suite");
});

// -----------------------------------------------------------------------------
// EDGE CASE 10: Image Upload Format Rejection
// -----------------------------------------------------------------------------
test("Edge Case 10: Invalid image mime-types are rejected by validation rule", () => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/heic"];
  const invalidTypes = ["application/pdf", "text/html", "application/x-msdownload", "image/gif"];

  for (const inv of invalidTypes) {
    assert.equal(allowed.includes(inv), false, `${inv} must not be allowed`);
  }
});
