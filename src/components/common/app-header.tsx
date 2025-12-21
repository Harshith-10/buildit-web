"use client";

import { usePathname } from "next/navigation";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import getPageName from "@/lib/get-page-name";
import { usePageNameStore } from "@/stores/use-page-name-store";

export default function AppHeader() {
  const pathname = usePathname();
  // Subscribe to page names to trigger re-render when they change
  const pageNames = usePageNameStore((state) => state.pageNames);
  console.log("AppHeader Render:", { pathname, pageNames });

  const pathSegments = pathname.split("/").filter((segment) => segment !== "");

  const breadcrumbItems = pathSegments.map((_, index) => {
    // Construct the full path up to this segment
    const fullPath = `/${pathSegments.slice(0, index + 1).join("/")}`;
    const displayName = getPageName(fullPath, pageNames);

    return (
      <React.Fragment key={fullPath}>
        <BreadcrumbItem>
          <BreadcrumbLink href={fullPath} className={pathname === fullPath ? "font-bold text-foreground" : ""}>{displayName}</BreadcrumbLink>
        </BreadcrumbItem>
        {index < pathSegments.length - 1 && <BreadcrumbSeparator />}
      </React.Fragment>
    );
  });

  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-2">
        <Breadcrumb>
          <BreadcrumbList>{breadcrumbItems}</BreadcrumbList>
        </Breadcrumb>
      </div>
      
    </header>
  );
}
