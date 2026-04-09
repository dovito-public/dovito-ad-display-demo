"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { mockAuth } from "@/lib/mock-auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAdminSignIn = () => {
    setIsLoading(true);
    const u = mockAuth.signIn("admin@dovito.com");
    toast.success("Signed in as admin (demo)", { description: u.email });
    router.push("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(var(--dovito-deep-blue))] via-[hsl(var(--dovito-navy))] to-[hsl(var(--dovito-steel-blue))] py-12 px-4 sm:px-6 lg:px-8 relative">
      <Link
        href="/"
        className="absolute top-16 left-6 inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>
            Demo mode — click below to enter as the admin user
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm">
            <p className="text-yellow-800 text-xs">
              This is a public demo. No real password is required. The live
              product uses email/password and Google sign-in — both are
              stripped out here.
            </p>
          </div>
          <Button
            type="button"
            className="w-full h-auto py-3"
            onClick={handleAdminSignIn}
            disabled={isLoading}
          >
            <div className="flex flex-col items-center">
              <span className="font-semibold">Sign in as Admin</span>
              <span className="text-xs opacity-80">admin@dovito.com</span>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
