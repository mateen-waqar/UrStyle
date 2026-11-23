import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { authRepository } from "@/modules/authentication/repositories/authRepository";
import { ScheduleOutfitSchema } from "@/modules/outfit-calendar/validations";
import { TimeOfDay } from "@prisma/client";

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

    const searchParams = request.nextUrl.searchParams;
    const startStr = searchParams.get("start");
    const endStr = searchParams.get("end");

    const whereClause: any = { userId: user.id };

    if (startStr && endStr) {
      whereClause.scheduledDate = {
        gte: new Date(startStr),
        lte: new Date(endStr),
      };
    }

    const entries = await prisma.calendarEntry.findMany({
      where: whereClause,
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
      orderBy: { scheduledDate: "asc" },
    });

    return NextResponse.json({ entries });
  } catch (err: any) {
    console.error("Fetch calendar entries error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch calendar entries" },
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
    const validated = ScheduleOutfitSchema.parse(body);

    // Verify outfit ownership
    const outfit = await prisma.outfit.findFirst({
      where: { id: validated.outfitId, userId: user.id },
    });

    if (!outfit) {
      return NextResponse.json(
        { error: "Outfit not found or access denied." },
        { status: 404 }
      );
    }

    const entry = await prisma.calendarEntry.create({
      data: {
        userId: user.id,
        outfitId: validated.outfitId,
        scheduledDate: new Date(validated.scheduledDate),
        timeOfDay: validated.timeOfDay as TimeOfDay,
        occasion: validated.occasion || null,
        notes: validated.notes || null,
        isWorn: false,
      },
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
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (err: any) {
    console.error("Schedule calendar entry error:", err);
    const isClientError = err.name === "ZodError";
    return NextResponse.json(
      { error: err.message || "Failed to schedule outfit" },
      { status: isClientError ? 400 : 500 }
    );
  }
}
