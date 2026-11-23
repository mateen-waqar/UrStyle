import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { authRepository } from "@/modules/authentication/repositories/authRepository";
import { CreateCollectionSchema } from "@/modules/collections/validations";

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

    const collections = await prisma.savedCollection.findMany({
      where: { userId: user.id },
      include: {
        savedOutfits: {
          include: {
            outfit: {
              include: {
                items: {
                  include: {
                    wardrobeItem: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ collections });
  } catch (err: any) {
    console.error("Fetch collections error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch collections" },
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
    const validated = CreateCollectionSchema.parse(body);

    const collection = await prisma.savedCollection.create({
      data: {
        userId: user.id,
        name: validated.name,
        description: validated.description || null,
        isPrivate: validated.isPrivate,
        coverImageUrl: validated.coverImageUrl || null,
      },
    });

    return NextResponse.json(collection, { status: 201 });
  } catch (err: any) {
    console.error("Create collection error:", err);
    const isClientError = err.name === "ZodError";
    return NextResponse.json(
      { error: err.message || "Failed to create collection" },
      { status: isClientError ? 400 : 500 }
    );
  }
}
