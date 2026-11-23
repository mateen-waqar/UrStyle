"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  CheckCircle2,
  Trash2,
  X,
  Loader2,
  Box,
  Shirt,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarEntryDto {
  id: string;
  outfitId: string;
  scheduledDate: string;
  timeOfDay: "MORNING" | "AFTERNOON" | "EVENING" | "ALL_DAY";
  occasion?: string | null;
  isWorn: boolean;
  notes?: string | null;
  outfit: {
    id: string;
    title: string;
    occasion: string;
    items: Array<{
      slot: string;
      wardrobeItem: {
        id: string;
        name: string;
        colorPrimary: string;
        imageUrl?: string | null;
      };
    }>;
  };
}

export default function CalendarPage() {
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [entries, setEntries] = useState<CalendarEntryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Scheduling Modal
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [availableOutfits, setAvailableOutfits] = useState<any[]>([]);
  const [selectedOutfitId, setSelectedOutfitId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<string>("ALL_DAY");
  const [occasionInput, setOccasionInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Compute 7 days of the active week offset
  const weekDays = useMemo(() => {
    const today = new Date();
    // Monday of current week
    const dayOfWeek = today.getDay(); // 0 is Sunday
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday + currentWeekOffset * 7);
    monday.setHours(0, 0, 0, 0);

    const days = [];
    const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const isoDate = d.toISOString().split("T")[0];
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const formatted = `${monthNames[d.getMonth()]} ${d.getDate()}`;

      days.push({
        dateObj: d,
        isoDate,
        formattedDate: formatted,
        dayName: dayNames[i],
      });
    }

    return days;
  }, [currentWeekOffset]);

  // Week header label (e.g. "November 2026")
  const weekLabel = useMemo(() => {
    const start = weekDays[0].dateObj;
    const end = weekDays[6].dateObj;
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    if (start.getMonth() === end.getMonth()) {
      return `${monthNames[start.getMonth()]} ${start.getFullYear()}`;
    }
    return `${monthNames[start.getMonth()]} – ${monthNames[end.getMonth()]} ${end.getFullYear()}`;
  }, [weekDays]);

  // Fetch real calendar entries
  const fetchEntries = async () => {
    try {
      setIsLoading(true);
      const startIso = weekDays[0].dateObj.toISOString();
      const endIso = new Date(weekDays[6].dateObj.getTime() + 86400000).toISOString();

      const res = await fetch(`/api/calendar?start=${startIso}&end=${endIso}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
      }
    } catch (err) {
      console.error("Fetch calendar error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [weekDays]);

  // Fetch user outfits when opening modal
  const handleOpenScheduleModal = async (defaultDate?: string) => {
    setSelectedDate(defaultDate || weekDays[0].isoDate);
    setIsScheduleModalOpen(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/outfits");
      if (res.ok) {
        const data = await res.json();
        const outfitsList = (data.savedOutfits || []).map((s: any) => s.outfit).filter(Boolean);
        setAvailableOutfits(outfitsList);
        if (outfitsList.length > 0 && !selectedOutfitId) {
          setSelectedOutfitId(outfitsList[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching outfits:", err);
    }
  };

  // Submit Schedule Look to DB
  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOutfitId || !selectedDate) {
      setErrorMessage("Please select both an outfit and a scheduled date");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const scheduledDateTime = new Date(`${selectedDate}T12:00:00.000Z`).toISOString();
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outfitId: selectedOutfitId,
          scheduledDate: scheduledDateTime,
          timeOfDay: selectedTimeOfDay,
          occasion: occasionInput.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to schedule look");
      }

      setIsScheduleModalOpen(false);
      fetchEntries();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to schedule outfit");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle isWorn in DB
  const handleToggleWorn = async (entryId: string, currentWorn: boolean) => {
    try {
      // Optimistic update
      setEntries((prev) =>
        prev.map((en) => (en.id === entryId ? { ...en, isWorn: !currentWorn } : en))
      );

      await fetch(`/api/calendar/${entryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isWorn: !currentWorn }),
      });
    } catch (err) {
      console.error("Toggle worn error:", err);
      fetchEntries();
    }
  };

  // Delete calendar entry in DB
  const handleDeleteEntry = async (entryId: string) => {
    try {
      setEntries((prev) => prev.filter((en) => en.id !== entryId));
      await fetch(`/api/calendar/${entryId}`, { method: "DELETE" });
    } catch (err) {
      console.error("Delete calendar entry error:", err);
      fetchEntries();
    }
  };

  return (
    <div className="space-y-8">
      <Header
        eyebrow="Wardrobe Architecture • Schedule & Rotation"
        title="Outfit Calendar"
        description="Schedule ensembles for appointments, business meetings, galas, and weekend travels."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeekOffset((p) => p - 1)}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-mono font-medium px-2 text-charcoal">
              {weekLabel}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeekOffset((p) => p + 1)}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={() => handleOpenScheduleModal()}
              className="gap-2 text-xs ml-2 bg-charcoal text-cream hover:bg-charcoal/90"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Schedule Look</span>
            </Button>
          </div>
        }
      />

      {/* Week Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {weekDays.map((day) => {
          const dayEntries = entries.filter((en) => {
            const entryDateIso = new Date(en.scheduledDate).toISOString().split("T")[0];
            return entryDateIso === day.isoDate;
          });

          const primaryEntry = dayEntries[0];

          return (
            <div
              key={day.isoDate}
              className={cn(
                "rounded-xl border p-4 transition-all flex flex-col justify-between min-h-[240px]",
                primaryEntry
                  ? "border-border/90 bg-card shadow-subtle hover:border-charcoal/30"
                  : "border-dashed border-border/80 bg-atelier-100/30"
              )}
            >
              {/* Day Header */}
              <div className="pb-3 border-b border-border/50 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">{day.dayName}</span>
                  {primaryEntry && (
                    <button
                      onClick={() => handleToggleWorn(primaryEntry.id, primaryEntry.isWorn)}
                      title={primaryEntry.isWorn ? "Mark as unworn" : "Mark as worn"}
                      className="p-1 rounded hover:bg-atelier-100 text-muted-foreground hover:text-charcoal transition-colors"
                    >
                      <CheckCircle2
                        className={cn(
                          "h-3.5 w-3.5 transition-colors",
                          primaryEntry.isWorn ? "text-emerald-700 fill-emerald-100" : "text-stone-300"
                        )}
                      />
                    </button>
                  )}
                </div>
                <p className="text-[10px] font-mono text-muted-foreground">{day.formattedDate}</p>
              </div>

              {/* Outfit Content */}
              {primaryEntry ? (
                <div className="py-3 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={primaryEntry.isWorn ? "default" : "secondary"}
                        className="text-[9px] font-mono uppercase"
                      >
                        {primaryEntry.isWorn ? "Worn" : "Planned"}
                      </Badge>
                      <button
                        onClick={() => handleDeleteEntry(primaryEntry.id)}
                        className="text-stone-300 hover:text-red-600 transition-colors"
                        title="Unschedule look"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>

                    <h5 className="font-serif text-sm font-medium text-foreground leading-snug line-clamp-2">
                      {primaryEntry.outfit.title}
                    </h5>
                  </div>

                  {/* Garment swatches */}
                  <div className="flex items-center gap-1 pt-1">
                    {primaryEntry.outfit.items.map((it, idx) => (
                      <span
                        key={idx}
                        className="h-2.5 w-2.5 rounded-full border border-border/70 shadow-xs"
                        style={{ backgroundColor: it.wardrobeItem.colorPrimary }}
                        title={it.wardrobeItem.name}
                      />
                    ))}
                    <span className="text-[9px] font-mono text-muted-foreground ml-1">
                      {primaryEntry.outfit.items.length} pcs
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center space-y-2 flex-1 flex flex-col items-center justify-center">
                  <span className="text-[11px] text-muted-foreground/60 italic block">
                    No look planned
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenScheduleModal(day.isoDate)}
                    className="h-7 text-[10px] text-muted-foreground hover:text-charcoal"
                  >
                    + Add look
                  </Button>
                </div>
              )}

              {/* Day Footer Link to 3D studio */}
              <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                {primaryEntry ? (
                  <Link
                    href={`/studio?items=${primaryEntry.outfit.items.map((i) => i.wardrobeItem.id).join(",")}`}
                    className="hover:text-charcoal flex items-center gap-1"
                  >
                    <Box className="h-3 w-3" />
                    <span>View in 3D</span>
                  </Link>
                ) : (
                  <span>Open Day</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule Look Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl p-6 space-y-5 animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-charcoal" />
                <h3 className="font-serif text-base font-semibold text-foreground">
                  Schedule Outfit Ensemble
                </h3>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="h-7 w-7 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-charcoal"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-800 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleCreateSchedule} className="space-y-4 text-xs">
              {/* Outfit Select */}
              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase text-muted-foreground block">
                  Select Outfit
                </label>
                {availableOutfits.length > 0 ? (
                  <select
                    value={selectedOutfitId}
                    onChange={(e) => setSelectedOutfitId(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-none"
                  >
                    {availableOutfits.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.title} ({o.items?.length || 0} pieces)
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-[11px]">
                    No saved outfits found. Please save an outfit from the Generator or Custom Builder first.
                  </p>
                )}
              </div>

              {/* Date Input */}
              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase text-muted-foreground block">
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                  className="w-full h-9 px-3 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-none"
                />
              </div>

              {/* Time of Day */}
              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase text-muted-foreground block">
                  Time of Day
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {["ALL_DAY", "MORNING", "AFTERNOON", "EVENING"].map((tod) => (
                    <button
                      key={tod}
                      type="button"
                      onClick={() => setSelectedTimeOfDay(tod)}
                      className={cn(
                        "py-1.5 rounded-lg border text-[10px] font-mono tracking-wider transition-all",
                        selectedTimeOfDay === tod
                          ? "border-charcoal bg-charcoal text-cream font-semibold"
                          : "border-border bg-card text-muted-foreground hover:bg-atelier-100"
                      )}
                    >
                      {tod.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Occasion / Notes */}
              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase text-muted-foreground block">
                  Occasion Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Board review, Gallery opening, Dinner date"
                  value={occasionInput}
                  onChange={(e) => setOccasionInput(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsScheduleModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting || availableOutfits.length === 0}
                  className="bg-charcoal text-cream hover:bg-charcoal/90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      <span>Scheduling...</span>
                    </>
                  ) : (
                    <span>Schedule Outfit</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
