"use client";

import { AvatarFallback } from "@radix-ui/react-avatar";
import { useSession } from "@/lib/auth-client";
import { Avatar, AvatarImage } from "../ui/avatar";

export default function UserInfo() {
  const session = useSession();
  const user = session.data?.user;

  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      <Avatar>
        <AvatarImage src={user.image || undefined} />
        <AvatarFallback className="capitalize">
          {user.name.slice(0, 2)}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <p className="text-sm font-semibold">{user.name}</p>
        <p className="text-xs text-muted-foreground">{user.email}</p>
      </div>
    </div>
  );
}
