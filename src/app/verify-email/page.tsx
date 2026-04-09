"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type VerifyState = "loading" | "success" | "error";

function VerifyEmailContent() {
  const [state, setState] = useState<VerifyState>("loading");
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!token || !email) {
      setState("error");
      setMessage("This verification link is invalid or missing required parameters.");
      return;
    }

    const params = new URLSearchParams({ token, email });
    fetch(`/api/auth/verify-email?${params.toString()}`)
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (res.ok) {
          setState("success");
          setMessage(body.message || "Email verified successfully.");
        } else {
          setState("error");
          setMessage(body.message || "Verification failed. Please try again.");
        }
      })
      .catch(() => {
        setState("error");
        setMessage("Something went wrong. Please try again.");
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state === "loading") {
    return <p className="text-sm text-center text-gray-500">Verifying your email...</p>;
  }

  if (state === "success") {
    return (
      <div className="text-center space-y-4">
        <p className="text-sm text-green-700 font-medium">{message}</p>
        <p className="text-sm text-gray-500">You can now sign in to your account.</p>
        <Button className="w-full" onClick={() => router.push("/login")}>
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      <p className="text-sm text-red-600">{message}</p>
      <p className="text-sm text-gray-500">
        If your link has expired, please register again or contact support.
      </p>
      <Button variant="outline" className="w-full" onClick={() => router.push("/register")}>
        Back to Register
      </Button>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(var(--dovito-deep-blue))] via-[hsl(var(--dovito-navy))] to-[hsl(var(--dovito-steel-blue))] py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
          <CardDescription>Confirming your email address</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Suspense fallback={<p className="text-sm text-center text-gray-500">Loading...</p>}>
            <VerifyEmailContent />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
