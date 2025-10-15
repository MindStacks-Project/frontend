import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <>
      <div className="text-center mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email below to log in to your account
        </p>
      </div>
      <LoginForm />
      <p className="px-8 text-center text-sm text-muted-foreground mt-4">
        <Link
          href="/signup"
          className="underline underline-offset-4 hover:text-primary"
        >
          Don't have an account? Sign Up
        </Link>
      </p>
    </>
  );
}
