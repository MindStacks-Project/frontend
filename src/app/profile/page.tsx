// src/app/profile/page.tsx
"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto max-w-2xl py-10 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.photoURL || undefined} />
            <AvatarFallback>{user?.displayName?.substring(0,2).toUpperCase() || "PL"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <CardTitle>{user?.displayName || "Player"}</CardTitle>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 mt-4">
          <div className="grid gap-1">
             <h3 className="font-medium">Account Details</h3>
             <div className="text-sm border p-3 rounded-md bg-muted/50">
               <p><strong>User ID:</strong> {user?.uid}</p>
               <p><strong>Provider:</strong> {user?.providerData[0]?.providerId || "Email"}</p>
             </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
             (This data is live from your temporary Firebase setup)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}