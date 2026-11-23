import React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-atelier-300/60 dark:bg-atelier-800/40",
        className
      )}
    />
  );
}

export function GarmentCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-border/80 bg-card overflow-hidden shadow-card">
      <Skeleton className="aspect-[4/5] w-full rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-3/4" />
        <div className="pt-2 flex justify-between">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-8" />
        </div>
      </div>
    </div>
  );
}

export function OutfitCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-border/80 bg-card p-6 shadow-card space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-5 w-48" />
        </div>
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-7 w-20 rounded-md" />
        <Skeleton className="h-7 w-24 rounded-md" />
        <Skeleton className="h-7 w-20 rounded-md" />
      </div>
      <Skeleton className="h-14 w-full rounded-lg" />
      <div className="pt-2 flex justify-between">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/80 bg-card p-6 shadow-card space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-9 w-20" />
      <Skeleton className="h-3 w-36" />
    </div>
  );
}
