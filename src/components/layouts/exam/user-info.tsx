"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "@/lib/auth-client";

export default function UserInfo(
  { direction = "left" }: { direction?: "left" | "right" }
) {
  const session = useSession();
  const user = session?.data?.user;
  return (
    <div className={`flex items-center gap-2 ${direction === "left" ? "flex-row-reverse" : ""}`}>
      <Avatar className="w-8 h-8">
        <AvatarImage src={user?.image ?? undefined} alt={user?.name} />
        <AvatarFallback>
          <span className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center">
            {user?.name.slice(0, 2).toUpperCase()}
          </span>
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <p className="font-semibold text-sm">{user?.name}</p>
        <p className="text-xs text-muted-foreground">{user?.email}</p>
      </div>
    </div>
  );
}
