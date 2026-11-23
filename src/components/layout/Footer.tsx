import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-atelier-50 py-10 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-muted-foreground">
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <span className="font-serif text-base font-medium tracking-tight text-foreground">
            StyleOS
          </span>
          <span className="hidden sm:inline text-border">•</span>
          <span className="text-[11px] font-mono tracking-wider uppercase text-muted-foreground/80">
            Intelligent Wardrobe & 3D Virtual Atelier
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
          <Link href="/dashboard" className="hover:text-charcoal transition-colors">
            Dashboard
          </Link>
          <Link href="/wardrobe" className="hover:text-charcoal transition-colors">
            Wardrobe
          </Link>
          <Link href="/outfits" className="hover:text-charcoal transition-colors">
            Deterministic Engine
          </Link>
          <Link href="/studio" className="hover:text-charcoal transition-colors">
            3D Studio
          </Link>
          <Link href="/calendar" className="hover:text-charcoal transition-colors">
            Calendar
          </Link>
          <span className="font-mono text-[10px] text-muted-foreground/60">
            v0.1.0 Atelier
          </span>
        </div>
      </div>
    </footer>
  );
}
