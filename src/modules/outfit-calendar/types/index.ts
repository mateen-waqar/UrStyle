import { OutfitDto } from "@/types";

export interface CalendarEntryDto {
  id: string;
  userId: string;
  outfitId: string;
  scheduledDate: string;
  timeOfDay: string;
  occasion: string | null;
  isWorn: boolean;
  notes: string | null;
  outfit: OutfitDto;
}
