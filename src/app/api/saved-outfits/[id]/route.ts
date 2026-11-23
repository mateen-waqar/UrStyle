import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { savedOutfitService } from "@/modules/saved-outfits/services/savedOutfitService";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await savedOutfitService.deleteSavedOutfit(params.id, user.id);

    return NextResponse.json({ success: true, message: "Saved outfit removed" });
  } catch (err: any) {
    console.error("Delete saved outfit error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete saved outfit" },
      { status: 500 }
    );
  }
}
