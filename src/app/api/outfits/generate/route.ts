import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { outfitGenerationService } from "@/modules/outfit-generation-engine/services/outfitGenerationService";
import { GenerateOutfitsInputSchema } from "@/modules/outfit-generation-engine/validations";
import { authRepository } from "@/modules/authentication/repositories/authRepository";
import { checkRateLimit } from "@/lib/rateLimit";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 15 outfit generation requests per minute
    const rl = checkRateLimit(`outfit-generate:${user.id}`, { limit: 15, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Outfit generation rate limit exceeded. Please wait a moment." },
        { status: 429 }
      );
    }

    await authRepository.ensureAppUser(user.id, user.email!);

    const body = await request.json();
    const validatedInput = GenerateOutfitsInputSchema.parse(body);

    const result = await outfitGenerationService.generateOutfits(
      user.id,
      validatedInput
    );

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Outfit generation error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate outfits" },
      { status: 400 }
    );
  }
}
