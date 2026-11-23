import test from "node:test";
import assert from "node:assert/strict";

import { styleRuleEvaluator } from "../src/modules/outfit-styling-engine/services/styleRuleEvaluator.ts";
import type { WardrobeItemDto } from "../src/types/index.ts";

function createMockItem(overrides: Partial<WardrobeItemDto>): WardrobeItemDto {
  return {
    id: overrides.id || `mock-${Math.random().toString(36).substring(2, 7)}`,
    userId: "test-user-uuid",
    name: overrides.name || "Mock Garment",
    category: overrides.category || "TOP",
    subCategory: overrides.subCategory || "T-shirts",
    brand: overrides.brand || "Loro Piana",
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
    purchasePrice: overrides.purchasePrice || 150,
    notes: overrides.notes || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// -----------------------------------------------------------------------------
// 1. Shirt Tuck Recommendation Tests
// -----------------------------------------------------------------------------
test("Style Rule: Formal trousers with button-down shirt recommends full clean tuck", () => {
  const shirt = createMockItem({ category: "TOP", subCategory: "Shirts", formality: "BUSINESS_FORMAL" });
  const trousers = createMockItem({ category: "BOTTOM", subCategory: "Trousers", formality: "BUSINESS_FORMAL" });

  const result = styleRuleEvaluator.evaluateOutfit([shirt, trousers], "OFFICE", "BUSINESS_FORMAL");
  const tuckRec = result.recommendations.find((r) => r.category === "TUCK");

  assert.ok(tuckRec, "Should generate a tuck recommendation");
  assert.ok(tuckRec.action.toLowerCase().includes("tuck in the shirt completely"));
  assert.ok(tuckRec.explanation.length > 0);
  assert.ok(tuckRec.stylingReason.toLowerCase().includes("proportions"));
});

test("Style Rule: Smart casual chinos with polo recommends French front tuck", () => {
  const polo = createMockItem({ category: "TOP", subCategory: "Polos", formality: "SMART_CASUAL" });
  const chinos = createMockItem({ category: "BOTTOM", subCategory: "Chinos", formality: "SMART_CASUAL" });

  const result = styleRuleEvaluator.evaluateOutfit([polo, chinos], "DATE", "SMART_CASUAL");
  const tuckRec = result.recommendations.find((r) => r.category === "TUCK");

  assert.ok(tuckRec, "Should generate a tuck recommendation");
  assert.ok(tuckRec.title.toLowerCase().includes("french"));
  assert.ok(tuckRec.action.toLowerCase().includes("french tuck"));
  assert.ok(tuckRec.stylingReason.toLowerCase().includes("waist"));
});

test("Style Rule: Hoodie/Sweater advises against tucking to avoid fabric bulge", () => {
  const hoodie = createMockItem({ category: "TOP", subCategory: "Hoodies", formality: "CASUAL" });
  const jeans = createMockItem({ category: "BOTTOM", subCategory: "Jeans", formality: "CASUAL" });

  const result = styleRuleEvaluator.evaluateOutfit([hoodie, jeans], "CASUAL_OUTING", "CASUAL");
  const tuckRec = result.recommendations.find((r) => r.category === "TUCK");

  assert.ok(tuckRec, "Should generate a tuck recommendation");
  assert.ok(tuckRec.action.toLowerCase().includes("do not tuck"));
});

// -----------------------------------------------------------------------------
// 2. Sleeve Styling Tests
// -----------------------------------------------------------------------------
test("Style Rule: Casual button-down shirt recommends rolling sleeves below elbow", () => {
  const shirt = createMockItem({ category: "TOP", subCategory: "Shirts", formality: "SMART_CASUAL" });
  const pants = createMockItem({ category: "BOTTOM", subCategory: "Chinos" });

  const result = styleRuleEvaluator.evaluateOutfit([shirt, pants], "CASUAL_OUTING", "CASUAL");
  const sleeveRec = result.recommendations.find((r) => r.category === "SLEEVE");

  assert.ok(sleeveRec, "Should generate sleeve recommendation");
  assert.ok(sleeveRec.action.toLowerCase().includes("roll the sleeves"));
  assert.ok(sleeveRec.stylingReason.toLowerCase().includes("wrist"));
});

// -----------------------------------------------------------------------------
// 3. Oversized Proportions & Fit Balance Tests
// -----------------------------------------------------------------------------
test("Style Rule: Oversized top + Oversized bottoms triggers volume balance rule", () => {
  const top = createMockItem({ category: "TOP", fit: "OVERSIZED" });
  const bottom = createMockItem({ category: "BOTTOM", fit: "OVERSIZED" });

  const result = styleRuleEvaluator.evaluateOutfit([top, bottom], "CASUAL_OUTING", "CASUAL");
  assert.equal(result.silhouetteBalance, "RELAXED_OVERSIZED");

  const fitRec = result.recommendations.find((r) => r.category === "FIT_BALANCE");
  assert.ok(fitRec, "Should generate fit balance recommendation");
  assert.ok(fitRec.title.toLowerCase().includes("volume"));
});

test("Style Rule: Oversized top + Slim bottom identifies inverted triangle silhouette", () => {
  const top = createMockItem({ category: "TOP", fit: "OVERSIZED" });
  const bottom = createMockItem({ category: "BOTTOM", fit: "SLIM" });

  const result = styleRuleEvaluator.evaluateOutfit([top, bottom], "CASUAL_OUTING", "CASUAL");
  assert.equal(result.silhouetteBalance, "TOP_HEAVY");

  const fitRec = result.recommendations.find((r) => r.category === "FIT_BALANCE");
  assert.ok(fitRec, "Should generate fit balance recommendation");
  assert.ok(fitRec.title.toLowerCase().includes("inverted triangle"));
});

// -----------------------------------------------------------------------------
// 4. Footwear & Belt Tests
// -----------------------------------------------------------------------------
test("Style Rule: Loafers recommend no-show socks and clean trouser break", () => {
  const bottom = createMockItem({ category: "BOTTOM", subCategory: "Trousers" });
  const loafers = createMockItem({ category: "FOOTWEAR", subCategory: "Loafers" });

  const result = styleRuleEvaluator.evaluateOutfit([bottom, loafers], "OFFICE", "SMART_CASUAL");
  const shoeRec = result.recommendations.find((r) => r.category === "FOOTWEAR");

  assert.ok(shoeRec, "Should generate footwear recommendation");
  assert.ok(shoeRec.action.toLowerCase().includes("no-show"));
});

test("Style Rule: Lounge joggers advise beltless waistline", () => {
  const joggers = createMockItem({ category: "BOTTOM", subCategory: "Joggers" });

  const result = styleRuleEvaluator.evaluateOutfit([joggers], "CASUAL_OUTING", "CASUAL");
  const beltRec = result.recommendations.find((r) => r.category === "BELT");

  assert.ok(beltRec, "Should generate belt recommendation");
  assert.ok(beltRec.action.toLowerCase().includes("do not wear a belt"));
});

// -----------------------------------------------------------------------------
// 5. Blazer Etiquette & Recommendation Structure
// -----------------------------------------------------------------------------
test("Style Rule: Blazer triggers single button drape etiquette rule", () => {
  const blazer = createMockItem({ category: "OUTERWEAR", subCategory: "Blazers" });
  const shirt = createMockItem({ category: "TOP", subCategory: "Shirts" });

  const result = styleRuleEvaluator.evaluateOutfit([shirt, blazer], "OFFICE", "SMART_CASUAL");
  const jacketRec = result.recommendations.find((r) => r.category === "JACKET");

  assert.ok(jacketRec, "Should generate jacket recommendation");
  assert.ok(jacketRec.action.toLowerCase().includes("unbuttoned") || jacketRec.action.toLowerCase().includes("top button"));
});

test("Style Rule: Every recommendation strictly provides Action, Explanation, and Reason", () => {
  const shirt = createMockItem({ category: "TOP", subCategory: "Shirts", fit: "REGULAR", formality: "SMART_CASUAL" });
  const chinos = createMockItem({ category: "BOTTOM", subCategory: "Chinos", fit: "REGULAR", formality: "SMART_CASUAL" });
  const loafers = createMockItem({ category: "FOOTWEAR", subCategory: "Loafers", formality: "SMART_CASUAL" });
  const blazer = createMockItem({ category: "OUTERWEAR", subCategory: "Blazers", formality: "SMART_CASUAL" });

  const result = styleRuleEvaluator.evaluateOutfit([shirt, chinos, loafers, blazer], "DATE", "SMART_CASUAL");

  assert.ok(result.recommendations.length >= 4, "Should have comprehensive recommendations");
  for (const rec of result.recommendations) {
    assert.ok(rec.action && rec.action.trim().length > 0, `Missing action on ${rec.id}`);
    assert.ok(rec.explanation && rec.explanation.trim().length > 0, `Missing explanation on ${rec.id}`);
    assert.ok(rec.stylingReason && rec.stylingReason.trim().length > 0, `Missing styling reason on ${rec.id}`);
  }
});
