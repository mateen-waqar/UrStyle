import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { authRepository } from "@/modules/authentication/repositories/authRepository";
import { UpdateProfileSchema } from "@/modules/user-profile/validations";

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

    await authRepository.ensureAppUser(user.id, user.email!);

    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
      profile: profile || null,
    });
  } catch (err: any) {
    console.error("Get profile error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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
    const validated = UpdateProfileSchema.parse(body);

    const updated = await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {
        ...validated,
      },
      create: {
        userId: user.id,
        ...validated,
      },
    });

    return NextResponse.json({ success: true, profile: updated });
  } catch (err: any) {
    console.error("Update profile error:", err);
    const isClientError = err.name === "ZodError";
    return NextResponse.json(
      { error: err.message || "Failed to update profile" },
      { status: isClientError ? 400 : 500 }
    );
  }
}
