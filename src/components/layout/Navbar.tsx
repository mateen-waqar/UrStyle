"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Box, Plus, Search, Menu, X } from "lucide-react";
import { MobileNav } from "./MobileNav";

export function Navbar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/wardrobe?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 max-w-7xl mx-auto w-full">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="font-serif text-xl sm:text-2xl font-medium tracking-tight text-foreground transition-opacity group-hover:opacity-80">
                StyleOS
              </span>
              <span className="hidden sm:inline-block text-[9px] font-mono tracking-luxury uppercase px-1.5 py-0.5 rounded border border-border bg-atelier-200 text-muted-foreground">
                Atelier
              </span>
            </Link>

            {/* Quick Search Form */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/80 bg-card/60 text-xs text-muted-foreground hover:border-charcoal/30 focus-within:border-charcoal/50 focus-within:bg-card transition-all shadow-subtle w-64">
                <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder="Search wardrobe pieces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none text-foreground placeholder:text-muted-foreground text-xs focus:outline-none w-full"
                />
                <kbd className="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded bg-atelier-200 border border-border text-muted-foreground shrink-0">
                  ↵
                </kbd>
              </div>
            </form>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            {/* Quick 3D Studio Launcher */}
            <Link href="/studio">
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex gap-1.5 text-xs border-border hover:border-charcoal/40"
              >
                <Box className="h-3.5 w-3.5 text-beige-600" />
                <span>Virtual Studio</span>
              </Button>
            </Link>

            {/* Quick Add Garment CTA */}
            <Link href="/wardrobe?action=new">
              <Button size="sm" variant="default" className="gap-1.5 text-xs bg-charcoal text-cream hover:bg-charcoal/90">
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Add Garment</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg border border-border text-charcoal hover:bg-atelier-200 transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-down / Drawer Navigation */}
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
