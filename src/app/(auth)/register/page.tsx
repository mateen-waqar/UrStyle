"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters in length.");
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            display_name: displayName.trim(),
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Automatically save initial Step 1 data if user is authenticated immediately
        try {
          await fetch("/api/onboarding", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "save_step",
              step: 1,
              data: {
                displayName: displayName.trim(),
                genderPreference: "UNISEX",
              },
            }),
          });
        } catch {
          // Non-blocking fallback
        }

        // Direct user to the multi-step onboarding wizard
        router.push("/onboarding");
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during registration.");
      setIsLoading(false);
    }
  };

  return (
    <Card className="border border-border/90 bg-card shadow-elevated">
      <CardHeader className="space-y-1 text-center">
        <span className="text-[10px] font-mono tracking-luxury uppercase text-muted-foreground block">
          StyleOS Atelier
        </span>
        <CardTitle className="font-serif text-2xl font-medium text-foreground">
          Create Account
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Begin your journey into deterministic sartorial intelligence and 3D avatars.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Your Name</label>
            <Input
              type="text"
              placeholder="Julian Laurent"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              autoComplete="name"
              className="border-border bg-atelier-100/50 text-xs text-foreground focus:border-charcoal"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Email Address</label>
            <Input
              type="email"
              placeholder="sartorial@styleos.atelier"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="border-border bg-atelier-100/50 text-xs text-foreground focus:border-charcoal"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Password</label>
            <Input
              type="password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="border-border bg-atelier-100/50 text-xs text-foreground focus:border-charcoal"
            />
            <p className="text-[10px] text-muted-foreground">
              Must be at least 8 characters.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-charcoal text-white hover:bg-black font-medium text-xs tracking-wider uppercase h-10 shadow-subtle gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Creating Atelier Profile...</span>
              </>
            ) : (
              <>
                <span>Continue to Onboarding</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground pt-2">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-charcoal hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
