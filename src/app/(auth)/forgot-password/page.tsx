"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, CheckCircle2, ArrowLeft, Loader2, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const supabase = createClient();
      const redirectUrl = `${window.location.origin}/auth/callback?next=/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setIsSuccess(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to dispatch password recovery email.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border border-border/90 bg-card shadow-elevated">
      <CardHeader className="space-y-1 text-center">
        <span className="text-[10px] font-mono tracking-luxury uppercase text-muted-foreground block">
          Password Recovery
        </span>
        <CardTitle className="font-serif text-2xl font-medium text-foreground">
          Reset Password
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Enter your registered email address to receive password reset instructions.
        </CardDescription>
      </CardHeader>

      {isSuccess ? (
        <CardContent className="space-y-4 text-center py-4">
          <div className="h-12 w-12 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center mx-auto shadow-subtle">
            <CheckCircle2 className="h-6 w-6 stroke-[1.8]" />
          </div>
          <div className="space-y-1">
            <h4 className="font-serif text-base font-medium text-foreground">
              Recovery Link Sent
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
              If an atelier account is associated with <span className="font-medium text-foreground">{email}</span>, you will receive an email with instructions shortly.
            </p>
          </div>
          <div className="pt-4">
            <Link href="/login">
              <Button variant="outline" size="sm" className="gap-2 text-xs">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to Sign In</span>
              </Button>
            </Link>
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
                  <span>Dispatching Link...</span>
                </>
              ) : (
                <>
                  <Mail className="h-3.5 w-3.5" />
                  <span>Send Recovery Instructions</span>
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground pt-2">
              Remembered your password?{" "}
              <Link href="/login" className="font-medium text-charcoal hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
