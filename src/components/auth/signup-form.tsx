"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase.client";

export function SignUpForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const run = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const { createUserWithEmailAndPassword, updateProfile } = await import(
          "firebase/auth"
        );
        const res = await createUserWithEmailAndPassword(auth, email, password);

        if (nickname.trim().length > 0) {
          await updateProfile(res.user, { displayName: nickname.trim() });
        }

        router.replace("/dashboard");
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Could not create account. Try again.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    void run();
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="nickname">Nickname</Label>
        <Input
          id="nickname"
          placeholder="PuzzleMaster"
          required
          disabled={isLoading}
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          required
          disabled={isLoading}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          required
          disabled={isLoading}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      <div className="items-top flex space-x-2 mt-2">
        <Checkbox id="consent" required />
        <div className="grid gap-1.5 leading-none">
          <label
            htmlFor="consent"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I am 13+ and agree to data sharing for research.
          </label>
          <p className="text-sm text-muted-foreground">
            You can change this setting later. Your data will be anonymized.
          </p>
        </div>
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Account
      </Button>
    </form>
  );
}
