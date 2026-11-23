"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { navigationItems } from "./Sidebar";
import { X, ChevronRight, Box, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (!isOpen) return null;

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {}
    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } catch {}
    onClose();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-charcoal/30 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Body */}
      <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-card border-l border-border p-6 shadow-elevated flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <span className="font-serif text-lg font-medium tracking-tight">
              Navigation
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-charcoal transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Links */}
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium tracking-wide transition-colors",
                    isActive
                      ? "bg-charcoal text-white"
                      : "text-muted-foreground hover:bg-atelier-200 hover:text-charcoal"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="h-3 w-3 opacity-60" />
                </Link>
              );
            })}
          </nav>

          <div className="pt-2">
            <Link href="/studio" onClick={onClose}>
              <Button variant="outline" className="w-full gap-2 text-xs">
                <Box className="h-3.5 w-3.5 text-beige-600" />
                <span>Launch 3D Virtual Studio</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* User Card with Sign Out */}
        <div className="pt-6 border-t border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-charcoal text-white font-serif text-xs flex items-center justify-center">
              JL
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">Julian Laurent</p>
              <p className="text-[10px] text-muted-foreground font-mono">
                Atelier Member
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="p-2 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Sign Out"
          >
            {isSigningOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
