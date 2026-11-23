import test from "node:test";
import assert from "node:assert/strict";

import {
  SaveOutfitEnsembleSchema,
  BookmarkOutfitSchema,
} from "../src/modules/saved-outfits/validations/index.ts";

test("Outfit Saving: Validates complete outfit ensemble schema", () => {
  const payload = {
    title: "Minimalist Autumn Wool",
    occasion: "OFFICE",
    formality: "SMART_CASUAL",
    season: "FALL",
    compatibilityScore: 0.94,
    colorHarmonyScore: 0.92,
    styleBalanceScore: 0.96,
    items: [
      { wardrobeItemId: "item-101", slot: "INNER_TOP", layerIndex: 0 },
      { wardrobeItemId: "item-102", slot: "BOTTOM", layerIndex: 0 },
      { wardrobeItemId: "item-103", slot: "FOOTWEAR", layerIndex: 0 },
      { wardrobeItemId: "item-104", slot: "OUTER_TOP", layerIndex: 1 },
    ],
    stylingInstructions: [
      { slot: "INNER_TOP", instruction: "Tuck front hem cleanly into trousers.", tipType: "TUCK" },
      { slot: "OUTER_TOP", instruction: "Leave blazer unbuttoned while seated.", tipType: "BUTTON" },
    ],
    notes: "Perfect for client reviews.",
  };

  const parsed = SaveOutfitEnsembleSchema.parse(payload);
  assert.equal(parsed.title, "Minimalist Autumn Wool");
  assert.equal(parsed.items.length, 4);
  assert.equal(parsed.stylingInstructions?.length, 2);
});

test("Outfit Saving: Rejects outfit with zero items", () => {
  const emptyOutfit = {
    title: "Invisible Fit",
    items: [],
  };

  assert.throws(() => SaveOutfitEnsembleSchema.parse(emptyOutfit), {
    name: "ZodError",
  });
});

test("Outfit Saving: Clamps and validates compatibility scores between 0 and 1", () => {
  const invalidScore = {
    title: "Over-scored Outfit",
    items: [{ wardrobeItemId: "item-1", slot: "INNER_TOP", layerIndex: 0 }],
    compatibilityScore: 1.5, // Exceeds max 1.0
  };

  assert.throws(() => SaveOutfitEnsembleSchema.parse(invalidScore), {
    name: "ZodError",
  });
});

test("Bookmark Outfit: Validates bookmark payload with UUIDs", () => {
  const bookmark = BookmarkOutfitSchema.parse({
    outfitId: "123e4567-e89b-12d3-a456-426614174000",
    notes: "To wear on next Friday",
  });

  assert.equal(bookmark.outfitId, "123e4567-e89b-12d3-a456-426614174000");
  assert.equal(bookmark.notes, "To wear on next Friday");
});
