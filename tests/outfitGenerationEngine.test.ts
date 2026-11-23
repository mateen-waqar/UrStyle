import test from "node:test";
import assert from "node:assert/strict";

import { colorCompatibilityService } from "../src/modules/outfit-generation-engine/services/colorCompatibilityService.ts";
import { ruleEvaluationEngine } from "../src/modules/outfit-generation-engine/services/ruleEvaluationEngine.ts";
import { stylingInstructionService } from "../src/modules/outfit-styling-engine/services/stylingInstructionService.ts";
import { OutfitGenerationService } from "../src/modules/outfit-generation-engine/services/outfitGenerationService.ts";
import { DEFAULT_SCORING_WEIGHTS } from "../src/modules/outfit-generation-engine/constants/scoringWeights.ts";
import type { WardrobeItemDto } from "../src/types/index.ts";

// Helper to create mock wardrobe items
function createMockItem(overrides: Partial<WardrobeItemDto>): WardrobeItemDto {
  return {
    id: overrides.id || `mock-${Math.random().toString(36).substring(2, 7)}`,
    userId: "test-user-uuid",
    name: overrides.name || "Mock Item",
    category: overrides.category || "TOP",
    subCategory: overrides.subCategory || "T-shirts",
    brand: overrides.brand || "Acne Studios",
    size: overrides.size || "M",
    colorPrimary: overrides.colorPrimary || "#181716", // Noir
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
// 1. Color Compatibility Tests
// -----------------------------------------------------------------------------
test("Color Compatibility: All neutrals yield high minimalist score", () => {
  // Charcoal (#292624), Ivory (#F5F2EB), Flannel Grey (#4A4642)
  const score = colorCompatibilityService.evaluateColors(["#292624", "#F5F2EB", "#4A4642"]);
  assert.ok(score >= 0.90, `Expected score >= 0.90, got ${score}`);
});

test("Color Compatibility: Neutral base + Single hero accent yields high score", () => {
  // Charcoal (#292624), Ivory (#F5F2EB), Deep Terracotta (#8C4F3B)
  const score = colorCompatibilityService.evaluateColors(["#292624", "#F5F2EB", "#8C4F3B"]);
  assert.ok(score >= 0.88, `Expected score >= 0.88, got ${score}`);
});

test("Color Compatibility: 4+ clashing saturated non-neutrals receive heavy penalty", () => {
  // Bright Red (#FF0000), Bright Green (#00FF00), Bright Purple (#800080), Bright Orange (#FFA500)
  const score = colorCompatibilityService.evaluateColors(["#FF0000", "#00FF00", "#800080", "#FFA500"]);
  assert.ok(score <= 0.60, `Expected penalty score <= 0.60, got ${score}`);
});

test("Color Compatibility: User preferred color provides matching bonus", () => {
  const withoutPref = colorCompatibilityService.evaluateColors(["#292624", "#1E2A38"]);
  const withPref = colorCompatibilityService.evaluateColors(["#292624", "#1E2A38"], "#1E2A38");
  assert.ok(withPref >= withoutPref, `Expected preferred color bonus (${withPref} >= ${withoutPref})`);
});

// -----------------------------------------------------------------------------
// 2. Rule Evaluation Engine Tests
// -----------------------------------------------------------------------------
test("Rule Evaluation: Configurable scoring weights sum to 1.0", () => {
  const sum =
    DEFAULT_SCORING_WEIGHTS.colorCompatibility +
    DEFAULT_SCORING_WEIGHTS.styleConsistency +
    DEFAULT_SCORING_WEIGHTS.occasionSuitability +
    DEFAULT_SCORING_WEIGHTS.formalityCompatibility +
    DEFAULT_SCORING_WEIGHTS.seasonSuitability +
    DEFAULT_SCORING_WEIGHTS.patternCompatibility;
  assert.equal(Math.round(sum * 100) / 100, 1.0);
});

test("Rule Evaluation: Pattern compatibility favors solid anchor + statement piece", () => {
  const topSolid = createMockItem({ pattern: "SOLID" });
  const bottomPlaid = createMockItem({ pattern: "CHECKERED", category: "BOTTOM" });
  const shoesSolid = createMockItem({ pattern: "SOLID", category: "FOOTWEAR" });

  const res = ruleEvaluationEngine.evaluatePatternCompatibility([topSolid, bottomPlaid, shoesSolid]);
  assert.ok(res.score >= 0.90, `Expected score >= 0.90 for single statement pattern, got ${res.score}`);
});

test("Rule Evaluation: Formality clash (Formal Oxford shoes + Lounge joggers) heavily penalized", () => {
  const formalShoes = createMockItem({
    category: "FOOTWEAR",
    subCategory: "Formal shoes",
    formality: "BUSINESS_FORMAL",
    style: "CLASSIC_TAILORING",
  });
  const joggers = createMockItem({
    category: "BOTTOM",
    subCategory: "Joggers",
    formality: "CASUAL",
    style: "ATHLEISURE",
  });
  const top = createMockItem({ category: "TOP", formality: "CASUAL" });

  const styleRes = ruleEvaluationEngine.evaluateStyleConsistency([top, joggers, formalShoes]);
  assert.ok(styleRes.score <= 0.35, `Expected severe clash penalty <= 0.35, got ${styleRes.score}`);
});

test("Rule Evaluation: Summer climate penalizes heavy wool outerwear", () => {
  const heavyCoat = createMockItem({
    category: "OUTERWEAR",
    subCategory: "Coats",
    material: "WOOL",
    seasonality: ["WINTER"],
  });
  const top = createMockItem({ category: "TOP", seasonality: ["SUMMER"] });
  const bottom = createMockItem({ category: "BOTTOM", seasonality: ["SUMMER"] });

  const res = ruleEvaluationEngine.evaluateSeasonSuitability([top, bottom, heavyCoat], "SUMMER");
  assert.ok(res.score <= 0.30, `Expected seasonal incompatibility penalty <= 0.30, got ${res.score}`);
});

// -----------------------------------------------------------------------------
// 3. Styling Instruction Service Tests
// -----------------------------------------------------------------------------
test("Styling Instructions: Recommends French tuck and sleeve roll for Smart Casual shirts", () => {
  const shirt = createMockItem({
    category: "TOP",
    subCategory: "Shirts",
    formality: "SMART_CASUAL",
  });
  const chinos = createMockItem({
    category: "BOTTOM",
    subCategory: "Chinos",
    formality: "SMART_CASUAL",
  });
  const loafers = createMockItem({
    category: "FOOTWEAR",
    subCategory: "Loafers",
    formality: "SMART_CASUAL",
  });

  const advice = stylingInstructionService.generateDetailedStyling([shirt, chinos, loafers], "SMART_CASUAL", "DATE");

  assert.ok(advice.shirtTuck.toLowerCase().includes("tuck"));
  assert.ok(advice.sleeveStyling.toLowerCase().includes("roll"));
  assert.ok(advice.footwearPairing.toLowerCase().includes("no-show"));
});

// -----------------------------------------------------------------------------
// 4. Outfit Generation Engine: Missing Categories & Independence
// -----------------------------------------------------------------------------
test("Outfit Generation: Explains missing essential categories when wardrobe is incomplete", async () => {
  // Mock repository with only Tops and Bottoms (No footwear)
  const mockRepo = {
    findMany: async () => ({
      items: [
        createMockItem({ category: "TOP", subCategory: "T-shirts" }),
        createMockItem({ category: "BOTTOM", subCategory: "Jeans" }),
      ],
      total: 2,
    }),
  } as any;

  const engine = new OutfitGenerationService(ruleEvaluationEngine, stylingInstructionService, mockRepo);
  const result = await engine.generateOutfits("user-1", {
    occasion: "CASUAL_OUTING",
    preferredStyle: "CASUAL",
    season: "ALL_SEASON",
    numberOfOutfits: 4,
    excludeRecentlyGeneratedOutfits: true,
  });

  assert.equal(result.outfits.length, 0);
  assert.ok(result.missingCategories?.includes("Footwear"));
  assert.ok(result.message?.includes("Footwear"));
});

test("Outfit Generation: Successfully synthesizes outfits independent of 3D asset mappings", async () => {
  // Mock repository with complete available wardrobe (none have 3D mappings)
  const mockRepo = {
    findMany: async () => ({
      items: [
        createMockItem({ id: "top-1", name: "Oxford Shirt", category: "TOP", subCategory: "Shirts", formality: "SMART_CASUAL", colorPrimary: "#F5F2EB" }),
        createMockItem({ id: "top-2", name: "Cashmere Knit", category: "TOP", subCategory: "Sweaters", formality: "SMART_CASUAL", colorPrimary: "#292624" }),
        createMockItem({ id: "bottom-1", name: "Tailored Trousers", category: "BOTTOM", subCategory: "Trousers", formality: "SMART_CASUAL", colorPrimary: "#4A4642" }),
        createMockItem({ id: "shoe-1", name: "Suede Chelsea Boots", category: "FOOTWEAR", subCategory: "Boots", formality: "SMART_CASUAL", colorPrimary: "#332219" }),
        createMockItem({ id: "shoe-2", name: "Minimal Leather Loafers", category: "FOOTWEAR", subCategory: "Loafers", formality: "SMART_CASUAL", colorPrimary: "#181716" }),
      ],
      total: 5,
    }),
  } as any;

  const engine = new OutfitGenerationService(ruleEvaluationEngine, stylingInstructionService, mockRepo);
  const result = await engine.generateOutfits("user-1", {
    occasion: "OFFICE",
    preferredStyle: "SMART_CASUAL",
    season: "ALL_SEASON",
    numberOfOutfits: 3,
    excludeRecentlyGeneratedOutfits: true,
  });

  assert.ok(result.outfits.length >= 1, "Should generate at least 1 valid outfit");
  assert.ok(result.outfits[0].score.compositeScore >= 0.70, "Composite score should meet threshold");
  assert.ok(result.outfits[0].stylingAdvice.shirtTuck.length > 0, "Should contain styling instructions");
  assert.ok(result.outfits[0].colorPalette.length >= 2, "Should have color palette");
});
