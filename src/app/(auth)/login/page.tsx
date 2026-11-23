"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const next = searchParams.get("next") || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data.user) {
        // Check if user completed onboarding
        try {
          const res = await fetch("/api/onboarding");
          const onboardingData = await res.json();

          if (onboardingData && !onboardingData.onboardingCompleted) {
            router.push("/onboarding");
            return;
          }
        } catch {
          // If onboarding check fails, proceed to next
        }

        router.push(next);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during sign in.");
    } finally {
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
          Sign In
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Access your digital wardrobe, deterministic outfits, and 3D studio.
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
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">Password</label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-muted-foreground hover:text-charcoal transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="border-border bg-atelier-100/50 text-xs text-foreground focus:border-charcoal"
            />
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
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Atelier</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground pt-2">
            Don&apos;t have an atelier account?{" "}
            <Link href="/register" className="font-medium text-charcoal hover:underline">
              Create an account
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs font-mono text-muted-foreground">
          Loading atelier portal...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
