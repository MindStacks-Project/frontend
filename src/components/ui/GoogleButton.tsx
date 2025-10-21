"use client";
import { auth, googleProvider } from "@/lib/firebase.client";
import { signInWithPopup } from "firebase/auth";

export default function GoogleButton() {
  const onClick = async () => {
    await signInWithPopup(auth, googleProvider);
    // you can redirect here if needed
  };
  return <button onClick={onClick}>Sign in with Google</button>;
}
