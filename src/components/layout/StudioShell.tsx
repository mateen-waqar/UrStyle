"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Box, Camera, RefreshCw } from "lucide-react";
import { useStudioStore } from "@/stores/studioStore";

interface StudioShellProps {
  children: React.ReactNode;
  controlsPanel?: React.ReactNode;
}

export function StudioShell({ children, controlsPanel }: StudioShellProps) {
  const { settings, updateSettings, resetCamera } = useStudioStore();

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-charcoal text-stone-100 flex flex-col">
      {/* Top Floating Editorial HUD Bar */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-charcoal/90 via-charcoal/40 to-transparent pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <Link
            href="/wardrobe"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-charcoal-50/90 hover:bg-charcoal-100 border border-charcoal-200 text-xs font-medium text-stone-300 transition-all backdrop-blur-md shadow-subtle"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Wardrobe</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-serif text-sm sm:text-base font-medium tracking-tight text-white">
              Virtual Studio
            </span>
            <span className="text-[10px] font-mono tracking-luxury uppercase px-2 py-0.5 rounded bg-white/10 text-beige-300 border border-white/15">
              3D Mannequin
            </span>
          </div>
        </div>

        {/* Viewport Quick Toggles */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => updateSettings({ autoRotate: !settings.autoRotate })}
            className={`p-2 rounded-lg border text-xs transition-all backdrop-blur-md shadow-subtle ${
              settings.autoRotate
                ? "bg-beige-400 text-charcoal border-beige-300"
                : "bg-charcoal-50/90 border-charcoal-200 text-stone-400 hover:text-white"
            }`}
            title="Toggle 360 Turntable"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => updateSettings({ showGrid: !settings.showGrid })}
            className={`p-2 rounded-lg border text-xs transition-all backdrop-blur-md shadow-subtle ${
              settings.showGrid
                ? "bg-beige-400 text-charcoal border-beige-300"
                : "bg-charcoal-50/90 border-charcoal-200 text-stone-400 hover:text-white"
            }`}
            title="Toggle Stage Grid"
          >
            <Box className="h-4 w-4" />
          </button>
          <button
            onClick={resetCamera}
            className="px-3 py-1.5 rounded-lg bg-charcoal-50/90 hover:bg-charcoal-100 border border-charcoal-200 text-xs font-medium text-stone-300 transition-all backdrop-blur-md shadow-subtle flex items-center gap-1.5"
          >
            <Camera className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset Camera</span>
          </button>
        </div>
      </header>

      {/* Main 3D Viewport Area */}
      <div className="flex-1 relative w-full h-full">
        {children}

        {/* Floating Side Control Panel */}
        {controlsPanel && (
          <aside className="absolute right-4 top-20 bottom-4 w-80 z-20 pointer-events-auto">
            {controlsPanel}
          </aside>
        )}
      </div>
    </div>
  );
}
