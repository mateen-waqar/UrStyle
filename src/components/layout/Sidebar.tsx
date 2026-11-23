"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Shirt,
  Wand2,
  Sparkles,
  Box,
  Bookmark,
  Palette,
  Calendar,
  Settings,
  Plus,
  LogOut,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  highlight?: boolean;
}

export const navigationItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/wardrobe", label: "Digital Wardrobe", icon: Shirt, badge: "Catalog" },
  { href: "/builder", label: "Custom Builder", icon: Wand2 },
  { href: "/outfits", label: "Outfit Generator", icon: Sparkles, badge: "Rules" },
  { href: "/studio", label: "Virtual 3D Studio", icon: Box, highlight: true },
  { href: "/saved-outfits", label: "Saved Outfits", icon: Bookmark },
  { href: "/collections", label: "Lookbooks", icon: Palette },
  { href: "/calendar", label: "Outfit Calendar", icon: Calendar },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [userName, setUserName] = useState<string>("Atelier Member");
  const [userInitials, setUserInitials] = useState<string>("OS");

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/onboarding");
        if (res.ok) {
          const data = await res.json();
          if (data.profile?.displayName) {
            setUserName(data.profile.displayName);
            const initials = data.profile.displayName
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .substring(0, 2);
            setUserInitials(initials || "OS");
          } else if (data.email) {
            setUserName(data.email.split("@")[0]);
            setUserInitials(data.email.substring(0, 2).toUpperCase());
          }
        }
      } catch {}
    }
    loadUser();
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {}
    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } catch {}
    router.push("/login");
    router.refresh();
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex w-64 flex-col justify-between border-r border-border/80 bg-atelier-50/70 backdrop-blur-md p-4 shrink-0 h-[calc(100vh-4rem)] sticky top-16 select-none",
        className
      )}
    >
      <div className="space-y-6">
        {/* Navigation Group */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-mono tracking-luxury uppercase text-muted-foreground">
            Sartorial Operating System
          </div>
          <nav className="space-y-0.5">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium tracking-wide transition-all",
                    isActive
                      ? "bg-charcoal text-white shadow-subtle"
                      : "text-muted-foreground hover:text-foreground hover:bg-atelier-200/80",
                    item.highlight && !isActive && "text-charcoal font-semibold"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-105",
                        isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && !isActive && (
                    <span className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-atelier-200 text-muted-foreground border border-border/60">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Quick Add CTA */}
        <div className="px-2">
          <Link
            href="/wardrobe?action=new"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg border border-dashed border-border/90 hover:border-charcoal/40 bg-card/60 hover:bg-card text-xs text-muted-foreground hover:text-charcoal font-medium transition-all shadow-subtle"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add to Wardrobe</span>
          </Link>
        </div>
      </div>

      {/* User / Atelier Profile Footer with Sign Out */}
      <div className="pt-4 border-t border-border/60">
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-atelier-200/60 transition-colors">
          <Link href="/settings" className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="h-8 w-8 rounded-full bg-charcoal text-white font-serif text-xs flex items-center justify-center shadow-subtle shrink-0">
              {userInitials}
            </div>
            <div className="space-y-0.5 truncate">
              <p className="text-xs font-medium text-foreground leading-none truncate">
                {userName}
              </p>
              <p className="text-[10px] text-muted-foreground font-mono">
                Verified Member
              </p>
            </div>
          </Link>

          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0 ml-1"
            title="Sign out of atelier"
          >
            {isSigningOut ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <LogOut className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
