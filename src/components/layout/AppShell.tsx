"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { LayoutDashboard, Shirt, Sparkles, Box, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  const mobileBottomBarItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/wardrobe", label: "Wardrobe", icon: Shirt },
    { href: "/outfits", label: "Style", icon: Sparkles },
    { href: "/studio", label: "3D Studio", icon: Box },
    { href: "/calendar", label: "Calendar", icon: Calendar },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 w-full min-w-0 pb-20 lg:pb-10">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Linear / iOS inspired) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-md border-t border-border/80 px-4 py-2 flex items-center justify-around">
        {mobileBottomBarItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors",
                isActive
                  ? "text-charcoal font-semibold"
                  : "text-muted-foreground hover:text-charcoal"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive ? "stroke-[2.2]" : "stroke-[1.5]")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Footer />
    </div>
  );
}
