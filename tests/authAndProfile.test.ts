import test from "node:test";
import assert from "node:assert/strict";

import {
  OnboardingStep1Schema,
  OnboardingStep2Schema,
  OnboardingStep3Schema,
  OnboardingStep4Schema,
  OnboardingStep5Schema,
  OnboardingStep6Schema,
  CompleteOnboardingSchema,
} from "../src/modules/user-profile/validations/index.ts";

test("Onboarding Step 1: Validates display name and gender preference", () => {
  const step1 = OnboardingStep1Schema.parse({
    displayName: "Julian Vance",
    genderPreference: "MALE",
  });

  assert.equal(step1.displayName, "Julian Vance");
  assert.equal(step1.genderPreference, "MALE");
});

test("Onboarding Step 1: Rejects empty or whitespace-only display name", () => {
  assert.throws(
    () =>
      OnboardingStep1Schema.parse({
        displayName: "",
        genderPreference: "FEMALE",
      }),
    { name: "ZodError" }
  );
});

test("Onboarding Step 2: Validates avatar gender choice", () => {
  const step2 = OnboardingStep2Schema.parse({
    avatarGender: "FEMALE",
  });
  assert.equal(step2.avatarGender, "FEMALE");
});

test("Onboarding Step 3: Validates aesthetic choice", () => {
  const step3 = OnboardingStep3Schema.parse({
    aesthetic: "OLD_MONEY",
  });
  assert.equal(step3.aesthetic, "OLD_MONEY");
});

test("Onboarding Step 4: Validates favorite colors array", () => {
  const step4 = OnboardingStep4Schema.parse({
    favoriteColors: ["#181716", "#F5F2EB", "#4A4642"],
  });
  assert.equal(step4.favoriteColors.length, 3);
});

test("Onboarding Step 5: Validates lifestyle context", () => {
  const step5 = OnboardingStep5Schema.parse({
    lifestyle: "BUSINESS",
  });
  assert.equal(step5.lifestyle, "BUSINESS");
});

test("Onboarding Step 6: Validates height and preferred fit", () => {
  const step6 = OnboardingStep6Schema.parse({
    heightCm: 182,
    preferredFit: "OVERSIZED",
  });
  assert.equal(step6.heightCm, 182);
  assert.equal(step6.preferredFit, "OVERSIZED");
});

test("Onboarding Step 6: Rejects unrealistic human height", () => {
  assert.throws(
    () =>
      OnboardingStep6Schema.parse({
        heightCm: 320, // Exceeds human scale maximum
        preferredFit: "REGULAR",
      }),
    { name: "ZodError" }
  );
});

test("Onboarding Complete: Validates complete onboarding payload", () => {
  const completePayload = {
    displayName: "Helena Rostova",
    genderPreference: "FEMALE" as const,
    avatarGender: "FEMALE" as const,
    aesthetic: "QUIET_LUXURY" as const,
    favoriteColors: ["#E8E2D8", "#292624"],
    lifestyle: "OFFICE" as const,
    heightCm: 174,
    preferredFit: "REGULAR" as const,
  };

  const parsed = CompleteOnboardingSchema.parse(completePayload);
  assert.equal(parsed.displayName, "Helena Rostova");
  assert.equal(parsed.aesthetic, "QUIET_LUXURY");
});
