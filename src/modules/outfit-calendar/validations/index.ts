import { z } from "zod";

export const ScheduleOutfitSchema = z.object({
  outfitId: z.string().uuid(),
  scheduledDate: z.string().datetime(),
  timeOfDay: z.enum(["MORNING", "AFTERNOON", "EVENING", "ALL_DAY"]).default("ALL_DAY"),
  occasion: z.string().max(100).nullable().optional(),
  notes: z.string().max(300).nullable().optional(),
});

export const UpdateCalendarEntrySchema = ScheduleOutfitSchema.partial().extend({
  isWorn: z.boolean().optional(),
});

export type ScheduleOutfitInput = z.infer<typeof ScheduleOutfitSchema>;
export type UpdateCalendarEntryInput = z.infer<typeof UpdateCalendarEntrySchema>;
