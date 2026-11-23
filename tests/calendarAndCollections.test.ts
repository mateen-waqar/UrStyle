import test from "node:test";
import assert from "node:assert/strict";

import { ScheduleOutfitSchema } from "../src/modules/outfit-calendar/validations/index.ts";
import { CreateCollectionSchema } from "../src/modules/collections/validations/index.ts";
import { UpdateProfileSchema } from "../src/modules/user-profile/validations/index.ts";

test("Calendar Entry: Validates a scheduled outfit payload", () => {
  const validEntry = {
    outfitId: "123e4567-e89b-12d3-a456-426614174000",
    scheduledDate: new Date("2026-11-25T09:00:00.000Z").toISOString(),
    timeOfDay: "MORNING",
    occasion: "Architecture Keynote",
    notes: "Pair with black leather chelsea boots and silver watch",
  };

  const parsed = ScheduleOutfitSchema.parse(validEntry);
  assert.equal(parsed.outfitId, "123e4567-e89b-12d3-a456-426614174000");
  assert.equal(parsed.timeOfDay, "MORNING");
  assert.equal(parsed.occasion, "Architecture Keynote");
});

test("Calendar Entry: Rejects non-UUID outfit ID and invalid ISO date strings", () => {
  const invalidDateEntry = {
    outfitId: "123e4567-e89b-12d3-a456-426614174000",
    scheduledDate: "not-a-valid-date",
    timeOfDay: "ALL_DAY",
  };

  assert.throws(() => ScheduleOutfitSchema.parse(invalidDateEntry), {
    name: "ZodError",
  });

  const emptyOutfitEntry = {
    outfitId: "invalid-not-a-uuid",
    scheduledDate: new Date().toISOString(),
  };

  assert.throws(() => ScheduleOutfitSchema.parse(emptyOutfitEntry), {
    name: "ZodError",
  });
});

test("Saved Collection: Validates lookbook capsule collection creation", () => {
  const validCapsule = {
    name: "Paris Fashion Week Fall 2026",
    description: "Tailored wool coats, cashmere knits and structured boots",
    isPrivate: true,
    coverImageUrl: "https://storage.supabase.co/lookbooks/pfw-cover.jpg",
  };

  const parsed = CreateCollectionSchema.parse(validCapsule);
  assert.equal(parsed.name, "Paris Fashion Week Fall 2026");
  assert.equal(parsed.isPrivate, true);
});

test("Saved Collection: Rejects blank collection titles", () => {
  const emptyNameCapsule = {
    name: "",
    description: "An unnamed lookbook",
  };

  assert.throws(() => CreateCollectionSchema.parse(emptyNameCapsule), {
    name: "ZodError",
  });
});

test("User Profile: Validates updated aesthetic, dimensions and preferences", () => {
  const profilePayload = {
    displayName: "Julian Vance",
    aesthetic: "QUIET_LUXURY",
    preferredFit: "RELAXED",
    city: "Milan",
    country: "Italy",
    favoriteColors: ["#0a0a0a", "#1b2a4a", "#e5e2db"],
    heightCm: 182,
  };

  const parsed = UpdateProfileSchema.parse(profilePayload);
  assert.equal(parsed.displayName, "Julian Vance");
  assert.equal(parsed.aesthetic, "QUIET_LUXURY");
  assert.equal(parsed.preferredFit, "RELAXED");
  assert.equal(parsed.heightCm, 182);
  assert.equal(parsed.favoriteColors?.length, 3);
});

test("User Profile: Rejects unsupported aesthetics and impossible heights", () => {
  const invalidAesthetic = {
    aesthetic: "CYBERPUNK_NEO_GOTHIC", // Not in enum
  };

  assert.throws(() => UpdateProfileSchema.parse(invalidAesthetic), {
    name: "ZodError",
  });

  const impossibleHeight = {
    heightCm: 320, // Exceeds 250cm limit
  };

  assert.throws(() => UpdateProfileSchema.parse(impossibleHeight), {
    name: "ZodError",
  });
});
