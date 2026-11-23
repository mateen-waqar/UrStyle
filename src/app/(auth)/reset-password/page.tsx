"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, CheckCircle2, ArrowRight, Loader2, Lock } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setIsSuccess(true);
        setTimeout(() => {
          router.push("/login?message=password_updated");
        }, 2000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border border-border/90 bg-card shadow-elevated">
      <CardHeader className="space-y-1 text-center">
        <span className="text-[10px] font-mono tracking-luxury uppercase text-muted-foreground block">
          Security Credential
        </span>
        <CardTitle className="font-serif text-2xl font-medium text-foreground">
          Set New Password
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Enter and confirm your new secure password below.
        </CardDescription>
      </CardHeader>

      {isSuccess ? (
        <CardContent className="space-y-4 text-center py-4">
          <div className="h-12 w-12 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center mx-auto shadow-subtle">
            <CheckCircle2 className="h-6 w-6 stroke-[1.8]" />
          </div>
          <div className="space-y-1">
            <h4 className="font-serif text-base font-medium text-foreground">
              Password Updated Successfully
            </h4>
            <p className="text-xs text-muted-foreground">
              Your password has been changed. Redirecting to sign in...
            </p>
          </div>
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">New Password</label>
              <Input
                type="password"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="border-border bg-atelier-100/50 text-xs text-foreground focus:border-charcoal"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Confirm New Password</label>
              <Input
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
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
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5" />
                  <span>Update Password</span>
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground pt-2">
              <Link href="/login" className="font-medium text-charcoal hover:underline">
                Return to Sign In
              </Link>
            </p>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
