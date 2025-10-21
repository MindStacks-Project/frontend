"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { auth, googleProvider } from "@/lib/firebase.client";
import { useRouter } from "next/navigation";

type GoogleButtonProps = {
  className?: string;
};

export default function GoogleButton({ className }: GoogleButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function signIn() {
    try {
      setIsLoading(true);
      const { signInWithPopup } = await import("firebase/auth");
      const res = await signInWithPopup(auth, googleProvider);
      const idToken = await res.user.getIdToken(true);

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE;
      const endpoint = baseUrl
        ? `${baseUrl.replace(/\/$/, "")}/v1/auth/firebase`
        : "/v1/auth/firebase";

      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ idToken }),
      });

      router.replace("/dashboard");
    } catch (error) {
      console.error("Google sign-in failed", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className={cn("w-full", className)}
      onClick={signIn}
      disabled={isLoading}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Sign in with Google
    </Button>
  );
}
