import { SignUpForm } from "@/components/auth/signup-form";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <>
      <div className="text-center mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create an account
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your details below to create your account and start playing.
        </p>
      </div>
      <SignUpForm />
      <p className="px-8 text-center text-sm text-muted-foreground mt-4">
        By clicking continue, you agree to our{" "}
        <Link
          href="/terms"
          className="underline underline-offset-4 hover:text-primary"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="underline underline-offset-4 hover:text-primary"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </>
  );
}
