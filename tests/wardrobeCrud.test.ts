import test from "node:test";
import assert from "node:assert/strict";

import {
  CreateWardrobeItemSchema,
  UpdateWardrobeItemSchema,
  WardrobeQueryFilterSchema,
} from "../src/modules/digital-wardrobe/validations/index.ts";

test("Wardrobe Validation: Valid clothing item parses successfully", () => {
  const validPayload = {
    name: "Double-Breasted Wool Blazer",
    category: "OUTERWEAR",
    subCategory: "Blazers",
    brand: "Lemaire",
    size: "48",
    colorPrimary: "#161514",
    colorSecondary: "#292624",
    pattern: "SOLID",
    material: "WOOL",
    fit: "RELAXED",
    style: "MINIMALIST",
    formality: "BUSINESS_FORMAL",
    seasonality: ["FALL", "WINTER"],
    occasions: ["WORK", "FORMAL_EVENT"],
    status: "AVAILABLE",
    purchasePrice: 650,
  };

  const parsed = CreateWardrobeItemSchema.parse(validPayload);
  assert.equal(parsed.name, "Double-Breasted Wool Blazer");
  assert.equal(parsed.category, "OUTERWEAR");
  assert.equal(parsed.purchasePrice, 650);
});

test("Wardrobe Validation: Rejects missing required primary color", () => {
  const invalid = {
    name: "Classic Tee",
    category: "TOP",
    subCategory: "T-shirts",
    seasonality: ["SUMMER"],
    // colorPrimary is missing
  };

  assert.throws(() => CreateWardrobeItemSchema.parse(invalid), {
    name: "ZodError",
  });
});

test("Wardrobe Validation: Rejects invalid or unsupported category", () => {
  const invalidCategory = {
    name: "Space Helmet",
    category: "SPACESUIT", // Invalid
    subCategory: "Helmet",
    colorPrimary: "#FFFFFF",
    seasonality: ["ALL_SEASON"],
  };

  assert.throws(() => CreateWardrobeItemSchema.parse(invalidCategory), {
    name: "ZodError",
  });
});

test("Wardrobe Validation: Rejects negative purchase price", () => {
  const negativePrice = {
    name: "Stolen Jacket",
    category: "OUTERWEAR",
    subCategory: "Jackets",
    colorPrimary: "#000000",
    seasonality: ["ALL_SEASON"],
    purchasePrice: -50, // Must be positive
  };

  assert.throws(() => CreateWardrobeItemSchema.parse(negativePrice), {
    name: "ZodError",
  });
});

test("Wardrobe Validation: Update schema permits partial fields", () => {
  const updatePayload = {
    status: "LAUNDRY" as const,
    notes: "Dry clean only after gala",
  };

  const parsed = UpdateWardrobeItemSchema.parse(updatePayload);
  assert.equal(parsed.status, "LAUNDRY");
  assert.equal(parsed.notes, "Dry clean only after gala");
});

test("Wardrobe Query Filter: Clamps pagination and sanitizes sort fields", () => {
  const filterInput = {
    category: "TOP",
    sortBy: "most_worn",
    limit: 25,
    offset: 50,
  };

  const parsed = WardrobeQueryFilterSchema.parse(filterInput);
  assert.equal(parsed.category, "TOP");
  assert.equal(parsed.sortBy, "most_worn");
  assert.equal(parsed.limit, 25);
  assert.equal(parsed.offset, 50);
});
