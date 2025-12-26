import { usePageNameStore } from "@/stores/use-page-name-store";

/**
 * Get the display name for a page based on its pathname.
 *
 * Resolution order:
 * 1. Check dynamic page names from usePageName hook
 * 2. Fall back to capitalized pathname segment
 *
 * All pages should use the usePageName hook to set their display names.
 * This function provides smart auto-generation as a fallback.
 *
 * @param pathname - The pathname to get the name for (e.g., "/dashboard" or "/collections/123")
 * @param pageNamesOverride - Optional map of page names to use instead of the store's current state
 * @returns The display name for the page
 */
export default function getPageName(
  pathname: string,
  pageNamesOverride?: Record<string, string>,
): string {
  // Add leading slash if not present
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;

  // Check if there's a dynamic name set via usePageName hook
  // Use override if provided, otherwise check store
  const dynamicName = pageNamesOverride
    ? pageNamesOverride[normalizedPath]
    : usePageNameStore.getState().getPageName(normalizedPath);

  if (dynamicName) {
    return dynamicName;
  }

  // For dynamic routes, try to extract a meaningful name
  // Example: "/collections/123" -> extract "123" or use custom logic
  const segments = normalizedPath.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1];

  // If it's a UUID or ID-like string, check if parent route has a pattern
  if (lastSegment && /^[a-zA-Z0-9-_]+$/.test(lastSegment)) {
    // Check if it looks like an ID (UUID, number, etc.)
    const isId =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        lastSegment,
      ) || /^\d+$/.test(lastSegment);

    if (isId) {
      // For IDs, just return a shortened version or the ID itself
      return lastSegment.length > 8
        ? `${lastSegment.slice(0, 8)}...`
        : lastSegment;
    }
  }

  // Fall back to capitalizing the last segment
  return capitalizeSegment(lastSegment || "Home");
}

/**
 * Capitalize a URL segment, handling kebab-case and snake_case
 */
function capitalizeSegment(segment: string): string {
  return segment
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
