import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { wardrobeService } from "@/modules/digital-wardrobe/services/wardrobeService";
import {
  CreateWardrobeItemSchema,
  WardrobeQueryFilterSchema,
} from "@/modules/digital-wardrobe/validations";
import { authRepository } from "@/modules/authentication/repositories/authRepository";

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const filterInput = {
      category: searchParams.get("category") || undefined,
      subCategory: searchParams.get("subCategory") || undefined,
      status: searchParams.get("status") || undefined,
      formality: searchParams.get("formality") || undefined,
      season: searchParams.get("season") || undefined,
      style: searchParams.get("style") || undefined,
      color: searchParams.get("color") || undefined,
      search: searchParams.get("search") || undefined,
      sortBy: (searchParams.get("sortBy") as any) || "recently_added",
      isFavorite: searchParams.has("isFavorite")
        ? searchParams.get("isFavorite") === "true"
        : undefined,
      limit: searchParams.has("limit") ? Number(searchParams.get("limit")) : 50,
      offset: searchParams.has("offset") ? Number(searchParams.get("offset")) : 0,
    };

    const filters = WardrobeQueryFilterSchema.parse(filterInput);
    const result = await wardrobeService.listItems(user.id, filters);

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch wardrobe items" },
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

    await authRepository.ensureAppUser(user.id, user.email!);

    const body = await request.json();
    const validatedData = CreateWardrobeItemSchema.parse(body);

    const created = await wardrobeService.addItem(user.id, validatedData);

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create wardrobe item" },
      { status: 400 }
    );
  }
}
