import React from "react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-6">
      <header className="flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-serif text-2xl font-medium tracking-tight text-foreground transition-opacity group-hover:opacity-80">
            StyleOS
          </span>
          <span className="text-[9px] font-mono tracking-luxury uppercase px-1.5 py-0.5 rounded border border-border bg-atelier-200 text-muted-foreground">
            Atelier
          </span>
        </Link>
      </header>

      <main className="max-w-md w-full mx-auto my-auto py-8">
        {children}
      </main>

      <footer className="text-center text-[11px] text-muted-foreground font-mono">
        Supabase Authentication • 256-Bit TLS Encryption
      </footer>
    </div>
  );
}
