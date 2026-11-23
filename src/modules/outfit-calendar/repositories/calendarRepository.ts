import { prisma } from "@/lib/prisma";
import { ScheduleOutfitInput, UpdateCalendarEntryInput } from "../validations";

export class CalendarRepository {
  async listByMonth(userId: string, startDate: Date, endDate: Date) {
    return prisma.calendarEntry.findMany({
      where: {
        userId,
        scheduledDate: {
          gte: startDate,
          lte: endDate,
        },
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
      orderBy: { scheduledDate: "asc" },
    });
  }

  async schedule(userId: string, input: ScheduleOutfitInput) {
    return prisma.calendarEntry.create({
      data: {
        userId,
        outfitId: input.outfitId,
        scheduledDate: new Date(input.scheduledDate),
        timeOfDay: input.timeOfDay,
        occasion: input.occasion,
        notes: input.notes,
      },
      include: {
        outfit: true,
      },
    });
  }

  async update(id: string, userId: string, input: UpdateCalendarEntryInput) {
    return prisma.calendarEntry.updateMany({
      where: { id, userId },
      data: {
        ...(input.scheduledDate ? { scheduledDate: new Date(input.scheduledDate) } : {}),
        timeOfDay: input.timeOfDay,
        occasion: input.occasion,
        isWorn: input.isWorn,
        notes: input.notes,
      },
    });
  }

  async delete(id: string, userId: string) {
    return prisma.calendarEntry.deleteMany({
      where: { id, userId },
    });
  }
}

export const calendarRepository = new CalendarRepository();
