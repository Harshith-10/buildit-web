"use client";

import { Bell, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import getPageName from "@/lib/react/get-page-name";
import { usePageNameStore } from "@/stores/use-page-name-store";
import { Button } from "../ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import User from "./user-card";

export default function AppHeader() {
  const pathname = usePathname();
  // Subscribe to page names to trigger re-render when they change
  const pageNames = usePageNameStore((state) => state.pageNames);

  const pathSegments = pathname.split("/").filter((segment) => segment !== "");

  const breadcrumbItems = pathSegments.map((_, index) => {
    // Construct the full path up to this segment
    const fullPath = `/${pathSegments.slice(0, index + 1).join("/")}`;
    const displayName = getPageName(fullPath, pageNames);

    return (
      <Fragment key={fullPath}>
        <BreadcrumbItem>
          <BreadcrumbLink
            asChild
            className={pathname === fullPath ? "text-foreground text-base" : ""}
          >
            <Link href={fullPath}>{displayName}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {index < pathSegments.length - 1 && <BreadcrumbSeparator />}
      </Fragment>
    );
  });

  return (
    <div className="flex items-center justify-between p-4 border-b sticky top-0 z-50 bg-background">
      <div className="flex items-center gap-2">
        <Breadcrumb>
          <BreadcrumbList>{breadcrumbItems}</BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-2 min-w-md">
        <InputGroup>
          <InputGroupInput placeholder="Search for problems, collections or exams..." />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
        <Button size="icon" variant="ghost">
          <Bell />
        </Button>
        <User size="small" popupSide="bottom" disableTooltip />
      </div>
    </div>
  );
}
