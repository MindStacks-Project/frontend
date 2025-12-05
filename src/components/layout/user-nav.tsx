"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { auth } from "@/lib/firebase.client";
import { signOut } from "firebase/auth";
import Link from "next/link";
export function UserNav() {
  const router = useRouter();
  const { user } = useAuth();

  const displayName = user?.displayName || user?.email || "Player";
  const email = user?.email || "";
  const providerPhoto =
    user?.providerData?.find((profile) => profile.photoURL)?.photoURL || null;
  const photoUrl = user?.photoURL || providerPhoto || undefined;
  const initials =
    displayName && displayName.length > 0
      ? displayName
          .split(" ")
          .slice(0, 2)
          .map((part) => part[0])
          .join("")
          .toUpperCase()
      : "PL";

  async function handleLogout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Failed to sign out", error);
    } finally {
      router.replace("/");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
          <Avatar className="h-10 w-10 overflow-visible rounded-full ring-2 ring-emerald-500 ring-offset-2 ring-offset-background">
            <AvatarImage
              src={photoUrl}
              alt={displayName}
              className="rounded-full"
              referrerPolicy="no-referrer"
            />
            <AvatarFallback className="rounded-full">{initials}</AvatarFallback>
            <span
              aria-hidden
              className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-background bg-emerald-500"
            />
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            {email && (
              <p className="text-xs leading-none text-muted-foreground">
                {email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
        <DropdownMenuItem asChild>
  <Link href="/profile" className="w-full cursor-pointer">
    <UserIcon className="mr-2 h-4 w-4" />
    <span>Profile</span>
  </Link>
</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            void handleLogout();
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
