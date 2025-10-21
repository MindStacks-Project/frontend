"use client";
import { auth } from "@/lib/firebase.client";
import { signOut } from "firebase/auth";

export default function LogoutButton() {
  return <button onClick={() => signOut(auth)}>Log out</button>;
}
