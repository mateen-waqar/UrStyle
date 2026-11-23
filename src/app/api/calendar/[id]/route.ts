import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

interface RouteParams {
  params: {
    id: string;
  };
}

const UpdateCalendarEntrySchema = z.object({
  isWorn: z.boolean().optional(),
  notes: z.string().max(300).nullable().optional(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = UpdateCalendarEntrySchema.parse(body);

    const existing = await prisma.calendarEntry.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Calendar entry not found or access denied" },
        { status: 404 }
      );
    }

    const updated = await prisma.calendarEntry.update({
      where: { id: params.id },
      data: {
        isWorn: validated.isWorn !== undefined ? validated.isWorn : undefined,
        notes: validated.notes !== undefined ? validated.notes : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("Update calendar entry error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update calendar entry" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.calendarEntry.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Calendar entry not found or access denied" },
        { status: 404 }
      );
    }

    await prisma.calendarEntry.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete calendar entry error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete calendar entry" },
      { status: 400 }
    );
  }
}
