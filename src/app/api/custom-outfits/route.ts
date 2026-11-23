import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { authRepository } from "@/modules/authentication/repositories/authRepository";
import { savedOutfitService } from "@/modules/saved-outfits/services/savedOutfitService";
import { SaveOutfitEnsembleSchema } from "@/modules/saved-outfits/validations";
import { checkRateLimit } from "@/lib/rateLimit";

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

    // Rate limiting
    const rl = checkRateLimit(`custom-outfit:${user.id}`, { limit: 20, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many outfit save requests. Please wait a moment." },
        { status: 429 }
      );
    }

    await authRepository.ensureAppUser(user.id, user.email!);

    const rawBody = await request.json();

    const formattedPayload = {
      title: rawBody.title || "Custom Wardrobe Ensemble",
      description: rawBody.description,
      occasion: rawBody.occasion || "CASUAL_OUTING",
      formality: rawBody.formality || "SMART_CASUAL",
      season: rawBody.season || "ALL_SEASON",
      generationSource: "MANUAL_BUILDER",
      compatibilityScore: rawBody.compatibilityScore != null ? Number(rawBody.compatibilityScore) : null,
      items: Array.isArray(rawBody.items)
        ? rawBody.items.map((it: any) => ({
            wardrobeItemId: it.wardrobeItemId || it.id,
            slot: it.slot || "INNER_TOP",
            layerIndex: it.layerIndex ?? 0,
          }))
        : [],
      stylingInstructions: Array.isArray(rawBody.stylingInstructions)
        ? rawBody.stylingInstructions.map((si: any) => ({
            slot: si.slot || "INNER_TOP",
            instruction: typeof si === "string" ? si : si.instruction || si.action,
            tipType: si.tipType || si.category || "LAYER",
          }))
        : undefined,
      notes: rawBody.notes,
    };

    const validatedInput = SaveOutfitEnsembleSchema.parse(formattedPayload);

    const savedOutfit = await savedOutfitService.saveOutfitEnsemble(user.id, validatedInput);

    return NextResponse.json(savedOutfit, { status: 201 });
  } catch (err: any) {
    console.error("Save custom outfit error:", err);
    const isClientError = err.name === "ZodError" || err.message?.includes("Security exception");
    return NextResponse.json(
      { error: err.message || "Failed to save custom outfit" },
      { status: isClientError ? 400 : 500 }
    );
  }
}
