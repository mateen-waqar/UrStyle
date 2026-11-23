import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StyleOS — Your Wardrobe. Reimagined.",
  description:
    "A digital wardrobe and intelligent outfit creation platform with deterministic rule-based styling and interactive 3D avatars.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased text-foreground">
        {children}
      </body>
    </html>
  );
}
