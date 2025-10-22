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
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          className="mr-2 h-4 w-4"
        >
          <path fill="#EA4335" d="M24 9.5c3.45 0 6.53 1.19 8.97 3.15l6.7-6.7C35.88 2.31 30.27 0 24 0 14.7 0 6.6 5.4 2.7 13.2l7.9 6.15C11.8 12.6 17.4 9.5 24 9.5z" />
          <path fill="#34A853" d="M46.5 24c0-1.8-.18-3.54-.51-5.22H24v9.92h12.68c-.55 2.97-2.21 5.48-4.72 7.17l7.44 5.78C43.63 37.44 46.5 31.24 46.5 24z" />
          <path fill="#4A90E2" d="M10.6 28.35c-.5-1.5-.8-3.1-.8-4.85s.3-3.35.8-4.85l-7.9-6.15C.96 16.47 0 20.1 0 24c0 3.9.96 7.53 2.7 10.65l7.9-6.3z" />
          <path fill="#FBBC05" d="M24 48c6.27 0 11.8-2.07 15.73-5.63l-7.44-5.78c-2.07 1.39-4.73 2.21-8.29 2.21-6.6 0-12.2-3.1-15.4-7.75l-7.9 6.3C6.6 42.6 14.7 48 24 48z" />
        </svg>
      )}
      Sign in with Google
    </Button>
  );
}
