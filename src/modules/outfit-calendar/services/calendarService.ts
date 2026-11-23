import { calendarRepository, CalendarRepository } from "../repositories/calendarRepository";
import { ScheduleOutfitInput, UpdateCalendarEntryInput } from "../validations";

export class CalendarService {
  constructor(private readonly repo: CalendarRepository = calendarRepository) {}

  async getScheduledOutfits(userId: string, startDate: Date, endDate: Date) {
    return this.repo.listByMonth(userId, startDate, endDate);
  }

  async planOutfit(userId: string, input: ScheduleOutfitInput) {
    return this.repo.schedule(userId, input);
  }

  async updateEntry(id: string, userId: string, input: UpdateCalendarEntryInput) {
    return this.repo.update(id, userId, input);
  }

  async cancelEntry(id: string, userId: string) {
    return this.repo.delete(id, userId);
  }
}

export const calendarService = new CalendarService();
