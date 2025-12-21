"use client";

import {
  ChevronsUpDown,
  LogOut,
  Moon,
  Settings,
  Sun,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// import { signOut, useSession } from "@/lib/auth-client";
import { Skeleton } from "../ui/skeleton";

export default function User({
  size,
  disableTooltip = false,
  popupSide = "right",
}: {
  size: "default" | "small";
  popupSide?: "top" | "bottom" | "left" | "right";
  disableTooltip?: boolean;
}) {
  //   const { data: session, isPending, error } = useSession();

  const _router = useRouter();
  const { theme, setTheme } = useTheme();

  //   const handleLogout = async () => {
  //     await signOut({
  //       fetchOptions: {
  //         onSuccess: () => {
  //           router.push("/auth");
  //         },
  //       },
  //     });
  //   };

  //   if (isPending || !session?.user) {
  //     return <UserSkeleton size={size} />;
  //   }

  //   if (error) {
  //     toast.error("Failed to load session. Redirecting to auth...");
  //     redirect("/auth");
  //   }

  //   const user = session.user;

  const user = {
    name: "Harshith Doddipalli",
    email: "harshith.doddipalli@gmail.com",
    image: "https://api.dicebear.com/9.x/glass/svg?seed=Harshit%20Doddipalli",
    username: "harshith",
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="cursor-pointer">
          {size === "default" ? (
            <div className="w-full flex items-center gap-2 rounded-lg p-2 hover:bg-accent transition-colors">
              <Avatar className="h-10 w-10 z-50">
                <AvatarImage
                  src={
                    user.image ||
                    `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${user.username}`
                  }
                />
                <AvatarFallback className="bg-primary/20 text-primary uppercase">
                  {user.name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <div className="flex-1 flex flex-col overflow-hidden text-left min-w-0">
                  <p className="font-medium truncate text-sm">{user.name}</p>
                  <p className="text-muted-foreground text-xs truncate">
                    {user.email}
                  </p>
                </div>
                <ChevronsUpDown size={16} className="text-muted-foreground" />
              </div>
            </div>
          ) : disableTooltip ? (
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarImage
                src={
                  user.image ||
                  `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${user.username}`
                }
              />
              <AvatarFallback className="bg-primary/20 text-primary rounded h-full w-full uppercase text-xs">
                {user.name
                  .split(" ")
                  .map((word) => word[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarImage
                    src={
                      user.image ||
                      `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${user.username}`
                    }
                  />
                  <AvatarFallback className="bg-primary/20 text-primary rounded h-full w-full uppercase text-xs">
                    {user.name
                      .split(" ")
                      .map((word) => word[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent side={popupSide} align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={
                user.image ||
                `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${user.username}`
              }
            />
            <AvatarFallback className="bg-primary/20 text-primary uppercase">
              {user.name
                .split(" ")
                .map((word) => word[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden text-left min-w-0">
            <p className="font-medium truncate text-sm">{user.name}</p>
            <p className="text-muted-foreground text-xs truncate">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/student/dashboard" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            <span className="ml-2">Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/student/dashboard" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="ml-2">Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          <span className="ml-2">
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          //   onClick={handleLogout}
          className="cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function _UserSkeleton({
  size,
  disableTooltip = false,
}: {
  size: "default" | "small";
  disableTooltip?: boolean;
}) {
  return (
    <div className="cursor-pointer">
      {size === "default" ? (
        <div className="w-full flex items-center gap-2 rounded-lg p-2 hover:bg-accent transition-colors">
          <Avatar className="h-10 w-10 z-50">
            <Skeleton className="h-10 w-10" />
          </Avatar>
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <div className="flex-1 flex flex-col overflow-hidden text-left">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
            <ChevronsUpDown size={16} className="text-muted-foreground" />
          </div>
        </div>
      ) : disableTooltip ? (
        <Avatar className="h-8 w-8 cursor-pointer">
          <Skeleton className="h-8 w-8" />
        </Avatar>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <Avatar className="h-8 w-8 cursor-pointer">
              <Skeleton className="h-8 w-8" />
            </Avatar>
          </TooltipTrigger>
          <TooltipContent side="right">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-16" />
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
