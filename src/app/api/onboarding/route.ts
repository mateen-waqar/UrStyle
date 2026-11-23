import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { authRepository } from "@/modules/authentication/repositories/authRepository";
import { userProfileRepository } from "@/modules/user-profile/repositories/userProfileRepository";
import {
  OnboardingStep1Schema,
  OnboardingStep2Schema,
  OnboardingStep3Schema,
  OnboardingStep4Schema,
  OnboardingStep5Schema,
  OnboardingStep6Schema,
  CompleteOnboardingSchema,
} from "@/modules/user-profile/validations";

export async function GET() {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure AppUser exists in database using authenticated Supabase identity
    await authRepository.ensureAppUser(user.id, user.email!);

    const profile = await userProfileRepository.getByUserId(user.id);

    return NextResponse.json({
      userId: user.id,
      email: user.email,
      profile: profile || null,
      onboardingStep: profile?.onboardingStep || 1,
      onboardingCompleted: profile?.onboardingCompleted || false,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load onboarding status" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure AppUser exists
    await authRepository.ensureAppUser(user.id, user.email!);

    const body = await request.json();
    const { action, step, data } = body;

    if (action === "save_step") {
      let partialData: Record<string, any> = {};

      switch (step) {
        case 1: {
          const parsed = OnboardingStep1Schema.parse(data);
          partialData = {
            displayName: parsed.displayName,
            genderPreference: parsed.genderPreference,
          };
          break;
        }
        case 2: {
          const parsed = OnboardingStep2Schema.parse(data);
          partialData = {
            genderPreference: parsed.avatarGender === "FEMALE" ? "FEMALE" : "MALE",
          };
          break;
        }
        case 3: {
          const parsed = OnboardingStep3Schema.parse(data);
          partialData = {
            aesthetic: parsed.aesthetic,
          };
          break;
        }
        case 4: {
          const parsed = OnboardingStep4Schema.parse(data);
          partialData = {
            favoriteColors: parsed.favoriteColors,
          };
          break;
        }
        case 5: {
          const parsed = OnboardingStep5Schema.parse(data);
          partialData = {
            lifestyle: parsed.lifestyle,
          };
          break;
        }
        case 6: {
          const parsed = OnboardingStep6Schema.parse(data);
          partialData = {
            heightCm: parsed.heightCm,
            preferredFit: parsed.preferredFit,
          };
          break;
        }
        default:
          break;
      }

      const updated = await userProfileRepository.saveOnboardingStep(
        user.id,
        step,
        partialData
      );

      return NextResponse.json({ success: true, profile: updated });
    }

    if (action === "complete") {
      const parsed = CompleteOnboardingSchema.parse(data);
      const profile = await userProfileRepository.completeOnboarding(
        user.id,
        parsed
      );

      return NextResponse.json({ success: true, profile });
    }

    return NextResponse.json(
      { error: "Invalid onboarding action" },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to persist onboarding" },
      { status: 400 }
    );
  }
}
