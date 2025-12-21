# Page Naming System

This document explains how to use the dynamic page naming system to set custom breadcrumb names for your pages.

## Quick Start

To set a custom page name for your page, simply call the `usePageName` hook in your page component:

```tsx
"use client";

import { usePageName } from "@/hooks/use-page-name";

export default function MyPage() {
  usePageName("My Custom Page Title");
  
  return <div>Page content here</div>;
}
```

## How It Works

The page naming system uses a **two-tier resolution strategy**:

1. **Dynamic Names** (Highest Priority): Names set via the `usePageName` hook
2. **Auto-Generated**: Capitalized path segments as fallback

**Note**: Static mappings have been removed. For pages that don't set custom names, the system will fall back to auto-generated names from the URL path.

## Files Involved

### Core Files

- **`/src/stores/use-page-name-store.ts`** - Zustand store managing dynamic page names
- **`/src/hooks/use-page-name.ts`** - Hook for setting page names from components
- **`/src/lib/get-page-name.tsx`** - Page name resolution logic (dynamic → auto-generated)
- **`/src/components/common/app-header.tsx`** - Displays breadcrumbs with page names

## Usage Examples

### Basic Usage

```tsx
"use client";

import { usePageName } from "@/hooks/use-page-name";

export default function DashboardPage() {
  usePageName("Dashboard");
  return <div>Dashboard content</div>;
}
```

### Dynamic Pages

For pages with dynamic IDs (e.g., `/collections/[id]`):

```tsx
"use client";

import { usePageName } from "@/hooks/use-page-name";
import { useParams } from "next/navigation";

export default function CollectionPage() {
  const params = useParams();
  const collectionName = "My Collection"; // Fetch this from your data
  
  usePageName(collectionName);
  
  return <div>Collection: {params.id}</div>;
}
```

### Conditional Names

```tsx
"use client";

import { usePageName } from "@/hooks/use-page-name";
import { useSearchParams } from "next/navigation";

export default function ExamsPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  
  const pageName = status === "ongoing" 
    ? "Take Exam" 
    : status === "upcoming"
    ? "Upcoming Exams"
    : "All Exams";
  
  usePageName(pageName);
  
  return <div>Exams page</div>;
}
```

## Best Practices

- **Always use `usePageName`**: All pages should explicitly set their names using the hook
- **Keep names concise**: Short, clear names work best in breadcrumbs
- **Dynamic content**: For pages with IDs, you can update the name when data loads
- **Consistency**: Use the same naming convention across similar page types

## Automatic Cleanup

The `usePageName` hook automatically cleans up the page name when the component unmounts, preventing memory leaks and stale data.

## Breadcrumb Display

The app header automatically displays breadcrumbs for all path segments, using the names resolved by the page naming system.

Example path: `/dashboard/collections/123`
- Breadcrumb 1: "Dashboard" (from static mapping or custom hook)
- Breadcrumb 2: "Collections" (from static mapping or custom hook)
- Breadcrumb 3: "123" or custom name (from `usePageName` hook or auto-generated)
