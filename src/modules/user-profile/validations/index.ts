import { z } from "zod";

export const UpdateProfileSchema = z.object({
  displayName: z.string().min(2).max(60).optional(),
  bio: z.string().max(300).optional(),
  genderPreference: z.enum(["MALE", "FEMALE", "UNISEX", "NON_BINARY"]).optional(),
  aesthetic: z
    .enum([
      "MINIMALIST",
      "QUIET_LUXURY",
      "STREETWEAR",
      "CLASSIC_TAILORING",
      "SMART_CASUAL",
      "AVANT_GARDE",
      "ATHLEISURE",
      "OLD_MONEY",
      "MONOCHROME",
      "BOHEMIAN",
    ])
    .optional(),
  bodyShape: z
    .enum(["RECTANGLE", "INVERTED_TRIANGLE", "HOURGLASS", "PEAR", "ATHLETIC", "OVAL"])
    .optional(),
  skinTone: z.string().optional(),
  heightCm: z.number().min(100).max(250).optional(),
  weightKg: z.number().min(30).max(300).optional(),
  preferredFit: z.enum(["SLIM", "REGULAR", "RELAXED", "OVERSIZED"]).optional(),
  favoriteColors: z.array(z.string()).optional(),
  lifestyle: z.string().optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  onboardingCompleted: z.boolean().optional(),
  onboardingStep: z.number().min(1).max(7).optional(),
});

// Step 1: Personal information
export const OnboardingStep1Schema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters").max(50),
  genderPreference: z.enum(["MALE", "FEMALE", "UNISEX", "NON_BINARY"]),
});

// Step 2: Avatar selection
export const OnboardingStep2Schema = z.object({
  avatarGender: z.enum(["MALE", "FEMALE"]),
});

// Step 3: Fashion preferences
export const OnboardingStep3Schema = z.object({
  aesthetic: z.enum([
    "CASUAL",
    "SMART_CASUAL",
    "FORMAL",
    "STREETWEAR",
    "MINIMAL",
    "OLD_MONEY",
    "SPORTY",
  ]),
});

// Step 4: Favorite colors (multiple selections allowed)
export const OnboardingStep4Schema = z.object({
  favoriteColors: z
    .array(z.string())
    .min(1, "Please select at least one favorite color"),
});

// Step 5: Lifestyle
export const OnboardingStep5Schema = z.object({
  lifestyle: z.enum([
    "UNIVERSITY",
    "OFFICE",
    "BUSINESS",
    "DAILY_CASUAL",
    "SPECIAL_OCCASIONS",
  ]),
});

// Step 6: Body and fit preferences
export const OnboardingStep6Schema = z.object({
  heightCm: z.number().min(100).max(250).nullable().optional(),
  preferredFit: z.enum(["SLIM", "REGULAR", "OVERSIZED"]),
});

// Full Onboarding payload
export const CompleteOnboardingSchema = z.object({
  displayName: z.string().min(2).max(50),
  genderPreference: z.enum(["MALE", "FEMALE", "UNISEX", "NON_BINARY"]),
  avatarGender: z.enum(["MALE", "FEMALE"]),
  aesthetic: z.string(),
  favoriteColors: z.array(z.string()).min(1),
  lifestyle: z.string(),
  heightCm: z.number().nullable().optional(),
  preferredFit: z.enum(["SLIM", "REGULAR", "OVERSIZED"]),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type OnboardingStep1Input = z.infer<typeof OnboardingStep1Schema>;
export type OnboardingStep2Input = z.infer<typeof OnboardingStep2Schema>;
export type OnboardingStep3Input = z.infer<typeof OnboardingStep3Schema>;
export type OnboardingStep4Input = z.infer<typeof OnboardingStep4Schema>;
export type OnboardingStep5Input = z.infer<typeof OnboardingStep5Schema>;
export type OnboardingStep6Input = z.infer<typeof OnboardingStep6Schema>;
export type CompleteOnboardingInput = z.infer<typeof CompleteOnboardingSchema>;
